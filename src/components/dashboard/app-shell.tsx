"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPaletteProvider } from "@/components/command-palette/command-palette-provider";

interface AppShellProps {
  user: { name: string; email: string };
  clinic: { name: string; plan: string };
  children: React.ReactNode;
}

export function AppShell({ user, clinic, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen mesh-bg relative">
      <Sidebar
        user={user}
        clinic={clinic}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar user={user} onMenuClick={() => setDrawerOpen(true)} />
        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">{children}</main>
      </div>
      <CommandPaletteProvider />
    </div>
  );
}
