"use client";

import { useEffect, useState } from "react";
import { CommandPalette } from "./command-palette";

/**
 * Mounts the command palette and wires the global Cmd+K / Ctrl+K shortcut.
 */
export function CommandPaletteProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
