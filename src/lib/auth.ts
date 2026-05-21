import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * Loads the authenticated user + their clinic profile.
 * Redirects to /login if there is no session, or throws if the auth user
 * exists but has no profile row (out-of-band data inconsistency).
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await db.user.findUnique({
    where: { id: user.id },
    include: { clinic: true },
  });

  if (!profile) {
    redirect("/login");
  }

  return { authUser: user, profile, clinic: profile.clinic };
}

/**
 * Gate for the internal developer area (/admin/*).
 * Allowed emails come from the ADMIN_EMAILS env var (comma-separated).
 * Anyone not on the list is bounced to the normal dashboard.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allow.includes(ctx.authUser.email?.toLowerCase() ?? "")) {
    redirect("/dashboard");
  }
  return ctx;
}
