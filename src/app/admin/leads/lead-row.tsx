"use client";

import { useState, useTransition } from "react";
import { Phone, Mail, Building2, Clock, ChevronDown } from "lucide-react";
import type { Lead, LeadStatus } from "@prisma/client";
import { cn, getInitials } from "@/lib/utils";
import { updateLeadStatus } from "./actions";

const STATUS_OPTIONS: { value: LeadStatus; label: string; cls: string }[] = [
  { value: "NEW", label: "Novo", cls: "bg-info/10 text-info border-info/20" },
  {
    value: "CONTACTED",
    label: "Contatado",
    cls: "bg-warning/10 text-warning border-warning/20",
  },
  {
    value: "QUALIFIED",
    label: "Qualificado",
    cls: "bg-brand-accent-soft text-brand-primary border-brand-accent/30",
  },
  {
    value: "WON",
    label: "Ganho",
    cls: "bg-success/10 text-success border-success/20",
  },
  {
    value: "LOST",
    label: "Perdido",
    cls: "bg-text-muted/10 text-text-muted border-text-muted/20",
  },
];

export function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [pending, start] = useTransition();

  const cfg = STATUS_OPTIONS.find((o) => o.value === status)!;
  const whatsappLink = `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`;

  const handleStatusChange = (next: LeadStatus) => {
    setStatus(next);
    start(() => updateLeadStatus(lead.id, next));
  };

  return (
    <li className="rounded-lg border border-border bg-bg-base shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold flex-shrink-0"
          aria-hidden="true"
        >
          {getInitials(lead.name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{lead.name}</p>
          <p className="text-xs text-text-muted truncate">
            {lead.clinicName} · {lead.dentists ?? "—"} dentistas
          </p>
        </div>
        <span
          className={cn(
            "hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
            cfg.cls,
          )}
        >
          {cfg.label}
        </span>
        <span className="text-xs text-text-muted hidden md:inline">
          {new Date(lead.createdAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-text-muted transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-border bg-bg-soft px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <ContactRow icon={Mail} value={lead.email} href={`mailto:${lead.email}`} />
            <ContactRow
              icon={Phone}
              value={lead.whatsapp}
              href={whatsappLink}
              cta="WhatsApp"
            />
            <ContactRow icon={Building2} value={lead.clinicName} />
            <ContactRow
              icon={Clock}
              value={new Date(lead.createdAt).toLocaleString("pt-BR")}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Status:
            </span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              disabled={pending}
              className="h-9 rounded-md border border-border bg-bg-base px-2 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 cursor-pointer disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {pending && (
              <span className="text-xs text-text-muted">Salvando...</span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function ContactRow({
  icon: Icon,
  value,
  href,
  cta,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} className="text-text-muted flex-shrink-0" />
      <span className="text-text-primary truncate flex-1">{value}</span>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-brand-primary hover:underline"
        >
          {cta ?? "Abrir"}
        </a>
      )}
    </div>
  );
}
