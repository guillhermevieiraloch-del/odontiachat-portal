"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className }: TabsProps) {
  const baseId = useId();

  return (
    <div
      role="tablist"
      aria-label="Configuração da IA"
      className={cn(
        "flex items-center gap-1 overflow-x-auto border-b border-border -mx-4 px-4 lg:mx-0 lg:px-0",
        className,
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`${baseId}-${tab.id}-tab`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${baseId}-${tab.id}-panel`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 min-h-11 text-sm font-bold transition-colors duration-200 border-b-2 whitespace-nowrap",
              isActive
                ? "border-brand-accent text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border",
            )}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  active: string;
  children: React.ReactNode;
}

export function TabPanel({ id, active, children }: TabPanelProps) {
  if (id !== active) return null;
  return (
    <div role="tabpanel" className="animate-fade-in-up">
      {children}
    </div>
  );
}
