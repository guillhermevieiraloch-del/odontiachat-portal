"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

  // Schedule a reminder for 24h before the appointment (if there's enough time)
  const reminderTime = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);
  if (reminderTime.getTime() > Date.now() + 60 * 60 * 1000) {
    await db.reminder.create({
      data: {
        clinicId: clinic.id,
        appointmentId: appt.id,
        scheduledFor: reminderTime,
      },
    });
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

  // Reagendou: atualiza reminders pendentes para 24h antes do novo horário
  if (startsAt.getTime() !== current.startsAt.getTime()) {
    const newReminderTime = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);
    if (newReminderTime.getTime() > Date.now() + 60 * 60 * 1000) {
      await db.reminder.updateMany({
        where: { appointmentId: data.id, status: "pending" },
        data: { scheduledFor: newReminderTime },
      });
    } else {
      await db.reminder.updateMany({
        where: { appointmentId: data.id, status: "pending" },
        data: { status: "skipped" },
      });
    }
  }

  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function cancelAppointmentAction(id: string): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const updated = await db.appointment.updateMany({
    where: { id, clinicId: clinic.id },
    data: { status: "cancelled" },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Agendamento não encontrado" };
  }

  // Cancela lembretes pendentes deste appointment
  await db.reminder.updateMany({
    where: { appointmentId: id, status: "pending" },
    data: { status: "skipped" },
  });

  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
  return { ok: true };
}
