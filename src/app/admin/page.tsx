import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries/admin";
import { formatPriceBRL } from "@/lib/plans";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function trialBadge(iso: string | null): { text: string; cls: string } | null {
  if (!iso) return null;
  const days = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return { text: "Trial expirado", cls: "bg-danger/10 text-danger" };
  if (days <= 3)
    return { text: `Trial ${days}d`, cls: "bg-warning/10 text-warning" };
  return { text: `Trial ${days}d`, cls: "bg-bg-mist text-text-secondary" };
}

export default async function AdminPage() {
  await requireAdmin();
  const { clinics, totals } = await getAdminOverview();

  const kpis = [
    {
      label: "Clínicas",
      value: String(totals.totalClinics),
      sub: `${totals.paidClinics} pagas · ${totals.trialClinics} em trial`,
    },
    {
      label: "MRR",
      value: formatPriceBRL(totals.mrrCents),
      sub: "receita recorrente mensal",
    },
    {
      label: "Custo estimado",
      value: formatPriceBRL(totals.estimatedCostCents),
      sub: "IA neste ciclo",
    },
    {
      label: "Margem bruta",
      value: formatPriceBRL(totals.grossMarginCents),
      sub:
        totals.mrrCents > 0
          ? `${Math.round((totals.grossMarginCents / totals.mrrCents) * 100)}% do MRR`
          : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="border-b border-border bg-bg-base">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Link
              href="/admin/leads"
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Leads →
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Centro de controle
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
            Visão geral das clínicas
          </h1>
          <p className="mt-1 text-text-secondary">
            Métricas de uso, receita e custo de todas as clínicas da plataforma.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border bg-bg-base p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {k.label}
              </p>
              <p className="mt-2 text-2xl lg:text-3xl font-display font-extrabold text-text-primary">
                {k.value}
              </p>
              <p className="mt-1 text-xs text-text-secondary">{k.sub}</p>
            </div>
          ))}
        </section>

        {/* Tabela de clínicas */}
        <section className="rounded-xl border border-border bg-bg-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-soft border-b border-border text-left">
                  <th className="px-4 py-3 font-semibold text-text-primary">
                    Clínica
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary">
                    Plano
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary">
                    Uso do ciclo
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary text-right">
                    Custo IA
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary text-right">
                    Receita
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary text-right">
                    Margem
                  </th>
                  <th className="px-4 py-3 font-semibold text-text-primary">
                    Criada
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinics.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-text-muted"
                    >
                      Nenhuma clínica cadastrada ainda.
                    </td>
                  </tr>
                )}
                {clinics.map((c) => {
                  const badge = trialBadge(c.trialEndsAt);
                  const margin = c.monthlyRevenueCents - c.estimatedCostCents;
                  const pct = Math.round(c.usageRatio * 100);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-b-0 hover:bg-bg-soft/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text-primary">
                          {c.name}
                        </p>
                        <p className="text-xs text-text-muted">{c.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-text-primary">
                          {c.planLabel}
                        </span>
                        {badge && (
                          <span
                            className={cn(
                              "ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              badge.cls,
                            )}
                          >
                            {badge.text}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-bg-mist overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                c.usageRatio >= 0.95
                                  ? "bg-danger"
                                  : c.usageRatio >= 0.8
                                    ? "bg-warning"
                                    : "bg-success",
                              )}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-text-secondary">
                            {c.messagesUsed.toLocaleString("pt-BR")}
                            {c.messageLimit !== null && (
                              <> / {c.messageLimit.toLocaleString("pt-BR")}</>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                        {formatPriceBRL(Math.round(c.estimatedCostCents))}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-text-primary font-medium">
                        {c.monthlyRevenueCents > 0
                          ? formatPriceBRL(c.monthlyRevenueCents)
                          : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right tabular-nums font-semibold",
                          margin >= 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {c.monthlyRevenueCents > 0
                          ? formatPriceBRL(Math.round(margin))
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted tabular-nums">
                        {fmtDate(c.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-xs text-text-muted">
          Custo IA = soma real dos tokens (UsageEvent) no ciclo. Margem =
          receita do plano − custo IA. Não inclui infra fixa (Vercel/Supabase/Railway).
        </p>
      </main>
    </div>
  );
}
