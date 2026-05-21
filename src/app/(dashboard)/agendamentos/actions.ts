"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { botClient } from "@/lib/bot-client";

const createSchema = z.object({
  patientId: z.string().optional(),
  newPatient: z
    .object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(8),
    })
    .optional(),
  procedureId: z.string().min(1),
  dentistId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
}).refine((d) => d.patientId || d.newPatient, {
  message: "Selecione ou cadastre um paciente",
});

export type CreateAppointmentInput = z.infer<typeof createSchema>;

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const procedure = await db.procedure.findFirst({
    where: { id: data.procedureId, clinicId: clinic.id },
  });
  if (!procedure) return { ok: false, error: "Procedimento inválido" };

  const startsAt = new Date(`${data.date}T${data.time}:00`);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: "Data ou hora inválida" };
  }
  const endsAt = new Date(startsAt.getTime() + procedure.duration * 60_000);

  let patientId = data.patientId;
  if (!patientId && data.newPatient) {
    const existing = await db.patient.findFirst({
      where: { clinicId: clinic.id, phone: data.newPatient.phone },
    });
    if (existing) {
      patientId = existing.id;
    } else {
      const created = await db.patient.create({
        data: {
          clinicId: clinic.id,
          name: data.newPatient.name,
          phone: data.newPatient.phone,
        },
      });
      patientId = created.id;
    }
  }

  if (!patientId) return { ok: false, error: "Paciente obrigatório" };

  const owned = await db.patient.findFirst({
    where: { id: patientId, clinicId: clinic.id },
    select: { id: true },
  });
  if (!owned) return { ok: false, error: "Paciente não encontrado" };

  const appt = await db.appointment.create({
    data: {
      clinicId: clinic.id,
      patientId,
      procedureId: procedure.id,
      dentistId: data.dentistId || null,
      startsAt,
      endsAt,
      notes: data.notes || null,
      status: "confirmed",
    },
  });

  // Agenda o lembrete conforme a config da clínica (liga/desliga + horas antes)
  if (clinic.remindersEnabled) {
    const hours =
      clinic.reminderHoursBefore > 0 ? clinic.reminderHoursBefore : 24;
    const reminderTime = new Date(startsAt.getTime() - hours * 60 * 60 * 1000);
    if (reminderTime.getTime() > Date.now() + 5 * 60 * 1000) {
      await db.reminder.create({
        data: {
          clinicId: clinic.id,
          appointmentId: appt.id,
          scheduledFor: reminderTime,
        },
      });
    }
  }

  // Reflect into the clinic's Google Calendar — best-effort, never blocks
  // the booking if the bot is unreachable (DB is the source of truth).
  try {
    const [patient, dentist] = await Promise.all([
      db.patient.findUnique({
        where: { id: patientId },
        select: { name: true, phone: true },
      }),
      data.dentistId
        ? db.dentist.findUnique({
            where: { id: data.dentistId },
            select: { name: true },
          })
        : Promise.resolve(null),
    ]);
    const result = await botClient.createCalendarEvent(clinic.id, {
      patientName: patient?.name ?? "Paciente",
      patientPhone: patient?.phone ?? "",
      service: procedure.name,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      dentistId: data.dentistId || undefined,
      dentistName: dentist?.name,
    });
    if (result.googleEventId) {
      await db.appointment.update({
        where: { id: appt.id },
        data: { googleEventId: result.googleEventId },
      });
    }
  } catch (err) {
    console.error("Falha ao sincronizar com Google Calendar:", err);
  }

  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  return { ok: true, id: appt.id };
}

const updateSchema = z.object({
  id: z.string().min(1),
  procedureId: z.string().min(1).optional(),
  dentistId: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]).optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateSchema>;

export async function updateAppointmentAction(
  input: UpdateAppointmentInput,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" };
  }
  const data = parsed.data;

  const current = await db.appointment.findFirst({
    where: { id: data.id, clinicId: clinic.id },
    include: { procedure: true },
  });
  if (!current) return { ok: false, error: "Agendamento não encontrado" };

  // Recalculate startsAt/endsAt if date/time/procedure changed
  let startsAt = current.startsAt;
  let endsAt = current.endsAt;
  let procedureId = current.procedureId;
  let duration = current.procedure?.duration ?? 60;

  if (data.procedureId && data.procedureId !== current.procedureId) {
    const proc = await db.procedure.findFirst({
      where: { id: data.procedureId, clinicId: clinic.id },
    });
    if (!proc) return { ok: false, error: "Procedimento inválido" };
    procedureId = proc.id;
    duration = proc.duration;
  }

  if (data.date || data.time) {
    const dateStr = data.date ?? current.startsAt.toISOString().slice(0, 10);
    const timeStr =
      data.time ??
      current.startsAt.toISOString().slice(11, 16);
    startsAt = new Date(`${dateStr}T${timeStr}:00`);
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false, error: "Data ou hora inválida" };
    }
    endsAt = new Date(startsAt.getTime() + duration * 60_000);
  } else if (data.procedureId && data.procedureId !== current.procedureId) {
    // procedure changed but date/time didn't — keep startsAt, update endsAt
    endsAt = new Date(startsAt.getTime() + duration * 60_000);
  }

  await db.appointment.update({
    where: { id: data.id },
    data: {
      ...(procedureId !== current.procedureId ? { procedureId } : {}),
      ...(data.dentistId !== undefined ? { dentistId: data.dentistId || null } : {}),
      startsAt,
      endsAt,
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
    },
  });

  // Reagendou: reposiciona o lembrete conforme a config da clínica
  const timeChanged = startsAt.getTime() !== current.startsAt.getTime();
  if (timeChanged) {
    const hours =
      clinic.reminderHoursBefore > 0 ? clinic.reminderHoursBefore : 24;
    const newReminderTime = new Date(
      startsAt.getTime() - hours * 60 * 60 * 1000,
    );
    if (
      clinic.remindersEnabled &&
      newReminderTime.getTime() > Date.now() + 5 * 60 * 1000
    ) {
      const updated = await db.reminder.updateMany({
        where: { appointmentId: data.id, status: "pending" },
        data: { scheduledFor: newReminderTime },
      });
      if (updated.count === 0) {
        await db.reminder.create({
          data: {
            clinicId: clinic.id,
            appointmentId: data.id,
            scheduledFor: newReminderTime,
          },
        });
      }
    } else {
      await db.reminder.updateMany({
        where: { appointmentId: data.id, status: "pending" },
        data: { status: "skipped" },
      });
    }
  }

  // Move the Google Calendar event if the time changed — best-effort.
  if (timeChanged && current.googleEventId) {
    try {
      await botClient.updateCalendarEvent(clinic.id, current.googleEventId, {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    } catch (err) {
      console.error("Falha ao mover evento no Google Calendar:", err);
    }
  }

  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function cancelAppointmentAction(id: string): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const appt = await db.appointment.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true, googleEventId: true },
  });
  if (!appt) {
    return { ok: false, error: "Agendamento não encontrado" };
  }

  await db.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });

  // Cancela lembretes pendentes deste appointment
  await db.reminder.updateMany({
    where: { appointmentId: id, status: "pending" },
    data: { status: "skipped" },
  });

  // Remove o evento do Google Calendar — best-effort.
  if (appt.googleEventId) {
    try {
      await botClient.deleteCalendarEvent(clinic.id, appt.googleEventId);
    } catch (err) {
      console.error("Falha ao remover evento do Google Calendar:", err);
    }
  }

  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  return { ok: true };
}
