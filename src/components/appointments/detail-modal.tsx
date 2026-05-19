"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Phone, Stethoscope, Clock, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "./status-badge";
import type { MockAppointment } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";

interface DetailModalProps {
  appointment: MockAppointment | null;
  onClose: () => void;
  onConfirm?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function DetailModal({
  appointment,
  onClose,
  onConfirm,
  onReschedule,
  onCancel,
}: DetailModalProps) {
  const { getPatient, getProcedure, getDentist } = useAppointmentsMeta();
  if (!appointment) return null;
  const patient = getPatient(appointment.patientId);
  const procedure = getProcedure(appointment.procedureId);
  const dentist = getDentist(appointment.dentistId);
  const isFinal =
    appointment.status === "completed" || appointment.status === "cancelled";

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Detalhes do agendamento"
      size="md"
      footer={
        <div className="flex flex-wrap-reverse gap-2 w-full justify-between">
          <div>
            {!isFinal && (
              <Button
                variant="ghost"
                size="md"
                onClick={onCancel}
                className="text-danger hover:bg-danger/10"
              >
                Cancelar consulta
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Fechar
            </Button>
            {!isFinal && (
              <>
                <Button variant="outline" size="md" onClick={onReschedule}>
                  Remarcar
                </Button>
                {appointment.status === "pending" && (
                  <Button variant="primary" size="md" onClick={onConfirm}>
                    Confirmar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display font-bold text-2xl text-text-primary">
            {patient?.name}
          </h3>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow icon={Phone} label="Telefone" value={patient?.phone ?? "—"} />
          <DetailRow
            icon={Stethoscope}
            label="Procedimento"
            value={procedure?.name ?? "—"}
          />
          <DetailRow
            icon={Calendar}
            label="Data"
            value={format(appointment.startsAt, "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
            capitalize
          />
          <DetailRow
            icon={Clock}
            label="Horário"
            value={`${format(appointment.startsAt, "HH:mm")} — ${format(appointment.endsAt, "HH:mm")} (${procedure?.duration} min)`}
          />
          <DetailRow icon={User} label="Dentista" value={dentist?.name ?? "—"} />
          {procedure && procedure.price > 0 && (
            <DetailRow
              icon={Stethoscope}
              label="Valor"
              value={`R$ ${procedure.price.toFixed(2).replace(".", ",")}`}
            />
          )}
        </div>

        {appointment.notes && (
          <div className="rounded-md border border-border bg-bg-soft p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
              <FileText size={12} />
              Notas
            </div>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
              {appointment.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: typeof User;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent-soft text-brand-primary flex-shrink-0"
        aria-hidden="true"
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className={`text-sm text-text-primary ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
