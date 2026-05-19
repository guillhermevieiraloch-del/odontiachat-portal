"use client";

import { Bot } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { AIConfig, Tone } from "@/lib/mock-ai-config";

const TONE_OPTIONS: { id: Tone; label: string; description: string }[] = [
  {
    id: "formal",
    label: "Formal",
    description: "Linguagem profissional, sem gírias.",
  },
  {
    id: "casual",
    label: "Casual",
    description: "Direto e descontraído, como uma conversa amiga.",
  },
  {
    id: "acolhedor",
    label: "Acolhedor",
    description: "Empático e caloroso, ideal para a maioria das clínicas.",
  },
];

interface Props {
  config: AIConfig;
  onChange: (patch: Partial<AIConfig>) => void;
}

export function PersonalityTab({ config, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Tone */}
        <section>
          <h3 className="font-display font-bold text-text-primary mb-1">
            Tom de voz
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Define como a IA se comunica com seus pacientes.
          </p>
          <div
            role="radiogroup"
            aria-label="Tom de voz"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {TONE_OPTIONS.map((opt) => {
              const isActive = config.tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onChange({ tone: opt.id })}
                  className={cn(
                    "rounded-md border px-4 py-3 min-h-[88px] text-left transition-colors duration-200",
                    isActive
                      ? "border-brand-accent bg-brand-accent-soft/50"
                      : "border-border bg-bg-base hover:border-brand-primary-light hover:bg-bg-soft",
                  )}
                >
                  <span
                    className={cn(
                      "block font-display font-bold text-sm",
                      isActive ? "text-brand-primary" : "text-text-primary",
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-xs text-text-secondary mt-1 leading-snug">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Messages */}
        <section className="space-y-5">
          <Field
            label="Mensagem de saudação"
            htmlFor="greeting"
            hint="Primeira mensagem que o paciente recebe ao iniciar a conversa."
          >
            <Textarea
              id="greeting"
              value={config.greeting}
              onChange={(v) => onChange({ greeting: v })}
              rows={3}
            />
          </Field>

          <Field
            label="Mensagem fora do horário"
            htmlFor="ooh"
            hint="Enviada quando o paciente fala com a IA fora do horário de atendimento."
          >
            <Textarea
              id="ooh"
              value={config.outOfHoursMsg}
              onChange={(v) => onChange({ outOfHoursMsg: v })}
              rows={3}
            />
          </Field>

          <Field
            label="Despedida"
            htmlFor="farewell"
            hint="Mensagem ao final de uma conversa concluída."
          >
            <Textarea
              id="farewell"
              value={config.farewell}
              onChange={(v) => onChange({ farewell: v })}
              rows={2}
            />
          </Field>
        </section>

        {/* Emojis toggle */}
        <section className="rounded-md border border-border bg-bg-base p-4">
          <Toggle
            id="use-emojis"
            checked={config.useEmojis}
            onChange={(v) => onChange({ useEmojis: v })}
            label="Usar emojis nas respostas"
            description="A IA vai usar emojis ocasionalmente para tornar a conversa mais leve. Recomendado para tons casual e acolhedor."
          />
        </section>
      </div>

      {/* Live preview */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Pré-visualização
          </p>
          <div className="rounded-lg border border-border bg-bg-mist p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white"
                aria-hidden="true"
              >
                <Bot size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-text-primary">OdontIAChat</p>
                <p className="text-[10px] text-success font-semibold">Online</p>
              </div>
            </div>

            <PreviewBubble text={config.greeting} />
            <p className="text-[10px] text-text-muted text-center pt-1">
              — fora do horário —
            </p>
            <PreviewBubble text={config.outOfHoursMsg} />
            <p className="text-[10px] text-text-muted text-center pt-1">
              — encerrando conversa —
            </p>
            <PreviewBubble text={config.farewell} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function PreviewBubble({ text }: { text: string }) {
  return (
    <div className="bg-bg-base rounded-lg rounded-tl-sm px-3 py-2 shadow-sm max-w-[90%]">
      <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line">
        {text || (
          <span className="text-text-muted italic">Mensagem vazia...</span>
        )}
      </p>
    </div>
  );
}

function Textarea({
  id,
  value,
  onChange,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 resize-y"
    />
  );
}
