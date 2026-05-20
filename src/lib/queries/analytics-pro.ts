import "server-only";
import { db } from "@/lib/db";
import { subDays } from "date-fns";

/**
 * Pro-tier analytics — heavier queries that don't run on Solo/Clínica plans.
 */

export interface HourDayHeatmap {
  /** 7×24 grid: [weekday 0-6 (sun-sat)][hour 0-23] = msgs count */
  cells: number[][];
  max: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  pctOfTop: number;
}

export interface DentistPerformance {
  dentistId: string;
  name: string;
  specialty: string;
  appointments: number;
  cancelled: number;
  completed: number;
}

export interface RetentionStats {
  newPatients: number;
  returningPatients: number;
  retentionRate: number; // %
}

export interface ProAnalytics {
  heatmap: HourDayHeatmap;
  funnel: FunnelStep[];
  dentistPerformance: DentistPerformance[];
  retention: RetentionStats;
  avgTimeToFirstResponse: number | null; // seconds
}

export async function getProAnalytics(
  clinicId: string,
  daysBack = 30,
): Promise<ProAnalytics> {
  const since = subDays(new Date(), daysBack);

  const [
    patientMessages,
    conversations,
    appointments,
    dentists,
    patients,
    firstResponsePairs,
  ] = await Promise.all([
    db.message.findMany({
      where: {
        conversation: { clinicId },
        sender: "patient",
        createdAt: { gte: since },
      },
      select: { createdAt: true },
    }),
    db.conversation.count({ where: { clinicId, createdAt: { gte: since } } }),
    db.appointment.findMany({
      where: { clinicId, createdAt: { gte: since } },
      select: {
        id: true,
        status: true,
        dentistId: true,
        patientId: true,
        createdAt: true,
      },
    }),
    db.dentist.findMany({
      where: { clinicId, active: true },
      select: { id: true, name: true, specialty: true },
    }),
    db.patient.findMany({
      where: { clinicId, createdAt: { gte: since } },
      select: { id: true, createdAt: true },
    }),
    db.conversation.findMany({
      where: { clinicId, createdAt: { gte: since } },
      select: {
        id: true,
        createdAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 2,
          select: { sender: true, createdAt: true },
        },
      },
    }),
  ]);

  // ── Heatmap: 7 days × 24 hours ──
  const cells: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );
  for (const m of patientMessages) {
    const d = new Date(m.createdAt);
    cells[d.getDay()][d.getHours()]++;
  }
  let max = 0;
  for (const row of cells) for (const v of row) if (v > max) max = v;
  const heatmap: HourDayHeatmap = { cells, max };

  // ── Funnel ──
  const totalConversations = conversations;
  const withBooking = new Set(appointments.map((a) => a.patientId)).size;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const completed = appointments.filter((a) => a.status === "completed").length;

  const top = totalConversations || 1;
  const funnel: FunnelStep[] = [
    {
      label: "Conversas iniciadas",
      count: totalConversations,
      pctOfTop: 100,
    },
    {
      label: "Pacientes que agendaram",
      count: withBooking,
      pctOfTop: Math.round((withBooking / top) * 100),
    },
    {
      label: "Consultas confirmadas",
      count: confirmed,
      pctOfTop: Math.round((confirmed / top) * 100),
    },
    {
      label: "Consultas realizadas",
      count: completed,
      pctOfTop: Math.round((completed / top) * 100),
    },
  ];

  // ── Performance por dentista ──
  const dentistMap = new Map(dentists.map((d) => [d.id, d]));
  const dentistGroups = new Map<
    string,
    { appointments: number; cancelled: number; completed: number }
  >();
  for (const a of appointments) {
    if (!a.dentistId || !dentistMap.has(a.dentistId)) continue;
    const g = dentistGroups.get(a.dentistId) ?? {
      appointments: 0,
      cancelled: 0,
      completed: 0,
    };
    g.appointments++;
    if (a.status === "cancelled") g.cancelled++;
    if (a.status === "completed") g.completed++;
    dentistGroups.set(a.dentistId, g);
  }
  const dentistPerformance: DentistPerformance[] = dentists
    .map((d) => {
      const g = dentistGroups.get(d.id) ?? {
        appointments: 0,
        cancelled: 0,
        completed: 0,
      };
      return {
        dentistId: d.id,
        name: d.name,
        specialty: d.specialty,
        appointments: g.appointments,
        cancelled: g.cancelled,
        completed: g.completed,
      };
    })
    .sort((a, b) => b.appointments - a.appointments);

  // ── Retention ──
  // "Returning" = patient created BEFORE the window who has appointments inside it
  const newPatientsInWindow = patients.length;
  const apptPatientIds = Array.from(
    new Set(appointments.map((a) => a.patientId)),
  );
  const returningPatientIds = new Set<string>();
  for (const pid of apptPatientIds) {
    if (!patients.find((p) => p.id === pid)) returningPatientIds.add(pid);
  }
  const totalPatientsActive = newPatientsInWindow + returningPatientIds.size;
  const retention: RetentionStats = {
    newPatients: newPatientsInWindow,
    returningPatients: returningPatientIds.size,
    retentionRate:
      totalPatientsActive > 0
        ? Math.round((returningPatientIds.size / totalPatientsActive) * 100)
        : 0,
  };

  // ── Avg time to first response (patient -> ai/attendant first msg) ──
  let totalMs = 0;
  let pairs = 0;
  for (const c of firstResponsePairs) {
    const [first, second] = c.messages;
    if (first?.sender === "patient" && second && second.sender !== "patient") {
      totalMs += new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
      pairs++;
    }
  }
  const avgTimeToFirstResponse =
    pairs > 0 ? Math.round(totalMs / pairs / 1000) : null;

  return {
    heatmap,
    funnel,
    dentistPerformance,
    retention,
    avgTimeToFirstResponse,
  };
}
