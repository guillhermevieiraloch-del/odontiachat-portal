"use client";

import { Phone, Calendar } from "lucide-react";
import { cn, getInitials, formatPhoneBR } from "@/lib/utils";
import type { CRMPatient } from "@/lib/mock-patients-data";
import { formatRelativeBR } from "./utils";

interface Props {
  patient: CRMPatient;
  onSelect: (id: string) => void;
}

export function PatientCard({ patient, onSelect }: Props) {
  const nextScheduled = patient.history.find((h) => h.status === "scheduled");
  const completedCount = patient.history.filter((h) => h.status === "completed").length;
  const isInactive = patient.status === "inactive";

  return (
    <article
      className={cn(
        "group relative overflow-hidden flex flex-col rounded-2xl border bg-bg-base p-5 shadow-card",
        "transition-all duration-300 ease-out-soft",
        "hover:shadow-card-hover hover:-translate-y-1 hover:border-brand-accent/60",
        isInactive ? "opacity-70 border-border" : "border-border",
      )}
    >
      {/* Decorative gradient blob */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full bg-brand-accent/22 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <button
        type="button"
        onClick={() => onSelect(patient.id)}
        className="relative flex items-start gap-3 text-left rounded-md focus-visible:outline-none -m-1 p-1"
        aria-label={`Ver perfil de ${patient.name}`}
      >
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0",
            "text-white text-sm font-bold",
            "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
            "shadow-[0_4px_12px_-2px_rgba(13,59,102,0.36)] ring-2 ring-bg-base",
            "transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:-rotate-3",
          )}
          aria-hidden="true"
        >
          {getInitials(patient.name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-text-primary truncate">
            {patient.name}
          </p>
          <p className="text-xs text-text-muted truncate flex items-center gap-1 mt-0.5 tabular-nums">
            <Phone size={11} />
            {formatPhoneBR(patient.phone)}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 border",
            isInactive
              ? "bg-text-muted/12 text-text-muted border-text-muted/25"
              : "bg-success/12 text-success border-success/30",
          )}
        >
          {isInactive ? "Inativo" : "Ativo"}
        </span>
      </button>

      <dl className="relative grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border text-xs">
        <div>
          <dt className="text-text-muted">Último contato</dt>
          <dd className="font-semibold text-text-primary mt-0.5 tabular-nums">
            {formatRelativeBR(patient.lastContactAt)}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">Consultas</dt>
          <dd className="font-semibold text-text-primary mt-0.5 tabular-nums">
            {completedCount} concluídas
          </dd>
        </div>
      </dl>

      {nextScheduled && (
        <div className="relative mt-3 inline-flex items-center gap-1.5 text-xs text-brand-primary bg-brand-accent-soft px-2.5 py-1.5 rounded-lg font-semibold border border-brand-accent/30">
          <Calendar size={12} />
          <span className="truncate">
            {formatRelativeBR(nextScheduled.date)} · {nextScheduled.procedure}
          </span>
        </div>
      )}
    </article>
  );
}
