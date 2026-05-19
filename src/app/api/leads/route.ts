import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendLeadNotification } from "@/lib/email";

const leadSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().min(8, "WhatsApp inválido"),
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

    // Fire-and-forget email notification (don't block the response if it fails)
    sendLeadNotification(lead).catch((err) =>
      console.error("Falha ao enviar e-mail de notificação:", err),
    );

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
