import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { botClient } from "@/lib/bot-client";

const schema = z.object({
  content: z.string().min(1).max(4000),
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
    return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
  }

  // Verify the conversation belongs to this clinic
  const conv = await db.conversation.findFirst({
    where: { id: conversationId, clinicId: clinic.id },
  });
  if (!conv) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  try {
    await botClient.sendOutbound(clinic.id, conversationId, parsed.data.content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
