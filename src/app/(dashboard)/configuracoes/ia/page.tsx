import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIConfigShell } from "@/components/ai-config/ai-config-shell";
import type { AIConfig, Tone } from "@/lib/mock-ai-config";

export const dynamic = "force-dynamic";

export default async function IAPage() {
  const { clinic } = await requireUser();

  const [aiConfig, procedures] = await Promise.all([
    db.aIConfig.findUnique({ where: { clinicId: clinic.id } }),
    db.procedure.findMany({
      where: { clinicId: clinic.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const initial: AIConfig = {
    tone: (aiConfig?.tone ?? "acolhedor") as Tone,
    greeting:
      aiConfig?.greeting ??
      "Olá! Sou a assistente da clínica. Como posso te ajudar?",
    outOfHoursMsg:
      aiConfig?.outOfHoursMsg ??
      "Estamos fora do horário de atendimento. Deixe sua mensagem que retornaremos assim que possível.",
    farewell:
      aiConfig?.farewell ?? "Foi um prazer te atender! Qualquer dúvida, estou por aqui.",
    useEmojis: aiConfig?.useEmojis ?? true,
    description: clinic.description ?? "",
    specialties: clinic.specialties ?? [],
    acceptedInsurance: clinic.acceptedInsurance ?? [],
    paymentMethods: clinic.paymentMethods ?? [],
    procedures: procedures.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      price: p.price ? Number(p.price) : 0,
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
    })),
    triageQuestions: aiConfig?.triageQuestions ?? [],
    escalationKeywords: aiConfig?.escalationKeywords ?? [],
  };

  return <AIConfigShell initial={initial} />;
}
