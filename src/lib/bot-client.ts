/**
 * Cliente HTTP que o portal usa pra falar com o Bot Service (`src/server.js`).
 * Sempre roda no SERVER (nunca no browser) — `BOT_API_SECRET` é secreto.
 */
import "server-only";

const BASE = process.env.BOT_API_URL ?? "http://localhost:3333";
const SECRET = process.env.BOT_API_SECRET ?? "dev-secret-change-me";

export interface BotSessionStatus {
  status: "disconnected" | "connecting" | "qr" | "authenticated" | "ready" | "error" | "auth_failure";
  qr: string | null;
  connectedAt: string | null;
  lastError: string | null;
}

async function call<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "x-bot-secret": SECRET,
      "Content-Type": "application/json",
      ...headers,
    },
    body: json ? JSON.stringify(json) : init.body,
    // Bot service has its own short timeout; we don't cache here
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error ?? ""; } catch {}
    throw new Error(`Bot service ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const botClient = {
  health: () => call<{ ok: boolean; sessions: number; uptime: number }>("/health"),

  getStatus: (clinicId: string) =>
    call<BotSessionStatus>(`/sessions/${clinicId}/status`),

  connect: (clinicId: string) =>
    call<{ ok: boolean; status: BotSessionStatus }>(
      `/sessions/${clinicId}/connect`,
      { method: "POST", json: {} },
    ),

  disconnect: (clinicId: string) =>
    call<{ ok: boolean }>(`/sessions/${clinicId}/disconnect`, {
      method: "POST",
      json: {},
    }),

  sendTestMessage: (clinicId: string, phone: string, message?: string) =>
    call<{ ok: boolean }>(`/sessions/${clinicId}/test-message`, {
      method: "POST",
      json: { phone, message },
    }),

  sendOutbound: (clinicId: string, conversationId: string, content: string) =>
    call<{ ok: boolean }>(
      `/sessions/${clinicId}/conversations/${conversationId}/send`,
      { method: "POST", json: { content } },
    ),

  // ─── Google Calendar sync (manual appointments from the dashboard) ───
  createCalendarEvent: (
    clinicId: string,
    payload: {
      patientName: string;
      patientPhone?: string;
      service: string;
      startsAt: string;
      endsAt: string;
      dentistId?: string;
      dentistName?: string;
    },
  ) =>
    call<{ ok: boolean; googleEventId: string | null }>(
      `/sessions/${clinicId}/calendar/event`,
      { method: "POST", json: payload },
    ),

  updateCalendarEvent: (
    clinicId: string,
    eventId: string,
    payload: { startsAt: string; endsAt: string },
  ) =>
    call<{ ok: boolean }>(
      `/sessions/${clinicId}/calendar/event/${eventId}`,
      { method: "PATCH", json: payload },
    ),

  deleteCalendarEvent: (clinicId: string, eventId: string) =>
    call<{ ok: boolean }>(`/sessions/${clinicId}/calendar/event/${eventId}`, {
      method: "DELETE",
    }),
};
