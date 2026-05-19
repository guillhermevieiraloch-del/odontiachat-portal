"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  MoreHorizontal,
  Crown,
  Stethoscope,
  Headphones,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn, getInitials } from "@/lib/utils";
import { ROLES } from "@/lib/constants";
import {
  inviteTeamMemberAction,
  cancelInviteAction,
  changeRoleAction,
  removeTeamMemberAction,
} from "@/app/(dashboard)/configuracoes/equipe/actions";
import { useToast } from "@/components/ui/toast";

type Role = "ADMIN" | "ATTENDANT" | "DENTIST";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface Invite {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt?: string;
}

const ROLE_CONFIG: Record<
  Role,
  { label: string; icon: typeof Crown; cls: string }
> = {
  ADMIN: {
    label: "Administrador",
    icon: Crown,
    cls: "bg-brand-accent-soft text-brand-primary border-brand-accent/30",
  },
  DENTIST: {
    label: "Dentista",
    icon: Stethoscope,
    cls: "bg-success/10 text-success border-success/20",
  },
  ATTENDANT: {
    label: "Atendente",
    icon: Headphones,
    cls: "bg-info/10 text-info border-info/20",
  },
};

interface TeamPageProps {
  currentUserId: string;
  members: Member[];
  invites: Invite[];
}

export function TeamPage({ currentUserId, members, invites }: TeamPageProps) {
  const router = useRouter();
  const toast = useToast();
  const [openInvite, setOpenInvite] = useState(false);
  const [, start] = useTransition();

  const sendInvite = async (email: string, role: Role) => {
    const result = await inviteTeamMemberAction({ email, role });
    if (!result.ok) {
      toast.error("Erro ao convidar", result.error);
      return;
    }
    toast.success("Convite enviado", `Convite para ${email} foi criado.`);
    setOpenInvite(false);
    router.refresh();
  };

  const removeMember = (id: string, name: string) => {
    if (!confirm(`Remover ${name} da equipe?`)) return;
    start(async () => {
      const result = await removeTeamMemberAction(id);
      if (!result.ok) {
        toast.error("Erro ao remover", result.error);
        return;
      }
      toast.success("Membro removido");
      router.refresh();
    });
  };

  const removeInvite = (id: string) => {
    start(async () => {
      const result = await cancelInviteAction(id);
      if (!result.ok) {
        toast.error("Erro ao cancelar", result.error);
        return;
      }
      toast.success("Convite cancelado");
      router.refresh();
    });
  };

  const updateRole = (id: string, role: Role) => {
    start(async () => {
      const result = await changeRoleAction({ userId: id, role });
      if (!result.ok) {
        toast.error("Erro ao alterar papel", result.error);
        return;
      }
      toast.success("Papel atualizado");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary">
            Equipe
          </h1>
          <p className="mt-2 text-text-secondary">
            Gerencie os membros da clínica e suas permissões.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setOpenInvite(true)}>
          <UserPlus size={16} />
          Convidar membro
        </Button>
      </header>

      {/* Active members */}
      <section className="rounded-lg border border-border bg-bg-base shadow-sm">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-text-primary">
            Membros ativos ({members.length})
          </h2>
        </header>
        <ul className="divide-y divide-border">
          {members.map((m) => {
            const cfg = ROLE_CONFIG[m.role];
            const RoleIcon = cfg.icon;
            return (
              <li
                key={m.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-bg-soft transition-colors duration-200"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold flex-shrink-0"
                  aria-hidden="true"
                >
                  {getInitials(m.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">{m.email}</p>
                </div>

                <select
                  value={m.role}
                  onChange={(e) => updateRole(m.id, e.target.value as Role)}
                  disabled={
                    m.id === currentUserId ||
                    (m.role === "ADMIN" && members.filter((x) => x.role === "ADMIN").length === 1)
                  }
                  className="h-11 rounded-md border border-border bg-bg-base px-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label={`Função de ${m.name}`}
                  title={
                    m.id === currentUserId
                      ? "Você não pode alterar seu próprio papel"
                      : undefined
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <span
                  className={cn(
                    "hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                    cfg.cls,
                  )}
                >
                  <RoleIcon size={11} />
                  {cfg.label}
                </span>

                <button
                  type="button"
                  onClick={() => removeMember(m.id, m.name)}
                  disabled={
                    m.id === currentUserId ||
                    (m.role === "ADMIN" && members.filter((x) => x.role === "ADMIN").length === 1)
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Remover ${m.name}`}
                  title={
                    m.id === currentUserId
                      ? "Você não pode remover a si mesmo"
                      : m.role === "ADMIN" && members.filter((x) => x.role === "ADMIN").length === 1
                        ? "Você não pode remover o último administrador"
                        : "Remover membro"
                  }
                >
                  <Trash2 size={16} />
                </button>

                {/* Hide on mobile (placeholder for future overflow menu) */}
                <span className="sr-only">
                  <MoreHorizontal />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pending invites */}
      <section className="rounded-lg border border-border bg-bg-base shadow-sm">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-text-primary">
            Convites pendentes ({invites.length})
          </h2>
        </header>
        {invites.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-text-secondary">
              Nenhum convite pendente.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((inv) => {
              const cfg = ROLE_CONFIG[inv.role];
              const RoleIcon = cfg.icon;
              return (
                <li
                  key={inv.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-bg-soft transition-colors duration-200"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-mist text-text-muted flex-shrink-0"
                    aria-hidden="true"
                  >
                    <Mail size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {inv.email}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 inline-flex items-center gap-1">
                      <Clock size={11} />
                      Enviado em {new Date(inv.sentAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                      cfg.cls,
                    )}
                  >
                    <RoleIcon size={11} />
                    {cfg.label}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider">
                    Aguardando
                  </span>

                  <button
                    type="button"
                    onClick={() => removeInvite(inv.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-colors duration-200"
                    aria-label={`Cancelar convite para ${inv.email}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Permission matrix */}
      <section className="rounded-lg border border-border bg-bg-base shadow-sm">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-bold text-text-primary">
            O que cada função pode fazer
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-mist border-b border-border">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Permissão
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Admin
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Dentista
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Atendente
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Ver dashboard e métricas", true, true, true],
                ["Responder conversas", true, false, true],
                ["Configurar IA", true, false, false],
                ["Editar agendamentos", true, true, true],
                ["Gerenciar pacientes", true, true, true],
                ["Editar dados da clínica", true, false, false],
                ["Gerenciar equipe", true, false, false],
                ["Acessar faturamento", true, false, false],
              ].map(([label, ...allowed], i) => (
                <tr key={i}>
                  <td className="px-5 py-3 text-text-primary">{label as string}</td>
                  {allowed.map((ok, j) => (
                    <td key={j} className="px-3 py-3 text-center">
                      {ok ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                          ✓
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InviteModal
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        onInvite={sendInvite}
      />
    </div>
  );
}

function InviteModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ATTENDANT");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    try {
      await onInvite(email.trim(), role);
      setEmail("");
      setRole("ATTENDANT");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convidar novo membro"
      description="Envie um convite por e-mail. O membro define a senha quando aceitar."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="md" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="invite-form"
            disabled={!email.trim() || pending}
          >
            <Mail size={14} />
            {pending ? "Enviando..." : "Enviar convite"}
          </Button>
        </>
      }
    >
      <form id="invite-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-mail" htmlFor="invite-email" required>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colaborador@email.com"
            required
            autoComplete="email"
          />
        </Field>

        <Field label="Função" htmlFor="invite-role" required>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="h-12 w-full rounded-md border border-border bg-bg-base px-4 text-base text-text-primary focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/20 transition-colors duration-200"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}
