import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { exchangeCodeForTokens, fetchAccountEmail } from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  const { clinic } = await requireUser();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const redirect = (qs: string) =>
    NextResponse.redirect(new URL(`/configuracoes/integracoes?${qs}`, url.origin));

  if (error) return redirect(`error=${encodeURIComponent(error)}`);
  if (!code) return redirect("error=missing_code");
  if (state !== clinic.id) return redirect("error=state_mismatch");

  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro na troca de tokens";
    return redirect(`error=${encodeURIComponent(msg)}`);
  }

  if (!tokens.refresh_token) {
    return redirect("error=missing_refresh_token");
  }

  let email: string | null = null;
  if (tokens.access_token) {
    try {
      email = await fetchAccountEmail(tokens.access_token);
    } catch {
      email = null;
    }
  }

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      googleRefreshToken: tokens.refresh_token,
      googleAccessToken: tokens.access_token ?? null,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      googleAccountEmail: email,
      googleConnectedAt: new Date(),
      googleCalendarId: clinic.googleCalendarId || "primary",
    },
  });

  return redirect("connected=1");
}
