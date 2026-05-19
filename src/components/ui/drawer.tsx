"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: "sm" | "md" | "lg";
  children: React.ReactNode;
  ariaLabel?: string;
}

const WIDTH_MAP = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
};

export function Drawer({
  open,
  onClose,
  title,
  width = "md",
  children,
  ariaLabel,
}: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      const focusable = ref.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-[100]"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in-up"
      />

      <aside
        ref={ref}
        className={cn(
          "absolute inset-y-0 right-0 w-full bg-bg-base shadow-xl border-l border-border flex flex-col animate-fade-in-up",
          WIDTH_MAP[width],
        )}
      >
        {title && (
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border min-h-[68px]">
            <h2 className="font-display font-bold text-lg text-text-primary truncate">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200 flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
