"use client";

import { Sparkles, Zap, Receipt, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceBRL, PLANS } from "@/lib/plans";

interface UsageProps {
  messagesUsed: number;
  messageLimit: number | null; // null = unlimited
  usageRatio: number;
  isOver: boolean;
  estimatedCostCents: number;
}

interface PlanProps {
  id: string;
  label: string;
  priceCents: number;
}

interface DailyPoint {
  day: string; // YYYY-MM-DD
  count: number;
}

export interface BillingPageProps {
  usage: UsageProps;
  plan: PlanProps;
  trialEndsAt: string | null;
  cycleStart: string;
  cycleEnd: string;
  daily: DailyPoint[];
}

function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

export function BillingPage({
  usage,
  plan,
  trialEndsAt,
  cycleStart,
  cycleEnd,
  daily,
}: BillingPageProps) {
  const limitDisplay =
    usage.messageLimit === null
      ? "ilimitado"
      : usage.messageLimit.toLocaleString("pt-BR");
  const pct = Math.round(usage.usageRatio * 100);
  const isTrial = plan.id === "trial";
  const trialDaysLeft = trialEndsAt ? daysUntil(trialEndsAt) : null;

  // Tone for usage bar
  let barTone = "bg-success";
  if (usage.isOver) barTone = "bg-danger";
  else if (usage.usageRatio >= 0.95) barTone = "bg-danger";
  else if (usage.usageRatio >= 0.8) barTone = "bg-warning";

  // Daily chart — find max for scale
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          Faturamento
        </h1>
        <p className="mt-2 text-text-secondary">
          Acompanhe seu uso, plano e custos do ciclo atual.
        </p>
      </header>

      {/* Trial banner */}
      {isTrial && trialDaysLeft !== null && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 flex items-start gap-3",
            trialDaysLeft <= 3
              ? "border-danger/30 bg-danger/10"
              : "border-brand-accent/30 bg-brand-accent-soft/50",
          )}
        >
          <AlertTriangle
            size={18}
            className={cn(
              "flex-shrink-0 mt-0.5",
              trialDaysLeft <= 3 ? "text-danger" : "text-brand-primary",
            )}
          />
          <div className="flex-1">
            <p className="font-semibold text-text-primary">
              {trialDaysLeft === 0
                ? "Seu teste grátis termina hoje"
                : `Restam ${trialDaysLeft} ${trialDaysLeft === 1 ? "dia" : "dias"} de teste grátis`}
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Escolha um plano antes de {formatDateBR(trialEndsAt!)} pra
              continuar sem interrupção.
            </p>
          </div>
        </div>
      )}

      {/* Plano atual */}
      <section className="rounded-lg border border-border bg-gradient-to-br from-brand-primary to-brand-primary-light text-white shadow-lg overflow-hidden relative">
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} />
                Plano atual
              </span>
              <h2 className="font-display font-bold text-2xl mt-3">
                OdontIAChat {plan.label}
              </h2>
              <p className="text-white/85 mt-1 text-sm">
                {usage.messageLimit === null
                  ? "Mensagens ilimitadas"
                  : `Até ${usage.messageLimit.toLocaleString("pt-BR")} mensagens/mês`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-extrabold text-3xl">
                {formatPriceBRL(plan.priceCents)}
              </p>
              {plan.priceCents > 0 && (
                <p className="text-white/70 text-xs">/mês</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Escolha um plano — só pra quem ainda está em trial */}
      {isTrial && (
        <section className="rounded-lg border border-border bg-bg-base p-6">
          <header className="mb-4">
            <h3 className="font-display font-bold text-lg text-text-primary">
              Pronto pra continuar? Escolha um plano
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Cobrança mensal pelo Mercado Pago. Cancele quando quiser.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["solo", "clinica", "pro"] as const).map((id) => {
              const p = PLANS[id];
              if (!p.checkoutUrl) return null;
              const featured = id === "clinica";
              return (
                <a
                  key={id}
                  href={p.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group rounded-lg border p-4 transition-colors",
                    featured
                      ? "border-brand-primary bg-brand-accent-soft/30 hover:bg-brand-accent-soft/50"
                      : "border-border bg-bg-base hover:border-brand-primary hover:bg-brand-accent-soft/20",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display font-bold text-text-primary">
                      {p.label}
                    </p>
                    {featured && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                        Mais popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-display font-extrabold text-2xl text-text-primary">
                    {formatPriceBRL(p.priceCents)}
                    <span className="text-xs font-semibold text-text-muted">
                      {" "}
                      /mês
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {p.monthlyMessageLimit.toLocaleString("pt-BR")} msgs/mês
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary group-hover:underline">
                    Assinar
                    <ArrowRight size={14} />
                  </p>
                </a>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Depois de pagar, seu plano pode levar alguns minutos pra ser
            ativado.
          </p>
        </section>
      )}

      {/* Uso do mês */}
      <section className="rounded-lg border border-border bg-bg-base p-6">
        <header className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
              <Zap size={18} />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              Uso do ciclo atual
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            {formatDateBR(cycleStart)} → {formatDateBR(cycleEnd)}
          </p>
        </header>

        <div className="mb-2 flex items-baseline justify-between flex-wrap gap-2">
          <p className="text-4xl font-display font-extrabold text-text-primary tabular-nums">
            {usage.messagesUsed.toLocaleString("pt-BR")}
            <span className="text-lg font-semibold text-text-muted">
              {" "}
              / {limitDisplay} msgs
            </span>
          </p>
          {usage.messageLimit !== null && (
            <p className="text-lg font-semibold text-text-secondary tabular-nums">
              {pct}%
            </p>
          )}
        </div>

        {usage.messageLimit !== null && (
          <div className="h-3 w-full overflow-hidden rounded-full bg-bg-mist">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                barTone,
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        )}

        {usage.isOver && (
          <div className="mt-4 rounded-md bg-danger/10 border border-danger/30 p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">
                Você passou do limite do plano
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Cada mensagem extra está sendo cobrada a R$ 0,15. Considere
                fazer upgrade pra plano superior pra economizar.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Gráfico diário */}
      {daily.length > 0 && (
        <section className="rounded-lg border border-border bg-bg-base p-6">
          <header className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
              <TrendingUp size={18} />
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              Mensagens por dia
            </h3>
          </header>

          <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
            {daily.map((d) => {
              const ratio = d.count / maxDaily;
              return (
                <div
                  key={d.day}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  title={`${d.day}: ${d.count} msgs`}
                >
                  <div
                    className="w-6 rounded-t-sm bg-brand-primary"
                    style={{ height: `${Math.max(2, ratio * 100)}%` }}
                  />
                  <span className="text-[10px] text-text-muted tabular-nums">
                    {d.day.slice(8, 10)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Custo estimado */}
      <section className="rounded-lg border border-border bg-bg-base p-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
            <Receipt size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-text-primary">
              Custo operacional estimado
            </h3>
            <p className="text-xs text-text-muted">
              Soma dos custos de IA neste ciclo (informativo — não é o preço do
              seu plano)
            </p>
          </div>
        </div>
        <p className="font-display font-extrabold text-2xl text-text-primary tabular-nums">
          {formatPriceBRL(Math.round(usage.estimatedCostCents))}
        </p>
      </section>
    </div>
  );
}
