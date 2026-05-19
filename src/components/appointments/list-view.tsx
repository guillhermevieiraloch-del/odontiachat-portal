"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { ActionMenu } from "./action-menu";
import type { MockAppointment } from "@/lib/mock-appointments-data";
import { useAppointmentsMeta } from "./appointments-context";

type SortKey = "startsAt" | "patient" | "procedure" | "dentist" | "status";
type SortDir = "asc" | "desc";

interface ListViewProps {
  appointments: MockAppointment[];
  onSelect: (id: string) => void;
}

export function ListView({ appointments, onSelect }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("startsAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { getPatient, getProcedure, getDentist } = useAppointmentsMeta();

  const sorted = useMemo(() => {
    const arr = [...appointments];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "startsAt":
          cmp = a.startsAt.getTime() - b.startsAt.getTime();
          break;
        case "patient":
          cmp = (getPatient(a.patientId)?.name ?? "").localeCompare(
            getPatient(b.patientId)?.name ?? "",
          );
          break;
        case "procedure":
          cmp = (getProcedure(a.procedureId)?.name ?? "").localeCompare(
            getProcedure(b.procedureId)?.name ?? "",
          );
          break;
        case "dentist":
          cmp = (getDentist(a.dentistId)?.name ?? "").localeCompare(
            getDentist(b.dentistId)?.name ?? "",
          );
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [appointments, sortKey, sortDir, getDentist, getPatient, getProcedure]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-bg-base p-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-mist text-text-muted mb-4">
          <Calendar size={24} />
        </div>
        <p className="font-display font-bold text-lg text-text-primary">
          Nenhum agendamento encontrado
        </p>
        <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
          Tente ajustar os filtros ou crie um novo agendamento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-bg-base overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-mist border-b border-border">
            <tr>
              <SortableHeader
                label="Data e hora"
                sortKey="startsAt"
                currentKey={sortKey}
                dir={sortDir}
                onClick={toggle}
              />
              <SortableHeader
                label="Paciente"
                sortKey="patient"
                currentKey={sortKey}
                dir={sortDir}
                onClick={toggle}
              />
              <SortableHeader
                label="Procedimento"
                sortKey="procedure"
                currentKey={sortKey}
                dir={sortDir}
                onClick={toggle}
              />
              <SortableHeader
                label="Dentista"
                sortKey="dentist"
                currentKey={sortKey}
                dir={sortDir}
                onClick={toggle}
              />
              <SortableHeader
                label="Status"
                sortKey="status"
                currentKey={sortKey}
                dir={sortDir}
                onClick={toggle}
              />
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary w-16">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((a) => {
              const patient = getPatient(a.patientId);
              const procedure = getProcedure(a.procedureId);
              const dentist = getDentist(a.dentistId);
              return (
                <tr
                  key={a.id}
                  className="hover:bg-bg-soft transition-colors duration-200 cursor-pointer"
                  onClick={() => onSelect(a.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(a.id);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-text-primary">
                      {format(a.startsAt, "dd 'de' MMM", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {format(a.startsAt, "EEEE, HH:mm", { locale: ptBR })}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-text-primary">{patient?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{patient?.phone}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-text-primary">{procedure?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{procedure?.duration} min</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-text-primary">{dentist?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{dentist?.specialty}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <ActionMenu appointmentId={a.id} status={a.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  const isActive = currentKey === sortKey;
  const Icon = !isActive ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      className="text-left"
      aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={cn(
          "w-full flex items-center gap-1.5 px-4 py-3 min-h-11 text-xs font-bold uppercase tracking-wider hover:bg-bg-base/50 transition-colors duration-200",
          isActive ? "text-brand-primary" : "text-text-secondary",
        )}
      >
        {label}
        <Icon size={12} />
      </button>
    </th>
  );
}
