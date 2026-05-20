import Link from "next/link";
import { Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrialBannerProps {
  trialEndsAt: string; // ISO
}

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const days = daysUntil(trialEndsAt);
  const expired = days === 0;
  const urgent = days <= 3;

  const tone = expired
    ? "border-danger/40 bg-danger/10 text-danger"
    : urgent
      ? "border-warning/40 bg-warning/10 text-text-primary"
      : "border-brand-accent/30 bg-brand-accent-soft/50 text-text-primary";

  const Icon = expired || urgent ? AlertTriangle : Sparkles;
  const iconColor = expired
    ? "text-danger"
    : urgent
      ? "text-warning"
      : "text-brand-primary";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 flex items-center justify-between gap-3 flex-wrap",
        tone,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={18} className={cn("flex-shrink-0", iconColor)} />
        <p className="text-sm font-medium">
          {expired ? (
            <>
              <strong>Seu teste grátis acabou.</strong> Escolha um plano pra
              voltar a usar o atendimento da IA.
            </>
          ) : days === 1 ? (
            <>
              <strong>Último dia do teste grátis.</strong> Escolha um plano
              antes do fim de hoje.
            </>
          ) : (
            <>
              Restam{" "}
              <strong className="tabular-nums">{days} dias</strong> de teste
              grátis. Escolha um plano sem pressa.
            </>
          )}
        </p>
      </div>
      <Link
        href="/precos"
        className={cn(
          "flex-shrink-0 inline-flex items-center px-4 h-9 rounded-md font-semibold text-sm transition-colors min-h-11 sm:min-h-9",
          expired || urgent
            ? "bg-danger text-white hover:bg-danger/90"
            : "bg-brand-primary text-white hover:bg-brand-primary-dark",
        )}
      >
        Escolher plano
      </Link>
    </div>
  );
}
