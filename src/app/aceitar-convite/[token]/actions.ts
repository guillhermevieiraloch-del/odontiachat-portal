"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export interface AcceptInviteState {
  error?: string;
}

/**
 * Accepts an invite for an already-logged-in user.
 * Creates the User row linked to the clinic and marks the invite as accepted.
 * For non-logged-in users, the page redirects to /signup?invite=TOKEN before
 * this action runs.
 */
export async function acceptInviteAction(
  prevState: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = formData.get("token");
  const name = formData.get("name");
  if (typeof token !== "string" || !token) return { error: "Token inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar logado" };

  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite) return { error: "Convite não encontrado" };
  if (invite.acceptedAt) return { error: "Convite já foi aceito" };
  if (invite.expiresAt < new Date()) return { error: "Convite expirado" };
  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return {
      error: `Esse convite foi enviado pra ${invite.email}, mas você está logado como ${user.email}. Faça login com o e-mail certo.`,
    };
  }

  // Check if user is already member of *another* clinic
  const existingMembership = await db.user.findUnique({ where: { id: user.id } });
  if (existingMembership && existingMembership.clinicId !== invite.clinicId) {
    return {
      error: "Você já faz parte de outra clínica. Saia dela antes de aceitar este convite.",
    };
  }

  const displayName =
    typeof name === "string" && name.trim().length > 0 ? name.trim() : (user.email ?? "Usuário");

  // Upsert User row
  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: invite.email,
      name: displayName,
      role: invite.role,
      clinicId: invite.clinicId,
    },
    update: {
      role: invite.role,
      clinicId: invite.clinicId,
    },
  });

  // Mark invite as accepted
  await db.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  // Update Supabase auth display name (best-effort)
  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { name: displayName },
    });
  } catch (err) {
    console.warn("[invite/accept] Falha ao atualizar display name no Supabase:", err);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
