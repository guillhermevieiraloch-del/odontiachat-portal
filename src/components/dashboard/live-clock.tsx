"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

/**
 * Live "system online" indicator + clock that updates every second.
 * Sits inside the hero card to feel "real-time".
 */
export function LiveClock() {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/8 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
      </span>
      <Radio size={11} className="text-success" />
      <span className="uppercase tracking-[0.12em] text-white/80">Sistema online</span>
      <span className="text-white/30">·</span>
      <span className="font-mono tabular-nums text-white">{time}</span>
    </span>
  );
}
