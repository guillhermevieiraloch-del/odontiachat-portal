import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number;
  caption?: string;
  icon: LucideIcon;
  iconBg?: "accent" | "primary" | "success" | "warning";
  sparkData?: number[];
  delay?: number;
}

const ICON_STYLES = {
  accent: "bg-brand-accent-soft text-brand-primary ring-1 ring-brand-accent/40",
  primary:
    "text-white bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)] shadow-[0_6px_16px_-4px_rgba(13,59,102,0.5)]",
  success: "bg-success/15 text-success ring-1 ring-success/30",
  warning: "bg-warning/15 text-warning ring-1 ring-warning/30",
};

const BLOB_STYLES = {
  accent: "bg-brand-accent/30",
  primary: "bg-brand-primary-light/22",
  success: "bg-success/22",
  warning: "bg-warning/22",
};

const SPARK_COLOR_MAP = {
  accent: "accent" as const,
  primary: "primary" as const,
  success: "success" as const,
  warning: "warning" as const,
};

export function MetricCard({
  label,
  value,
  delta,
  caption,
  icon: Icon,
  iconBg = "accent",
  sparkData,
  delay = 0,
}: MetricCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-bg-base",
        "shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-border-strong",
        "transition-all duration-300 ease-out-soft",
        "animate-fade-in-up",
        "min-h-[200px] flex flex-col p-6",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative gradient blob */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500",
          BLOB_STYLES[iconBg],
        )}
      />

      <div className="relative flex items-start justify-between gap-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-secondary">
          {label}
        </p>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
            "transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:-rotate-3",
            ICON_STYLES[iconBg],
          )}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>
      </div>

      <div className="relative flex-1">
        <p className="font-display font-extrabold text-text-primary leading-none tabular-nums tracking-tight text-[2.75rem] lg:text-[3rem]">
          <AnimatedCounter value={value} delayMs={delay} />
        </p>

        {(delta !== undefined || caption) && (
          <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md",
                  isPositive
                    ? "text-success bg-success/12"
                    : "text-danger bg-danger/12",
                )}
              >
                {isPositive ? (
                  <TrendingUp size={11} strokeWidth={2.6} />
                ) : (
                  <TrendingDown size={11} strokeWidth={2.6} />
                )}
                {Math.abs(delta)}%
              </span>
            )}
            {caption && <span className="text-text-muted text-[11px]">{caption}</span>}
          </div>
        )}
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="relative mt-4 -mx-6 -mb-6 px-2 pb-1 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkline data={sparkData} color={SPARK_COLOR_MAP[iconBg]} height={44} />
        </div>
      )}
    </article>
  );
}
