"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  sender: "user" | "ai";
  content: string;
}

const STARTERS = [
  "Quanto custa uma limpeza?",
  "Vocês atendem convênio?",
  "Quero agendar uma consulta",
  "Onde fica a clínica?",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function DemoChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      sender: "ai",
      content:
        "Oi! 👋 Sou a assistente virtual da Clínica Sorriso Demo. Posso te ajudar com agendamento, dúvidas sobre tratamentos, valores e mais. O que você precisa?",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending || rateLimited) return;

    const userMsg: Msg = { id: uid(), sender: "user", content: trimmed };
    const aiMsgId = uid();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiMsgId, sender: "ai", content: "…" },
    ]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (res.status === 429) {
        setRateLimited(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content:
                    "Acabou o limite de mensagens do demo. Crie uma conta grátis pra continuar conversando com a IA da SUA clínica!",
                }
              : m,
          ),
        );
        return;
      }

      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { reply: string };
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, content: data.reply } : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content:
                  "Ops, tive um problema agora. Tenta de novo daqui a pouco.",
              }
            : m,
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-base shadow-card flex flex-col h-[600px]">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 bg-gradient-to-r from-brand-primary to-brand-primary-light text-white rounded-t-2xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Bot size={18} />
        </div>
        <div>
          <p className="font-semibold">Clínica Sorriso Demo</p>
          <p className="text-xs text-white/80">IA respondendo em tempo real</p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2 items-end",
              m.sender === "user" && "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0",
                m.sender === "user"
                  ? "bg-brand-accent text-brand-primary"
                  : "bg-brand-primary text-white",
              )}
            >
              {m.sender === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                m.sender === "user"
                  ? "bg-brand-primary text-white rounded-br-sm"
                  : "bg-bg-mist text-text-primary rounded-bl-sm",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-bg-base text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={rateLimited}
          placeholder={
            rateLimited
              ? "Limite do demo atingido — crie uma conta pra continuar"
              : "Mande uma mensagem como se fosse paciente…"
          }
          className="flex-1 rounded-md border border-border bg-bg-base px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={pending || !input.trim() || rateLimited}
          className="flex items-center justify-center h-11 w-11 rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Enviar"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
