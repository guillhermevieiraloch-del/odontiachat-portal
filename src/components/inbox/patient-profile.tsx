"use client";

import { useState } from "react";
import { Phone, Mail, Cake, Calendar, X, MessageSquare, FileText, type LucideIcon } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Patient, PatientHistoryItem } from "@/lib/mock-inbox-data";

const STATUS_LABEL: Record<PatientHistoryItem["status"], { label: string; cls: string }> = {
  completed: { label: "Concluído", cls: "bg-success/10 text-success" },
  scheduled: { label: "Agendado", cls: "bg-brand-accent-soft text-brand-primary" },
  cancelled: { label: "Cancelado", cls: "bg-text-muted/15 text-text-muted" },
};

interface PatientProfileProps {
  patient: Patient;
  onClose?: () => void;
}

export function PatientProfile({ patient, onClose }: PatientProfileProps) {
  const [notes, setNotes] = useState(patient.notes ?? "");
  const [isDirty, setDirty] = useState(false);

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 min-h-[68px]">
        <h2 className="font-display font-bold text-lg text-text-primary">
          Perfil do paciente
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200"
            aria-label="Fechar perfil"
          >
            <X size={18} />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <section className="px-5 py-6 text-center border-b border-border">
          <span
            className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-white text-xl font-display font-bold"
            aria-hidden="true"
          >
            {getInitials(patient.name)}
          </span>
          <h3 className="mt-3 font-display font-bold text-lg text-text-primary">
            {patient.name}
          </h3>
          <span className="mt-1 inline-block text-xs text-text-muted">
            Paciente desde 2025
          </span>
        </section>

        {/* Contact */}
        <section className="px-5 py-4 border-b border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Contato
          </h4>
          <ContactRow icon={Phone} label="Telefone" value={patient.phone} />
          {patient.email && (
            <ContactRow icon={Mail} label="E-mail" value={patient.email} />
          )}
          {patient.birthDate && (
            <ContactRow
              icon={Cake}
              label="Nascimento"
              value={new Date(patient.birthDate).toLocaleDateString("pt-BR")}
            />
          )}
        </section>

        {/* Quick action */}
        <section className="px-5 py-4 border-b border-border">
          <Button variant="primary" size="md" className="w-full">
            <Calendar size={16} />
            Agendar consulta
          </Button>
        </section>

        {/* History */}
        <section className="px-5 py-4 border-b border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
            Histórico de agendamentos
          </h4>
          {patient.history.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-bg-soft p-4 text-center">
              <Calendar size={20} className="mx-auto text-text-muted mb-2" />
              <p className="text-xs text-text-secondary">
                Nenhum agendamento ainda.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {patient.history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-bg-soft px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {h.procedure}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{h.date}</p>
                  </div>
                  <span
                    className={cn(
                      "flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      STATUS_LABEL[h.status].cls,
                    )}
                  >
                    {STATUS_LABEL[h.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notes */}
        <section className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary inline-flex items-center gap-1.5">
              <FileText size={12} />
              Notas internas
            </h4>
            {isDirty && (
              <span className="text-[10px] text-warning font-bold">Não salvo</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setDirty(true);
            }}
            placeholder="Adicione notas internas sobre o paciente (alergias, preferências, observações)..."
            rows={4}
            className="w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-none"
          />
          {isDirty && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={() => setDirty(false)}
            >
              Salvar notas
            </Button>
          )}
        </section>

        {/* Conversation link */}
        <section className="px-5 py-4">
          <a
            href={`/inbox?c=${patient.id}`}
            className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors duration-200"
          >
            <MessageSquare size={14} />
            Ver todas as conversas
          </a>
        </section>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent-soft text-brand-primary flex-shrink-0"
        aria-hidden="true"
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className="text-sm text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
