import Link from "next/link";
import { Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceBRL, type PlanConfig } from "@/lib/plans";

export interface UsageCardProps {
  messagesUsed: number;
  messageLimit: number;
  usageRatio: number;
  isOver: boolean;
  estimatedCostCents: number;
  plan: PlanConfig;
}

function toneFromRatio(ratio: number, isOver: boolean): {
  bar: string;
  badge: string;
  badgeText: string;
  message?: string;
} {
  if (isOver) {
    return {
      bar: "bg-danger",
      badge: "bg-danger/10 text-danger border-danger/30",
      badgeText: "Limite excedido",
      message: "Você passou do limite. Cada msg extra custa R$ 0,15.",
    };
  }
  if (ratio >= 0.95) {
    return {
      bar: "bg-danger",
      badge: "bg-danger/10 text-danger border-danger/30",
      badgeText: "Quase no limite",
      message: "Considere fazer upgrade pra não pagar excedente.",
    };
  }
  if (ratio >= 0.8) {
    return {
      bar: "bg-warning",
      badge: "bg-warning/10 text-warning border-warning/30",
      badgeText: "Atenção",
      message: "Você está chegando perto do limite mensal.",
    };
  }
  return {
    bar: "bg-success",
    badge: "bg-success/10 text-success border-success/30",
    badgeText: "Tranquilo",
  };
}

export function UsageCard({
  messagesUsed,
  messageLimit,
  usageRatio,
  isOver,
  estimatedCostCents,
  plan,
}: UsageCardProps) {
  const tone = toneFromRatio(usageRatio, isOver);
  const limitDisplay =
    messageLimit === Infinity ? "ilimitado" : messageLimit.toLocaleString("pt-BR");
  const pct = Math.round(usageRatio * 100);
  const isTrial = plan.isTrial;

  return (
    <div className="rounded-2xl border border-border bg-bg-base p-5 shadow-card">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary flex-shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="font-display font-bold text-text-primary">
              Uso do mês
            </h2>
            <p className="text-xs text-text-muted">
              Plano <strong className="text-text-primary">{plan.label}</strong>
              {!isTrial && plan.priceCents > 0 && (
                <> · {formatPriceBRL(plan.priceCents)}/mês</>
              )}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wider rounded-full border px-2 py-1",
            tone.badge,
          )}
        >
          {tone.badgeText}
        </span>
      </header>

      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-3xl font-display font-extrabold text-text-primary tabular-nums">
          {messagesUsed.toLocaleString("pt-BR")}
          <span className="text-base font-semibold text-text-muted">
            {" "}
            / {limitDisplay}
          </span>
        </p>
        {messageLimit !== Infinity && (
          <p className="text-sm font-semibold text-text-secondary tabular-nums">
            {pct}%
          </p>
        )}
      </div>

      {messageLimit !== Infinity && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-mist">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              tone.bar,
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}

      {tone.message && (
        <div className="mt-3 flex items-start gap-2 text-xs text-text-secondary">
          <AlertTriangle
            size={14}
            className="mt-0.5 flex-shrink-0 text-warning"
          />
          <p>{tone.message}</p>
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between text-xs text-text-muted">
        <span>
          Custo estimado:{" "}
          <strong className="text-text-primary">
            {formatPriceBRL(Math.round(estimatedCostCents))}
          </strong>
        </span>
        <Link
          href="/configuracoes/faturamento"
          className="font-semibold text-brand-primary hover:underline"
        >
          Detalhes →
        </Link>
      </footer>
    </div>
  );
}
