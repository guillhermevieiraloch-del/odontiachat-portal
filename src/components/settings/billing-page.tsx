"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2026-005",
    date: "2026-05-01",
    description: "Plano Clínica · maio/2026",
    amount: 249,
    status: "paid",
  },
  {
    id: "INV-2026-004",
    date: "2026-04-01",
    description: "Plano Clínica · abril/2026",
    amount: 249,
    status: "paid",
  },
  {
    id: "INV-2026-003",
    date: "2026-03-01",
    description: "Plano Clínica · março/2026",
    amount: 249,
    status: "paid",
  },
  {
    id: "INV-2026-002",
    date: "2026-02-01",
    description: "Plano Clínica · fevereiro/2026",
    amount: 249,
    status: "paid",
  },
  {
    id: "INV-2026-001",
    date: "2026-01-01",
    description: "Plano Clínica · janeiro/2026",
    amount: 249,
    status: "paid",
  },
];

export function BillingPage() {
  const [editCardOpen, setEditCardOpen] = useState(false);

  const nextChargeDate = new Date();
  nextChargeDate.setDate(1);
  nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
          Faturamento
        </h1>
        <p className="mt-2 text-text-secondary">
          Gerencie seu plano, método de pagamento e baixe as notas fiscais.
        </p>
      </header>

      {/* Plano atual */}
      <section className="rounded-lg border border-border bg-gradient-to-br from-brand-primary to-brand-primary-light text-white shadow-lg overflow-hidden relative">
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent text-brand-primary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} />
                Plano atual
              </span>
              <h2 className="font-display font-bold text-2xl mt-3">
                OdontIAChat Clínica
              </h2>
              <p className="text-white/85 mt-1 text-sm">
                Atendimento 24/7 · Até 1.500 conversas/mês · Sem taxa de setup
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-extrabold text-3xl">R$ 249</p>
              <p className="text-white/70 text-xs">/mês</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <Stat
              label="Conversas no mês"
              value="847 / 1500"
              progress={847 / 1500}
            />
            <Stat
              label="Próxima cobrança"
              value={nextChargeDate.toLocaleDateString("pt-BR")}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button variant="accent" size="md">
              <ArrowUpRight size={16} />
              Mudar de plano
            </Button>
            <button
              type="button"
              className="inline-flex items-center min-h-11 px-4 rounded-md text-sm font-bold text-white/85 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              Cancelar assinatura
            </button>
          </div>
        </div>
      </section>

      {/* Payment method */}
      <section className="rounded-lg border border-border bg-bg-base shadow-sm">
        <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-bold text-text-primary">
            Método de pagamento
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditCardOpen(true)}
          >
            Atualizar cartão
          </Button>
        </header>
        <div className="px-5 py-5 flex items-center gap-4">
          <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gradient-to-br from-brand-primary to-brand-primary-light text-white font-display font-bold text-xs">
            VISA
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary">
              •••• •••• •••• 4242
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Vence em 12/2027 · Camila Ferreira
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={11} />
            Ativo
          </span>
        </div>
      </section>

      {/* Invoices */}
      <section className="rounded-lg border border-border bg-bg-base shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-text-primary">
            Histórico de faturas
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Baixe as notas fiscais para sua contabilidade.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-mist border-b border-border">
              <tr>
                <Th>Fatura</Th>
                <Th>Data</Th>
                <Th>Descrição</Th>
                <Th className="text-right">Valor</Th>
                <Th>Status</Th>
                <th className="px-4 py-3 w-12">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg-soft transition-colors duration-200">
                  <td className="px-4 py-3 font-mono text-text-primary text-xs">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(inv.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{inv.description}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">
                    {inv.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-mist hover:text-brand-primary transition-colors duration-200"
                      aria-label={`Baixar ${inv.id}`}
                      title="Baixar NFe"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Update card modal */}
      <Modal
        open={editCardOpen}
        onClose={() => setEditCardOpen(false)}
        title="Atualizar cartão"
        description="Os dados do cartão são processados de forma segura. Não armazenamos números completos."
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" type="button" onClick={() => setEditCardOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" form="card-form">
              <CreditCard size={14} />
              Salvar cartão
            </Button>
          </>
        }
      >
        <form
          id="card-form"
          onSubmit={(e) => {
            e.preventDefault();
            setEditCardOpen(false);
          }}
          className="space-y-4"
        >
          <Field label="Número do cartão" htmlFor="card-number" required>
            <Input
              id="card-number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              autoComplete="cc-number"
              inputMode="numeric"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Validade" htmlFor="card-expiry" required>
              <Input
                id="card-expiry"
                placeholder="MM/AA"
                maxLength={5}
                autoComplete="cc-exp"
                inputMode="numeric"
              />
            </Field>
            <Field label="CVV" htmlFor="card-cvv" required>
              <Input
                id="card-cvv"
                placeholder="123"
                maxLength={4}
                autoComplete="cc-csc"
                inputMode="numeric"
              />
            </Field>
          </div>
          <Field label="Nome no cartão" htmlFor="card-name" required>
            <Input id="card-name" autoComplete="cc-name" placeholder="Como aparece no cartão" />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

function Stat({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <div className="rounded-md bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
        {label}
      </p>
      <p className="text-sm font-display font-bold mt-1">{value}</p>
      {progress != null && (
        <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-brand-accent rounded-full transition-all duration-200"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const config = {
    paid: {
      label: "Paga",
      cls: "bg-success/10 text-success",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pendente",
      cls: "bg-warning/10 text-warning",
      icon: AlertCircle,
    },
    failed: {
      label: "Falhou",
      cls: "bg-danger/10 text-danger",
      icon: AlertCircle,
    },
  }[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        config.cls,
      )}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}
