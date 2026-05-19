import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { botClient } from "@/lib/bot-client";

export const dynamic = "force-dynamic";

export async function POST() {
  const { clinic } = await requireUser();
  try {
    const result = await botClient.disconnect(clinic.id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
