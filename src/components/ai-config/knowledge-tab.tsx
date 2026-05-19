"use client";

import { Check } from "lucide-react";
import { Field } from "@/components/ui/field";
import { TagInput } from "@/components/ui/tag-input";
import { SPECIALTIES } from "@/lib/constants";
import { COMMON_INSURANCES, COMMON_PAYMENT_METHODS } from "@/lib/mock-ai-config";
import type { AIConfig } from "@/lib/mock-ai-config";
import { cn } from "@/lib/utils";

interface Props {
  config: AIConfig;
  onChange: (patch: Partial<AIConfig>) => void;
}

export function KnowledgeTab({ config, onChange }: Props) {
  const toggleSpecialty = (id: string) => {
    const next = config.specialties.includes(id)
      ? config.specialties.filter((s) => s !== id)
      : [...config.specialties, id];
    onChange({ specialties: next });
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Description */}
      <section>
        <Field
          label="Sobre a clínica"
          htmlFor="description"
          hint="Texto que a IA usa como base para responder dúvidas gerais sobre sua clínica. Inclua histórico, diferenciais, equipe e localização. Quanto mais detalhado, melhor a IA responde."
        >
          <textarea
            id="description"
            value={config.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={6}
            placeholder="Ex: Clínica especializada em odontologia geral e estética, com 10 anos de mercado..."
            className="w-full rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-y"
          />
        </Field>
        <p className="text-xs text-text-muted mt-1">
          {config.description.length} caracteres
        </p>
      </section>

      {/* Specialties */}
      <section>
        <h3 className="font-display font-bold text-text-primary mb-1">
          Especialidades atendidas
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          A IA usa para classificar pacientes e direcionar a triagem.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SPECIALTIES.map((s) => {
            const isSelected = config.specialties.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggleSpecialty(s.id)}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-3 min-h-11 transition-colors duration-200 text-left",
                  isSelected
                    ? "border-brand-accent bg-brand-accent-soft"
                    : "border-border bg-bg-base hover:border-brand-primary-light hover:bg-bg-soft",
                )}
              >
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
              </button>
            );
          })}
        </div>
      </section>

      {/* Insurance */}
      <section>
        <Field
          label="Convênios aceitos"
          htmlFor="insurance"
          hint="Digite e pressione Enter para adicionar. A IA usa para responder se vocês atendem o convênio do paciente."
        >
          <TagInput
            id="insurance"
            value={config.acceptedInsurance}
            onChange={(tags) => onChange({ acceptedInsurance: tags })}
            placeholder="Ex: Unimed, Bradesco Saúde..."
            suggestions={COMMON_INSURANCES}
          />
        </Field>
      </section>

      {/* Payment methods */}
      <section>
        <Field
          label="Formas de pagamento"
          htmlFor="payment"
          hint="A IA informa essas opções quando o paciente pergunta sobre pagamento."
        >
          <TagInput
            id="payment"
            value={config.paymentMethods}
            onChange={(tags) => onChange({ paymentMethods: tags })}
            placeholder="Ex: Pix, Cartão de crédito..."
            suggestions={COMMON_PAYMENT_METHODS}
          />
        </Field>
      </section>
    </div>
  );
}
