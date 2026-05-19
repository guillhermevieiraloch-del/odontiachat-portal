"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, RefreshCcw, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIConfig } from "@/lib/mock-ai-config";

interface ChatMsg {
  id: string;
  sender: "patient" | "ai";
  content: string;
  time: string;
}

interface Props {
  config: AIConfig;
}

const HOUR = () =>
  new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function SimulatorTab({ config }: Props) {
  const initialMessages = (): ChatMsg[] => [
    { id: "init", sender: "ai", content: config.greeting, time: HOUR() },
  ];

  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const reset = () => {
    setMessages(initialMessages());
    setDraft("");
  };

  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const text = draft.trim();
    if (!text || pending) return;
    setError(null);

    const userMsg: ChatMsg = {
      id: `u_${Date.now()}`,
      sender: "patient",
      content: text,
      time: HOUR(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setDraft("");
    setPending(true);

    try {
      // Convert chat history to API format (skip the initial greeting)
      const apiMessages = nextMessages
        .filter((m) => m.id !== "init")
        .map((m) => ({
          role: (m.sender === "patient" ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: m.content,
        }));

      const res = await fetch("/api/ai/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro ${res.status}`);
      }
      const data = (await res.json()) as { reply: string; escalated: boolean };
      const aiMsg: ChatMsg = {
        id: `a_${Date.now()}`,
        sender: "ai",
        content: data.reply,
        time: HOUR(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-text-primary">
            Testar a IA
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Simule uma conversa com sua IA usando as configurações atuais. As
            mensagens não são salvas.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={reset}>
          <RefreshCcw size={14} />
          Resetar conversa
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-bg-base shadow-sm overflow-hidden flex flex-col h-[560px]">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 bg-brand-primary text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Bot size={16} />
          </span>
          <div>
            <p className="font-semibold text-sm">OdontIAChat</p>
            <p className="text-[11px] text-white/80">
              Modo de teste · {config.tone}
            </p>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="px-4 py-2 bg-danger/10 border-y border-danger/20 text-xs text-danger"
          >
            {error}
          </div>
        )}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-bg-mist space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.sender === "patient" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 shadow-sm flex flex-col gap-0.5",
                  m.sender === "patient"
                    ? "bg-brand-primary text-white rounded-tr-sm"
                    : "bg-bg-base text-text-primary rounded-tl-sm",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {m.content}
                </p>
                <span
                  className={cn(
                    "text-[10px] self-end",
                    m.sender === "patient" ? "text-white/70" : "text-text-muted",
                  )}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start">
              <div className="bg-bg-base rounded-lg rounded-tl-sm px-3 py-2.5 shadow-sm">
                <div className="flex gap-1" aria-label="OdontIAChat está digitando">
                  <Dot delay={0} />
                  <Dot delay={150} />
                  <Dot delay={300} />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-bg-base p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-mist text-text-muted flex-shrink-0"
              aria-hidden="true"
            >
              <User size={16} />
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Simule a mensagem de um paciente..."
              rows={1}
              className="flex-1 min-h-11 max-h-32 resize-none rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200"
              aria-label="Mensagem de teste"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar"
            >
              <Send size={18} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-brand-accent animate-pulse"
      style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
      aria-hidden="true"
    />
  );
}

