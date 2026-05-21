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
 * Admin status is a flag on the User row (User.isPlatformAdmin) — set
 * directly in the database. No env var to misconfigure.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.profile.isPlatformAdmin) {
    redirect("/dashboard");
  }
  return ctx;
}
