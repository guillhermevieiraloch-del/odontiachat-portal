"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { updateAppointmentAction } from "@/app/(dashboard)/agendamentos/actions";
import type { MockAppointment } from "@/lib/mock-appointments-data";

interface Props {
  appointment: MockAppointment | null;
  onClose: () => void;
}

export function RescheduleModal({ appointment, onClose }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointment) return;
    const d = appointment.startsAt;
    setDate(d.toISOString().slice(0, 10));
    setTime(d.toISOString().slice(11, 16));
    setError(null);
  }, [appointment]);

  if (!appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result = await updateAppointmentAction({
        id: appointment.id,
        date,
        time,
      });
      if (!result.ok) {
        setError(result.error ?? "Erro ao remarcar");
        return;
      }
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Remarcar agendamento"
      description="Escolha a nova data e horário."
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="reschedule-form"
            disabled={pending || !date || !time}
          >
            {pending ? "Salvando..." : "Confirmar remarcação"}
          </Button>
        </>
      }
    >
      <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nova data" htmlFor="resched-date" required>
          <Input
            id="resched-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Novo horário" htmlFor="resched-time" required>
          <Input
            id="resched-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
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
