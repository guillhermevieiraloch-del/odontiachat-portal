import "server-only";
import { db } from "@/lib/db";
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  format,
  differenceInMinutes,
} from "date-fns";

export interface DashboardMetrics {
  conversationsToday: { value: number; deltaPct: number };
  upcomingAppointments: number;
  conversionRate: { value: number; deltaPct: number };
  noShowsAvoided: number;
}

export async function getDashboardMetrics(
  clinicId: string,
): Promise<DashboardMetrics> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const weekFromNow = addDays(todayEnd, 7);

  const [
    conversationsToday,
    conversationsYesterday,
    upcomingCount,
    convsLast30,
    apptsLast30,
    apptsLast30Prev,
    remindersSent,
  ] = await Promise.all([
    db.conversation.count({
      where: { clinicId, createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    db.conversation.count({
      where: { clinicId, createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
    }),
    db.appointment.count({
      where: {
        clinicId,
        status: "confirmed",
        startsAt: { gte: now, lte: weekFromNow },
      },
    }),
    db.conversation.count({
      where: { clinicId, createdAt: { gte: subDays(now, 30) } },
    }),
    db.appointment.count({
      where: { clinicId, createdAt: { gte: subDays(now, 30) } },
    }),
    db.appointment.count({
      where: {
        clinicId,
        createdAt: { gte: subDays(now, 60), lt: subDays(now, 30) },
      },
    }),
    db.reminder.count({
      where: {
        clinicId,
        status: "sent",
        sentAt: { gte: subDays(now, 30) },
      },
    }),
  ]);

  const deltaPctConv =
    conversationsYesterday > 0
      ? Math.round(
          ((conversationsToday - conversationsYesterday) /
            conversationsYesterday) *
            100,
        )
      : 0;

  const conversionRate =
    convsLast30 > 0 ? Math.round((apptsLast30 / convsLast30) * 100) : 0;
  const prevConversion = apptsLast30Prev; // simplificação — comparativo absoluto

  return {
    conversationsToday: {
      value: conversationsToday,
      deltaPct: deltaPctConv,
    },
    upcomingAppointments: upcomingCount,
    conversionRate: { value: conversionRate, deltaPct: prevConversion },
    noShowsAvoided: remindersSent,
  };
}

/**
 * 7-day per-metric history for sparkline rendering inside metric cards.
 */
export async function getMetricSparklines(clinicId: string) {
  const today = new Date();
  const conversations: number[] = [];
  const appointments: number[] = [];
  const reminders: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const [c, a, r] = await Promise.all([
      db.conversation.count({
        where: { clinicId, createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      db.appointment.count({
        where: {
          clinicId,
          status: "confirmed",
          startsAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      db.reminder.count({
        where: { clinicId, status: "sent", sentAt: { gte: dayStart, lte: dayEnd } },
      }),
    ]);
    conversations.push(c);
    appointments.push(a);
    reminders.push(r);
  }

  return { conversations, appointments, reminders };
}

export async function getActivityChartData(clinicId: string) {
  const points: { day: string; conversas: number; agendamentos: number }[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const [conversas, agendamentos] = await Promise.all([
      db.conversation.count({
        where: { clinicId, createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      db.appointment.count({
        where: { clinicId, createdAt: { gte: dayStart, lte: dayEnd } },
      }),
    ]);
    points.push({
      day: format(date, "dd"),
      conversas,
      agendamentos,
    });
  }
  return points;
}

export async function getActiveConversationsPreview(clinicId: string) {
  const rows = await db.conversation.findMany({
    where: { clinicId, status: "active" },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
  });

  return rows.map((c) => {
    const mins = differenceInMinutes(new Date(), c.lastMessageAt);
    const time =
      mins < 1
        ? "agora"
        : mins < 60
          ? `${mins} min`
          : mins < 60 * 24
            ? `${Math.floor(mins / 60)} h`
            : `${Math.floor(mins / 60 / 24)} d`;
    return {
      id: c.id,
      name: c.patient?.name ?? "Sem nome",
      phone: c.patient?.phone ?? "",
      preview: c.messages[0]?.content ?? "",
      time,
      unread: c.unreadCount,
      handledBy: c.handledBy as "ai" | "attendant",
    };
  });
}

export async function getUpcomingAppointmentsPreview(clinicId: string) {
  const rows = await db.appointment.findMany({
    where: {
      clinicId,
      status: { in: ["confirmed", "pending"] },
      startsAt: { gte: new Date() },
    },
    include: {
      patient: { select: { name: true } },
      procedure: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
  });

  return rows.map((a) => {
    const d = a.startsAt;
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const date = isToday
      ? "Hoje"
      : isTomorrow
        ? "Amanhã"
        : d.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
          });
    return {
      id: a.id,
      patient: a.patient?.name ?? "Sem nome",
      procedure: a.procedure?.name ?? "Consulta",
      date,
      time: d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });
}
