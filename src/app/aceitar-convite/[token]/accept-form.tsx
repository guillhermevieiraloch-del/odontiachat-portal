"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { acceptInviteAction, type AcceptInviteState } from "./actions";

const initialState: AcceptInviteState = {};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full mt-6" disabled={pending}>
      {pending ? "Entrando na clínica..." : "Aceitar e entrar"}
    </Button>
  );
}

export function AcceptInviteForm({
  token,
  defaultName,
}: {
  token: string;
  defaultName: string;
}) {
  const [state, formAction] = useFormState(acceptInviteAction, initialState);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="token" value={token} />

      <Field label="Seu nome" htmlFor="invite-name" required>
        <Input
          id="invite-name"
          name="name"
          defaultValue={defaultName}
          placeholder="Seu nome completo"
          required
        />
      </Field>

      {state.error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </div>
      )}

      <SubmitBtn />
    </form>
  );
}
