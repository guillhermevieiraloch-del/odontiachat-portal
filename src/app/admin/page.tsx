import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries/admin";
import { formatPriceBRL } from "@/lib/plans";
import { Logo } from "@/components/brand/logo";
import { AdminClinicsTable } from "@/components/admin/admin-clinics-table";

export const dynamic = "force-dynamic";

/** Formata margem em centavos, lidando com valores negativos (formatPriceBRL
 * trata negativo como "Sob consulta", o que não serve pra margem). */
function fmtMargin(cents: number): string {
  return cents < 0 ? `- ${formatPriceBRL(-cents)}` : formatPriceBRL(cents);
}

export default async function AdminPage() {
  const ctx = await requireUser();

  // Em vez de redirect silencioso: mostra exatamente o que o servidor lê.
  if (!ctx.profile.isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-xl border border-border bg-bg-base p-8">
          <h1 className="text-xl font-display font-bold text-text-primary">
            Acesso restrito ao centro de controle
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Esta conta não está marcada como administradora da plataforma.
          </p>
          <div className="mt-4 rounded-lg bg-bg-mist p-4 text-sm font-mono text-text-primary space-y-1">
            <p>email: {ctx.authUser.email ?? "(sem email)"}</p>
            <p>user id: {ctx.profile.id}</p>
            <p>isPlatformAdmin: {JSON.stringify(ctx.profile.isPlatformAdmin)}</p>
          </div>
          <Link
            href="/dashboard"
            className="mt-5 inline-block text-sm font-semibold text-brand-primary hover:underline"
          >
            Ir para o portal da clínica
          </Link>
        </div>
      </div>
    );
  }

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
      value: fmtMargin(totals.grossMarginCents),
      sub:
        totals.mrrCents > 0
          ? `${Math.round((totals.grossMarginCents / totals.mrrCents) * 100)}% do MRR`
          : "—",
    },
    {
      label: "Mensagens no ciclo",
      value: totals.messagesThisCycle.toLocaleString("pt-BR"),
      sub: "total processado pela IA",
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
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

        {/* Tabela de clínicas com filtros + ordenação */}
        <AdminClinicsTable clinics={clinics} />

        <p className="mt-4 text-xs text-text-muted">
          Custo IA = soma real dos tokens (UsageEvent) no ciclo. Margem =
          receita do plano − custo IA. Não inclui infra fixa (Vercel/Supabase/Railway).
        </p>
      </main>
    </div>
  );
}
