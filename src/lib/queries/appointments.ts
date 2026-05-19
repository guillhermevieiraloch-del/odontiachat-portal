import "server-only";
import { db } from "@/lib/db";
import type {
  MockAppointment,
  AppointmentStatus,
} from "@/lib/mock-appointments-data";

/**
 * Carrega todos os agendamentos da clínica num intervalo de tempo.
 * Por padrão retorna 30 dias pra trás + 60 dias pra frente (faz sentido pro calendário).
 */
export async function listAppointments(
  clinicId: string,
  opts: { from?: Date; to?: Date } = {},
): Promise<MockAppointment[]> {
  const now = new Date();
  const from = opts.from ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const to = opts.to ?? new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const rows = await db.appointment.findMany({
    where: {
      clinicId,
      startsAt: { gte: from, lte: to },
    },
    include: { procedure: true, patient: true },
    orderBy: { startsAt: "asc" },
  });

  return rows.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    procedureId: a.procedureId ?? "",
    dentistId: a.dentistId ?? "",
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    status: a.status as AppointmentStatus,
    notes: a.notes ?? undefined,
  }));
}

/**
 * Lookups que o calendário precisa pra renderizar nomes (patient, procedure, dentist).
 * O componente atual de calendário usa MOCK_PATIENTS, MOCK_PROCEDURES, MOCK_DENTISTS
 * via helpers getPatient/getProcedure/getDentist — vamos retornar listas reais e
 * adaptar o calendário pra recebê-las via prop.
 */
export async function listAppointmentMetadata(clinicId: string) {
  const [patients, procedures] = await Promise.all([
    db.patient.findMany({
      where: { clinicId },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    db.procedure.findMany({
      where: { clinicId, active: true },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        acceptsInsurance: true,
        showPrice: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
    })),
    procedures: procedures.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      price: Number(p.price ?? 0),
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
    })),
    // Dentists are not in schema yet — TODO: add Dentist model
    dentists: [] as { id: string; name: string; specialty: string }[],
  };
}
