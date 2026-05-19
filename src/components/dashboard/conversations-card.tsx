import Link from "next/link";
import { Bot, User, MessageCircle, ArrowRight } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  handledBy: "ai" | "attendant";
}

export function ConversationsCard({ items }: { items: Conversation[] }) {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-bg-base shadow-card hover:shadow-card-hover transition-shadow duration-300 ease-out-soft">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div>
          <h2 className="font-display font-bold text-base text-text-primary">
            Conversas em andamento
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Últimas 5 conversas ativas
          </p>
        </div>
        <Link
          href="/inbox"
          className="group text-xs font-bold text-brand-primary hover:text-brand-primary-dark inline-flex items-center gap-1 transition-colors"
        >
          Ver todas <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/inbox?c=${c.id}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-bg-soft transition-colors duration-200"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0 bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)] shadow-sm group-hover:scale-105 transition-transform duration-200"
                  aria-hidden="true"
                >
                  {getInitials(c.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-text-primary truncate">
                      {c.name}
                    </p>
                    <span className="text-[11px] text-text-muted whitespace-nowrap">
                      {c.time}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {c.preview}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        c.handledBy === "ai"
                          ? "bg-brand-accent-soft text-brand-primary"
                          : "bg-warning/10 text-warning",
                      )}
                    >
                      {c.handledBy === "ai" ? <Bot size={10} /> : <User size={10} />}
                      {c.handledBy === "ai" ? "IA respondendo" : "Aguardando atendente"}
                    </span>
                    {c.unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-accent text-brand-primary text-[10px] font-bold">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
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
        <MessageCircle className="text-text-muted" size={20} />
      </div>
      <p className="text-sm font-semibold text-text-primary">
        Nenhuma conversa ativa
      </p>
      <p className="text-xs text-text-secondary mt-1">
        Quando pacientes mandarem mensagem, elas aparecem aqui.
      </p>
    </div>
  );
}
