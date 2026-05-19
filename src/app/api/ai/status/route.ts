import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  status: z.enum(["active", "paused"]),
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
    return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  }

  await db.aIConfig.upsert({
    where: { clinicId: clinic.id },
    create: {
      clinicId: clinic.id,
      status: parsed.data.status,
    },
    update: {
      status: parsed.data.status,
    },
  });

  return NextResponse.json({ ok: true, status: parsed.data.status });
}
