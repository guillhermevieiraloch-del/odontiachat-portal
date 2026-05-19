import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  handledBy: z.enum(["ai", "attendant"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { clinic } = await requireUser();
  const { id: conversationId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  }

  const conv = await db.conversation.updateMany({
    where: { id: conversationId, clinicId: clinic.id },
    data: { handledBy: parsed.data.handledBy },
  });

  if (conv.count === 0) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
