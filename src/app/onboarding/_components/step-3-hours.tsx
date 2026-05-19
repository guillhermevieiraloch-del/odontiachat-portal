"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WEEKDAYS } from "@/lib/constants";
import { saveStep3, type WorkingHoursPayload } from "../actions";
import { cn } from "@/lib/utils";

type DayHours = {
  open: boolean;
  start?: string;
  end?: string;
  lunchStart?: string;
  lunchEnd?: string;
};

const defaultDay: DayHours = { open: true, start: "09:00", end: "18:00" };
const closedDay: DayHours = { open: false };

const defaults: WorkingHoursPayload = {
  monday: defaultDay,
  tuesday: defaultDay,
  wednesday: defaultDay,
  thursday: defaultDay,
  friday: defaultDay,
  saturday: { open: true, start: "09:00", end: "13:00" },
  sunday: closedDay,
};

export function Step3Hours({ initial }: { initial?: WorkingHoursPayload | null }) {
  const [hours, setHours] = useState<WorkingHoursPayload>(
    initial && Object.keys(initial).length > 0 ? initial : defaults,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const update = (day: string, patch: Partial<DayHours>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  const toggleLunch = (day: string) => {
    setHours((prev) => {
      const cur = prev[day];
      if (cur.lunchStart) {
        const { lunchStart, lunchEnd, ...rest } = cur;
        void lunchStart;
        void lunchEnd;
        return { ...prev, [day]: rest };
      }
      return {
        ...prev,
        [day]: { ...cur, lunchStart: "12:00", lunchEnd: "13:00" },
      };
    });
  };

  const onSubmit = () => {
    setError(null);
    start(async () => {
      const result = await saveStep3(hours);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-bg-base p-8 shadow-md">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
        Horário de funcionamento
      </h1>
      <p className="text-text-secondary mb-8">
        A IA respeitará esses horários para agendar e enviar lembretes.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      )}

      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const cur = hours[day.id];
          return (
            <div
              key={day.id}
              className={cn(
                "rounded-md border px-4 py-3 transition-colors",
                cur.open ? "border-border bg-bg-base" : "border-border bg-bg-soft opacity-70",
              )}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <label className="flex items-center gap-3 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={cur.open}
                    onChange={(e) => update(day.id, { open: e.target.checked })}
                    className="h-4 w-4 rounded accent-brand-primary"
                  />
                  <span className="font-semibold text-text-primary">{day.label}</span>
                </label>

                {cur.open ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="time"
                      value={cur.start ?? ""}
                      onChange={(e) => update(day.id, { start: e.target.value })}
                      className="h-10 w-28"
                      aria-label={`Início ${day.label}`}
                    />
                    <span className="text-text-muted text-sm">até</span>
                    <Input
                      type="time"
                      value={cur.end ?? ""}
                      onChange={(e) => update(day.id, { end: e.target.value })}
                      className="h-10 w-28"
                      aria-label={`Fim ${day.label}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleLunch(day.id)}
                      className="ml-2 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      {cur.lunchStart ? "− Remover almoço" : "+ Pausa almoço"}
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-text-muted">Fechado</span>
                )}
              </div>

              {cur.open && cur.lunchStart && (
                <div className="mt-2 ml-[148px] flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-text-muted">Almoço:</span>
                  <Input
                    type="time"
                    value={cur.lunchStart}
                    onChange={(e) => update(day.id, { lunchStart: e.target.value })}
                    className="h-9 w-24 text-sm"
                    aria-label={`Início almoço ${day.label}`}
                  />
                  <span className="text-text-muted text-xs">até</span>
                  <Input
                    type="time"
                    value={cur.lunchEnd ?? ""}
                    onChange={(e) => update(day.id, { lunchEnd: e.target.value })}
                    className="h-9 w-24 text-sm"
                    aria-label={`Fim almoço ${day.label}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <Button type="button" size="lg" onClick={onSubmit} disabled={pending}>
          {pending ? "Salvando..." : "Continuar →"}
        </Button>
      </div>
    </div>
  );
}
