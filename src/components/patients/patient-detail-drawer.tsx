"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Cake,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  ExternalLink,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { cn, getInitials } from "@/lib/utils";
import type {
  CRMPatient,
  CRMPatientHistoryItem,
} from "@/lib/mock-patients-data";
import { formatRelativeBR, formatDateBR, formatCurrencyBR } from "./utils";
import { updatePatientNotesAction } from "@/app/(dashboard)/pacientes/actions";
import { EditPatientModal } from "./edit-patient-modal";

const STATUS_CONFIG: Record<
  CRMPatientHistoryItem["status"],
  { label: string; cls: string }
> = {
  completed: { label: "Concluído", cls: "bg-success/10 text-success" },
  scheduled: { label: "Agendado", cls: "bg-brand-accent-soft text-brand-primary" },
  cancelled: { label: "Cancelado", cls: "bg-text-muted/15 text-text-muted" },
};

interface Props {
  patient: CRMPatient | null;
  onClose: () => void;
}

export function PatientDetailDrawer({ patient, onClose }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(patient?.notes ?? "");
  const [isDirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Reset notes when patient changes
  useEffect(() => {
    setNotes(patient?.notes ?? "");
    setDirty(false);
    setSaveError(null);
  }, [patient?.id, patient?.notes]);

  if (!patient) return null;

  const handleSaveNotes = () => {
    setSaveError(null);
    start(async () => {
      const res = await updatePatientNotesAction({ id: patient.id, notes });
      if (!res.ok) {
        setSaveError(res.error ?? "Erro ao salvar");
        return;
      }
      setDirty(false);
      router.refresh();
    });
  };

  const completedCount = patient.history.filter((h) => h.status === "completed").length;
  const nextScheduled = patient.history.find((h) => h.status === "scheduled");

  return (
    <Drawer open={!!patient} onClose={onClose} title="Perfil do paciente" width="lg">
      {/* Identity hero */}
      <section className="px-5 py-6 border-b border-border bg-gradient-to-br from-brand-accent-soft/40 via-bg-soft to-bg-base">
        <div className="flex items-start gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-white text-lg font-display font-bold flex-shrink-0"
            aria-hidden="true"
          >
            {getInitials(patient.name)}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-xl text-text-primary truncate">
              {patient.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  patient.status === "active"
                    ? "bg-success/10 text-success"
                    : "bg-text-muted/15 text-text-muted",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    patient.status === "active" ? "bg-success" : "bg-text-muted",
                  )}
                  aria-hidden="true"
                />
                {patient.status === "active" ? "Ativo" : "Inativo"}
              </span>
              <span className="text-xs text-text-muted">
                Paciente desde {formatDateBR(patient.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Consultas" value={String(completedCount)} />
          <Stat label="Total gasto" value={formatCurrencyBR(patient.totalSpent)} />
          <Stat
            label="Último contato"
            value={formatRelativeBR(patient.lastContactAt)}
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-5 py-4 border-b border-border flex flex-wrap gap-2">
        <Button variant="primary" size="md" className="flex-1 min-w-[180px]">
          <MessageSquare size={16} />
          Iniciar conversa no WhatsApp
        </Button>
        <Button variant="outline" size="md" className="flex-1 min-w-[160px]">
          <Calendar size={16} />
          Novo agendamento
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setEditing(true)}
          aria-label="Editar paciente"
        >
          <Pencil size={16} />
          Editar
        </Button>
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
            value={formatDateBR(patient.birthDate)}
          />
        )}
      </section>

      {/* Next appointment highlight */}
      {nextScheduled && (
        <section className="px-5 py-4 border-b border-border">
          <div className="rounded-md border-l-4 border-l-brand-accent bg-brand-accent-soft/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary mb-1">
              Próximo agendamento
            </p>
            <p className="font-semibold text-text-primary text-sm">
              {nextScheduled.procedure}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {formatRelativeBR(nextScheduled.date)} ·{" "}
              {formatDateBR(nextScheduled.date)}
            </p>
          </div>
        </section>
      )}

      {/* History */}
      <section className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary inline-flex items-center gap-1.5">
            <TrendingUp size={12} />
            Histórico de agendamentos ({patient.history.length})
          </h4>
        </div>
        {patient.history.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-soft p-4 text-center">
            <Calendar size={20} className="mx-auto text-text-muted mb-2" />
            <p className="text-xs text-text-secondary">Nenhum agendamento ainda.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {patient.history
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((h) => (
                <li
                  key={h.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-bg-soft px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {h.procedure}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDateBR(h.date)}
                      {h.price != null && h.price > 0 && (
                        <> · {formatCurrencyBR(h.price)}</>
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                      STATUS_CONFIG[h.status].cls,
                    )}
                  >
                    {STATUS_CONFIG[h.status].label}
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
          placeholder="Alergias, preferências, observações..."
          rows={4}
          className="w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-none"
        />
        {isDirty && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-2"
            onClick={handleSaveNotes}
            disabled={pending}
          >
            {pending ? "Salvando..." : "Salvar notas"}
          </Button>
        )}
        {saveError && (
          <p role="alert" className="text-xs text-danger mt-2">
            {saveError}
          </p>
        )}
      </section>

      {/* Conversations link */}
      <section className="px-5 py-4">
        <Link
          href={`/inbox?c=${patient.id}`}
          className="flex items-center justify-between gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors duration-200 min-h-11"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            Ver conversas no inbox
          </span>
          <ExternalLink size={14} />
        </Link>
      </section>

      {editing && (
        <EditPatientModal
          patient={patient}
          onClose={() => setEditing(false)}
        />
      )}
    </Drawer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-base border border-border px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="text-sm font-display font-bold text-text-primary mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
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
