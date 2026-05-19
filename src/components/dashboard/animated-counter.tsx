"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string | number;
  durationMs?: number;
  delayMs?: number;
}

/**
 * Counts up from 0 to a numeric value with cubic-ease-out timing.
 * If `value` is a non-numeric string, renders it as-is.
 * Honors prefers-reduced-motion.
 */
export function AnimatedCounter({ value, durationMs = 800, delayMs = 0 }: Props) {
  const numericTarget = parseTarget(value);
  const suffix = typeof value === "string" && value.endsWith("%") ? "%" : "";

  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (numericTarget === null) return;
    if (startedRef.current) return;
    startedRef.current = true;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent(numericTarget);
      return;
    }

    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(numericTarget * eased);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [numericTarget, durationMs, delayMs]);

  if (numericTarget === null) return <>{value}</>;
  return <>{Math.round(current)}{suffix}</>;
}

function parseTarget(value: string | number): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^-?\d+(\.\d+)?%?$/.test(value)) {
    return Number(value.replace("%", ""));
  }
  return null;
}
