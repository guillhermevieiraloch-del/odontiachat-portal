"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { createPatientAction } from "@/app/(dashboard)/pacientes/actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewPatientModal({ open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setBirthDate("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    if (pending) return;
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result = await createPatientAction({
        name,
        phone,
        email: email || undefined,
        birthDate: birthDate || undefined,
        notes: notes || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Erro ao cadastrar paciente");
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
      title="Novo paciente"
      description="Cadastre um paciente manualmente. Pacientes que falam com a IA pelo WhatsApp já são adicionados automaticamente."
      size="md"
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
            form="new-patient-form"
            disabled={pending || !name || !phone}
          >
            {pending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </>
      }
    >
      <form id="new-patient-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo" htmlFor="new-pat-name" required>
          <Input
            id="new-pat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria da Silva"
          />
        </Field>

        <Field label="Telefone (WhatsApp)" htmlFor="new-pat-phone" required>
          <Input
            id="new-pat-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </Field>

        <Field label="E-mail" htmlFor="new-pat-email">
          <Input
            id="new-pat-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="maria@email.com"
          />
        </Field>

        <Field label="Data de nascimento" htmlFor="new-pat-birth">
          <Input
            id="new-pat-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>

        <Field label="Notas internas" htmlFor="new-pat-notes">
          <textarea
            id="new-pat-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Convênio, restrições, preferências, etc."
            className="w-full rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-none"
          />
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
