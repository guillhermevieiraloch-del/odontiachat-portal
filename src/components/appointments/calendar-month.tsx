"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "./status-badge";
import type { MockAppointment } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";

interface CalendarMonthProps {
  appointments: MockAppointment[];
  cursorDate: Date;
  onCursorChange: (d: Date) => void;
  onSelect: (id: string) => void;
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function CalendarMonth({
  appointments,
  cursorDate,
  onCursorChange,
  onSelect,
}: CalendarMonthProps) {
  const { getPatient } = useAppointmentsMeta();
  const monthStart = startOfMonth(cursorDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursorDate), { weekStartsOn: 1 });

  const days = useMemo(() => {
    const arr: Date[] = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      arr.push(cur);
      cur = addDays(cur, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  const apptsByDay = useMemo(() => {
    const map = new Map<string, MockAppointment[]>();
    for (const a of appointments) {
      const key = format(a.startsAt, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  return (
    <div className="rounded-lg border border-border bg-bg-base shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-soft">
        <button
          type="button"
          onClick={() => onCursorChange(subMonths(cursorDate, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-base transition-colors duration-200"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <p className="font-display font-bold text-text-primary capitalize text-lg">
          {format(cursorDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>

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
            onClick={() => onCursorChange(addMonths(cursorDate, 1))}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-base transition-colors duration-200"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-bg-soft">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-secondary"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursorDate);
          const dayKey = format(day, "yyyy-MM-dd");
          const appts = apptsByDay.get(dayKey) ?? [];
          return (
            <div
              key={dayKey}
              className={cn(
                "border-b border-l border-border min-h-[100px] sm:min-h-[120px] p-1.5 first:border-l-0 [&:nth-child(7n+1)]:border-l-0",
                !inMonth && "bg-bg-soft",
                isToday(day) && "bg-brand-accent-soft",
              )}
            >
              <p
                className={cn(
                  "text-xs font-bold mb-1",
                  isToday(day)
                    ? "text-brand-primary"
                    : inMonth
                      ? "text-text-primary"
                      : "text-text-muted",
                )}
              >
                {format(day, "d")}
              </p>
              <div className="space-y-0.5">
                {appts.slice(0, 3).map((a) => {
                  const patient = getPatient(a.patientId);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelect(a.id)}
                      className={cn(
                        "w-full text-left text-[10px] px-1 py-0.5 rounded border-l-[2px] truncate transition-colors duration-200",
                        STATUS_COLORS[a.status],
                      )}
                      title={`${format(a.startsAt, "HH:mm")} ${patient?.name}`}
                    >
                      <span className="font-bold">{format(a.startsAt, "HH:mm")}</span>{" "}
                      <span className="text-text-primary">{patient?.name}</span>
                    </button>
                  );
                })}
                {appts.length > 3 && (
                  <p className="text-[10px] text-text-muted px-1">
                    +{appts.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
