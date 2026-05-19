"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start justify-between gap-4 cursor-pointer min-h-11 py-1"
    >
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="block font-semibold text-sm text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-text-secondary mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 mt-0.5",
          "focus-visible:ring-[3px] focus-visible:ring-brand-accent/40",
          checked ? "bg-brand-primary" : "bg-text-muted/40",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
          aria-hidden="true"
        />
      </button>
    </label>
  );
}
