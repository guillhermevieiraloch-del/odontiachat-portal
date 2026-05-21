"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Stethoscope, Pencil, Trash2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  createProcedureAction,
  updateProcedureAction,
  deleteProcedureAction,
  toggleProcedureActiveAction,
  type ProcedureInput,
} from "@/app/(dashboard)/configuracoes/procedimentos/actions";

export interface ProcedureRow {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  acceptsInsurance: boolean;
  showPrice: boolean;
  active: boolean;
  dentistIds: string[];
}

export interface DentistOption {
  id: string;
  name: string;
  specialty: string;
}

const EMPTY: ProcedureInput = {
  name: "",
  duration: 30,
  price: null,
  acceptsInsurance: false,
  showPrice: true,
  dentistIds: [],
};

function formatPrice(price: number | null, showPrice: boolean): string {
  if (!showPrice) return "Sob consulta";
  if (price === null || price === 0) return "Gratuito";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProceduresPage({
  procedures,
  dentists,
}: {
  procedures: ProcedureRow[];
  dentists: DentistOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [modal, setModal] = useState<
    { kind: "create" } | { kind: "edit"; id: string } | null
  >(null);
  const [form, setForm] = useState<ProcedureInput>(EMPTY);
  const [priceText, setPriceText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dentistName = (id: string) =>
    dentists.find((d) => d.id === id)?.name ?? "—";

  const openCreate = () => {
    setForm(EMPTY);
    setPriceText("");
    setError(null);
    setModal({ kind: "create" });
  };

  const openEdit = (p: ProcedureRow) => {
    setForm({
      name: p.name,
      duration: p.duration,
      price: p.price,
      acceptsInsurance: p.acceptsInsurance,
      showPrice: p.showPrice,
      dentistIds: p.dentistIds,
    });
    setPriceText(p.price !== null ? String(p.price) : "");
    setError(null);
    setModal({ kind: "edit", id: p.id });
  };

  const close = () => {
    setModal(null);
    setError(null);
  };

  const toggleDentist = (id: string) => {
    setForm((f) => ({
      ...f,
      dentistIds: f.dentistIds.includes(id)
        ? f.dentistIds.filter((x) => x !== id)
        : [...f.dentistIds, id],
    }));
  };

  const handleSubmit = () => {
    if (!modal) return;
    const priceNum = priceText.trim()
      ? Number(priceText.replace(",", "."))
      : null;
    if (priceText.trim() && (priceNum === null || Number.isNaN(priceNum))) {
      setError("Preço inválido");
      return;
    }
    const payload: ProcedureInput = { ...form, price: priceNum };

    start(async () => {
      setError(null);
      const result =
        modal.kind === "create"
          ? await createProcedureAction(payload)
          : await updateProcedureAction(modal.id, payload);
      if (!result.ok) {
        setError(result.error ?? "Erro");
        return;
      }
      toast.success(
        modal.kind === "create"
          ? "Procedimento adicionado"
          : "Procedimento atualizado",
      );
      close();
      router.refresh();
    });
  };

  const handleToggle = (p: ProcedureRow) => {
    start(async () => {
      const result = await toggleProcedureActiveAction(p.id, !p.active);
      if (!result.ok) {
        toast.error(result.error ?? "Erro");
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = (p: ProcedureRow) => {
    if (!confirm(`Remover "${p.name}"?`)) return;
    start(async () => {
      const result = await deleteProcedureAction(p.id);
      if (!result.ok) {
        toast.error(result.error ?? "Erro");
        return;
      }
      toast.success("Procedimento removido");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Procedimentos
          </h1>
          <p className="mt-2 text-text-secondary max-w-2xl">
            Os tratamentos que a clínica oferece. A IA usa essa lista pra
            informar valores, duração e agendar — e sabe qual dentista faz cada
            um.
          </p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={16} />
          Adicionar procedimento
        </Button>
      </header>

      {dentists.length === 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-secondary">
          Você ainda não cadastrou dentistas. Cadastre em{" "}
          <strong>Configurações &gt; Dentistas</strong> pra poder vincular quem
          faz cada procedimento.
        </div>
      )}

      {procedures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg-soft px-8 py-16 text-center">
          <Stethoscope size={32} className="mx-auto text-text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            Nenhum procedimento cadastrado
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Cadastre os tratamentos da clínica pra IA poder informar preço,
            duração e agendar.
          </p>
          <Button onClick={openCreate} size="md" className="mt-6">
            <Plus size={16} />
            Adicionar primeiro procedimento
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {procedures.map((p) => (
            <li
              key={p.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border border-border bg-bg-base p-4 transition-colors",
                !p.active && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-text-primary">{p.name}</p>
                  {!p.active && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Inativo
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-sm text-text-secondary flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} />
                    {p.duration} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Tag size={13} />
                    {formatPrice(p.price, p.showPrice)}
                  </span>
                  {p.acceptsInsurance && (
                    <span className="text-success text-xs font-semibold">
                      aceita convênio
                    </span>
                  )}
                </div>
                {p.dentistIds.length > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    Dentistas: {p.dentistIds.map(dentistName).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(p)}
                  disabled={pending}
                  className="rounded-md p-2 text-text-muted hover:bg-bg-mist hover:text-text-primary transition-colors min-h-11 min-w-11 inline-flex items-center justify-center text-xs font-semibold"
                >
                  {p.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="rounded-md p-2 text-text-muted hover:bg-bg-mist hover:text-text-primary transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  disabled={pending}
                  className="rounded-md p-2 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!modal}
        onClose={close}
        title={
          modal?.kind === "edit" ? "Editar procedimento" : "Novo procedimento"
        }
      >
        <div className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-md bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <Field label="Nome do procedimento" htmlFor="p-name" required>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Limpeza e profilaxia"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Duração (minutos)" htmlFor="p-duration" required>
              <Input
                id="p-duration"
                type="number"
                min={5}
                max={480}
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
              />
            </Field>
            <Field label="Preço (R$)" htmlFor="p-price" hint="Vazio = gratuito">
              <Input
                id="p-price"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showPrice: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-brand-primary"
              />
              <span className="text-sm text-text-primary">
                Mostrar o preço pro paciente (desmarcado = &quot;sob
                consulta&quot;)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.acceptsInsurance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acceptsInsurance: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-brand-primary"
              />
              <span className="text-sm text-text-primary">
                Aceita convênio
              </span>
            </label>
          </div>

          {dentists.length > 0 && (
            <Field
              label="Quais dentistas fazem este procedimento"
              htmlFor="p-dentists"
              hint="A IA usa isso pra agendar com o dentista certo."
            >
              <div className="space-y-1.5">
                {dentists.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-bg-soft"
                  >
                    <input
                      type="checkbox"
                      checked={form.dentistIds.includes(d.id)}
                      onChange={() => toggleDentist(d.id)}
                      className="h-4 w-4 rounded accent-brand-primary"
                    />
                    <span className="text-sm text-text-primary">
                      {d.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      · {d.specialty}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={close} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending
                ? "Salvando..."
                : modal?.kind === "edit"
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
