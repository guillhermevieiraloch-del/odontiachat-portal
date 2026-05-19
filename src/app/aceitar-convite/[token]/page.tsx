import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ArrowRight, AlertCircle, Building2, UserCircle, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Logo } from "@/components/brand/logo";
import { AcceptInviteForm } from "./accept-form";

export const dynamic = "force-dynamic";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  ATTENDANT: "Atendente",
  DENTIST: "Dentista",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { clinic: { select: { name: true } } },
  });

  if (!invite) return <ErrorShell message="Convite inválido ou não encontrado." />;
  if (invite.acceptedAt) return <ErrorShell message="Este convite já foi aceito." />;
  if (invite.expiresAt < new Date()) return <ErrorShell message="Este convite expirou. Peça um novo." />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → bounce to signup with prefilled email and the invite token
  if (!user) {
    const params = new URLSearchParams({
      email: invite.email,
      invite: token,
    });
    redirect(`/signup?${params.toString()}`);
  }

  // Logged in with different email
  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <ErrorShell
        message={`Esse convite foi enviado pra ${invite.email}, mas você está logado como ${user.email}. Saia da conta e entre com o e-mail correto.`}
      />
    );
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <Logo size="md" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-border bg-bg-base shadow-lg p-8 animate-scale-in">
          <div className="flex items-center justify-center mb-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-accent-dark)_100%)] shadow-[0_6px_20px_-4px_rgba(13,59,102,0.5)]">
              <Sparkles size={26} />
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary text-center tracking-tight">
            Aceitar convite
          </h1>

          <p className="mt-2 text-text-secondary text-center text-sm">
            Você foi convidado(a) pra fazer parte do time.
          </p>

          <div className="mt-6 space-y-3">
            <InfoRow icon={Building2} label="Clínica" value={invite.clinic.name} />
            <InfoRow icon={UserCircle} label="Papel" value={ROLE_LABELS[invite.role]} />
          </div>

          <AcceptInviteForm token={token} defaultName={user.user_metadata?.name ?? ""} />

          <Link
            href="/dashboard"
            className="mt-4 block text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Não foi você? Recusar e voltar
          </Link>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-soft px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
        <Icon size={16} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className="font-semibold text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <Logo size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-danger/30 bg-bg-base shadow-lg p-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
            <AlertCircle size={26} />
          </span>
          <h1 className="text-xl font-display font-bold text-text-primary">
            Convite indisponível
          </h1>
          <p className="mt-2 text-sm text-text-secondary">{message}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
          >
            Voltar pro login <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
