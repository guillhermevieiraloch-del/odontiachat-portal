"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  phone: z.string().trim().min(8, "Telefone obrigatório"),
  email: z.string().trim().email().optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createSchema>;

export interface PatientActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export async function createPatientAction(
  input: CreatePatientInput,
): Promise<PatientActionResult> {
  const { clinic } = await requireUser();

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const existing = await db.patient.findFirst({
    where: { clinicId: clinic.id, phone: data.phone },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "Já existe um paciente com esse telefone" };
  }

  const patient = await db.patient.create({
    data: {
      clinicId: clinic.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/pacientes");
  return { ok: true, id: patient.id };
}

const updateNotesSchema = z.object({
  id: z.string().min(1),
  notes: z.string(),
});

export async function updatePatientNotesAction(
  input: z.infer<typeof updateNotesSchema>,
): Promise<PatientActionResult> {
  const { clinic } = await requireUser();
  const parsed = updateNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" };
  }

  const updated = await db.patient.updateMany({
    where: { id: parsed.data.id, clinicId: clinic.id },
    data: { notes: parsed.data.notes || null },
  });
  if (updated.count === 0) {
    return { ok: false, error: "Paciente não encontrado" };
  }

  revalidatePath("/pacientes");
  return { ok: true };
}

const updatePatientSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Nome obrigatório"),
  phone: z.string().trim().min(8, "Telefone obrigatório"),
  email: z.string().trim().email().optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export async function updatePatientAction(
  input: UpdatePatientInput,
): Promise<PatientActionResult> {
  const { clinic } = await requireUser();
  const parsed = updatePatientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const existing = await db.patient.findFirst({
    where: { id: data.id, clinicId: clinic.id },
    select: { id: true, phone: true },
  });
  if (!existing) return { ok: false, error: "Paciente não encontrado" };

  // Phone uniqueness (skip if phone unchanged)
  if (existing.phone !== data.phone) {
    const conflict = await db.patient.findFirst({
      where: { clinicId: clinic.id, phone: data.phone, NOT: { id: data.id } },
      select: { id: true },
    });
    if (conflict) return { ok: false, error: "Já existe outro paciente com esse telefone" };
  }

  await db.patient.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      ...(data.status ? { status: data.status } : {}),
    },
  });

  revalidatePath("/pacientes");
  return { ok: true };
}
