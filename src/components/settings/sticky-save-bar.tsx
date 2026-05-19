"use client";

import { Button } from "@/components/ui/button";

interface Props {
  isDirty: boolean;
  justSaved: boolean;
  pending?: boolean;
  error?: string | null;
  onSave: () => void;
  onReset: () => void;
}

export function StickySaveBar({
  isDirty,
  justSaved,
  pending,
  error,
  onSave,
  onReset,
}: Props) {
  if (!isDirty && !justSaved && !error) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-border bg-bg-base/95 backdrop-blur shadow-[0_-4px_20px_rgba(13,59,102,0.08)] animate-fade-in-up"
      role="status"
      aria-live="polite"
    >
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <span
                className="inline-block h-2 w-2 rounded-full bg-danger"
                aria-hidden="true"
              />
              <span className="font-semibold text-danger">{error}</span>
            </>
          ) : justSaved ? (
            <>
              <span
                className="inline-block h-2 w-2 rounded-full bg-success"
                aria-hidden="true"
              />
              <span className="font-semibold text-success">
                Alterações salvas com sucesso
              </span>
            </>
          ) : (
            <>
              <span
                className="inline-block h-2 w-2 rounded-full bg-warning animate-pulse"
                aria-hidden="true"
              />
              <span className="font-semibold text-text-primary">
                Alterações não salvas
              </span>
            </>
          )}
        </div>

        {!justSaved && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={pending}
            >
              Descartar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={pending}
            >
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
