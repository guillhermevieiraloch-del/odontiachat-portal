"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { forgotPasswordAction, type ForgotState } from "./actions";

const initialState: ForgotState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Enviando..." : "Enviar link de recuperação"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);

  if (state.ok) {
    return (
      <div className="rounded-xl bg-bg-base p-8 shadow-lg border border-border text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success mb-4">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Verifique seu e-mail</h1>
        <p className="text-text-secondary mb-6">
          Se a conta existir, enviamos um link para resetar sua senha. O link expira em 1 hora.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-brand-primary hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-base p-8 shadow-lg border border-border">
      <h1 className="text-3xl font-display font-bold mb-2">
        Recuperar senha
      </h1>
      <p className="text-text-secondary mb-8">
        Informe seu e-mail e mandaremos um link para criar uma nova senha.
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
          label="E-mail"
          htmlFor="email"
          required
          error={state.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!state.fieldErrors?.email}
            required
          />
        </Field>

        <SubmitButton />
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Lembrou da senha?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-primary hover:underline"
        >
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
