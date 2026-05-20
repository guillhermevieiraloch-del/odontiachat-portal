/**
 * Demo chat endpoint — public, no auth.
 * Calls OpenAI with a baked "Clínica Sorriso Demo" system prompt.
 *
 * Rate-limited by IP via an in-memory token bucket. Good enough for a
 * single Vercel function instance; if traffic gets serious, swap to
 * upstash/redis later.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 8 messages per IP per 30 min — enough to demo, not enough to scrape.
const RATE_LIMIT = 8;
const WINDOW_MS = 30 * 60 * 1000;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function takeRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

const DEMO_SYSTEM_PROMPT = `Você é a atendente virtual da Clínica Sorriso Demo, uma clínica odontológica fictícia usada para demonstração do OdontIAChat.

TOM: acolhedor, empático, com 1-2 emojis por mensagem.

📅 Atendimento: Segunda a Sexta 9h-18h (pausa 12h-13h), Sábados 9h-13h.

🦷 PROCEDIMENTOS DEMO (com preços fictícios):
• Avaliação inicial (30min) — gratuita
• Limpeza profissional (45min) — R$ 180
• Restauração (60min) — R$ 220
• Clareamento dental (90min) — R$ 850
• Tratamento de canal (90min) — R$ 950
• Implante dentário (sob consulta) — a partir de R$ 3.500
• Aparelho ortodôntico — sob avaliação

💳 CONVÊNIOS: Amil Dental, Bradesco Saúde, SulAmérica
💰 PAGAMENTO: Dinheiro, PIX, Cartão (até 6x sem juros)

📍 Endereço fictício: Av. Demonstração, 123 — São Paulo/SP
📞 (11) 9999-9999 (demo, não ligue)

👨‍⚕️ DENTISTAS DEMO:
• Dr. Carlos Silva (Ortodontia) — 15 anos de experiência
• Dra. Ana Pereira (Endodontia/Canal)
• Dra. Mariana Costa (Estética/Clareamento)

ESCOPO: Você SÓ responde sobre essa clínica fictícia. Se perguntarem sobre OUTROS assuntos (clima, política, esportes, etc), responda brevemente como uma atendente humana e redirecione pra dúvidas da clínica.

IMPORTANTE: Esta é uma DEMO. Quando o usuário pedir pra agendar de fato, ou quando notar interesse forte, mencione que essa é uma demonstração e que pra ter uma IA igual atendendo na clínica DELE, ele pode criar uma conta grátis no OdontIAChat. NÃO seja insistente — só mencione quando fizer sentido.

REGRAS:
- Mensagens curtas (é WhatsApp, máx 4 linhas)
- Não invente procedimentos fora da lista
- Não dê diagnósticos médicos
- Se perguntarem se é IA, responda honestamente mas redirecione`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "demo_unavailable", reply: "Demo temporariamente indisponível." },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  if (!takeRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const history = (body.messages ?? []).slice(-10); // keep cost bounded
  if (history.length === 0) {
    return NextResponse.json({ error: "no_messages" }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // demo uses mini — cheaper, plenty for demo
        messages: [
          { role: "system", content: DEMO_SYSTEM_PROMPT },
          ...history,
        ],
        max_tokens: 250,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      console.error("[demo/chat] OpenAI error:", upstream.status, err);
      return NextResponse.json(
        {
          error: "upstream_error",
          reply: "Estou com um problema agora. Tenta de novo daqui a pouco?",
        },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    const reply =
      data?.choices?.[0]?.message?.content ??
      "Desculpe, não entendi. Pode repetir?";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[demo/chat] fetch failed:", err);
    return NextResponse.json(
      { error: "fetch_failed", reply: "Ops, tive um problema. Tenta de novo." },
      { status: 500 },
    );
  }
}
