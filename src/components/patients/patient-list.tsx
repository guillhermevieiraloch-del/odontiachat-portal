"use client";

import { Phone, Calendar } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { CRMPatient } from "@/lib/mock-patients-data";
import { formatRelativeBR, formatCurrencyBR } from "./utils";

interface Props {
  patients: CRMPatient[];
  onSelect: (id: string) => void;
}

export function PatientList({ patients, onSelect }: Props) {
  return (
    <div className="rounded-lg border border-border bg-bg-base overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-mist border-b border-border">
            <tr>
              <Th>Paciente</Th>
              <Th>Telefone</Th>
              <Th>Último contato</Th>
              <Th>Consultas</Th>
              <Th className="text-right">Total gasto</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((p) => {
              const completed = p.history.filter((h) => h.status === "completed").length;
              const isInactive = p.status === "inactive";
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(p.id);
                    }
                  }}
                  className={cn(
                    "hover:bg-bg-soft transition-colors duration-200 cursor-pointer",
                    isInactive && "opacity-70",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold flex-shrink-0"
                        aria-hidden="true"
                      >
                        {getInitials(p.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">
                          {p.name}
                        </p>
                        {p.email && (
                          <p className="text-xs text-text-muted truncate">{p.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <Phone size={12} className="text-text-muted" />
                      {p.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatRelativeBR(p.lastContactAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <Calendar size={12} className="text-text-muted" />
                      {completed}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">
                    {formatCurrencyBR(p.totalSpent)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isInactive
                          ? "bg-text-muted/15 text-text-muted"
                          : "bg-success/10 text-success",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isInactive ? "bg-text-muted" : "bg-success",
                        )}
                        aria-hidden="true"
                      />
                      {isInactive ? "Inativo" : "Ativo"}
                    </span>
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

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}
