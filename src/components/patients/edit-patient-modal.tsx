"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { updatePatientAction } from "@/app/(dashboard)/pacientes/actions";
import type { CRMPatient } from "@/lib/mock-patients-data";

interface Props {
  patient: CRMPatient | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPatientModal({ patient, onClose, onSaved }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!patient) return;
    setName(patient.name ?? "");
    setPhone(patient.phone ?? "");
    setEmail(patient.email ?? "");
    setBirthDate(
      patient.birthDate
        ? new Date(patient.birthDate).toISOString().slice(0, 10)
        : "",
    );
    setStatus(patient.status === "inactive" ? "inactive" : "active");
    setError(null);
  }, [patient]);

  if (!patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result = await updatePatientAction({
        id: patient.id,
        name,
        phone,
        email: email || undefined,
        birthDate: birthDate || undefined,
        status,
      });
      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar");
        return;
      }
      onSaved?.();
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Editar paciente"
      description="Atualize os dados cadastrais. As notas internas são editadas no perfil."
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="edit-patient-form"
            disabled={pending || !name || !phone}
          >
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="edit-patient-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo" htmlFor="edit-pat-name" required>
          <Input
            id="edit-pat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Telefone (WhatsApp)" htmlFor="edit-pat-phone" required>
          <Input
            id="edit-pat-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="E-mail" htmlFor="edit-pat-email">
          <Input
            id="edit-pat-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Data de nascimento" htmlFor="edit-pat-birth">
          <Input
            id="edit-pat-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="edit-pat-status">
          <select
            id="edit-pat-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            className="h-11 w-full rounded-md border border-border bg-bg-base px-4 text-sm text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/22 transition-all duration-200 ease-out-soft"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </Field>
        {error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
