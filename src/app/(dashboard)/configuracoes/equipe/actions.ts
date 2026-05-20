"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { sendInviteEmail } from "@/lib/email";
import { getPlan } from "@/lib/plans";

const inviteSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  role: z.enum(["ADMIN", "ATTENDANT", "DENTIST"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;

export interface TeamActionResult {
  ok: boolean;
  error?: string;
}

export async function inviteTeamMemberAction(
  input: InviteInput,
): Promise<TeamActionResult> {
  const { clinic, profile } = await requireUser();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();

  // Cap por tier — conta membros + convites pendentes
  const plan = getPlan(clinic.plan);
  if (plan.maxTeamMembers !== Infinity) {
    const [members, pendingCount] = await Promise.all([
      db.user.count({ where: { clinicId: clinic.id } }),
      db.invite.count({
        where: { clinicId: clinic.id, acceptedAt: null },
      }),
    ]);
    if (members + pendingCount >= plan.maxTeamMembers) {
      return {
        ok: false,
        error: `Seu plano ${plan.label} permite até ${plan.maxTeamMembers} membro${plan.maxTeamMembers === 1 ? "" : "s"} na equipe (incluindo convites pendentes). Faça upgrade pra adicionar mais.`,
      };
    }
  }

  // Already part of the clinic?
  const existing = await db.user.findFirst({
    where: { email, clinicId: clinic.id },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "Este e-mail já é membro da clínica" };
  }

  // Pending invite already?
  const pending = await db.invite.findFirst({
    where: { email, clinicId: clinic.id, acceptedAt: null },
    select: { id: true },
  });
  if (pending) {
    return { ok: false, error: "Já existe um convite pendente pra esse e-mail" };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.invite.create({
    data: {
      clinicId: clinic.id,
      email,
      role: data.role as Role,
      token,
      expiresAt,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const acceptUrl = `${baseUrl}/aceitar-convite/${token}`;

  try {
    await sendInviteEmail({
      email,
      inviterName: profile.name,
      clinicName: clinic.name,
      role: data.role,
      acceptUrl,
    });
  } catch (err) {
    console.warn("[invite] Falha ao enviar email:", err);
    // Não falha o action — o invite foi criado, só o email não saiu
  }

  revalidatePath("/configuracoes/equipe");
  return { ok: true };
}

export async function cancelInviteAction(id: string): Promise<TeamActionResult> {
  const { clinic } = await requireUser();
  const result = await db.invite.deleteMany({
    where: { id, clinicId: clinic.id, acceptedAt: null },
  });
  if (result.count === 0) {
    return { ok: false, error: "Convite não encontrado" };
  }
  revalidatePath("/configuracoes/equipe");
  return { ok: true };
}

const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "ATTENDANT", "DENTIST"]),
});

export async function changeRoleAction(
  input: z.infer<typeof changeRoleSchema>,
): Promise<TeamActionResult> {
  const { clinic, authUser } = await requireUser();
  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };

  if (parsed.data.userId === authUser.id) {
    return { ok: false, error: "Você não pode alterar seu próprio papel" };
  }

  const updated = await db.user.updateMany({
    where: { id: parsed.data.userId, clinicId: clinic.id },
    data: { role: parsed.data.role as Role },
  });
  if (updated.count === 0) return { ok: false, error: "Membro não encontrado" };
  revalidatePath("/configuracoes/equipe");
  return { ok: true };
}

export async function removeTeamMemberAction(
  userId: string,
): Promise<TeamActionResult> {
  const { clinic, authUser } = await requireUser();
  if (userId === authUser.id) {
    return { ok: false, error: "Você não pode remover a si mesmo" };
  }
  const target = await db.user.findFirst({
    where: { id: userId, clinicId: clinic.id },
    select: { id: true, role: true },
  });
  if (!target) return { ok: false, error: "Membro não encontrado" };

  // Don't allow removing the last admin
  if (target.role === "ADMIN") {
    const adminCount = await db.user.count({
      where: { clinicId: clinic.id, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return { ok: false, error: "Não é possível remover o último administrador" };
    }
  }

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/configuracoes/equipe");
  return { ok: true };
}
