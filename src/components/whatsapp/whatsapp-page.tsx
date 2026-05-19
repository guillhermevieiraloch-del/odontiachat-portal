"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Send,
  Wifi,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

interface ApiStatus {
  status:
    | "disconnected"
    | "connecting"
    | "qr"
    | "authenticated"
    | "ready"
    | "error"
    | "auth_failure";
  qr: string | null;
  qrImage: string | null;
  connectedAt: string | null;
  lastError: string | null;
}

const POLL_INTERVAL = 2000;

export function WhatsAppPage() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status", { cache: "no-store" });
      const data: ApiStatus = await res.json();
      setStatus(data);
      // Para polling se já chegou em ready ou erro persistente
      if (
        ["ready", "error", "disconnected"].includes(data.status) &&
        pollRef.current
      ) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Quando estiver em qr/connecting/authenticated, faz polling
  useEffect(() => {
    if (!status) return;
    const polling = ["connecting", "qr", "authenticated"].includes(status.status);
    if (polling && !pollRef.current) {
      pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current && !polling) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, fetchStatus]);

  const connect = async () => {
    setActing(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error || "Falha ao conectar");
      await fetchStatus();
      pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActing(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Tem certeza que quer desconectar? A IA vai parar de responder pacientes."))
      return;
    setActing(true);
    setError(null);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      await fetchStatus();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActing(false);
    }
  };

  const state = status?.status ?? "disconnected";
  const isConnected = state === "ready";
  const isConnecting = ["connecting", "qr", "authenticated"].includes(state);
  const hasErrored = ["error", "auth_failure"].includes(state);
  const isOffline = status?.lastError?.includes("Bot service");

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          Conexão do WhatsApp
        </h1>
        <p className="mt-2 text-text-secondary">
          Conecte o número de WhatsApp da sua clínica para a OdontIAChat começar
          a atender pacientes automaticamente.
        </p>
      </header>

      {isOffline && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-text-primary">
              Bot Service offline
            </p>
            <p className="text-text-secondary mt-0.5">
              O serviço de WhatsApp não está rodando. Verifique se{" "}
              <code className="text-xs bg-bg-mist px-1.5 py-0.5 rounded">
                npm start
              </code>{" "}
              está ativo na pasta raiz do projeto.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {!isConnected && !isConnecting && !isOffline && (
        <DisconnectedView onConnect={connect} pending={acting} />
      )}

      {isConnecting && (
        <ConnectingView
          status={state}
          qrImage={status?.qrImage ?? null}
          onCancel={disconnect}
          onRefresh={connect}
        />
      )}

      {isConnected && status && (
        <ConnectedView
          connectedAt={status.connectedAt}
          onDisconnect={disconnect}
          disconnecting={acting}
        />
      )}

      {hasErrored && !isOffline && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center">
          <AlertCircle size={28} className="text-danger mx-auto mb-3" />
          <p className="font-display font-bold text-text-primary mb-1">
            Erro de autenticação
          </p>
          <p className="text-sm text-text-secondary mb-4">
            {status?.lastError || "Tente conectar novamente."}
          </p>
          <Button variant="primary" size="md" onClick={connect} disabled={acting}>
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  );
}

// ───────── Disconnected ─────────

function DisconnectedView({
  onConnect,
  pending,
}: {
  onConnect: () => void;
  pending: boolean;
}) {
  return (
    <section className="rounded-lg border border-border bg-bg-base shadow-sm p-8 text-center">
      <div
        className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning mb-5"
        aria-hidden="true"
      >
        <Smartphone size={28} />
      </div>
      <h2 className="font-display font-bold text-xl text-text-primary mb-2">
        WhatsApp não conectado
      </h2>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        Para a IA começar a responder pacientes, você precisa conectar o número
        de WhatsApp da clínica escaneando um QR Code.
      </p>

      <Button variant="primary" size="lg" onClick={onConnect} disabled={pending}>
        <Wifi size={16} />
        {pending ? "Conectando..." : "Conectar agora"}
      </Button>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <Tip icon={Smartphone} title="Qualquer número" desc="WhatsApp pessoal ou Business funciona." />
        <Tip icon={Shield} title="Seguro" desc="Não armazenamos suas mensagens fora do portal." />
        <Tip icon={Clock} title="Demora 1 minuto" desc="Basta escanear o QR Code com o celular." />
      </div>
    </section>
  );
}

function Tip({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Smartphone;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg-soft p-4">
      <Icon size={18} className="text-brand-primary mb-2" aria-hidden="true" />
      <p className="font-semibold text-sm text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
    </div>
  );
}

// ───────── Connecting ─────────

