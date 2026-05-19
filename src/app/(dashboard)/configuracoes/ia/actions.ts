"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const procedureSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  duration: z.number().int().positive(),
  price: z.number().nonnegative(),
  acceptsInsurance: z.boolean(),
  showPrice: z.boolean(),
});

const aiConfigSchema = z.object({
  tone: z.enum(["formal", "casual", "acolhedor"]),
  greeting: z.string().trim().min(1),
  outOfHoursMsg: z.string().trim().min(1),
  farewell: z.string().trim().min(1),
  useEmojis: z.boolean(),
  description: z.string(),
  specialties: z.array(z.string()),
  acceptedInsurance: z.array(z.string()),
  paymentMethods: z.array(z.string()),
  procedures: z.array(procedureSchema),
  triageQuestions: z.array(z.string()),
  escalationKeywords: z.array(z.string()),
});

export type SaveAIConfigInput = z.infer<typeof aiConfigSchema>;

export interface SaveAIConfigResult {
  ok: boolean;
  error?: string;
}

export async function saveAIConfigAction(
  input: SaveAIConfigInput,
): Promise<SaveAIConfigResult> {
  const { clinic } = await requireUser();

  const parsed = aiConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" };
  }
  const data = parsed.data;

  const existing = await db.procedure.findMany({
    where: { clinicId: clinic.id },
    select: { id: true },
  });
  const existingIds = existing.map((p) => p.id);
  const existingSet = new Set(existingIds);
  const incomingSet = new Set(data.procedures.map((p) => p.id));
  const toDelete = existingIds.filter((id) => !incomingSet.has(id));
  const toUpdate = data.procedures.filter((p) => existingSet.has(p.id));
  const toCreate = data.procedures.filter((p) => !existingSet.has(p.id));

  await db.$transaction([
    db.clinic.update({
      where: { id: clinic.id },
      data: {
        description: data.description || null,
        specialties: data.specialties,
        acceptedInsurance: data.acceptedInsurance,
        paymentMethods: data.paymentMethods,
      },
    }),
    db.aIConfig.upsert({
      where: { clinicId: clinic.id },
      create: {
        clinicId: clinic.id,
        tone: data.tone,
        greeting: data.greeting,
        outOfHoursMsg: data.outOfHoursMsg,
        farewell: data.farewell,
        useEmojis: data.useEmojis,
        triageQuestions: data.triageQuestions,
        escalationKeywords: data.escalationKeywords,
      },
      update: {
        tone: data.tone,
        greeting: data.greeting,
        outOfHoursMsg: data.outOfHoursMsg,
        farewell: data.farewell,
        useEmojis: data.useEmojis,
        triageQuestions: data.triageQuestions,
        escalationKeywords: data.escalationKeywords,
      },
    }),
    ...(toDelete.length
      ? [
          db.procedure.deleteMany({
            where: { id: { in: toDelete }, clinicId: clinic.id },
          }),
        ]
      : []),
    ...toUpdate.map((p) =>
      db.procedure.update({
        where: { id: p.id },
        data: {
          name: p.name,
          duration: p.duration,
          price: p.price,
          acceptsInsurance: p.acceptsInsurance,
          showPrice: p.showPrice,
        },
      }),
    ),
    ...(toCreate.length
      ? [
          db.procedure.createMany({
            data: toCreate.map((p) => ({
              clinicId: clinic.id,
              name: p.name,
              duration: p.duration,
              price: p.price,
              acceptsInsurance: p.acceptsInsurance,
              showPrice: p.showPrice,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/configuracoes/ia");
  revalidatePath("/dashboard");
  return { ok: true };
}
