"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn, getInitials } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-config";
import { signOut } from "@/lib/actions/auth";

interface SidebarProps {
  user: { name: string; email: string };
  clinic: { name: string; plan: string };
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ user, clinic, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-brand-primary-dark/40 backdrop-blur-md transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-out-soft lg:translate-x-0",
          "glass-strong border-r border-border/70",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navegação lateral"
      >
        {/* Subtle aurora behind the sidebar — adds depth without distracting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-12 h-64 w-64 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="absolute bottom-0 -right-12 h-56 w-56 rounded-full bg-brand-primary-light/10 blur-3xl" />
        </div>

        <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist transition-colors duration-200"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-border/60 p-3 bg-bg-base/40">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                "text-white text-xs font-bold",
                "bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-primary-light)_100%)]",
                "shadow-[0_4px_12px_-2px_rgba(13,59,102,0.36)]",
                "ring-2 ring-white/80",
              )}
              aria-hidden="true"
            >
              {getInitials(user.name)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                  <span className="h-1 w-1 rounded-full bg-success" aria-hidden="true" />
                  {clinic.plan}
                </span>
              </div>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-11 rounded-md text-sm font-semibold text-text-secondary hover:text-danger hover:bg-danger/8 transition-colors duration-200"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

interface NavLinkProps {
  item: (typeof NAV_ITEMS)[number];
  pathname: string;
  onNavigate: () => void;
}

function NavLink({ item, pathname, onNavigate }: NavLinkProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = !!item.children?.length;
  const [expanded, setExpanded] = useState(isActive && hasChildren);
  const Icon = item.icon;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 min-h-11 rounded-lg text-sm font-semibold",
          "transition-all duration-200 ease-out-soft",
          isActive
            ? "text-brand-primary bg-bg-base shadow-sm border border-border/60"
            : "text-text-secondary hover:text-brand-primary hover:bg-bg-base/60",
        )}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-accent"
            aria-hidden="true"
          />
        )}
        <Icon
          size={18}
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            isActive ? "text-brand-accent-dark" : "text-text-muted group-hover:text-brand-primary",
            "group-hover:scale-110",
          )}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "group w-full flex items-center justify-between gap-3 px-3 py-2.5 min-h-11 rounded-lg text-sm font-semibold",
          "transition-all duration-200 ease-out-soft",
          isActive
            ? "text-brand-primary bg-bg-base shadow-sm border border-border/60"
            : "text-text-secondary hover:text-brand-primary hover:bg-bg-base/60",
        )}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-3">
          <Icon
            size={18}
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              isActive ? "text-brand-accent-dark" : "text-text-muted group-hover:text-brand-primary",
              "group-hover:scale-110",
            )}
          />
          {item.label}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-300 ease-out-soft text-text-muted",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && item.children && (
        <ul className="mt-1 ml-4 pl-4 border-l border-border/70 space-y-0.5 animate-fade-in-up">
          {item.children.map((child) => {
            const childActive = pathname === child.href;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center px-3 py-2 min-h-11 rounded-md text-sm transition-all duration-200",
                    childActive
                      ? "text-brand-primary font-semibold bg-brand-accent-soft/60"
                      : "text-text-secondary hover:text-brand-primary hover:bg-bg-mist/60",
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
