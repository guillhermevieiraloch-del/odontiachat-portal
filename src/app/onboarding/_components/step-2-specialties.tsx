"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { SPECIALTIES } from "@/lib/constants";
import { saveStep2, type StepState } from "../actions";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

const initial: StepState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Salvando..." : "Continuar →"}
    </Button>
  );
}

export function Step2Specialties({ defaults }: { defaults: string[] }) {
  const [state, formAction] = useFormState(saveStep2, initial);
  const [selected, setSelected] = useState<Set<string>>(new Set(defaults));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-bg-base p-8 shadow-md">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
        Especialidades atendidas
      </h1>
      <p className="text-text-secondary mb-8">
        A OdontIAChat usa essa lista para classificar o paciente e direcionar a triagem.
      </p>

      <form action={formAction} className="space-y-6" noValidate>
        {state.error && (
          <div
            role="alert"
            className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
          >
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SPECIALTIES.map((s) => {
            const isSelected = selected.has(s.id);
            return (
              <label
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-4 py-3 cursor-pointer transition-colors",
                  isSelected
                    ? "border-brand-accent bg-brand-accent-soft"
                    : "border-border hover:border-brand-primary-light hover:bg-bg-soft",
                )}
              >
                <input
                  type="checkbox"
                  name="specialties"
                  value={s.id}
                  checked={isSelected}
                  onChange={() => toggle(s.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border flex-shrink-0",
                    isSelected
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-border bg-bg-base",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {s.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
