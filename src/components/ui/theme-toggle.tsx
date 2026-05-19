"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg",
        "text-text-secondary hover:text-brand-primary hover:bg-bg-mist",
        "transition-all duration-200 ease-out-soft active:scale-95",
        "overflow-hidden",
      )}
    >
      <Sun
        size={17}
        className={cn(
          "absolute transition-all duration-500 ease-spring",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
        )}
      />
      <Moon
        size={17}
        className={cn(
          "absolute transition-all duration-500 ease-spring",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
        )}
      />
    </button>
  );
}
