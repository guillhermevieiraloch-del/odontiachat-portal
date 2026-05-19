"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="rounded-xl bg-bg-base p-8 shadow-lg border border-border">
      <h1 className="text-3xl font-display font-bold mb-2">Entrar</h1>
      <p className="text-text-secondary mb-8">
        Acesse o portal da sua clínica.
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

        <Field
          label="Senha"
          htmlFor="password"
          required
          error={state.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={!!state.fieldErrors?.password}
            required
          />
        </Field>

        <SubmitButton />

        <div className="text-center pt-1">
          <Link
            href="/esqueci-senha"
            className="text-sm text-text-secondary hover:text-brand-primary"
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Ainda não tem conta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
