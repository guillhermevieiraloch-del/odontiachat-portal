import { MessageSquare } from "lucide-react";

export function InboxEmptyState() {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12 bg-bg-mist">
      <div className="max-w-md text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary mb-5">
          <MessageSquare size={26} />
        </div>
        <h2 className="font-display font-bold text-xl text-text-primary">
          Selecione uma conversa
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          Escolha uma conversa na lista à esquerda para visualizar as mensagens e o
          perfil do paciente.
        </p>
        <p className="text-xs text-text-muted mt-6">
          Dica: use os filtros e a busca para encontrar conversas rapidamente.
        </p>
      </div>
    </div>
  );
}
