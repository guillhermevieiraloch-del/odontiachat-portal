"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const dayHoursSchema = z.object({
  open: z.boolean(),
  start: z.string().optional(),
  end: z.string().optional(),
  lunchStart: z.string().optional(),
  lunchEnd: z.string().optional(),
});

const clinicSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  cnpj: z.string().trim().optional(),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().max(2).optional(),
  description: z.string().trim().optional(),
  workingHours: z.record(z.string(), dayHoursSchema),
});

export type SaveClinicInput = z.infer<typeof clinicSchema>;

export interface SaveClinicResult {
  ok: boolean;
  error?: string;
}

export async function saveClinicAction(
  input: SaveClinicInput,
): Promise<SaveClinicResult> {
  const { clinic } = await requireUser();

  const parsed = clinicSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      name: data.name,
      cnpj: data.cnpj || null,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      description: data.description || null,
      workingHours: data.workingHours,
    },
  });

  revalidatePath("/configuracoes/clinica");
  revalidatePath("/dashboard");
  return { ok: true };
}