function ConnectingView({
  status,
  qrImage,
  onCancel,
  onRefresh,
}: {
  status: string;
  qrImage: string | null;
  onCancel: () => void;
  onRefresh: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-bg-base shadow-sm p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
        <div className="flex justify-center">
          {qrImage ? (
            <div className="inline-block rounded-lg bg-white p-4 shadow-md">
              <Image
                src={qrImage}
                alt="QR Code"
                width={256}
                height={256}
                unoptimized
                priority
              />
            </div>
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border bg-bg-soft">
              <div className="text-center">
                <RefreshCw
                  size={24}
                  className="mx-auto text-brand-primary animate-spin mb-2"
                />
                <p className="text-xs text-text-muted">
                  {status === "authenticated"
                    ? "Conectando ao WhatsApp..."
                    : "Gerando QR Code..."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-brand-accent animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
            </span>
            {status === "authenticated"
              ? "Autenticando..."
              : "Aguardando escaneamento"}
          </span>
          <h2 className="font-display font-bold text-xl text-text-primary mb-3">
            Escaneie o QR Code com seu WhatsApp
          </h2>

          <ol className="space-y-2.5 text-sm text-text-secondary mb-6">
            <Step n={1}>Abra o WhatsApp no celular da clínica</Step>
            <Step n={2}>
              Toque em <strong className="text-text-primary">Mais opções</strong> (Android) ou{" "}
              <strong className="text-text-primary">Configurações</strong> (iPhone)
            </Step>
            <Step n={3}>
              <strong className="text-text-primary">Dispositivos conectados</strong>{" "}
              → <strong className="text-text-primary">Conectar dispositivo</strong>
            </Step>
            <Step n={4}>Aponte o celular para a tela e escaneie</Step>
          </ol>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="md" onClick={onRefresh}>
              <RefreshCw size={14} />
              Gerar novo QR
            </Button>
            <Button variant="ghost" size="md" onClick={onCancel}>
              Cancelar
            </Button>
          </div>

          <p className="mt-4 text-xs text-text-muted">
            O QR é renovado automaticamente. O status atualiza em tempo real.
          </p>
        </div>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary text-xs font-bold flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

// ───────── Connected ─────────

function ConnectedView({
  connectedAt,
  onDisconnect,
  disconnecting,
}: {
  connectedAt: string | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const [testing, setTesting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");

  const sendTest = async () => {
    setTestError(null);
    if (!testPhone.trim()) {
      setTestError("Informe um telefone (com DDD).");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao enviar");
      }
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } catch (err) {
      setTestError((err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const connectedSince = connectedAt
    ? new Date(connectedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-success/30 bg-success/5 p-6 lg:p-8">
        <div className="flex items-start gap-4 flex-wrap">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white flex-shrink-0"
            aria-hidden="true"
          >
            <CheckCircle2 size={28} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl text-text-primary">
              WhatsApp conectado!
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              A OdontIAChat está pronta para atender pacientes 24h por dia.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-bg-base border border-border px-3 py-1.5">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="font-semibold text-text-primary text-sm">
                Conectado desde {connectedSince}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-bg-base shadow-sm p-5">
        <h3 className="font-display font-bold text-text-primary mb-1">
          Testar conexão
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Envie uma mensagem de teste pra um número (com DDD, ex: 5548999998888).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-3">
          <Field label="Telefone" htmlFor="test-phone">
            <Input
              id="test-phone"
              type="tel"
              placeholder="5548999998888"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
          </Field>
          <div className="self-end">
            <Button
              variant="primary"
              size="md"
              onClick={sendTest}
              disabled={testing}
            >
              <Send size={14} />
              {testing ? "Enviando..." : testSent ? "Enviado ✓" : "Enviar teste"}
            </Button>
          </div>
        </div>
        {testError && (
          <p role="alert" className="text-sm text-danger">
            {testError}
          </p>
        )}
        {testSent && (
          <div
            role="status"
            className="rounded-md bg-success/10 border border-success/20 px-4 py-3 flex items-start gap-2"
          >
            <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary">
              Mensagem enviada. Verifique no celular destinatário.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-warning/20 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={18}
            className="text-warning flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-sm text-text-primary mb-1">
              Mantenha o celular conectado
            </p>
            <p className="text-xs text-text-secondary">
              O celular precisa estar com internet (Wi-Fi ou dados) para a IA
              continuar respondendo. Se desconectar, os pacientes não receberão
              respostas até reconectar aqui.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-bg-base shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-text-primary mb-1">
              Desconectar WhatsApp
            </h3>
            <p className="text-sm text-text-secondary">
              A IA vai parar de responder até você reconectar.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={onDisconnect}
            disabled={disconnecting}
          >
            <Power size={14} />
            {disconnecting ? "Desconectando..." : "Desconectar"}
          </Button>
        </div>
      </section>
    </div>
  );
}
