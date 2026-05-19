import "server-only";
import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";
import type {
  CRMPatient,
  CRMPatientHistoryItem,
} from "@/lib/mock-patients-data";

/**
 * Carrega todos os pacientes da clínica com histórico de agendamentos.
 * Computa lastContactAt e totalSpent agregando dados.
 */
export async function listPatients(clinicId: string): Promise<CRMPatient[]> {
  const rows = await db.patient.findMany({
    where: { clinicId },
    include: {
      appointments: {
        include: { procedure: true },
        orderBy: { startsAt: "desc" },
      },
      conversations: {
        select: { lastMessageAt: true },
        orderBy: { lastMessageAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((p) => {
    const history: CRMPatientHistoryItem[] = p.appointments.map((a) => ({
      id: a.id,
      procedure: a.procedure?.name ?? "Consulta",
      date: a.startsAt.toISOString().slice(0, 10),
      status:
        a.status === "completed"
          ? "completed"
          : a.status === "cancelled"
            ? "cancelled"
            : "scheduled",
      price: a.procedure?.price ? Number(a.procedure.price) : undefined,
    }));

    const totalSpent = history
      .filter((h) => h.status === "completed")
      .reduce((sum, h) => sum + (h.price ?? 0), 0);

    const lastConvAt = p.conversations[0]?.lastMessageAt;
    const lastApptAt = p.appointments[0]?.startsAt;
    const lastContact = [lastConvAt, lastApptAt, p.updatedAt]
      .filter(Boolean)
      .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as Date;

    const daysSinceContact = differenceInDays(new Date(), lastContact);
    const status: "active" | "inactive" = daysSinceContact > 180 ? "inactive" : "active";

    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email ?? undefined,
      birthDate: p.birthDate?.toISOString().slice(0, 10),
      notes: p.notes ?? undefined,
      status,
      createdAt: p.createdAt.toISOString().slice(0, 10),
      lastContactAt: lastContact.toISOString().slice(0, 10),
      totalSpent,
      history,
    };
  });
}
