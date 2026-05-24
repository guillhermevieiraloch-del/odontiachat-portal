import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const leadSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  // Brazilian mobile is 11 digits; formatted strings have ~14-16 chars
  // ("(48) 99964-3253"). Require at least 10 digits after stripping non-digits.
  whatsapp: z
    .string()
    .refine(
      (v) => v.replace(/\D/g, "").length >= 10,
      "WhatsApp inválido (informe DDD + número)",
    ),
  clinicName: z.string().min(2, "Informe o nome da clínica"),
  dentists: z.string().optional(),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  // Public endpoint — rate limit by IP to stop form spam / DB flooding.
  if (!rateLimit("leads", clientIp(req), 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const data = parsed.data;

  try {
    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        clinicName: data.clinicName,
        dentists: data.dentists ?? null,
        source: "landing",
      },
    });

    // Await the email so the serverless function isn't terminated before the
    // outgoing HTTP call to Resend completes (fire-and-forget gets killed by
    // Vercel/Lambda when the response is sent). Failures here don't block the
    // 201 response — lead is already persisted.
    try {
      await sendLeadNotification(lead);
    } catch (err) {
      console.error("Falha ao enviar e-mail de notificação:", err);
    }

    return NextResponse.json(
      { ok: true, id: lead.id },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error("Erro ao salvar lead:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
