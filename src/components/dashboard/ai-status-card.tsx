"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AIStatus = "active" | "paused" | "offline";

interface AIStatusCardProps {
  initialStatus: AIStatus;
  lastActivity?: string;
}

export function AIStatusCard({ initialStatus, lastActivity }: AIStatusCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AIStatus>(initialStatus);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = {
    active: {
      label: "Online",
      dotColor: "bg-success",
      pulseColor: "bg-success/40",
      buttonLabel: "Pausar IA",
      buttonIcon: Pause,
      next: "paused" as AIStatus,
    },
    paused: {
      label: "Pausada",
      dotColor: "bg-warning",
      pulseColor: "bg-warning/40",
      buttonLabel: "Ativar IA",
      buttonIcon: Play,
      next: "active" as AIStatus,
    },
    offline: {
      label: "Offline",
      dotColor: "bg-text-muted",
      pulseColor: "bg-text-muted/30",
      buttonLabel: "Conectar",
      buttonIcon: Play,
      next: "active" as AIStatus,
    },
  }[status];

  const ButtonIcon = config.buttonIcon;

  const toggle = () => {
    // "offline" means WhatsApp isn't connected — toggling AI status won't help
    if (status === "offline") {
      router.push("/configuracoes/whatsapp");
      return;
    }
    start(async () => {
      setError(null);
      try {
        const res = await fetch("/api/ai/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: config.next }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Erro ao atualizar status");
        }
        setStatus(config.next);
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-bg-base p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 ease-out-soft">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-accent/20 blur-3xl"
      />
      <div className="relative flex items-start gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white flex-shrink-0 bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)] shadow-[0_4px_12px_-2px_rgba(13,59,102,0.4)]"
          aria-hidden="true"
        >
          <Bot size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Status da IA
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {status === "active" && (
                <span
                  className={cn(
                    "absolute inset-0 rounded-full animate-ping",
                    config.pulseColor,
                  )}
                />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  config.dotColor,
                )}
              />
            </span>
            <span className="font-display font-bold text-text-primary">
              {config.label}
            </span>
          </div>
          {lastActivity && (
            <p className="text-xs text-text-muted mt-1">
              Última atividade: {lastActivity}
            </p>
          )}
        </div>
      </div>

      <Button
        variant={status === "active" ? "secondary" : "primary"}
        size="sm"
        className="w-full mt-4"
        onClick={toggle}
        disabled={pending}
      >
        <ButtonIcon size={14} />
        {pending ? "Atualizando..." : config.buttonLabel}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger mt-2">
          {error}
        </p>
      )}
    </article>
  );
}
