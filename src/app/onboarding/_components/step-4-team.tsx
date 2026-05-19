"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { ROLES } from "@/lib/constants";
import { inviteMember, finishOnboarding, type StepState } from "../actions";
import { Mail } from "lucide-react";

interface InviteRow {
  id: string;
  email: string;
  role: string;
}

const initial: StepState = {};

function InviteSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="md" disabled={pending}>
      {pending ? "Enviando..." : "Enviar convite"}
    </Button>
  );
}

export function Step4Team({ invites }: { invites: InviteRow[] }) {
  const [state, formAction] = useFormState(inviteMember, initial);
  const [pendingFinish, startFinish] = useTransition();

  return (
    <div className="rounded-xl border border-border bg-bg-base p-8 shadow-md">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
        Convide sua equipe
      </h1>
      <p className="text-text-secondary mb-8">
        Adicione recepcionistas e dentistas. Eles receberão um convite por e-mail.{" "}
        <span className="text-text-muted">(Você pode pular e adicionar depois.)</span>
      </p>

      <form action={formAction} className="space-y-4 mb-8" noValidate>
        {state.error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colaborador@email.com"
              aria-invalid={!!state.fieldErrors?.email}
            />
          </Field>

          <Field label="Função" htmlFor="role" error={state.fieldErrors?.role}>
            <select
              id="role"
              name="role"
              defaultValue="ATTENDANT"
              className="flex h-12 w-full rounded-md border border-border bg-bg-base px-4 text-base text-text-primary focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-[3px] focus-visible:ring-brand-accent/20"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <InviteSubmit />
        </div>
      </form>

      {invites.length > 0 && (
        <div className="border-t border-border pt-6">
          <p className="text-sm font-semibold text-text-primary mb-3">
            Convites pendentes
          </p>
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between rounded-md border border-border bg-bg-soft px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-text-muted" />
                  <span className="text-sm text-text-primary">{inv.email}</span>
                  <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                    {ROLES.find((r) => r.id === inv.role)?.label || inv.role}
                  </span>
                </div>
                <span className="text-xs text-warning font-semibold flex items-center gap-1">
                  Aguardando
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-8 border-t border-border mt-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => startFinish(() => finishOnboarding())}
          disabled={pendingFinish}
        >
          Pular por enquanto
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => startFinish(() => finishOnboarding())}
          disabled={pendingFinish}
        >
          {pendingFinish ? "Finalizando..." : "Concluir e ir para o portal →"}
        </Button>
      </div>
    </div>
  );
}
