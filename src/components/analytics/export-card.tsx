import Link from "next/link";
import { Download, Lock } from "lucide-react";

export function ExportCard({ unlocked }: { unlocked: boolean }) {
  if (!unlocked) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-bg-soft p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary">
            <Lock size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-text-primary">
              Exportar dados em CSV
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">
              Disponível no plano Pro. Baixe pacientes, agendamentos e
              conversas em planilha.
            </p>
          </div>
          <Link
            href="/precos"
            className="flex-shrink-0 inline-flex items-center px-4 h-11 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors text-sm"
          >
            Ver planos
          </Link>
        </div>
      </section>
    );
  }

  const items = [
    {
      label: "Pacientes",
      desc: "Lista completa com telefone, e-mail e data de cadastro",
      href: "/api/export/pacientes",
    },
    {
      label: "Agendamentos",
      desc: "Todos os agendamentos com paciente, procedimento e dentista",
      href: "/api/export/agendamentos",
    },
    {
      label: "Conversas",
      desc: "Resumo das conversas com paciente, status e quantidade de msgs",
      href: "/api/export/conversas",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-bg-base p-6">
      <header className="mb-4 flex items-center gap-2">
        <Download size={18} className="text-brand-primary" />
        <h3 className="font-display font-bold text-lg text-text-primary">
          Exportar dados (CSV)
        </h3>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            download
            className="group rounded-lg border border-border bg-bg-base p-4 hover:border-brand-primary hover:bg-brand-accent-soft/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download
                size={14}
                className="text-text-muted group-hover:text-brand-primary"
              />
              <p className="font-semibold text-text-primary">{it.label}</p>
            </div>
            <p className="mt-1 text-xs text-text-secondary">{it.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
