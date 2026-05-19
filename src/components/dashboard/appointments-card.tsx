import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";

interface Appointment {
  id: string;
  patient: string;
  procedure: string;
  date: string;
  time: string;
}

export function AppointmentsCard({ items }: { items: Appointment[] }) {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-bg-base shadow-card hover:shadow-card-hover transition-shadow duration-300 ease-out-soft">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div>
          <h2 className="font-display font-bold text-base text-text-primary">
            Próximos agendamentos
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Próximas 5 consultas
          </p>
        </div>
        <Link
          href="/agendamentos"
          className="group text-xs font-bold text-brand-primary hover:text-brand-primary-dark inline-flex items-center gap-1 transition-colors"
        >
          Ver agenda <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a) => (
            <li key={a.id} className="px-5 py-3 hover:bg-bg-soft transition-colors">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-brand-accent-soft text-brand-primary flex-shrink-0"
                  aria-hidden="true"
                >
                  <Calendar size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">
                    {a.patient}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {a.procedure}
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-text-muted mt-1.5">
                    <Clock size={11} />
                    <strong className="font-semibold text-text-secondary">
                      {a.date}
                    </strong>
                    · {a.time}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-10 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-mist mb-3">
        <Calendar className="text-text-muted" size={20} />
      </div>
      <p className="text-sm font-semibold text-text-primary">
        Nenhum agendamento próximo
      </p>
      <p className="text-xs text-text-secondary mt-1">
        Os próximos agendamentos vão aparecer aqui.
      </p>
    </div>
  );
}
