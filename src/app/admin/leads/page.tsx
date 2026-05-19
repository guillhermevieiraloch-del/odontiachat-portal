import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";
import { LeadRow } from "./lead-row";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  // For now, any authenticated user can see it. Add proper role gating later
  // (e.g. only specific founder emails or a SUPERADMIN role).
  await requireUser();

  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "NEW").length,
    contacted: leads.filter((l) => l.status === "CONTACTED").length,
    qualified: leads.filter((l) => l.status === "QUALIFIED").length,
    won: leads.filter((l) => l.status === "WON").length,
    lost: leads.filter((l) => l.status === "LOST").length,
  };

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="border-b border-border bg-bg-base">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Painel interno
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
            Leads
          </h1>
          <p className="text-text-secondary mt-2">
            Solicitações vindas da landing page. Atualize o status conforme o
            funil de vendas.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <Stat label="Total" value={stats.total} tone="default" />
          <Stat label="Novos" value={stats.new} tone="info" />
          <Stat label="Contatado" value={stats.contacted} tone="warning" />
          <Stat label="Qualificado" value={stats.qualified} tone="accent" />
          <Stat label="Ganho" value={stats.won} tone="success" />
          <Stat label="Perdido" value={stats.lost} tone="muted" />
        </section>

        {/* Leads list */}
        {leads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-bg-base p-16 text-center">
            <p className="font-display font-bold text-lg text-text-primary">
              Nenhum lead ainda
            </p>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
              Quando alguém preencher o formulário da landing page, vai aparecer aqui em tempo real.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "info" | "warning" | "accent" | "success" | "muted";
}) {
  const toneClass = {
    default: "border-border bg-bg-base",
    info: "border-info/20 bg-info/5",
    warning: "border-warning/20 bg-warning/5",
    accent: "border-brand-accent/30 bg-brand-accent-soft/50",
    success: "border-success/20 bg-success/5",
    muted: "border-text-muted/20 bg-bg-mist",
  }[tone];

  return (
    <div className={`rounded-md border ${toneClass} px-3 py-3`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-display font-extrabold text-text-primary">
        {value}
      </p>
    </div>
  );
}
