import "server-only";
import { db } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  totalAppointments: number;
  totalEscalations: number;
  remindersSent: number;
  avgMessagesPerConversation: number;
  conversionRate: number; // %
  topProcedures: { name: string; count: number }[];
  busiestHours: { hour: number; count: number }[];
}

/**
 * Returns aggregate analytics over the last `daysBack` days.
 */
export async function getAnalyticsSummary(
  clinicId: string,
  daysBack = 30,
): Promise<AnalyticsSummary> {
  const since = subDays(new Date(), daysBack);

  const [
    totalConversations,
    totalMessages,
    appointments,
    totalEscalations,
    remindersSent,
    topProcsRaw,
    messagesByHourRaw,
  ] = await Promise.all([
    db.conversation.count({ where: { clinicId, createdAt: { gte: since } } }),
    db.message.count({
      where: { conversation: { clinicId }, createdAt: { gte: since } },
    }),
    db.appointment.findMany({
      where: { clinicId, createdAt: { gte: since } },
      include: { procedure: { select: { name: true } } },
    }),
    db.conversation.count({
      where: { clinicId, handledBy: "attendant", createdAt: { gte: since } },
    }),
    db.reminder.count({
      where: { clinicId, status: "sent", sentAt: { gte: since } },
    }),
    db.appointment.groupBy({
      by: ["procedureId"],
      where: { clinicId, createdAt: { gte: since }, procedureId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { procedureId: "desc" } },
      take: 5,
    }),
    db.message.findMany({
      where: {
        conversation: { clinicId },
        sender: "patient",
        createdAt: { gte: since },
      },
      select: { createdAt: true },
    }),
  ]);

  // Resolve procedure names
  const procIds = topProcsRaw.map((r) => r.procedureId).filter((x): x is string => !!x);
  const procs = await db.procedure.findMany({
    where: { id: { in: procIds } },
    select: { id: true, name: true },
  });
  const procMap = new Map(procs.map((p) => [p.id, p.name]));

  const topProcedures = topProcsRaw.map((r) => ({
    name: procMap.get(r.procedureId ?? "") ?? "—",
    count: r._count._all,
  }));

  const hourBuckets = new Array(24).fill(0) as number[];
  for (const m of messagesByHourRaw) {
    const h = new Date(m.createdAt).getHours();
    hourBuckets[h]++;
  }
  const busiestHours = hourBuckets
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .filter((b) => b.count > 0);

  const avgMessagesPerConversation =
    totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0;

  const totalAppointments = appointments.length;
  const conversionRate =
    totalConversations > 0
      ? Math.round((totalAppointments / totalConversations) * 100)
      : 0;

  return {
    totalConversations,
    totalMessages,
    totalAppointments,
    totalEscalations,
    remindersSent,
    avgMessagesPerConversation,
    conversionRate,
    topProcedures,
    busiestHours,
  };
}

/**
 * Daily series for the activity chart, 30 days back.
 *
 * Fetches the whole window in 3 queries and buckets by day in memory —
 * the previous version fired 90 sequential queries (30 days × 3), which
 * blocked the analytics page for seconds.
 */
export async function getAnalyticsDaily(clinicId: string, daysBack = 30) {
  const today = new Date();
  const windowStart = startOfDay(subDays(today, daysBack - 1));

  const [convs, appts, msgs] = await Promise.all([
    db.conversation.findMany({
      where: { clinicId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    db.appointment.findMany({
      where: { clinicId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    db.message.findMany({
      where: { conversation: { clinicId }, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
  ]);

  const dayKey = (d: Date) => startOfDay(d).toISOString().slice(0, 10);

  const buckets = new Map<
    string,
    { date: string; conversas: number; agendamentos: number; mensagens: number }
  >();
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = subDays(today, i);
    buckets.set(dayKey(d), {
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      conversas: 0,
      agendamentos: 0,
      mensagens: 0,
    });
  }

  for (const c of convs) {
    const b = buckets.get(dayKey(c.createdAt));
    if (b) b.conversas++;
  }
  for (const a of appts) {
    const b = buckets.get(dayKey(a.createdAt));
    if (b) b.agendamentos++;
  }
  for (const m of msgs) {
    const b = buckets.get(dayKey(m.createdAt));
    if (b) b.mensagens++;
  }

  return Array.from(buckets.values());
}
