"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { saveStep1, type StepState } from "../actions";

const initial: StepState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Salvando..." : "Continuar →"}
    </Button>
  );
}

interface Props {
  defaults: {
    cnpj?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
  };
}

export function Step1Clinic({ defaults }: Props) {
  const [state, formAction] = useFormState(saveStep1, initial);

  return (
    <div className="rounded-xl border border-border bg-bg-base p-8 shadow-md">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
        Dados da clínica
      </h1>
      <p className="text-text-secondary mb-8">
        Essas informações ajudam a IA a responder pacientes com precisão.
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

        <Field label="CNPJ" htmlFor="cnpj" error={state.fieldErrors?.cnpj}>
          <Input
            id="cnpj"
            name="cnpj"
            placeholder="00.000.000/0000-00"
            defaultValue={defaults.cnpj ?? ""}
          />
        </Field>

        <Field label="Telefone" htmlFor="phone" error={state.fieldErrors?.phone}>
          <Input
            id="phone"
            name="phone"
            placeholder="(00) 00000-0000"
            defaultValue={defaults.phone ?? ""}
          />
        </Field>

        <Field label="Endereço" htmlFor="address" error={state.fieldErrors?.address}>
          <Input
            id="address"
            name="address"
            placeholder="Rua, número, bairro"
            defaultValue={defaults.address ?? ""}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field
            label="Cidade"
            htmlFor="city"
            className="col-span-2"
            error={state.fieldErrors?.city}
          >
            <Input
              id="city"
              name="city"
              placeholder="Ex: São Paulo"
              defaultValue={defaults.city ?? ""}
            />
          </Field>

          <Field label="UF" htmlFor="state" error={state.fieldErrors?.state}>
            <Input
              id="state"
              name="state"
              placeholder="SP"
              maxLength={2}
              defaultValue={defaults.state ?? ""}
            />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
