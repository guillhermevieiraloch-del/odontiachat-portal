import { Lock, Stethoscope, Users, Clock, TrendingDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  ProAnalytics,
  HourDayHeatmap,
  FunnelStep,
  DentistPerformance,
  RetentionStats,
} from "@/lib/queries/analytics-pro";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function HeatmapBlock({ heatmap }: { heatmap: HourDayHeatmap }) {
  const max = heatmap.max || 1;
  return (
    <section className="rounded-2xl border border-border bg-bg-base p-6">
      <header className="mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">
          Quando seus pacientes mandam mensagem
        </h3>
        <p className="text-sm text-text-secondary mt-0.5">
          Útil pra entender quando reforçar atendimento humano vs deixar com a IA.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="text-[10px] tabular-nums">
          <thead>
            <tr>
              <th className="w-10" />
              {Array.from({ length: 24 }).map((_, h) => (
                <th
                  key={h}
                  className="w-6 h-6 text-center text-text-muted font-normal"
                >
                  {h % 3 === 0 ? `${h}h` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.cells.map((row, dow) => (
              <tr key={dow}>
                <td className="text-right pr-2 text-text-muted font-medium">
                  {WEEKDAYS[dow]}
                </td>
                {row.map((v, h) => {
                  const ratio = v / max;
                  return (
                    <td key={h} className="p-0.5">
                      <div
                        title={`${WEEKDAYS[dow]} ${h}h: ${v} msgs`}
                        className="w-5 h-5 rounded-sm"
                        style={{
                          backgroundColor:
                            v === 0
                              ? "rgb(var(--bg-mist) / 0.5)"
                              : `rgba(13, 59, 102, ${0.15 + 0.85 * ratio})`,
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FunnelBlock({ funnel }: { funnel: FunnelStep[] }) {
  return (
    <section className="rounded-2xl border border-border bg-bg-base p-6">
      <header className="mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">
          Funil de conversão
        </h3>
        <p className="text-sm text-text-secondary mt-0.5">
          Da primeira mensagem até a consulta realizada.
        </p>
      </header>
      <ul className="space-y-2">
        {funnel.map((step, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-text-primary">{step.label}</span>
              <span className="text-text-secondary tabular-nums">
                <strong className="text-text-primary">
                  {step.count.toLocaleString("pt-BR")}
                </strong>{" "}
                ({step.pctOfTop}%)
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-bg-mist overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  i === 0
                    ? "bg-brand-primary"
                    : i === funnel.length - 1
                      ? "bg-success"
                      : "bg-brand-primary-light",
                )}
                style={{ width: `${Math.min(100, step.pctOfTop)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DentistPerformanceBlock({
  data,
}: {
  data: DentistPerformance[];
}) {
  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-bg-base p-6">
        <header className="mb-4 flex items-center gap-2">
          <Stethoscope size={18} className="text-brand-primary" />
          <h3 className="font-display font-bold text-lg text-text-primary">
            Performance por dentista
          </h3>
        </header>
        <p className="text-sm text-text-secondary">
          Cadastre dentistas em Configurações &gt; Dentistas pra ver esse
          relatório.
        </p>
      </section>
    );
  }

  const maxAppts = Math.max(...data.map((d) => d.appointments), 1);

  return (
    <section className="rounded-2xl border border-border bg-bg-base p-6">
      <header className="mb-4 flex items-center gap-2">
        <Stethoscope size={18} className="text-brand-primary" />
        <h3 className="font-display font-bold text-lg text-text-primary">
          Performance por dentista
        </h3>
      </header>
      <ul className="space-y-3">
        {data.map((d) => {
          const ratio = d.appointments / maxAppts;
          const conversion =
            d.appointments > 0
              ? Math.round((d.completed / d.appointments) * 100)
              : 0;
          return (
            <li key={d.dentistId} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-muted">{d.specialty}</p>
                </div>
                <div className="text-right text-xs tabular-nums">
                  <p>
                    <strong className="text-text-primary text-base">
                      {d.appointments}
                    </strong>{" "}
                    <span className="text-text-muted">consultas</span>
                  </p>
                  <p className="text-text-muted">
                    {d.completed} feitas · {d.cancelled} canceladas ·{" "}
                    {conversion}% concluídas
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-bg-mist overflow-hidden">
                <div
                  className="h-full bg-brand-primary"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RetentionBlock({
  retention,
  avgTimeToFirstResponse,
}: {
  retention: RetentionStats;
  avgTimeToFirstResponse: number | null;
}) {
  const responseTimeDisplay =
    avgTimeToFirstResponse === null
      ? "—"
      : avgTimeToFirstResponse < 60
        ? `${avgTimeToFirstResponse}s`
        : `${Math.round(avgTimeToFirstResponse / 60)}min`;

  return (
    <section className="rounded-2xl border border-border bg-bg-base p-6">
      <header className="mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">
          Retenção e velocidade
        </h3>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-bg-soft p-4">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <Users size={14} />
            <span>Pacientes recorrentes</span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-text-primary tabular-nums">
            {retention.returningPatients}
          </p>
        </div>
        <div className="rounded-lg bg-bg-soft p-4">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <TrendingDown size={14} className="rotate-180" />
            <span>Taxa de retenção</span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-text-primary tabular-nums">
            {retention.retentionRate}%
          </p>
        </div>
        <div className="rounded-lg bg-bg-soft p-4">
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <Clock size={14} />
            <span>Resposta média</span>
          </div>
          <p className="mt-2 text-2xl font-display font-extrabold text-text-primary tabular-nums">
            {responseTimeDisplay}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ProAnalyticsBlocks({ data }: { data: ProAnalytics }) {
  return (
    <div className="space-y-5 lg:space-y-6">
      <header className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent-soft text-brand-primary text-[10px] font-bold uppercase tracking-wider">
          Plano Pro
        </span>
        <h2 className="font-display font-bold text-xl text-text-primary">
          Analytics avançado
        </h2>
      </header>
      <RetentionBlock
        retention={data.retention}
        avgTimeToFirstResponse={data.avgTimeToFirstResponse}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
        <FunnelBlock funnel={data.funnel} />
        <DentistPerformanceBlock data={data.dentistPerformance} />
      </div>
      <HeatmapBlock heatmap={data.heatmap} />
    </div>
  );
}

export function ProAnalyticsLocked() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-soft p-8 text-center">
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary">
        <Lock size={20} />
      </div>
      <h3 className="mt-4 font-display font-bold text-lg text-text-primary">
        Analytics avançado é exclusivo do Pro
      </h3>
      <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
        Heatmap de horários, funil de conversão, performance por dentista e
        retenção de pacientes — disponíveis no plano Pro.
      </p>
      <Link
        href="/precos"
        className="mt-5 inline-flex items-center justify-center px-4 h-11 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
      >
        Ver planos
      </Link>
    </div>
  );
}
