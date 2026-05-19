"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  Smartphone,
  Bot,
  Link as LinkIcon,
  UserPlus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  action: () => void;
  keywords?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<CommandItem[]>(() => {
    const nav = (href: string) => () => {
      onClose();
      router.push(href);
    };
    return [
      // Navegação
      { id: "nav-dash", group: "Navegação", label: "Dashboard", icon: LayoutDashboard, action: nav("/dashboard"), keywords: "home início painel" },
      { id: "nav-inbox", group: "Navegação", label: "Inbox", icon: MessageSquare, action: nav("/inbox"), keywords: "conversas mensagens chat" },
      { id: "nav-appts", group: "Navegação", label: "Agendamentos", icon: Calendar, action: nav("/agendamentos"), keywords: "consultas agenda calendário" },
      { id: "nav-patients", group: "Navegação", label: "Pacientes", icon: Users, action: nav("/pacientes"), keywords: "clientes" },
      { id: "nav-settings", group: "Navegação", label: "Configurações", icon: Settings, action: nav("/configuracoes/clinica"), keywords: "config" },

      // Ações
      { id: "act-new-appt", group: "Ações", label: "Novo agendamento", icon: Plus, action: nav("/agendamentos?new=1"), keywords: "criar consulta marcar" },
      { id: "act-new-patient", group: "Ações", label: "Novo paciente", icon: UserPlus, action: nav("/pacientes?new=1"), keywords: "cadastrar adicionar" },
      { id: "act-whatsapp", group: "Ações", label: "Conectar WhatsApp", icon: Smartphone, action: nav("/configuracoes/whatsapp"), keywords: "conectar qr código" },
      { id: "act-ai", group: "Ações", label: "Configurar IA", icon: Bot, action: nav("/configuracoes/ia"), keywords: "personalidade tom" },
      { id: "act-integrations", group: "Ações", label: "Integrações (Google Calendar)", icon: LinkIcon, action: nav("/configuracoes/integracoes"), keywords: "google calendar oauth" },
    ];
  }, [onClose, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  // Group filtered commands
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Open/close: focus input, reset state
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[activeIndex];
        if (cmd) cmd.action();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIndex, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  let runningIndex = -1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
      className="fixed inset-0 z-[150] flex items-start justify-center pt-20 sm:pt-32 px-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-brand-primary-dark/40 backdrop-blur-md animate-fade-in-up"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-bg-base shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={18} className="text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Buscar páginas, ações..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            aria-label="Buscar"
          />
          <kbd className="rounded-md border border-border bg-bg-mist px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-muted">
            ESC
          </kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">Nenhum resultado pra <strong>{query}</strong></p>
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="px-1 pb-1">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">
                  {group}
                </p>
                {items.map((cmd) => {
                  runningIndex++;
                  const isActive = runningIndex === activeIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={cmd.action}
                      onMouseMove={() => setActiveIndex(runningIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150",
                        isActive
                          ? "bg-brand-accent-soft text-brand-primary"
                          : "text-text-primary hover:bg-bg-mist",
                      )}
                    >
                      <Icon size={16} className={isActive ? "text-brand-primary" : "text-text-muted"} />
                      <span className="text-sm font-semibold">{cmd.label}</span>
                      {isActive && (
                        <kbd className="ml-auto rounded-md border border-brand-primary/20 bg-bg-base px-1.5 py-0.5 text-[10px] font-mono font-semibold text-brand-primary">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-bg-mist px-1 py-0.5 font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-bg-mist px-1 py-0.5 font-mono">↵</kbd>
              abrir
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-bg-mist px-1 py-0.5 font-mono">⌘K</kbd>
            comando
          </span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
