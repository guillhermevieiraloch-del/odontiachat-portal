import Link from "next/link";
import { MessageSquare, Bot, Calendar, ArrowRight, type LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const ACTIONS: QuickAction[] = [
  {
    label: "Ver inbox completo",
    description: "Todas as conversas dos seus pacientes",
    href: "/inbox",
    icon: MessageSquare,
  },
  {
    label: "Configurar IA",
    description: "Ajuste tom, conhecimento e triagem",
    href: "/configuracoes/ia",
    icon: Bot,
  },
  {
    label: "Ver calendário",
    description: "Agendamentos da semana e do mês",
    href: "/agendamentos",
    icon: Calendar,
  },
];

export function QuickActions() {
  return (
    <section aria-label="Atalhos rápidos">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden flex items-center gap-4 rounded-xl border border-border bg-bg-base p-5 shadow-card transition-all duration-300 ease-out-soft hover:border-brand-accent/60 hover:shadow-card-hover hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(64,224,208,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span
                className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-primary flex-shrink-0 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:bg-gradient-to-br group-hover:from-brand-primary group-hover:to-brand-primary-light group-hover:text-white group-hover:shadow-md"
                aria-hidden="true"
              >
                <Icon size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-text-primary">
                  {a.label}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  {a.description}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-primary flex-shrink-0"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
