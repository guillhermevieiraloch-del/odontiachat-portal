"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const procedureSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório"),
  duration: z.number().int().min(5, "Duração mínima de 5 minutos").max(480),
  price: z.number().min(0).nullable(),
  acceptsInsurance: z.boolean(),
  showPrice: z.boolean(),
  dentistIds: z.array(z.string()),
});

export type ProcedureInput = z.infer<typeof procedureSchema>;

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Garante que todos os dentistas informados são da clínica. */
async function validateDentists(
  clinicId: string,
  dentistIds: string[],
): Promise<boolean> {
  if (dentistIds.length === 0) return true;
  const count = await db.dentist.count({
    where: { id: { in: dentistIds }, clinicId },
  });
  return count === dentistIds.length;
}

export async function createProcedureAction(
  input: ProcedureInput,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = procedureSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const p = parsed.data;

  if (!(await validateDentists(clinic.id, p.dentistIds))) {
    return { ok: false, error: "Dentista inválido" };
  }

  await db.procedure.create({
    data: {
      clinicId: clinic.id,
      name: p.name,
      duration: p.duration,
      price: p.price,
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
      dentists: { connect: p.dentistIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/configuracoes/procedimentos");
  return { ok: true };
}

export async function updateProcedureAction(
  id: string,
  input: ProcedureInput,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const parsed = procedureSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const p = parsed.data;

  const existing = await db.procedure.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Procedimento não encontrado" };

  if (!(await validateDentists(clinic.id, p.dentistIds))) {
    return { ok: false, error: "Dentista inválido" };
  }

  await db.procedure.update({
    where: { id },
    data: {
      name: p.name,
      duration: p.duration,
      price: p.price,
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
      // `set` substitui a lista inteira de dentistas vinculados.
      dentists: { set: p.dentistIds.map((dId) => ({ id: dId })) },
    },
  });

  revalidatePath("/configuracoes/procedimentos");
  return { ok: true };
}

export async function deleteProcedureAction(id: string): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const existing = await db.procedure.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true, _count: { select: { appointments: true } } },
  });
  if (!existing) return { ok: false, error: "Procedimento não encontrado" };

  // Procedimento com histórico de agendamentos não é apagado — só desativado,
  // pra não quebrar os agendamentos existentes.
  if (existing._count.appointments > 0) {
    await db.procedure.update({ where: { id }, data: { active: false } });
    return { ok: true };
  }

  await db.procedure.delete({ where: { id } });
  revalidatePath("/configuracoes/procedimentos");
  return { ok: true };
}

export async function toggleProcedureActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const { clinic } = await requireUser();

  const existing = await db.procedure.findFirst({
    where: { id, clinicId: clinic.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Procedimento não encontrado" };

  await db.procedure.update({ where: { id }, data: { active } });
  revalidatePath("/configuracoes/procedimentos");
  return { ok: true };
}
