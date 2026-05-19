"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "odontia-theme";

export function useTheme(): { theme: Theme; toggle: () => void; set: (t: Theme) => void } {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  // Keep state in sync if another tab toggles the theme
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        apply(e.newValue);
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const apply = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.dataset.theme = t;
  };

  const set = (t: Theme) => {
    apply(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    setTheme(t);
  };

  const toggle = () => set(theme === "dark" ? "light" : "dark");

  return { theme, toggle, set };
}
