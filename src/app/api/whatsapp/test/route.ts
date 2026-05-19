import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { botClient } from "@/lib/bot-client";

const schema = z.object({
  phone: z.string().min(8),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { clinic } = await requireUser();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Telefone obrigatório" },
      { status: 400 },
    );
  }
  try {
    await botClient.sendTestMessage(
      clinic.id,
      parsed.data.phone,
      parsed.data.message,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
