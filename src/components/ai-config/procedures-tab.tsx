"use client";

import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  PROCEDURE_SUGGESTIONS,
  type AIConfig,
  type AIProcedure,
} from "@/lib/mock-ai-config";

interface Props {
  config: AIConfig;
  onChange: (patch: Partial<AIConfig>) => void;
}

export function ProceduresTab({ config, onChange }: Props) {
  const update = (id: string, patch: Partial<AIProcedure>) => {
    onChange({
      procedures: config.procedures.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    });
  };

  const remove = (id: string) => {
    onChange({ procedures: config.procedures.filter((p) => p.id !== id) });
  };

  const add = (preset?: { name: string; duration: number; price: number }) => {
    const newProc: AIProcedure = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: preset?.name ?? "",
      duration: preset?.duration ?? 60,
      price: preset?.price ?? 0,
      acceptsInsurance: false,
      showPrice: true,
    };
    onChange({ procedures: [...config.procedures, newProc] });
  };

  const existingNames = new Set(config.procedures.map((p) => p.name.toLowerCase()));
  const suggestions = PROCEDURE_SUGGESTIONS.filter(
    (s) => !existingNames.has(s.name.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-text-primary">
            Procedimentos e preços
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            A IA usa esses dados para informar duração e valor de cada serviço.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => add()}>
          <Plus size={16} />
          Adicionar
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-md border border-dashed border-border bg-bg-soft p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            <Sparkles size={12} className="text-brand-accent" />
            Sugestões rápidas
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => add(s)}
                className="inline-flex items-center gap-1 px-3 py-2 min-h-11 rounded-md border border-border bg-bg-base text-sm font-semibold text-text-primary hover:border-brand-accent hover:bg-brand-accent-soft transition-colors duration-200"
              >
                <Plus size={12} />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {config.procedures.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg-base p-12 text-center">
          <p className="font-display font-bold text-text-primary">
            Nenhum procedimento ainda
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Adicione procedimentos manualmente ou use as sugestões acima.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-mist border-b border-border">
                <tr>
                  <Th>Procedimento</Th>
                  <Th>Duração</Th>
                  <Th>Valor</Th>
                  <Th className="text-center">Convênio</Th>
                  <Th className="text-center">Mostrar preço</Th>
                  <th className="w-12" aria-label="Ações" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {config.procedures.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-3 py-2">
                      <Input
                        value={p.name}
                        onChange={(e) => update(p.id, { name: e.target.value })}
                        placeholder="Nome do procedimento"
                        className="h-11"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={5}
                          step={5}
                          value={p.duration}
                          onChange={(e) =>
                            update(p.id, { duration: Number(e.target.value) || 0 })
                          }
                          className="h-11 w-20 text-right"
                        />
                        <span className="text-xs text-text-muted">min</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-muted">R$</span>
                        <Input
                          type="number"
                          min={0}
                          step={10}
                          value={p.price}
                          onChange={(e) =>
                            update(p.id, { price: Number(e.target.value) || 0 })
                          }
                          className="h-11 w-24 text-right"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center pt-1">
                        <Toggle
                          checked={p.acceptsInsurance}
                          onChange={(v) => update(p.id, { acceptsInsurance: v })}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center pt-1">
                        <Toggle
                          checked={p.showPrice}
                          onChange={(v) => update(p.id, { showPrice: v })}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-200"
                        aria-label={`Remover ${p.name || "procedimento"}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary ${className}`}
    >
      {children}
    </th>
  );
}
