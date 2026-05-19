import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revokeRefreshToken } from "@/lib/google-oauth";

export async function POST() {
  const { clinic } = await requireUser();

  if (clinic.googleRefreshToken) {
    await revokeRefreshToken(clinic.googleRefreshToken);
  }

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      googleRefreshToken: null,
      googleAccessToken: null,
      googleTokenExpiry: null,
      googleAccountEmail: null,
      googleConnectedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
