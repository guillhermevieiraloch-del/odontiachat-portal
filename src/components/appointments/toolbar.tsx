"use client";

import { Plus, LayoutGrid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";

export type ViewMode = "calendar" | "list";

export interface AppointmentFilters {
  dentistId: string | "all";
  status: AppointmentStatus | "all";
  procedureId: string | "all";
}

interface ToolbarProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: AppointmentFilters;
  onFiltersChange: (f: AppointmentFilters) => void;
  onNew: () => void;
}

export function Toolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  onNew,
}: ToolbarProps) {
  const { dentists, procedures } = useAppointmentsMeta();
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Agendamentos
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Visualize, crie e remarque consultas da clínica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={onViewChange} />
          <Button variant="primary" size="md" onClick={onNew}>
            <Plus size={16} />
            <span className="hidden sm:inline">Novo agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mr-1">
          Filtros:
        </span>

        <FilterSelect
          label="Dentista"
          value={filters.dentistId}
          onChange={(v) => onFiltersChange({ ...filters, dentistId: v })}
          options={[
            { value: "all", label: "Todos os dentistas" },
            ...dentists.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) =>
            onFiltersChange({ ...filters, status: v as AppointmentStatus | "all" })
          }
          options={[
            { value: "all", label: "Todos os status" },
            { value: "confirmed", label: "Confirmados" },
            { value: "pending", label: "Pendentes" },
            { value: "completed", label: "Concluídos" },
            { value: "cancelled", label: "Cancelados" },
          ]}
        />

        <FilterSelect
          label="Procedimento"
          value={filters.procedureId}
          onChange={(v) => onFiltersChange({ ...filters, procedureId: v })}
          options={[
            { value: "all", label: "Todos os procedimentos" },
            ...procedures.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
      </div>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualização"
      className="inline-flex items-center rounded-lg border border-border bg-bg-base p-1 h-11 shadow-xs"
    >
      <button
        type="button"
        role="radio"
        aria-checked={view === "calendar"}
        onClick={() => onChange("calendar")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-bold transition-all duration-200 ease-out-soft active:scale-95",
          view === "calendar"
            ? "bg-brand-primary text-white shadow-[0_3px_8px_-2px_rgba(13,59,102,0.4)]"
            : "text-text-secondary hover:text-brand-primary hover:bg-bg-mist",
        )}
      >
        <LayoutGrid size={14} />
        <span className="hidden sm:inline">Calendário</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-bold transition-all duration-200 ease-out-soft active:scale-95",
          view === "list"
            ? "bg-brand-primary text-white shadow-[0_3px_8px_-2px_rgba(13,59,102,0.4)]"
            : "text-text-secondary hover:text-brand-primary hover:bg-bg-mist",
        )}
      >
        <List size={14} />
        <span className="hidden sm:inline">Lista</span>
      </button>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
