import { ONBOARDING_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressBarProps {
  current: number; // 1..4
}

export function ProgressBar({ current }: ProgressBarProps) {
  const total = ONBOARDING_STEPS.length;
  const pct = Math.round(((current - 1) / total) * 100);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-secondary">
          Passo {current} de {total}
        </span>
        <span className="text-sm font-semibold text-brand-primary">
          {ONBOARDING_STEPS[current - 1]?.label}
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-bg-mist overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[linear-gradient(90deg,var(--brand-primary-light)_0%,var(--brand-accent)_100%)] shadow-[0_0_10px_rgba(64,224,208,0.5)] transition-all duration-700 ease-out-soft"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>

      <ol className="mt-4 hidden md:flex items-center justify-between text-xs text-text-muted">
        {ONBOARDING_STEPS.map((step) => {
          const isDone = step.id < current;
          const isActive = step.id === current;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-1.5",
                isActive && "text-brand-primary font-semibold",
                isDone && "text-success",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold",
                  isActive && "border-brand-primary bg-brand-primary text-white",
                  isDone && "border-success bg-success text-white",
                  !isActive && !isDone && "border-border bg-bg-base text-text-muted",
                )}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : step.id}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
