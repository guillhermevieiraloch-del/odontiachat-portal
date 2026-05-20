"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";

const dentistSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório"),
  specialty: z.string().trim().min(2, "Especialidade obrigatória"),
  cro: z.string().trim().optional(),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  userId: z.string().trim().optional(),
});

export type DentistInput = z.infer<typeof dentistSchema>;

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createDentistAction(input: DentistInput): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = dentistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;

  // Cap por tier
  const plan = getPlan(clinic.plan);
  if (plan.maxDentists !== Infinity) {
    const count = await db.dentist.count({
      where: { clinicId: clinic.id, active: true },
    });
    if (count >= plan.maxDentists) {
      return {
        ok: false,
        error: `Seu plano ${plan.label} permite até ${plan.maxDentists} dentista${plan.maxDentists === 1 ? "" : "s"}. Faça upgrade pra adicionar mais.`,
      };
    }
  }

  if (d.userId) {
    const user = await db.user.findFirst({
      where: { id: d.userId, clinicId: clinic.id },
      select: { id: true },
    });
    if (!user) return { ok: false, error: "Usuário não pertence a essa clínica" };
  }

  await db.dentist.create({
    data: {
      clinicId: clinic.id,
      name: d.name,
      specialty: d.specialty,
      cro: d.cro || null,
      email: d.email || null,
      phone: d.phone || null,
      bio: d.bio || null,
      userId: d.userId || null,
    },
  });

  revalidatePath("/configuracoes/dentistas");
  return { ok: true };
}

export async function updateDentistAction(
  id: string,
  input: DentistInput,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = dentistSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;

  const existing = await db.dentist.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Dentista não encontrado" };

  if (d.userId) {
    const user = await db.user.findFirst({
      where: { id: d.userId, clinicId: clinic.id },
      select: { id: true },
    });
    if (!user) return { ok: false, error: "Usuário não pertence a essa clínica" };
  }

  await db.dentist.update({
    where: { id },
    data: {
      name: d.name,
      specialty: d.specialty,
      cro: d.cro || null,
      email: d.email || null,
      phone: d.phone || null,
      bio: d.bio || null,
      userId: d.userId || null,
    },
  });

  revalidatePath("/configuracoes/dentistas");
  return { ok: true };
}

export async function deleteDentistAction(id: string): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const existing = await db.dentist.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Dentista não encontrado" };

  await db.dentist.delete({ where: { id } });

  revalidatePath("/configuracoes/dentistas");
  return { ok: true };
}

export async function toggleDentistActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const existing = await db.dentist.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Dentista não encontrado" };

  await db.dentist.update({ where: { id }, data: { active } });

  revalidatePath("/configuracoes/dentistas");
  return { ok: true };
}
