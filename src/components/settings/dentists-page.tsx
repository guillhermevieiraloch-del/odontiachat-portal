"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Stethoscope, Pencil, Trash2, BadgeCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn, getInitials } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  createDentistAction,
  updateDentistAction,
  deleteDentistAction,
  toggleDentistActiveAction,
  type DentistInput,
} from "@/app/(dashboard)/configuracoes/dentistas/actions";

export interface DentistRow {
  id: string;
  name: string;
  specialty: string;
  cro: string;
  email: string;
  phone: string;
  bio: string;
  userId: string;
  active: boolean;
  createdAt: string;
}

export interface EligibleUser {
  id: string;
  name: string;
  email: string;
}

const EMPTY: DentistInput = {
  name: "",
  specialty: "",
  cro: "",
  email: "",
  phone: "",
  bio: "",
  userId: "",
};

export function DentistsPage({
  dentists,
  eligibleUsers,
}: {
  dentists: DentistRow[];
  eligibleUsers: EligibleUser[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [modal, setModal] = useState<
    | { kind: "create" }
    | { kind: "edit"; id: string }
    | null
  >(null);
  const [form, setForm] = useState<DentistInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setForm(EMPTY);
    setError(null);
    setModal({ kind: "create" });
  };

  const openEdit = (d: DentistRow) => {
    setForm({
      name: d.name,
      specialty: d.specialty,
      cro: d.cro,
      email: d.email,
      phone: d.phone,
      bio: d.bio,
      userId: d.userId,
    });
    setError(null);
    setModal({ kind: "edit", id: d.id });
  };

  const close = () => {
    setModal(null);
    setForm(EMPTY);
    setError(null);
  };

  const handleSubmit = () => {
    if (!modal) return;
    start(async () => {
      setError(null);
      const result =
        modal.kind === "create"
          ? await createDentistAction(form)
          : await updateDentistAction(modal.id, form);
      if (!result.ok) {
        setError(result.error ?? "Erro");
        return;
      }
      toast.success(
        modal.kind === "create" ? "Dentista adicionado" : "Dentista atualizado",
      );
      close();
      router.refresh();
    });
  };

  const handleToggleActive = (d: DentistRow) => {
    start(async () => {
      const result = await toggleDentistActiveAction(d.id, !d.active);
      if (!result.ok) {
        toast.error(result.error ?? "Erro");
        return;
      }
      toast.success(d.active ? "Dentista pausado" : "Dentista reativado");
      router.refresh();
    });
  };

  const handleDelete = (d: DentistRow) => {
    if (!confirm(`Remover ${d.name} permanentemente?`)) return;
    start(async () => {
      const result = await deleteDentistAction(d.id);
      if (!result.ok) {
        toast.error(result.error ?? "Erro ao remover");
        return;
      }
      toast.success("Dentista removido");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
            Dentistas
          </h1>
          <p className="mt-2 text-text-secondary max-w-2xl">
            Os profissionais que atendem na clínica. A IA usa essa lista pra
            sugerir o dentista certo quando paciente pede especialidade
            específica.
          </p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={16} />
          Adicionar dentista
        </Button>
      </header>

      {dentists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg-soft px-8 py-16 text-center">
          <Stethoscope size={32} className="mx-auto text-text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">
            Nenhum dentista cadastrado ainda
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Cadastre os profissionais que atendem na clínica pra que a IA consiga
            agendar pacientes com o dentista certo.
          </p>
          <Button onClick={openCreate} size="md" className="mt-6">
            <Plus size={16} />
            Adicionar primeiro dentista
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {dentists.map((d) => (
            <li
              key={d.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border border-border bg-bg-base p-4 transition-colors",
                !d.active && "opacity-60",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary font-semibold text-sm flex-shrink-0">
                {getInitials(d.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-text-primary truncate">
                    {d.name}
                  </p>
                  {d.userId && (
                    <span
                      title="Tem login no portal"
                      className="inline-flex items-center gap-1 text-xs text-success"
                    >
                      <UserCheck size={12} />
                      Com login
                    </span>
                  )}
                  {!d.active && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Pausado
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-text-secondary flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck size={13} className="text-brand-primary" />
                    {d.specialty}
                  </span>
                  {d.cro && <span className="text-text-muted">· CRO {d.cro}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(d)}
                  disabled={pending}
                  className="rounded-md p-2 text-text-muted hover:bg-bg-mist hover:text-text-primary transition-colors min-h-11 min-w-11 inline-flex items-center justify-center text-xs font-semibold"
                  title={d.active ? "Pausar" : "Reativar"}
                >
                  {d.active ? "Pausar" : "Ativar"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(d)}
                  className="rounded-md p-2 text-text-muted hover:bg-bg-mist hover:text-text-primary transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d)}
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
        title={modal?.kind === "edit" ? "Editar dentista" : "Adicionar dentista"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo" htmlFor="d-name" required>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Dr. João Silva"
              />
            </Field>
            <Field label="Especialidade" htmlFor="d-specialty" required>
              <Input
                id="d-specialty"
                value={form.specialty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, specialty: e.target.value }))
                }
                placeholder="Ortodontia"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CRO" htmlFor="d-cro" hint="Registro profissional">
              <Input
                id="d-cro"
                value={form.cro ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, cro: e.target.value }))}
                placeholder="CRO-SP 12345"
              />
            </Field>
            <Field label="E-mail" htmlFor="d-email">
              <Input
                id="d-email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="joao@clinica.com"
              />
            </Field>
          </div>

          <Field label="Telefone" htmlFor="d-phone">
            <Input
              id="d-phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </Field>

          <Field
            label="Bio"
            htmlFor="d-bio"
            hint="Texto curto que a IA pode citar (formação, anos de experiência, etc.)"
          >
            <textarea
              id="d-bio"
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none"
              placeholder="Especialista em ortodontia há 10 anos, formado pela USP..."
            />
          </Field>

          {eligibleUsers.length > 0 && (
            <Field
              label="Vincular a um usuário do portal"
              htmlFor="d-userId"
              hint="Opcional. Se esse dentista também acessa o portal."
            >
              <select
                id="d-userId"
                value={form.userId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, userId: e.target.value }))
                }
                className="w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              >
                <option value="">— Sem vínculo —</option>
                {eligibleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
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
                  ? "Salvar alterações"
                  : "Adicionar dentista"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
