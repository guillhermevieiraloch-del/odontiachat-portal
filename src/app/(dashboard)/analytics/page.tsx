import {
  MessageCircle,
  CalendarCheck,
  TrendingUp,
  Bell,
  AlertCircle,
  Activity,
  Clock,
  Stethoscope,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getAnalyticsSummary,
  getAnalyticsDaily,
} from "@/lib/queries/analytics";
import { getProAnalytics } from "@/lib/queries/analytics-pro";
import { getPlan } from "@/lib/plans";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ProAnalyticsBlocks, ProAnalyticsLocked } from "@/components/analytics/pro-blocks";
import { ExportCard } from "@/components/analytics/export-card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { clinic } = await requireUser();
  const plan = getPlan(clinic.plan);
  const hasAdvanced = plan.features.advancedAnalytics;

  const [summary, daily, pro] = await Promise.all([
    getAnalyticsSummary(clinic.id),
    getAnalyticsDaily(clinic.id),
    hasAdvanced ? getProAnalytics(clinic.id) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="mt-2 text-text-secondary">
          Como sua IA está performando — últimos 30 dias.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <MetricCard
          label="Conversas"
          value={summary.totalConversations}
          caption={`${summary.totalMessages} mensagens trocadas`}
          icon={MessageCircle}
          iconBg="accent"
          delay={0}
        />
        <MetricCard
          label="Agendamentos criados"
          value={summary.totalAppointments}
          caption={`Taxa de conversão: ${summary.conversionRate}%`}
          icon={CalendarCheck}
          iconBg="primary"
          delay={80}
        />
        <MetricCard
          label="Lembretes enviados"
          value={summary.remindersSent}
          caption="24h antes da consulta"
          icon={Bell}
          iconBg="success"
          delay={160}
        />
        <MetricCard
          label="Escalações para humano"
          value={summary.totalEscalations}
          caption="Conversas transferidas"
          icon={AlertCircle}
          iconBg="warning"
          delay={240}
        />
      </section>

      <ActivityChart
        data={daily.map((d) => ({
          day: d.date,
          conversas: d.conversas,
          agendamentos: d.agendamentos,
        }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Top procedures */}
        <section className="rounded-2xl border border-border bg-bg-base p-5 shadow-card">
          <header className="flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
              <Stethoscope size={15} />
            </span>
            <h2 className="font-display font-bold text-text-primary">
              Procedimentos mais agendados
            </h2>
          </header>
          {summary.topProcedures.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              Nenhum procedimento agendado ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {summary.topProcedures.map((p, i) => {
                const max = summary.topProcedures[0].count || 1;
                const pct = Math.round((p.count / max) * 100);
                return (
                  <li key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-text-primary truncate">
                        {p.name}
                      </span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {p.count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-mist overflow-hidden">
                      <div
                        className="h-full bg-[linear-gradient(90deg,var(--brand-primary-light)_0%,var(--brand-accent)_100%)] transition-all duration-700 ease-out-soft"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Busiest hours */}
        <section className="rounded-2xl border border-border bg-bg-base p-5 shadow-card">
          <header className="flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
              <Clock size={15} />
            </span>
            <h2 className="font-display font-bold text-text-primary">
              Horários de pico
            </h2>
          </header>
          {summary.busiestHours.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              Sem dados suficientes ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {summary.busiestHours.map((h, i) => {
                const max = summary.busiestHours[0].count || 1;
                const pct = Math.round((h.count / max) * 100);
                const label = `${String(h.hour).padStart(2, "0")}h às ${String((h.hour + 1) % 24).padStart(2, "0")}h`;
                return (
                  <li key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-text-primary tabular-nums">
                        {label}
                      </span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {h.count} msg
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-mist overflow-hidden">
                      <div
                        className="h-full bg-[linear-gradient(90deg,var(--brand-accent)_0%,var(--brand-accent-dark)_100%)] transition-all duration-700 ease-out-soft"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-bg-base p-5 shadow-card">
        <header className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
            <Activity size={15} />
          </span>
          <h2 className="font-display font-bold text-text-primary">
            Engajamento médio
          </h2>
        </header>
        <p className="text-sm text-text-secondary leading-relaxed">
          Em média, cada conversa tem{" "}
          <strong className="text-text-primary tabular-nums">
            {summary.avgMessagesPerConversation}
          </strong>{" "}
          mensagens — quanto mais alto, mais engajamento.
          {summary.totalEscalations > 0 && (
            <>
              {" "}
              <strong className="text-warning tabular-nums">
                {summary.totalEscalations}
              </strong>{" "}
              {summary.totalEscalations === 1
                ? "conversa foi"
                : "conversas foram"}{" "}
              transferida{summary.totalEscalations === 1 ? "" : "s"} pra atendente
              humano (palavras-gatilho da triagem).
            </>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent-soft border border-brand-accent/25 px-3 py-1 text-xs font-bold text-brand-primary">
            <TrendingUp size={12} />
            {summary.conversionRate}% de conversão
          </span>
        </div>
      </section>

      {hasAdvanced && pro ? (
        <ProAnalyticsBlocks data={pro} />
      ) : (
        <ProAnalyticsLocked />
      )}

      <ExportCard unlocked={plan.features.csvExport} />
    </div>
  );
}
