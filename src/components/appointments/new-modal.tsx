"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn, getInitials } from "@/lib/utils";
import type { MockPatient } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";
import { createAppointmentAction } from "@/app/(dashboard)/agendamentos/actions";

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
}

export function NewAppointmentModal({
  open,
  onClose,
  defaultDate,
}: NewAppointmentModalProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");

  const [procedureId, setProcedureId] = useState("");
  const [dentistId, setDentistId] = useState("");
  const [date, setDate] = useState(
    defaultDate
      ? defaultDate.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const { patients, procedures, dentists } = useAppointmentsMeta();

  const filteredPatients = patientQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
          p.phone.includes(patientQuery),
      ).slice(0, 5)
    : [];

  const canSubmit =
    (selectedPatient || (creatingNew && newPatientName && newPatientPhone)) &&
    procedureId &&
    date &&
    time;

  const reset = () => {
    setPatientQuery("");
    setSelectedPatient(null);
    setCreatingNew(false);
    setNewPatientName("");
    setNewPatientPhone("");
    setProcedureId("");
    setDentistId("");
    setNotes("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    start(async () => {
      const result = await createAppointmentAction({
        patientId: selectedPatient?.id,
        newPatient: creatingNew
          ? { name: newPatientName, phone: newPatientPhone }
          : undefined,
        procedureId,
        dentistId: dentistId || undefined,
        date,
        time,
        notes: notes || undefined,
      });

      if (!result.ok) {
        setError(result.error ?? "Erro ao criar agendamento");
        return;
      }

      reset();
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Novo agendamento"
      description="Selecione um paciente existente ou cadastre um novo, depois escolha o procedimento e horário."
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={handleClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="new-appointment-form"
            disabled={!canSubmit || pending}
          >
            {pending ? "Criando..." : "Criar agendamento"}
          </Button>
        </>
      }
    >
      <form id="new-appointment-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Patient selection */}
        <div>
          <label
            htmlFor="patient-search"
            className="text-sm font-semibold text-text-primary block mb-2"
          >
            Paciente <span className="text-danger">*</span>
          </label>

          {selectedPatient ? (
            <SelectedPatientCard
              patient={selectedPatient}
              onClear={() => setSelectedPatient(null)}
            />
          ) : creatingNew ? (
            <div className="space-y-3 rounded-md border border-brand-accent bg-brand-accent-soft/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-primary">
                  Cadastrando novo paciente
                </p>
                <button
                  type="button"
                  onClick={() => setCreatingNew(false)}
                  className="text-xs font-bold text-text-secondary hover:text-text-primary underline"
                >
                  cancelar
                </button>
              </div>
              <Field label="Nome" htmlFor="new-patient-name" required>
                <Input
                  id="new-patient-name"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Nome completo"
                />
              </Field>
              <Field label="Telefone" htmlFor="new-patient-phone" required>
                <Input
                  id="new-patient-phone"
                  type="tel"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center h-12 rounded-md border border-border bg-bg-base px-3 gap-2 focus-within:border-brand-accent focus-within:ring-[3px] focus-within:ring-brand-accent/20 transition-colors duration-200">
                <Search size={16} className="text-text-muted flex-shrink-0" />
                <input
                  id="patient-search"
                  type="search"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Buscar paciente por nome ou telefone..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </label>

              {patientQuery && filteredPatients.length > 0 && (
                <ul className="max-h-48 overflow-y-auto rounded-md border border-border divide-y divide-border">
                  {filteredPatients.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 min-h-11 text-left hover:bg-bg-mist transition-colors duration-200"
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold flex-shrink-0"
                          aria-hidden="true"
                        >
                          {getInitials(p.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {p.phone}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {patientQuery && filteredPatients.length === 0 && (
                <p className="text-sm text-text-secondary py-2 px-3">
                  Nenhum paciente encontrado.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setCreatingNew(true);
                  setNewPatientName(patientQuery);
                  setPatientQuery("");
                }}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors duration-200 mt-1"
              >
                <UserPlus size={14} />
                Cadastrar novo paciente
              </button>
            </div>
          )}
        </div>

        {/* Procedure */}
        <Field label="Procedimento" htmlFor="procedure" required>
          <SelectField
            id="procedure"
            value={procedureId}
            onChange={setProcedureId}
            placeholder="Selecione um procedimento"
            options={procedures.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.duration} min)`,
            }))}
          />
        </Field>

        {/* Date + time */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Data" htmlFor="appointment-date" required>
            <Input
              id="appointment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Horário" htmlFor="appointment-time" required>
            <Input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Field>
        </div>

        {/* Dentist (only show when there are dentists registered) */}
        {dentists.length > 0 && (
          <Field label="Dentista" htmlFor="dentist">
            <SelectField
              id="dentist"
              value={dentistId}
              onChange={setDentistId}
              placeholder="Selecione o dentista (opcional)"
              options={dentists.map((d) => ({
                value: d.id,
                label: `${d.name} — ${d.specialty}`,
              }))}
            />
          </Field>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}

        {/* Notes */}
        <Field label="Notas (opcional)" htmlFor="notes">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Observações sobre o agendamento..."
            className="w-full rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-none"
          />
        </Field>
      </form>
    </Modal>
  );
}

function SelectedPatientCard({
  patient,
  onClear,
}: {
  patient: MockPatient;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-brand-accent bg-brand-accent-soft/30 p-3">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white text-sm font-bold flex-shrink-0"
        aria-hidden="true"
      >
        {getInitials(patient.name)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-text-primary truncate">
          {patient.name}
        </p>
        <p className="text-xs text-text-muted truncate">{patient.phone}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-bold text-text-secondary hover:text-text-primary underline px-2 min-h-11 flex items-center"
      >
        trocar
      </button>
    </div>
  );
}

function SelectField({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-12 w-full rounded-md border border-border bg-bg-base px-4 text-base text-text-primary",
        "focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200",
        !value && "text-text-muted",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-text-primary">
          {o.label}
        </option>
      ))}
    </select>
  );
}
