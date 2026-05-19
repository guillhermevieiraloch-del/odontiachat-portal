"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Check, Calendar, X, User } from "lucide-react";
import type { AppointmentStatus } from "@/lib/mock-appointments-data";
import { cn } from "@/lib/utils";

interface ActionMenuProps {
  appointmentId: string;
  status: AppointmentStatus;
}

export function ActionMenu({ status }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={ref} className="relative inline-block" onClick={stop}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200"
        aria-label="Ações"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-30 w-52 rounded-md border border-border bg-bg-base shadow-lg overflow-hidden"
        >
          {status !== "confirmed" && status !== "completed" && (
            <ActionItem icon={Check} label="Confirmar" onClick={() => setOpen(false)} />
          )}
          {status !== "cancelled" && status !== "completed" && (
            <>
              <ActionItem
                icon={Calendar}
                label="Remarcar"
                onClick={() => setOpen(false)}
              />
              <ActionItem
                icon={X}
                label="Cancelar"
                onClick={() => setOpen(false)}
                variant="destructive"
              />
            </>
          )}
          <ActionItem
            icon={User}
            label="Ver paciente"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
  variant,
}: {
  icon: typeof MoreHorizontal;
  label: string;
  onClick: () => void;
  variant?: "destructive";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 min-h-11 text-sm text-left transition-colors duration-200",
        variant === "destructive"
          ? "text-danger hover:bg-danger/10"
          : "text-text-primary hover:bg-bg-mist",
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
