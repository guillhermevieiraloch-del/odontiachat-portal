"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { resetPasswordAction, type ResetState } from "./actions";

const initialState: ResetState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Salvando..." : "Definir nova senha"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <div className="rounded-xl bg-bg-base p-8 shadow-lg border border-border">
      <h1 className="text-3xl font-display font-bold mb-2">Nova senha</h1>
      <p className="text-text-secondary mb-8">
        Crie uma senha forte. Mínimo de 6 caracteres.
      </p>

      <form action={formAction} className="space-y-5" noValidate>
        {state.error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {state.error}
          </div>
        )}

        <Field
          label="Nova senha"
          htmlFor="password"
          required
          error={state.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!state.fieldErrors?.password}
            required
          />
        </Field>

        <Field
          label="Confirmar senha"
          htmlFor="confirm"
          required
          error={state.fieldErrors?.confirm}
        >
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!state.fieldErrors?.confirm}
            required
          />
        </Field>

        <SubmitButton />
      </form>
    </div>
  );
}
