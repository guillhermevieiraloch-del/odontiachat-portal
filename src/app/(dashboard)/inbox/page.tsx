import { InboxShell } from "@/components/inbox/inbox-shell";
import { requireUser } from "@/lib/auth";
import { listFullInbox } from "@/lib/queries/inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { clinic } = await requireUser();
  const conversations = await listFullInbox(clinic.id);

  // A conversa é considerada "ativa" se tem mensagens trocadas recentemente —
  // o tipo InboxConversation só tem status online/offline (do paciente), então
  // contamos todas que aparecem na inbox como ativas.
  const activeCount = conversations.length;
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread ?? 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      <header className="mb-4 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            <strong className="text-text-primary tabular-nums">{activeCount}</strong>{" "}
            {activeCount === 1 ? "conversa ativa" : "conversas ativas"}
            {unreadCount > 0 && (
              <>
                {" · "}
                <strong className="text-brand-primary tabular-nums">{unreadCount}</strong>{" "}
                não {unreadCount === 1 ? "lida" : "lidas"}
              </>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 rounded-2xl border border-border bg-bg-base overflow-hidden shadow-card">
        <InboxShell conversations={conversations} />
      </div>
    </div>
  );
}
