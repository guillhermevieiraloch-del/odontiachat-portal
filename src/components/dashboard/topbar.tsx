"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, Bell, ChevronRight, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ROUTE_LABELS } from "./nav-config";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TopbarProps {
  user: { name: string; email: string };
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumb: { label: string; href: string }[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += "/" + seg;
    breadcrumb.push({
      label: ROUTE_LABELS[acc] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      href: acc,
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-bg-base/72 backdrop-blur-xl px-4 lg:px-6 [backdrop-filter:saturate(140%)_blur(16px)]">
      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm flex-shrink min-w-0">
        {breadcrumb.map((b, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <span key={b.href} className="flex items-center gap-1 min-w-0">
              {isLast ? (
                <span className="font-semibold text-text-primary truncate">{b.label}</span>
              ) : (
                <Link
                  href={b.href}
                  className="text-text-secondary hover:text-brand-primary truncate"
                >
                  {b.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="hidden md:flex items-center w-64 lg:w-80 h-10 rounded-lg border border-border bg-bg-base/60 px-3 gap-2 text-text-muted shadow-xs focus-within:border-brand-accent focus-within:bg-bg-base focus-within:ring-[3px] focus-within:ring-brand-accent/22 focus-within:shadow-sm transition-all duration-200 ease-out-soft">
        <Search size={15} />
        <input
          type="search"
          placeholder="Buscar pacientes, conversas..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          aria-label="Busca global"
        />
        <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-border bg-bg-mist/60 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-muted">⌘K</kbd>
      </div>

      <ThemeToggle />

      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:text-brand-primary hover:bg-bg-mist transition-all duration-200 ease-out-soft active:scale-95"
        aria-label="Notificações (3 não lidas)"
      >
        <Bell size={17} />
        <span
          className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-brand-primary ring-2 ring-bg-base shadow-sm"
          aria-hidden="true"
        >
          3
        </span>
      </button>

      <UserMenu user={user} />
    </header>
  );
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 min-h-11 hover:bg-bg-mist transition-all duration-200 ease-out-soft active:scale-[0.97]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold",
            "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
            "shadow-[0_2px_8px_-2px_rgba(13,59,102,0.45)] ring-2 ring-bg-base",
          )}
        >
          {getInitials(user.name)}
        </span>
        <ChevronDown size={14} className={cn("text-text-muted hidden sm:block transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-bg-base/95 backdrop-blur-md shadow-xl overflow-hidden animate-scale-in origin-top-right"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <Link
            href="/configuracoes/clinica"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-mist",
            )}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <UserCircle size={16} className="text-text-muted" />
            Minha conta
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-mist border-t border-border"
              role="menuitem"
            >
              <LogOut size={16} className="text-text-muted" />
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
