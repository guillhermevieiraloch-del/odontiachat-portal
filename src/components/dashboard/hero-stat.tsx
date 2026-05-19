import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, TrendingUp, TrendingDown, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import { LiveClock } from "./live-clock";

interface Pill {
  label: string;
  tone: "success" | "warning" | "danger" | "info";
  pulsing?: boolean;
}

export interface HeroMiniStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface HeroStatProps {
  /** Pre-title (eyebrow) */
  eyebrow: string;
  /** Main label of the metric */
  label: string;
  /** Numeric value */
  value: number;
  /** Optional secondary line: caption / comparison */
  caption?: string;
  /** Percentage delta vs previous period */
  delta?: number;
  deltaLabel?: string;
  /** Last N data points for the sparkline */
  sparkData?: number[];
  /** Status pills shown bottom-right */
  pills?: Pill[];
  /** CTA link */
  cta?: { label: string; href: string };
  /** Mini stats shown as a horizontal strip */
  miniStats?: HeroMiniStat[];
}

const PILL_TONES = {
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-danger/15 text-danger border-danger/25",
  info: "bg-info/15 text-info border-info/25",
};

export function HeroStat({
  eyebrow,
  label,
  value,
  caption,
  delta,
  deltaLabel,
  sparkData,
  pills,
  cta,
  miniStats,
}: HeroStatProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 lg:p-8 isolate",
        "bg-[linear-gradient(135deg,#0a2e52_0%,#0d3b66_28%,#1a5490_72%,#2bc9b8_120%)]",
        "shadow-[0_24px_60px_-16px_rgba(13,59,102,0.55),0_4px_12px_-4px_rgba(13,59,102,0.35)]",
        "text-white",
        "animate-fade-in-up",
      )}
    >
      {/* Background mesh / aurora */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Blobs */}
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-accent/35 blur-3xl animate-bg-pan bg-[length:200%_200%]" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-brand-primary-light/40 blur-3xl" />
        <div
          className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/15 blur-3xl animate-soft-pulse"
          style={{ animationDuration: "5s" }}
        />

        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse at 30% 0%, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 30% 0%, #000 30%, transparent 75%)",
          }}
        />

        {/* Diagonal shimmer sweep */}
        <div
          aria-hidden="true"
          className="hero-sweep absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-xl"
        />

        {/* Floating particles — small glowing dots drifting upward */}
        <div aria-hidden="true" className="absolute inset-0">
          {[
            { left: "12%", drift: "12px", dur: "8s", delay: "0s", size: 4 },
            { left: "28%", drift: "-8px", dur: "11s", delay: "2.4s", size: 3 },
            { left: "44%", drift: "16px", dur: "9.5s", delay: "1s", size: 5 },
            { left: "62%", drift: "-12px", dur: "10s", delay: "3.2s", size: 3 },
            { left: "78%", drift: "8px", dur: "12s", delay: "0.8s", size: 4 },
            { left: "92%", drift: "-6px", dur: "9s", delay: "4s", size: 3 },
          ].map((p, i) => (
            <span
              key={i}
              className="float-up absolute bottom-0 block rounded-full bg-brand-accent shadow-[0_0_10px_rgba(64,224,208,0.6)]"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                ["--drift" as string]: p.drift,
                ["--dur" as string]: p.dur,
                ["--delay" as string]: p.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Decorative giant logo silhouette in the corner */}
        <div
          aria-hidden="true"
          className="absolute -right-12 -bottom-16 h-72 w-72 opacity-[0.08] mix-blend-screen pointer-events-none"
          style={{ animationDuration: "8s" }}
        >
          <Image
            src="/logo.png"
            alt=""
            width={288}
            height={288}
            priority
            className="object-contain animate-soft-pulse"
          />
        </div>
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
              <Sparkles size={12} className="text-brand-accent" />
              {eyebrow}
            </span>
            <LiveClock />
          </div>

          <p className="text-xs lg:text-sm font-semibold uppercase tracking-[0.14em] text-white/65">
            {label}
          </p>

          <div className="mt-2 flex items-baseline gap-4 flex-wrap">
            <p
              className={cn(
                "font-display font-extrabold leading-none tabular-nums tracking-tighter",
                "text-[clamp(3.5rem,9vw,6.5rem)]",
                "bg-[linear-gradient(180deg,#FFFFFF_0%,#D9F7F4_100%)] bg-clip-text text-transparent",
                "drop-shadow-[0_4px_16px_rgba(64,224,208,0.45)]",
              )}
            >
              <AnimatedCounter value={value} durationMs={1100} />
            </p>

            {delta !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-bold backdrop-blur-md",
                  isPositive
                    ? "bg-success/25 border-success/40 text-success"
                    : "bg-danger/25 border-danger/40 text-danger",
                )}
              >
                {isPositive ? <TrendingUp size={14} strokeWidth={2.8} /> : <TrendingDown size={14} strokeWidth={2.8} />}
                {Math.abs(delta)}%
                {deltaLabel && <span className="font-medium text-white/75 ml-1">{deltaLabel}</span>}
              </span>
            )}
          </div>

          {caption && (
            <p className="mt-3 text-sm text-white/70 max-w-md">{caption}</p>
          )}

          {pills && pills.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {pills.map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md border",
                    PILL_TONES[p.tone],
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      p.tone === "success" && "bg-success",
                      p.tone === "warning" && "bg-warning",
                      p.tone === "danger" && "bg-danger",
                      p.tone === "info" && "bg-info",
                      p.pulsing && "animate-soft-pulse",
                    )}
                  />
                  {p.label}
                </span>
              ))}
            </div>
          )}

          {cta && (
            <Link
              href={cta.href}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white text-brand-primary px-5 py-3 text-sm font-bold shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] hover:bg-brand-accent-soft hover:-translate-y-px hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.45)] transition-all duration-200 ease-out-soft"
            >
              {cta.label}
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>

        {sparkData && sparkData.length > 1 && (
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-3">
            <div className="rounded-xl bg-white/8 backdrop-blur-md border border-white/12 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-white/55 mb-2">
                Últimos 7 dias
              </p>
              <Sparkline data={sparkData} color="accent" height={56} />
            </div>
            {miniStats && miniStats.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {miniStats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-lg bg-white/8 backdrop-blur-md border border-white/12 p-3"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-bold text-white/55">
                        <Icon size={11} className="text-brand-accent" />
                        {s.label}
                      </div>
                      <p className="mt-1.5 font-display font-extrabold text-white text-lg leading-none tabular-nums">
                        {s.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
