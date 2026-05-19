"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_MAP = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // ESC to close + body scroll lock + focus management
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
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
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-brand-primary-dark/30 backdrop-blur-md animate-fade-in-up"
      />

      <div
        ref={dialogRef}
        className={cn(
          "relative w-full bg-bg-base shadow-2xl border border-border max-h-[92vh] flex flex-col",
          "rounded-t-2xl sm:rounded-2xl",
          "animate-scale-in",
          SIZE_MAP[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2
              id="modal-title"
              className="font-display font-bold text-xl text-text-primary"
            >
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-text-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200 flex-shrink-0"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap-reverse justify-end gap-2 px-6 py-4 border-t border-border bg-bg-soft rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
