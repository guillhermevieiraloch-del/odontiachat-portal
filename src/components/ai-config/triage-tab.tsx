"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { TagInput } from "@/components/ui/tag-input";
import {
  ESCALATION_SUGGESTIONS,
  TRIAGE_SUGGESTIONS,
  type AIConfig,
} from "@/lib/mock-ai-config";

interface Props {
  config: AIConfig;
  onChange: (patch: Partial<AIConfig>) => void;
}

export function TriageTab({ config, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const addQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onChange({ triageQuestions: [...config.triageQuestions, trimmed] });
    setDraft("");
  };

  const updateQuestion = (idx: number, text: string) => {
    const next = [...config.triageQuestions];
    next[idx] = text;
    onChange({ triageQuestions: next });
  };

  const removeQuestion = (idx: number) => {
    onChange({
      triageQuestions: config.triageQuestions.filter((_, i) => i !== idx),
    });
  };

  const remainingSuggestions = TRIAGE_SUGGESTIONS.filter(
    (s) => !config.triageQuestions.some((q) => q.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="max-w-3xl space-y-8">
      {/* Triage questions */}
      <section>
        <h3 className="font-display font-bold text-text-primary mb-1">
          Perguntas de triagem
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          A IA fará essas perguntas antes de agendar a consulta. Coleta dados
          importantes pra você se preparar.
        </p>

        {config.triageQuestions.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-soft p-8 text-center mb-3">
            <p className="text-sm text-text-secondary">
              Nenhuma pergunta adicionada. Use as sugestões abaixo ou crie a sua.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 mb-3">
            {config.triageQuestions.map((q, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-md border border-border bg-bg-base px-2 py-1.5"
              >
                <span
                  className="flex h-9 w-7 items-center justify-center text-text-muted cursor-grab"
                  aria-hidden="true"
                  title="Arrastar para reordenar (em breve)"
                >
                  <GripVertical size={14} />
                </span>
                <Input
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  className="h-11 flex-1 border-transparent bg-transparent focus:border-brand-accent focus:bg-bg-base"
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-200"
                  aria-label="Remover pergunta"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addQuestion(draft);
          }}
          className="flex gap-2"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex: Você está sentindo dor agora?"
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md" disabled={!draft.trim()}>
            <Plus size={16} />
            Adicionar
          </Button>
        </form>

        {remainingSuggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-text-muted self-center mr-1">
              Sugestões:
            </span>
            {remainingSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addQuestion(s)}
                className="inline-flex items-center px-2 py-1 rounded-md border border-dashed border-border text-xs font-semibold text-text-secondary hover:border-brand-accent hover:text-brand-primary hover:bg-brand-accent-soft/50 transition-colors duration-200 min-h-8"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Escalation keywords */}
      <section>
        <Field
          label="Palavras-gatilho para escalar"
          htmlFor="escalation"
          hint="Quando o paciente usar uma dessas palavras, a IA pausa e transfere a conversa para um atendente humano."
        >
          <TagInput
            id="escalation"
            value={config.escalationKeywords}
            onChange={(tags) => onChange({ escalationKeywords: tags })}
            placeholder="Ex: dor forte, emergência..."
            suggestions={ESCALATION_SUGGESTIONS}
            variant="danger"
          />
        </Field>
      </section>
    </div>
  );
}
