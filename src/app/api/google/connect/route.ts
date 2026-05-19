import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAuthorizationUrl } from "@/lib/google-oauth";

export async function GET() {
  const { clinic } = await requireUser();

  try {
    const url = getAuthorizationUrl(clinic.id);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao iniciar OAuth";
    return NextResponse.redirect(
      new URL(
        `/configuracoes/integracoes?error=${encodeURIComponent(msg)}`,
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      ),
    );
  }
}
