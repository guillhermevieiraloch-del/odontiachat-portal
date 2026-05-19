"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

function SubmitButton({ invited }: { invited: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending
        ? "Criando conta..."
        : invited
          ? "Aceitar convite e entrar"
          : "Criar conta"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, initialState);
  const params = useSearchParams();
  const inviteToken = params.get("invite") ?? "";
  const invitedEmail = params.get("email") ?? "";
  const invited = !!inviteToken;

  return (
    <div className="rounded-xl bg-bg-base p-8 shadow-lg border border-border">
      <h1 className="text-3xl font-display font-bold mb-2">
        {invited ? "Aceitar convite" : "Criar conta"}
      </h1>
      <p className="text-text-secondary mb-8">
        {invited
          ? "Termine de criar sua conta pra entrar na clínica."
          : "Configure sua clínica em poucos minutos."}
      </p>

      {invited && (
        <div className="mb-6 rounded-lg border border-brand-accent/30 bg-brand-accent-soft/50 px-4 py-3 text-sm flex items-start gap-2">
          <Sparkles size={16} className="text-brand-primary flex-shrink-0 mt-0.5" />
          <p className="text-text-primary">
            Você foi convidado(a) pra fazer parte de uma clínica. Os campos foram
            pré-preenchidos com o e-mail do convite.
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-5" noValidate>
        {state.error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {state.error}
          </div>
        )}

        {invited && <input type="hidden" name="inviteToken" value={inviteToken} />}

        <Field
          label="Seu nome"
          htmlFor="name"
          required
          error={state.fieldErrors?.name}
        >
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ex: Dra. Camila Ferreira"
            aria-invalid={!!state.fieldErrors?.name}
            required
          />
        </Field>

        {!invited && (
          <Field
            label="Nome da clínica"
            htmlFor="clinicName"
            required
            error={state.fieldErrors?.clinicName}
          >
            <Input
              id="clinicName"
              name="clinicName"
              autoComplete="organization"
              placeholder="Ex: Clínica Sorriso & Saúde"
              aria-invalid={!!state.fieldErrors?.clinicName}
              required
            />
          </Field>
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
            defaultValue={invitedEmail}
            readOnly={invited}
            required
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="password"
          required
          hint="Mínimo de 6 caracteres."
          error={state.fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha"
            aria-invalid={!!state.fieldErrors?.password}
            required
          />
        </Field>

        <SubmitButton invited={invited} />

        <p className="text-xs text-text-muted text-center">
          Ao criar sua conta você concorda com nossos termos de uso e política de privacidade.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link
          href={invited ? `/login?next=/aceitar-convite/${inviteToken}` : "/login"}
          className="font-semibold text-brand-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
