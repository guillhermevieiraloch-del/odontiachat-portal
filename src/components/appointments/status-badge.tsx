import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/mock-appointments-data";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; cls: string; dot: string }
> = {
  confirmed: {
    label: "Confirmado",
    cls: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  pending: {
    label: "Pendente",
    cls: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  completed: {
    label: "Concluído",
    cls: "bg-brand-accent-soft text-brand-primary border-brand-accent/30",
    dot: "bg-brand-primary",
  },
  cancelled: {
    label: "Cancelado",
    cls: "bg-text-muted/10 text-text-muted border-text-muted/20",
    dot: "bg-text-muted",
  },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: AppointmentStatus;
  size?: "sm" | "md";
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider",
        cfg.cls,
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full",
          cfg.dot,
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        )}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmed: "border-l-success bg-success/5 hover:bg-success/10",
  pending: "border-l-warning bg-warning/5 hover:bg-warning/10",
  completed: "border-l-brand-primary bg-brand-accent-soft hover:bg-brand-accent-soft/80",
  cancelled: "border-l-text-muted bg-bg-mist hover:bg-bg-mist/80 opacity-60",
};
