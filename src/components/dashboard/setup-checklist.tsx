import Link from "next/link";
import { Check, ArrowRight, Circle, Sparkles } from "lucide-react";
import type { SetupChecklist } from "@/lib/queries/setup-checklist";

export function SetupChecklistCard({ checklist }: { checklist: SetupChecklist }) {
  if (checklist.allDone) return null;

  const pct = Math.round((checklist.completed / checklist.total) * 100);

  return (
    <section
      aria-label="Primeiros passos"
      className="aurora-bg relative rounded-2xl border border-brand-primary/15 bg-gradient-to-br from-brand-accent-soft/50 via-bg-base to-bg-base p-5 lg:p-6 shadow-card animate-fade-in-up"
    >
      <header className="flex items-start gap-3 flex-wrap mb-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white flex-shrink-0 bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-accent-dark)_100%)] shadow-[0_6px_16px_-4px_rgba(13,59,102,0.45)] animate-bg-pan bg-[length:200%_200%]"
          aria-hidden="true"
        >
          <Sparkles size={22} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-lg text-text-primary">
            Vamos deixar tudo pronto
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Conclua os passos abaixo pra IA atender seus pacientes 24h.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-extrabold text-brand-primary leading-none">
            {checklist.completed}/{checklist.total}
          </p>
          <p className="text-xs text-text-muted mt-1">concluídos</p>
        </div>
      </header>

      <div
        className="h-2 rounded-full bg-bg-mist overflow-hidden mb-5"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[linear-gradient(90deg,var(--brand-primary-light)_0%,var(--brand-accent)_100%)] transition-[width] duration-700 ease-out-soft shadow-[0_0_8px_rgba(64,224,208,0.4)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {checklist.items.map((item) => (
          <li key={item.id}>
            {item.done ? (
              <div className="flex items-center gap-3 p-3 rounded-md bg-success/5 border border-success/20">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-white flex-shrink-0"
                  aria-hidden="true"
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary line-through decoration-1 decoration-text-muted/50">
                    {item.title}
                  </p>
                </div>
                <span className="text-xs font-bold uppercase text-success">
                  Pronto
                </span>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-md bg-bg-base border border-border hover:border-brand-primary hover:bg-brand-accent-soft/30 transition-colors group"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-mist text-text-muted group-hover:bg-brand-accent-soft group-hover:text-brand-primary flex-shrink-0 transition-colors"
                  aria-hidden="true"
                >
                  <Circle size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {item.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary flex-shrink-0">
                  {item.cta}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
