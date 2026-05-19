"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Power,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleState {
  connectedEmail: string | null;
  connectedAt: string | null;
  calendarId: string | null;
}

interface Props {
  google: GoogleState;
  flashSuccess: boolean;
  flashError: string | null;
}

export function IntegrationsPage({ google, flashSuccess, flashError }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          Integrações
        </h1>
        <p className="mt-2 text-text-secondary">
          Conecte sua clínica a serviços externos pra agendamentos caírem direto
          na sua agenda.
        </p>
      </header>

      {flashSuccess && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-success/30 bg-success/5 p-4 flex items-start gap-3"
        >
          <CheckCircle2
            size={18}
            className="text-success flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-text-primary">
            Google Calendar conectado com sucesso. Novos agendamentos vão direto
            pra sua agenda.
          </p>
        </div>
      )}

      {flashError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 flex items-start gap-3"
        >
          <AlertCircle
            size={18}
            className="text-danger flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-text-primary">
            Não consegui conectar: <code className="text-xs">{flashError}</code>
          </p>
        </div>
      )}

      <GoogleCalendarCard state={google} />
    </div>
  );
}

function GoogleCalendarCard({ state }: { state: GoogleState }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = !!state.connectedEmail;

  const disconnect = async () => {
    if (
      !confirm(
        "Desconectar o Google Calendar? Novos agendamentos não vão mais cair na sua agenda.",
      )
    )
      return;
    setDisconnecting(true);
    try {
      await fetch("/api/google/disconnect", { method: "POST" });
      router.refresh();
    } finally {
      setDisconnecting(false);
    }
  };

  const connectedSince = state.connectedAt
    ? new Date(state.connectedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <section
      className={`rounded-lg border bg-bg-base shadow-sm p-6 ${
        isConnected ? "border-success/30" : "border-border"
      }`}
    >
      <div className="flex items-start gap-4 flex-wrap">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full flex-shrink-0 ${
            isConnected
              ? "bg-success/10 text-success"
              : "bg-brand-accent-soft text-brand-primary"
          }`}
          aria-hidden="true"
        >
          <Calendar size={26} />
        </span>

        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-bold text-lg text-text-primary">
              Google Calendar
            </h2>
            {isConnected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                <CheckCircle2 size={12} />
                Conectado
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {isConnected ? (
              <>
                Conta: <strong>{state.connectedEmail}</strong>
                {connectedSince && (
                  <span className="text-text-muted">
                    {" "}
                    · desde {connectedSince}
                  </span>
                )}
              </>
            ) : (
              <>
                Quando um paciente agendar pelo WhatsApp, o evento aparece na sua
                agenda do Google automaticamente.
              </>
            )}
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={disconnect}
                  disabled={disconnecting}
                >
                  <Power size={14} />
                  {disconnecting ? "Desconectando..." : "Desconectar"}
                </Button>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 min-h-11 rounded-md text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors"
                >
                  Abrir Google Calendar
                  <ExternalLink size={14} />
                </a>
              </>
            ) : (
              <a
                href="/api/google/connect"
                className="inline-flex items-center gap-2 px-5 min-h-11 rounded-md bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
              >
                <Calendar size={16} />
                Conectar Google Calendar
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
