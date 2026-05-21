"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceBRL } from "@/lib/plans";
import type { AdminClinicRow } from "@/lib/queries/admin";

type PlanFilter = "all" | "trial" | "solo" | "clinica" | "pro" | "enterprise";
type SituationFilter =
  | "all"
  | "paid"
  | "trial"
  | "trial-expiring"
  | "near-limit"
  | "over-limit";
type SortKey = "name" | "usage" | "cost" | "revenue" | "margin" | "created";

function daysUntil(iso: string): number {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function fmtMargin(cents: number): string {
  return cents < 0 ? `- ${formatPriceBRL(-cents)}` : formatPriceBRL(cents);
}

function trialBadge(iso: string | null): { text: string; cls: string } | null {
  if (!iso) return null;
  const days = daysUntil(iso);
  if (days < 0)
    return { text: "Trial expirado", cls: "bg-danger/10 text-danger" };
  if (days <= 3)
    return { text: `Trial ${days}d`, cls: "bg-warning/10 text-warning" };
  return { text: `Trial ${days}d`, cls: "bg-bg-mist text-text-secondary" };
}

const PLAN_OPTIONS: { value: PlanFilter; label: string }[] = [
  { value: "all", label: "Todos os planos" },
  { value: "trial", label: "Free Trial" },
  { value: "solo", label: "Solo" },
  { value: "clinica", label: "Clínica" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const SITUATION_OPTIONS: { value: SituationFilter; label: string }[] = [
  { value: "all", label: "Todas as situações" },
  { value: "paid", label: "Pagas" },
  { value: "trial", label: "Em trial" },
  { value: "trial-expiring", label: "Trial expirando (≤3 dias)" },
  { value: "near-limit", label: "Perto do limite (≥80%)" },
  { value: "over-limit", label: "Acima do limite" },
];

export function AdminClinicsTable({ clinics }: { clinics: AdminClinicRow[] }) {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [situation, setSituation] = useState<SituationFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const marginOf = (c: AdminClinicRow) =>
    c.monthlyRevenueCents - c.estimatedCostCents;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = clinics.filter((c) => {
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (plan !== "all" && c.plan !== plan) return false;

      if (situation === "paid" && c.plan === "trial") return false;
      if (situation === "trial" && c.plan !== "trial") return false;
      if (situation === "trial-expiring") {
        if (c.plan !== "trial" || !c.trialEndsAt) return false;
        if (daysUntil(c.trialEndsAt) > 3) return false;
      }
      if (situation === "near-limit" && c.usageRatio < 0.8) return false;
      if (situation === "over-limit") {
        if (c.messageLimit === null || c.messagesUsed <= c.messageLimit)
          return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "usage":
          av = a.messagesUsed;
          bv = b.messagesUsed;
          break;
        case "cost":
          av = a.estimatedCostCents;
          bv = b.estimatedCostCents;
          break;
        case "revenue":
          av = a.monthlyRevenueCents;
          bv = b.monthlyRevenueCents;
          break;
        case "margin":
          av = marginOf(a);
          bv = marginOf(b);
          break;
        case "created":
          av = a.createdAt;
          bv = b.createdAt;
          break;
      }
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
    return rows;
  }, [clinics, search, plan, situation, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortHeader({
    label,
    sortKey: key,
    align = "left",
  }: {
    label: string;
    sortKey: SortKey;
    align?: "left" | "right";
  }) {
    const active = sortKey === key;
    return (
      <th
        className={cn(
          "px-4 py-3 font-semibold text-text-primary select-none",
          align === "right" ? "text-right" : "text-left",
        )}
      >
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={cn(
            "inline-flex items-center gap-1 hover:text-brand-primary transition-colors",
            align === "right" && "flex-row-reverse",
          )}
        >
          {label}
          {active ? (
            sortDir === "asc" ? (
              <ArrowUp size={13} />
            ) : (
              <ArrowDown size={13} />
            )
          ) : (
            <ArrowUpDown size={13} className="text-text-muted" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full h-11 rounded-md border border-border bg-bg-base pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanFilter)}
          className="h-11 rounded-md border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
        >
          {PLAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={situation}
          onChange={(e) => setSituation(e.target.value as SituationFilter)}
          className="h-11 rounded-md border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
        >
          {SITUATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-text-muted tabular-nums">
          {filtered.length} de {clinics.length}
        </span>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-bg-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-soft border-b border-border">
                <SortHeader label="Clínica" sortKey="name" />
                <th className="px-4 py-3 font-semibold text-text-primary text-left">
                  Plano
                </th>
                <SortHeader label="Uso do ciclo" sortKey="usage" />
                <SortHeader label="Custo IA" sortKey="cost" align="right" />
                <SortHeader label="Receita" sortKey="revenue" align="right" />
                <SortHeader label="Margem" sortKey="margin" align="right" />
                <SortHeader label="Criada" sortKey="created" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-text-muted"
                  >
                    Nenhuma clínica encontrada com esses filtros.
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const badge = trialBadge(c.trialEndsAt);
                const margin = marginOf(c);
                const pct = Math.round(c.usageRatio * 100);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-b-0 hover:bg-bg-soft/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary">{c.name}</p>
                      <p className="text-xs text-text-muted">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-text-primary">
                        {c.planLabel}
                      </span>
                      {badge && (
                        <span
                          className={cn(
                            "ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            badge.cls,
                          )}
                        >
                          {badge.text}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-bg-mist overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              c.usageRatio >= 0.95
                                ? "bg-danger"
                                : c.usageRatio >= 0.8
                                  ? "bg-warning"
                                  : "bg-success",
                            )}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-text-secondary">
                          {c.messagesUsed.toLocaleString("pt-BR")}
                          {c.messageLimit !== null && (
                            <> / {c.messageLimit.toLocaleString("pt-BR")}</>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {formatPriceBRL(Math.round(c.estimatedCostCents))}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary font-medium">
                      {c.monthlyRevenueCents > 0
                        ? formatPriceBRL(c.monthlyRevenueCents)
                        : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums font-semibold",
                        margin >= 0 ? "text-success" : "text-danger",
                      )}
                    >
                      {c.monthlyRevenueCents > 0
                        ? fmtMargin(Math.round(margin))
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted tabular-nums">
                      {fmtDate(c.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
