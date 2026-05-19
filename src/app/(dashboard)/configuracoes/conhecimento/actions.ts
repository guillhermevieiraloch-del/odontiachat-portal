"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const knowledgeSchema = z.object({
  // Localização
  addressReferences: z.string().optional(),
  parkingInfo: z.string().optional(),
  accessibilityInfo: z.string().optional(),
  publicTransportInfo: z.string().optional(),

  // Atendimento
  acceptsChildren: z.boolean().default(true),
  childrenMinAge: z.string().optional(),
  emergencyInfo: z.string().optional(),
  averageWaitTime: z.string().optional(),
  languagesSpoken: z.array(z.string()).default([]),

  // Políticas
  cancellationPolicy: z.string().optional(),
  latenessPolicy: z.string().optional(),
  noShowPolicy: z.string().optional(),

  // Primeira consulta
  firstVisitInfo: z.string().optional(),
  firstVisitDuration: z.string().optional(),

  // Equipe / diferenciais
  yearsInBusiness: z.number().int().nonnegative().nullable().optional(),
  differentiators: z.string().optional(),
  teamDescription: z.string().optional(),

  // Não-oferecidos
  notOfferedProcedures: z.string().optional(),
  partnerReferrals: z.string().optional(),

  // FAQs
  faqs: z.array(faqSchema).default([]),

  additionalNotes: z.string().optional(),
});

export type KnowledgeInput = z.infer<typeof knowledgeSchema>;

export interface KnowledgeResult {
  ok: boolean;
  error?: string;
}

const REQUIRED_FIELDS_FOR_COMPLETION = 5; // Pelo menos 5 campos preenchidos pra marcar como completo

function countFilled(data: KnowledgeInput): number {
  let n = 0;
  const stringFields: (keyof KnowledgeInput)[] = [
    "addressReferences", "parkingInfo", "accessibilityInfo", "publicTransportInfo",
    "childrenMinAge", "emergencyInfo", "averageWaitTime",
    "cancellationPolicy", "latenessPolicy", "noShowPolicy",
    "firstVisitInfo", "firstVisitDuration",
    "differentiators", "teamDescription",
    "notOfferedProcedures", "partnerReferrals",
    "additionalNotes",
  ];
  for (const f of stringFields) {
    const v = data[f];
    if (typeof v === "string" && v.trim().length > 0) n++;
  }
  if (data.languagesSpoken.length > 0) n++;
  if (data.faqs.length > 0) n++;
  if (data.yearsInBusiness != null && data.yearsInBusiness > 0) n++;
  return n;
}

export async function saveClinicKnowledgeAction(
  input: KnowledgeInput,
): Promise<KnowledgeResult> {
  const { clinic } = await requireUser();

  const parsed = knowledgeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  await db.clinicKnowledge.upsert({
    where: { clinicId: clinic.id },
    create: {
      clinicId: clinic.id,
      addressReferences: data.addressReferences || null,
      parkingInfo: data.parkingInfo || null,
      accessibilityInfo: data.accessibilityInfo || null,
      publicTransportInfo: data.publicTransportInfo || null,
      acceptsChildren: data.acceptsChildren,
      childrenMinAge: data.childrenMinAge || null,
      emergencyInfo: data.emergencyInfo || null,
      averageWaitTime: data.averageWaitTime || null,
      languagesSpoken: data.languagesSpoken,
      cancellationPolicy: data.cancellationPolicy || null,
      latenessPolicy: data.latenessPolicy || null,
      noShowPolicy: data.noShowPolicy || null,
      firstVisitInfo: data.firstVisitInfo || null,
      firstVisitDuration: data.firstVisitDuration || null,
      yearsInBusiness: data.yearsInBusiness ?? null,
      differentiators: data.differentiators || null,
      teamDescription: data.teamDescription || null,
      notOfferedProcedures: data.notOfferedProcedures || null,
      partnerReferrals: data.partnerReferrals || null,
      faqs: data.faqs,
      additionalNotes: data.additionalNotes || null,
    },
    update: {
      addressReferences: data.addressReferences || null,
      parkingInfo: data.parkingInfo || null,
      accessibilityInfo: data.accessibilityInfo || null,
      publicTransportInfo: data.publicTransportInfo || null,
      acceptsChildren: data.acceptsChildren,
      childrenMinAge: data.childrenMinAge || null,
      emergencyInfo: data.emergencyInfo || null,
      averageWaitTime: data.averageWaitTime || null,
      languagesSpoken: data.languagesSpoken,
      cancellationPolicy: data.cancellationPolicy || null,
      latenessPolicy: data.latenessPolicy || null,
      noShowPolicy: data.noShowPolicy || null,
      firstVisitInfo: data.firstVisitInfo || null,
      firstVisitDuration: data.firstVisitDuration || null,
      yearsInBusiness: data.yearsInBusiness ?? null,
      differentiators: data.differentiators || null,
      teamDescription: data.teamDescription || null,
      notOfferedProcedures: data.notOfferedProcedures || null,
      partnerReferrals: data.partnerReferrals || null,
      faqs: data.faqs,
      additionalNotes: data.additionalNotes || null,
    },
  });

  // Marca como completo se preencheu o mínimo
  const filledCount = countFilled(data);
  if (filledCount >= REQUIRED_FIELDS_FOR_COMPLETION && !clinic.knowledgeCompletedAt) {
    await db.clinic.update({
      where: { id: clinic.id },
      data: { knowledgeCompletedAt: new Date() },
    });
  }

  revalidatePath("/configuracoes/conhecimento");
  revalidatePath("/setup-conhecimento");
  revalidatePath("/dashboard");
  return { ok: true };
}
