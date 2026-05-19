import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1),
});

const TONE_DESCRIPTIONS: Record<string, string> = {
  formal: "profissional, sem gírias, linguagem culta",
  casual: "direto e descontraído, como um amigo",
  acolhedor: "empático e caloroso, com cuidado humano",
};

function buildSystemPrompt(opts: {
  clinicName: string;
  tone: string;
  useEmojis: boolean;
  description: string | null;
  greeting: string;
  procedures: { name: string; duration: number; price: number; acceptsInsurance: boolean; showPrice: boolean }[];
  acceptedInsurance: string[];
  paymentMethods: string[];
  triageQuestions: string[];
  escalationKeywords: string[];
}): string {
  const tone = TONE_DESCRIPTIONS[opts.tone] || TONE_DESCRIPTIONS.acolhedor;
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const procedureList = opts.procedures.length
    ? opts.procedures
        .map((p) => {
          const price =
            p.showPrice && p.price > 0
              ? `R$ ${p.price.toFixed(2).replace(".", ",")}`
              : p.showPrice
                ? "gratuita"
                : "sob consulta";
          return `• ${p.name} (${p.duration}min) — ${price}${p.acceptsInsurance ? " · aceita convênio" : ""}`;
        })
        .join("\n")
    : "(nenhum procedimento cadastrado ainda)";

  return `Você é a atendente virtual da ${opts.clinicName}.
TOM DE VOZ: ${tone}.
${opts.useEmojis ? "Use emojis com moderação (1-2 por mensagem)." : "Não use emojis."}

Hoje é ${today}.

PROCEDIMENTOS:
${procedureList}

CONVÊNIOS: ${opts.acceptedInsurance.length ? opts.acceptedInsurance.join(", ") : "apenas particular"}
FORMAS DE PAGAMENTO: ${opts.paymentMethods.length ? opts.paymentMethods.join(", ") : "consultar"}

${opts.description ? `SOBRE A CLÍNICA:\n${opts.description}\n\n` : ""}${opts.triageQuestions.length ? `ANTES DE AGENDAR, faça uma destas perguntas:\n${opts.triageQuestions.map((q) => `- ${q}`).join("\n")}\n\n` : ""}REGRAS:
- Mensagens curtas, claras e diretas (é WhatsApp).
- Sempre pergunte o nome do paciente antes de finalizar agendamento.
- Mostre no máximo 6 horários por vez.
- Este é um modo de SIMULAÇÃO — você pode propor horários genéricos, mas avise quando estiver assumindo. Não chame ferramentas reais.

PRIMEIRA SAUDAÇÃO (use se for o início da conversa):
${opts.greeting}`;
}

export async function POST(req: NextRequest) {
  const { clinic } = await requireUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no servidor." },
      { status: 503 },
    );
  }

  // Load AIConfig + procedures freshly so the simulator reflects the latest settings
  const fullClinic = await db.clinic.findUnique({
    where: { id: clinic.id },
    include: {
      aiConfig: true,
      procedures: { where: { active: true } },
    },
  });

  if (!fullClinic?.aiConfig) {
    return NextResponse.json(
      { error: "Configure a IA primeiro em Configurações > IA." },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey });

  // Check escalation keywords on the latest user message
  const latestUser = [...parsed.data.messages]
    .reverse()
    .find((m) => m.role === "user");
  if (
    latestUser &&
    fullClinic.aiConfig.escalationKeywords.some((k) =>
      latestUser.content.toLowerCase().includes(k.toLowerCase()),
    )
  ) {
    const emoji = fullClinic.aiConfig.useEmojis ? " 🙏" : "";
    return NextResponse.json({
      reply: `Entendi a urgência. Vou transferir você para um atendente humano agora.${emoji}`,
      escalated: true,
    });
  }

  const systemPrompt = buildSystemPrompt({
    clinicName: fullClinic.name,
    tone: fullClinic.aiConfig.tone,
    useEmojis: fullClinic.aiConfig.useEmojis,
    description: fullClinic.description,
    greeting: fullClinic.aiConfig.greeting,
    procedures: fullClinic.procedures.map((p) => ({
      name: p.name,
      duration: p.duration,
      price: Number(p.price ?? 0),
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
    })),
    acceptedInsurance: fullClinic.acceptedInsurance,
    paymentMethods: fullClinic.paymentMethods,
    triageQuestions: fullClinic.aiConfig.triageQuestions,
    escalationKeywords: fullClinic.aiConfig.escalationKeywords,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...parsed.data.messages,
      ],
      temperature: 0.7,
      max_tokens: 400,
    });
    const reply =
      completion.choices[0]?.message?.content ?? "Desculpe, não consegui responder.";
    return NextResponse.json({ reply, escalated: false });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json(
      { error: "Erro ao chamar a IA. Verifique a OPENAI_API_KEY." },
      { status: 502 },
    );
  }
}
