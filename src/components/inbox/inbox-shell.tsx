"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "./conversation-list";
import { ConversationView } from "./conversation-view";
import { PatientProfile } from "./patient-profile";
import { InboxEmptyState } from "./empty-state";
import { cn } from "@/lib/utils";
import type { InboxConversation } from "@/lib/mock-inbox-data";

interface InboxShellProps {
  conversations: InboxConversation[];
}

export function InboxShell({ conversations }: InboxShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("c");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId && conversations.some((c) => c.id === initialId)
      ? initialId
      : null,
  );
  const [profileOpen, setProfileOpen] = useState(false);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      const params = new URLSearchParams(searchParams);
      params.set("c", id);
      router.replace(`/inbox?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clear = useCallback(() => {
    setSelectedId(null);
    setProfileOpen(false);
    router.replace("/inbox", { scroll: false });
  }, [router]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: list */}
      <aside
        className={cn(
          "w-full md:w-[320px] md:flex-shrink-0 border-r border-border",
          selected ? "hidden md:flex md:flex-col" : "flex flex-col",
        )}
        aria-label="Lista de conversas"
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={select}
        />
      </aside>

      {/* Center: conversation */}
      <section
        className={cn(
          "flex-1 min-w-0",
          selected ? "flex flex-col" : "hidden md:flex md:flex-col",
        )}
        aria-label="Conversa selecionada"
      >
        {selected ? (
          <ConversationView
            conversation={selected}
            onBack={clear}
            onToggleProfile={() => setProfileOpen((v) => !v)}
            profileOpen={profileOpen}
          />
        ) : (
          <InboxEmptyState />
        )}
      </section>

      {/* Right: patient profile (desktop) */}
      {selected && (
        <aside
          className={cn(
            "hidden xl:flex xl:flex-col xl:w-[320px] xl:flex-shrink-0 border-l border-border transition-all duration-300",
            profileOpen ? "xl:flex" : "xl:hidden",
          )}
          aria-label="Perfil do paciente"
        >
          <PatientProfile
            patient={selected.patient}
            onClose={() => setProfileOpen(false)}
          />
        </aside>
      )}

      {/* Right: profile slide-over (mobile/tablet) */}
      {selected && profileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setProfileOpen(false)}
            className="xl:hidden fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-sm animate-fade-in-up"
          />
          <aside
            className="xl:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-border bg-bg-base shadow-xl animate-fade-in-up"
            aria-label="Perfil do paciente"
          >
            <PatientProfile
              patient={selected.patient}
              onClose={() => setProfileOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
