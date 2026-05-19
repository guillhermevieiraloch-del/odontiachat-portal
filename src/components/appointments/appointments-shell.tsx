"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toolbar, type AppointmentFilters, type ViewMode } from "./toolbar";
import { ListView } from "./list-view";
import { CalendarWeek } from "./calendar-week";
import { CalendarMonth } from "./calendar-month";
import { DetailModal } from "./detail-modal";
import { NewAppointmentModal } from "./new-modal";
import { RescheduleModal } from "./reschedule-modal";
import { AppointmentsMetaProvider } from "./appointments-context";
import {
  cancelAppointmentAction,
  updateAppointmentAction,
} from "@/app/(dashboard)/agendamentos/actions";
import type {
  MockAppointment,
  MockPatient,
  MockProcedure,
  MockDentist,
} from "@/lib/mock-appointments-data";

const DEFAULT_FILTERS: AppointmentFilters = {
  dentistId: "all",
  status: "all",
  procedureId: "all",
};

type CalendarMode = "week" | "month";

interface Props {
  appointments: MockAppointment[];
  patients: MockPatient[];
  procedures: MockProcedure[];
  dentists: MockDentist[];
}

export function AppointmentsShell({
  appointments,
  patients,
  procedures,
  dentists,
}: Props) {
  const router = useRouter();
  const [, start] = useTransition();
  const [view, setView] = useState<ViewMode>("calendar");
  const [calMode, setCalMode] = useState<CalendarMode>("week");
  const [filters, setFilters] = useState<AppointmentFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [cursorDate, setCursorDate] = useState(new Date());

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filters.dentistId !== "all" && a.dentistId !== filters.dentistId) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.procedureId !== "all" && a.procedureId !== filters.procedureId) return false;
      return true;
    });
  }, [appointments, filters]);

  const selected: MockAppointment | null = selectedId
    ? appointments.find((a) => a.id === selectedId) ?? null
    : null;
  const rescheduling: MockAppointment | null = rescheduleId
    ? appointments.find((a) => a.id === rescheduleId) ?? null
    : null;

  const handleConfirm = () => {
    if (!selected) return;
    start(async () => {
      const res = await updateAppointmentAction({ id: selected.id, status: "confirmed" });
      if (res.ok) {
        setSelectedId(null);
        router.refresh();
      } else {
        alert(res.error ?? "Erro ao confirmar");
      }
    });
  };

  const handleCancel = () => {
    if (!selected) return;
    if (!confirm("Tem certeza que quer cancelar este agendamento?")) return;
    start(async () => {
      const res = await cancelAppointmentAction(selected.id);
      if (res.ok) {
        setSelectedId(null);
        router.refresh();
      } else {
        alert(res.error ?? "Erro ao cancelar");
      }
    });
  };

  const handleReschedule = () => {
    if (!selected) return;
    setRescheduleId(selected.id);
    setSelectedId(null);
  };

  return (
    <AppointmentsMetaProvider
      patients={patients}
      procedures={procedures}
      dentists={dentists}
    >
    <div>
      <Toolbar
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        onNew={() => setNewOpen(true)}
      />

      {view === "calendar" && (
        <div className="mb-4 inline-flex items-center rounded-md border border-border bg-bg-base p-1">
          <CalModeButton
            active={calMode === "week"}
            onClick={() => setCalMode("week")}
            icon={CalendarRange}
            label="Semana"
          />
          <CalModeButton
            active={calMode === "month"}
            onClick={() => setCalMode("month")}
            icon={CalendarDays}
            label="Mês"
          />
        </div>
      )}

      {view === "list" ? (
        <ListView appointments={filtered} onSelect={setSelectedId} />
      ) : calMode === "week" ? (
        <CalendarWeek
          appointments={filtered}
          cursorDate={cursorDate}
          onCursorChange={setCursorDate}
          onSelect={setSelectedId}
        />
      ) : (
        <CalendarMonth
          appointments={filtered}
          cursorDate={cursorDate}
          onCursorChange={setCursorDate}
          onSelect={setSelectedId}
        />
      )}

      <DetailModal
        appointment={selected}
        onClose={() => setSelectedId(null)}
        onConfirm={handleConfirm}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />

      <RescheduleModal
        appointment={rescheduling}
        onClose={() => setRescheduleId(null)}
      />

      <NewAppointmentModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
    </AppointmentsMetaProvider>
  );
}

function CalModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof CalendarRange;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 min-h-11 rounded-md text-sm font-bold transition-colors duration-200",
        active
          ? "bg-brand-accent-soft text-brand-primary"
          : "text-text-secondary hover:text-text-primary",
      )}
      aria-pressed={active}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
