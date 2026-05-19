"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  durationMs: number;
}

interface ToastContextValue {
  push: (t: Omit<Toast, "id" | "durationMs"> & { durationMs?: number }) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback for components rendered outside the provider
    return {
      push: () => "",
      dismiss: () => {},
      success: (t) => console.log("[toast/success]", t),
      error: (t) => console.error("[toast/error]", t),
      info: (t) => console.log("[toast/info]", t),
      warning: (t) => console.warn("[toast/warning]", t),
    };
  }
  return ctx;
}

const TONE_CONFIG: Record<ToastTone, { icon: LucideIcon; cls: string }> = {
  success: {
    icon: CheckCircle2,
    cls: "border-success/40 bg-success-soft text-success",
  },
  error: {
    icon: AlertCircle,
    cls: "border-danger/40 bg-danger-soft text-danger",
  },
  info: {
    icon: Info,
    cls: "border-info/40 bg-info-soft text-info",
  },
  warning: {
    icon: AlertTriangle,
    cls: "border-warning/40 bg-warning-soft text-warning",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastContextValue["push"]>(
    (input) => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const toast: Toast = {
        id,
        tone: input.tone,
        title: input.title,
        description: input.description,
        durationMs: input.durationMs ?? 4500,
      };
      setToasts((prev) => [...prev, toast]);
      const timer = setTimeout(() => dismiss(id), toast.durationMs);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      success: (title, description) => void push({ tone: "success", title, description }),
      error: (title, description) => void push({ tone: "error", title, description, durationMs: 6000 }),
      info: (title, description) => void push({ tone: "info", title, description }),
      warning: (title, description) => void push({ tone: "warning", title, description }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="region"
            aria-label="Notificações"
            className="pointer-events-none fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          >
            {toasts.map((t) => {
              const cfg = TONE_CONFIG[t.tone];
              const Icon = cfg.icon;
              return (
                <div
                  key={t.id}
                  role={t.tone === "error" ? "alert" : "status"}
                  className={cn(
                    "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md",
                    "bg-bg-base/95",
                    "animate-slide-in-right",
                    cfg.cls.replace(/bg-\S+/, ""), // keep border + text color from tone, drop bg-* (we want bg-bg-base)
                  )}
                  style={{ minWidth: 280 }}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                      cfg.cls,
                    )}
                    aria-hidden="true"
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-text-primary leading-snug">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-mist transition-colors duration-200 flex-shrink-0"
                    aria-label="Fechar notificação"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
