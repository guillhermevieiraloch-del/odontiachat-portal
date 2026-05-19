"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

// ───────── Step 1: Clinic data ─────────

const step1Schema = z.object({
  cnpj: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().max(2, "Use a sigla (ex: SP)").optional().or(z.literal("")),
});

export type StepState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveStep1(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const { clinic } = await requireUser();
  const parsed = step1Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { fieldErrors };
  }

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      cnpj: parsed.data.cnpj || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      onboardingStep: Math.max(clinic.onboardingStep, 1),
    },
  });

  revalidatePath("/onboarding");
  redirect("/onboarding?step=2");
}

// ───────── Step 2: Specialties ─────────

export async function saveStep2(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const { clinic } = await requireUser();
  const specialties = formData.getAll("specialties").map(String);

  if (specialties.length === 0) {
    return { error: "Selecione ao menos uma especialidade." };
  }

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      specialties,
      onboardingStep: Math.max(clinic.onboardingStep, 2),
    },
  });

  revalidatePath("/onboarding");
  redirect("/onboarding?step=3");
}

// ───────── Step 3: Working hours ─────────

const dayHoursSchema = z
  .object({
    open: z.boolean(),
    start: z.string().optional(),
    end: z.string().optional(),
    lunchStart: z.string().optional(),
    lunchEnd: z.string().optional(),
  })
  .refine((d) => !d.open || (d.start && d.end), {
    message: "Defina início e fim do horário.",
  });

export type WorkingHoursPayload = Record<string, z.infer<typeof dayHoursSchema>>;

export async function saveStep3(payload: WorkingHoursPayload): Promise<StepState> {
  const { clinic } = await requireUser();

  for (const [day, hours] of Object.entries(payload)) {
    const result = dayHoursSchema.safeParse(hours);
    if (!result.success) {
      return { error: `Horários inválidos para ${day}.` };
    }
  }

  await db.clinic.update({
    where: { id: clinic.id },
    data: {
      workingHours: payload,
      onboardingStep: Math.max(clinic.onboardingStep, 3),
    },
  });

  revalidatePath("/onboarding");
  redirect("/onboarding?step=4");
}

// ───────── Step 4: Team invites (optional) ─────────

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["ADMIN", "ATTENDANT", "DENTIST"]),
});

export async function inviteMember(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const { clinic } = await requireUser();
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { fieldErrors };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await db.invite.create({
      data: {
        clinicId: clinic.id,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        expiresAt,
      },
    });
  } catch {
    return { error: "Não foi possível criar o convite." };
  }

  revalidatePath("/onboarding");
  return {};
}

export async function finishOnboarding(): Promise<void> {
  const { clinic } = await requireUser();
  await db.clinic.update({
    where: { id: clinic.id },
    data: { onboardingStep: 4, onboardingDone: true },
  });
  redirect("/dashboard");
}
