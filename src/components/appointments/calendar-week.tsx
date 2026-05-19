"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isToday,
  differenceInMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "./status-badge";
import type { MockAppointment } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;
const HOUR_HEIGHT = 56; // px per hour
const TOTAL_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

interface CalendarWeekProps {
  appointments: MockAppointment[];
  cursorDate: Date;
  onCursorChange: (d: Date) => void;
  onSelect: (id: string) => void;
}

export function CalendarWeek({
  appointments,
  cursorDate,
  onCursorChange,
  onSelect,
}: CalendarWeekProps) {
  const { getPatient, getProcedure } = useAppointmentsMeta();
  const weekStart = startOfWeek(cursorDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = endOfWeek(cursorDate, { weekStartsOn: 1 });

  const apptsByDay = useMemo(() => {
    const map = new Map<string, MockAppointment[]>();
    for (const a of appointments) {
      const key = format(a.startsAt, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => DAY_START_HOUR + i,
  );

  return (
    <div className="rounded-lg border border-border bg-bg-base shadow-sm overflow-hidden">
      {/* Navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-soft">
        <button
          type="button"
          onClick={() => onCursorChange(addDays(weekStart, -7))}
          className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-base transition-colors duration-200"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-display font-bold text-text-primary capitalize">
            {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p className="text-xs text-text-muted">
            {format(weekStart, "dd 'de' MMM", { locale: ptBR })} —{" "}
            {format(weekEnd, "dd 'de' MMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCursorChange(new Date())}
            className="hidden sm:inline-flex items-center min-h-11 px-3 rounded-md border border-border bg-bg-base text-sm font-bold text-text-primary hover:bg-bg-mist transition-colors duration-200"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(addDays(weekStart, 7))}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-base transition-colors duration-200"
            aria-label="Próxima semana"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {/* Day headers */}
          <div className="border-b border-border bg-bg-soft" />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={cn(
                "border-b border-l border-border bg-bg-soft px-2 py-2 text-center",
                isToday(d) && "bg-brand-accent-soft",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                {format(d, "EEE", { locale: ptBR })}
              </p>
              <p
                className={cn(
                  "font-display font-bold text-lg leading-tight mt-0.5",
                  isToday(d) ? "text-brand-primary" : "text-text-primary",
                )}
              >
                {format(d, "dd")}
              </p>
            </div>
          ))}

          {/* Hours column */}
          <div className="border-r border-border" style={{ height: TOTAL_HEIGHT }}>
            {hours.map((h) => (
              <div
                key={h}
                className="relative text-[10px] text-text-muted font-semibold pr-1 text-right"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute right-1 top-0 -translate-y-1/2 bg-bg-base px-1">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const appts = apptsByDay.get(dayKey) ?? [];
            return (
              <div
                key={dayKey}
                className={cn(
                  "relative border-l border-border",
                  isToday(day) && "bg-brand-accent-soft/20",
                )}
                style={{ height: TOTAL_HEIGHT }}
              >
                {/* Hour grid lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-b border-border"
                    style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Appointments */}
                {appts.map((a) => {
                  const startMinutes =
                    (a.startsAt.getHours() - DAY_START_HOUR) * 60 +
                    a.startsAt.getMinutes();
                  const duration = differenceInMinutes(a.endsAt, a.startsAt);
                  const top = (startMinutes / 60) * HOUR_HEIGHT;
                  const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 24);
                  const patient = getPatient(a.patientId);
                  const procedure = getProcedure(a.procedureId);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelect(a.id)}
                      className={cn(
                        "absolute left-1 right-1 px-1.5 py-1 rounded border-l-[3px] text-left transition-all duration-200 hover:shadow-md hover:z-10 overflow-hidden",
                        STATUS_COLORS[a.status],
                      )}
                      style={{ top, height }}
                      aria-label={`${patient?.name}, ${procedure?.name}, ${format(a.startsAt, "HH:mm")}`}
                    >
                      <p className="text-[11px] font-bold text-text-primary truncate leading-tight">
                        {format(a.startsAt, "HH:mm")} {patient?.name}
                      </p>
                      {height >= 36 && (
                        <p className="text-[10px] text-text-secondary truncate leading-tight mt-0.5">
                          {procedure?.name}
                        </p>
                      )}
                    </button>
                  );
                })}

                {/* Today line indicator */}
                {isToday(day) && <NowLine />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NowLine() {
  const now = new Date();
  const hour = now.getHours();
  if (hour < DAY_START_HOUR || hour >= DAY_END_HOUR) return null;
  const top = ((hour - DAY_START_HOUR) * 60 + now.getMinutes()) / 60 * HOUR_HEIGHT;
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top }}
      aria-hidden="true"
    >
      <span className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-danger" />
      <div className="h-[2px] bg-danger" />
    </div>
  );
}

