"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, User, Hand, UserCircle2, Paperclip, Send, MoreVertical } from "lucide-react";
import { cn, getInitials, formatPhoneBR } from "@/lib/utils";
import type { InboxConversation, Message, Sender } from "@/lib/mock-inbox-data";

interface ConversationViewProps {
  conversation: InboxConversation;
  onBack?: () => void;
  onToggleProfile?: () => void;
  profileOpen?: boolean;
}

export function ConversationView({
  conversation,
  onBack,
  onToggleProfile,
  profileOpen,
}: ConversationViewProps) {
  const [draft, setDraft] = useState("");
  const [aiPaused, setAiPaused] = useState(conversation.handledBy === "attendant");
  const [sending, setSending] = useState(false);
  const [pendingHandover, setPendingHandover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom on conversation change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.id, conversation.messages.length]);

  useEffect(() => {
    setAiPaused(conversation.handledBy === "attendant");
  }, [conversation.id, conversation.handledBy]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/inbox/${conversation.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao enviar");
      }
      setDraft("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const toggleAi = async () => {
    setError(null);
    setPendingHandover(true);
    const newPaused = !aiPaused;
    try {
      const res = await fetch(`/api/inbox/${conversation.id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handledBy: newPaused ? "attendant" : "ai" }),
      });
      if (!res.ok) throw new Error("Falha ao trocar atendimento");
      setAiPaused(newPaused);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingHandover(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-mist">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-bg-base px-4 py-3 min-h-[68px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200 lg:hidden"
            aria-label="Voltar para a lista"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {(() => {
          const rawName = conversation.patient.name?.trim() ?? "";
          const rawPhone = conversation.patient.phone ?? "";
          const isJustPhone =
            !rawName ||
            rawName === rawPhone ||
            /^\+?\d+$/.test(rawName.replace(/\s/g, ""));
          const displayName = isJustPhone ? "Paciente sem nome" : rawName;
          const displayPhone = formatPhoneBR(rawPhone);
          const initials = isJustPhone ? "?" : getInitials(rawName);

          return (
            <>
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0",
                  "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
                  "shadow-[0_4px_10px_-2px_rgba(13,59,102,0.35)] ring-2 ring-bg-base",
                )}
                aria-hidden="true"
              >
                {initials}
              </span>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-display font-bold text-text-primary truncate",
                    isJustPhone && "text-text-secondary italic font-semibold",
                  )}
                >
                  {displayName}
                </p>
                <p className="text-xs text-text-secondary truncate flex items-center gap-1.5">
                  <span className="hidden sm:inline tabular-nums">{displayPhone}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={cn(
                        "inline-block h-1.5 w-1.5 rounded-full",
                        conversation.status === "online"
                          ? "bg-success animate-soft-pulse"
                          : "bg-text-muted",
                      )}
                      aria-hidden="true"
                    />
                    {conversation.status === "online" ? "Online" : "Offline"}
                  </span>
                </p>
              </div>
            </>
          );
        })()}

        <button
          type="button"
          onClick={toggleAi}
          disabled={pendingHandover}
          className={cn(
            "hidden sm:inline-flex items-center gap-2 h-11 px-4 rounded-md text-sm font-bold transition-colors duration-200 disabled:opacity-50",
            aiPaused
              ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
              : "border border-border text-text-primary hover:bg-bg-mist",
          )}
        >
          <Hand size={14} />
          {pendingHandover
            ? "..."
            : aiPaused
              ? "Reativar IA"
              : "Assumir conversa"}
        </button>

        <button
          type="button"
          onClick={onToggleProfile}
          className={cn(
            "hidden lg:flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200",
            profileOpen && "bg-bg-mist text-brand-primary",
          )}
          aria-label="Ver perfil do paciente"
          aria-pressed={profileOpen}
        >
          <UserCircle2 size={20} />
        </button>

        <button
          type="button"
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200"
          aria-label="Mais opções"
          onClick={onToggleProfile}
        >
          <MoreVertical size={18} />
        </button>
      </header>

      {/* Banner when AI is paused */}
      {aiPaused && (
        <div
          role="status"
          className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-xs text-warning font-semibold text-center"
        >
          A IA está pausada nesta conversa. As mensagens precisam ser respondidas manualmente.
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 flex flex-col justify-end min-h-0">
        {conversation.messages.map((m, i) => {
          const prev = conversation.messages[i - 1];
          const showSenderGap = !prev || prev.sender !== m.sender;
          return (
            <MessageBubble
              key={m.id}
              message={m}
              showGap={showSenderGap}
            />
          );
        })}
      </div>

      {/* Input */}
      <footer className="border-t border-border bg-bg-base p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:text-brand-primary hover:bg-bg-mist transition-all duration-200 ease-out-soft active:scale-95 flex-shrink-0"
            aria-label="Anexar arquivo"
          >
            <Paperclip size={18} />
          </button>

          <label className="sr-only" htmlFor="message-input">
            Mensagem
          </label>
          <textarea
            id="message-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              aiPaused
                ? "Você está respondendo manualmente..."
                : "Mensagem (a IA está respondendo automaticamente)"
            }
            rows={1}
            className="flex-1 min-h-11 max-h-32 resize-none rounded-lg border border-border bg-bg-soft px-4 py-3 text-sm text-text-primary placeholder:text-text-muted shadow-xs focus:outline-none focus:border-brand-accent focus:bg-bg-base focus:ring-[3px] focus:ring-brand-accent/22 focus:shadow-sm transition-all duration-200 ease-out-soft"
          />

          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg flex-shrink-0",
              "text-white",
              "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
              "shadow-[0_4px_12px_-2px_rgba(13,59,102,0.4)]",
              "hover:shadow-[0_8px_20px_-4px_rgba(13,59,102,0.55),0_0_18px_-4px_rgba(64,224,208,0.5)]",
              "hover:-translate-y-0.5",
              "active:scale-95 active:duration-100",
              "transition-all duration-200 ease-out-soft",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
            )}
            aria-label="Enviar mensagem"
          >
            <Send size={17} />
          </button>
        </form>
        {error && (
          <p role="alert" className="text-xs text-danger mt-2">
            {error}
          </p>
        )}
      </footer>
    </div>
  );
}

function MessageBubble({ message, showGap }: { message: Message; showGap: boolean }) {
  const isOutbound = message.sender !== "patient";
  const senderConfig: Record<Sender, { bg: string; badgeIcon: React.ReactNode; badgeLabel: string; badgeBg: string }> =
    {
      patient: {
        bg: "bg-bg-base text-text-primary border border-border",
        badgeIcon: null,
        badgeLabel: "",
        badgeBg: "",
      },
      ai: {
        bg: "text-white bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
        badgeIcon: <Bot size={10} />,
        badgeLabel: "IA",
        badgeBg: "bg-white/15 text-brand-accent border border-white/20",
      },
      attendant: {
        bg: "text-white bg-[linear-gradient(135deg,#0e9f6e_0%,#10b981_100%)]",
        badgeIcon: <User size={10} />,
        badgeLabel: "Atendente",
        badgeBg: "bg-white/20 text-white border border-white/25",
      },
    };
  const cfg = senderConfig[message.sender];

  return (
    <div
      className={cn(
        "flex animate-fade-in-up",
        isOutbound ? "justify-end" : "justify-start",
        showGap && "mt-3",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm",
          cfg.bg,
          isOutbound ? "rounded-tr-sm" : "rounded-tl-sm",
        )}
      >
        {message.sender === "ai" || message.sender === "attendant" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1.5",
              cfg.badgeBg,
            )}
          >
            {cfg.badgeIcon}
            {cfg.badgeLabel}
          </span>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
        <span
          className={cn(
            "flex items-center justify-end gap-1 text-[10px] mt-1",
            isOutbound ? "text-white/70" : "text-text-muted",
          )}
        >
          {message.time}
          {isOutbound && (
            <svg
              width="14"
              height="9"
              viewBox="0 0 16 11"
              fill="none"
              aria-hidden="true"
              className={message.sender === "ai" ? "text-brand-accent" : "text-white/85"}
            >
              <path
                d="M11.071.653a.5.5 0 1 0-.781-.625L4.5 7.32 1.99 4.18a.5.5 0 1 0-.78.625l2.9 3.625a.5.5 0 0 0 .78 0L11.072.653zM15.071.653a.5.5 0 1 0-.781-.625L8.5 7.32 8.025 6.726l-.625.781.4.5a.5.5 0 0 0 .78 0L15.072.653z"
                fill="currentColor"
              />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
}
