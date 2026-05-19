"use client";

import { useMemo, useState } from "react";
import { Search, Bot, User, MessageSquarePlus } from "lucide-react";
import { cn, getInitials, formatPhoneBR } from "@/lib/utils";
import type { InboxConversation } from "@/lib/mock-inbox-data";

type Filter = "all" | "ai" | "attendant" | "unread";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "ai", label: "IA" },
  { id: "attendant", label: "Atendente" },
  { id: "unread", label: "Não lidas" },
];

interface ConversationListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function isNameJustPhone(name: string | undefined, phone: string | undefined) {
  const n = (name ?? "").trim();
  const p = phone ?? "";
  return !n || n === p || /^\+?\d+$/.test(n.replace(/\s/g, ""));
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      all: conversations.length,
      ai: conversations.filter((c) => c.handledBy === "ai").length,
      attendant: conversations.filter((c) => c.handledBy === "attendant").length,
      unread: conversations.filter((c) => c.unread > 0).length,
    }),
    [conversations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "ai" && c.handledBy !== "ai") return false;
      if (filter === "attendant" && c.handledBy !== "attendant") return false;
      if (filter === "unread" && c.unread === 0) return false;
      if (!q) return true;
      return (
        c.patient.name.toLowerCase().includes(q) ||
        c.patient.phone.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
      );
    });
  }, [conversations, filter, search]);

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Header */}
      <div className="border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg text-text-primary">Conversas</h2>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-primary hover:bg-brand-accent-soft transition-all duration-200 ease-out-soft active:scale-95"
            aria-label="Nova conversa"
            title="Nova conversa"
          >
            <MessageSquarePlus size={18} />
          </button>
        </div>

        {/* Search */}
        <label className="flex items-center h-11 rounded-lg border border-border bg-bg-soft px-3 gap-2 shadow-xs focus-within:border-brand-accent focus-within:bg-bg-base focus-within:ring-[3px] focus-within:ring-brand-accent/22 transition-all duration-200 ease-out-soft">
          <Search size={15} className="text-text-muted flex-shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            aria-label="Buscar conversas"
          />
        </label>

        {/* Filters */}
        <div
          role="tablist"
          aria-label="Filtros de conversa"
          className="mt-3 flex gap-1 overflow-x-auto -mx-1 px-1"
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.id;
            const count = counts[f.id];
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold",
                  "transition-all duration-200 ease-out-soft active:scale-95",
                  isActive
                    ? "bg-brand-primary text-white shadow-[0_4px_12px_-2px_rgba(13,59,102,0.35)]"
                    : "text-text-secondary hover:bg-bg-mist hover:text-text-primary",
                )}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-white/22 text-white"
                        : "bg-bg-mist text-text-secondary",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-semibold text-text-primary">
              Nenhuma conversa encontrada
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Tente ajustar a busca ou os filtros.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => {
              const isSelected = c.id === selectedId;
              const justPhone = isNameJustPhone(c.patient.name, c.patient.phone);
              const displayName = justPhone ? "Paciente sem nome" : c.patient.name;
              const initials = justPhone ? "?" : getInitials(c.patient.name);
              const isAI = c.handledBy === "ai";

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      "group relative w-full text-left flex items-start gap-3 px-4 py-3 min-h-[76px]",
                      "transition-all duration-200 ease-out-soft",
                      isSelected
                        ? "bg-brand-accent-soft/60"
                        : "hover:bg-bg-soft",
                    )}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    {/* Active indicator pill on the left */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-out-soft",
                        isSelected
                          ? "h-12 bg-brand-accent shadow-[0_0_12px_rgba(64,224,208,0.6)]"
                          : "h-0 bg-transparent",
                      )}
                    />

                    <span
                      className={cn(
                        "mt-0.5 flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0",
                        "text-white text-xs font-bold",
                        "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
                        "shadow-[0_2px_8px_-2px_rgba(13,59,102,0.4)] ring-2 ring-bg-base",
                        "transition-transform duration-200 ease-out-soft group-hover:scale-105",
                      )}
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "font-semibold text-sm text-text-primary truncate",
                            justPhone && "italic text-text-secondary",
                          )}
                        >
                          {displayName}
                        </p>
                        <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0 tabular-nums">
                          {c.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate tabular-nums">
                        {formatPhoneBR(c.patient.phone)}
                      </p>
                      <p
                        className={cn(
                          "text-xs truncate mt-1.5",
                          c.unread > 0
                            ? "text-text-primary font-semibold"
                            : "text-text-secondary",
                        )}
                      >
                        {c.preview}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            isAI
                              ? "bg-brand-accent-soft text-brand-primary border-brand-accent/30"
                              : "bg-warning/10 text-warning border-warning/25",
                          )}
                        >
                          {isAI ? <Bot size={10} /> : <User size={10} />}
                          {isAI ? "IA" : "Humano"}
                        </span>
                        {c.unread > 0 && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums",
                              "bg-brand-accent text-brand-primary shadow-[0_2px_6px_-1px_rgba(64,224,208,0.5)]",
                              "animate-soft-pulse",
                            )}
                            aria-label={`${c.unread} mensagens não lidas`}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
