import "server-only";
import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { db } from "@/lib/db";
import type { InboxConversation, Sender } from "@/lib/mock-inbox-data";

function relativeTime(date: Date): string {
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours} h`;
  const days = differenceInDays(now, date);
  if (days < 7) return `${days} d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/**
 * Carrega todas as conversas ativas + threads completas (até 50).
 * Pra MVP é suficiente. Pra escala maior, separar lista de mensagens.
 */
export async function listFullInbox(
  clinicId: string,
): Promise<InboxConversation[]> {
  const rows = await db.conversation.findMany({
    where: { clinicId, status: "active" },
    include: {
      patient: {
        include: {
          appointments: {
            where: { status: { in: ["confirmed", "pending", "completed"] } },
            orderBy: { startsAt: "desc" },
            include: { procedure: true },
            take: 8,
          },
        },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
  });

  return rows.map((c) => {
    const lastMsg = c.messages[c.messages.length - 1];
    return {
      id: c.id,
      patient: {
        id: c.patient?.id ?? c.id,
        name: c.patient?.name ?? "Sem nome",
        phone: c.patient?.phone ?? "",
        email: c.patient?.email ?? undefined,
        birthDate: c.patient?.birthDate?.toISOString().slice(0, 10),
        notes: c.patient?.notes ?? undefined,
        history:
          c.patient?.appointments.map((a) => ({
            id: a.id,
            procedure: a.procedure?.name ?? "Consulta",
            date: a.startsAt.toLocaleDateString("pt-BR"),
            status:
              a.status === "completed"
                ? ("completed" as const)
                : a.status === "cancelled"
                  ? ("cancelled" as const)
                  : ("scheduled" as const),
          })) ?? [],
      },
      preview: lastMsg?.content ?? "",
      time: relativeTime(c.lastMessageAt),
      unread: c.unreadCount,
      handledBy: (c.handledBy === "attendant" ? "attendant" : "ai") as
        | "ai"
        | "attendant",
      status: "online" as const,
      messages: c.messages.map((m) => ({
        id: m.id,
        sender: m.sender as Sender,
        content: m.content,
        time: m.createdAt.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    };
  });
}

export async function listConversations(clinicId: string) {
  const rows = await db.conversation.findMany({
    where: { clinicId, status: "active" },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, sender: true, createdAt: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
  });

  return rows.map((c) => {
    const last = c.messages[0];
    return {
      id: c.id,
      patientId: c.patient?.id ?? null,
      name: c.patient?.name ?? "Sem nome",
      phone: c.patient?.phone ?? "",
      preview: last?.content ?? "",
      lastMessageAt: c.lastMessageAt,
      unread: c.unreadCount,
      handledBy: c.handledBy as "ai" | "attendant",
    };
  });
}

export async function getConversation(clinicId: string, conversationId: string) {
  const conv = await db.conversation.findFirst({
    where: { id: conversationId, clinicId },
    include: {
      patient: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conv) return null;
  return conv;
}

export async function markConversationRead(
  clinicId: string,
  conversationId: string,
) {
  await db.conversation.updateMany({
    where: { id: conversationId, clinicId },
    data: { unreadCount: 0 },
  });
}

export async function setHandledBy(
  clinicId: string,
  conversationId: string,
  handledBy: "ai" | "attendant",
) {
  await db.conversation.updateMany({
    where: { id: conversationId, clinicId },
    data: { handledBy },
  });
}
