import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { loadKnowledgeFormInitial } from "@/lib/queries/knowledge";
import { KnowledgeForm } from "@/components/knowledge/knowledge-form";

export const dynamic = "force-dynamic";

export default async function SetupConhecimentoPage() {
  const { clinic } = await requireUser();

  // Se já está completo, manda pro dashboard
  if (clinic.knowledgeCompletedAt) {
    redirect("/dashboard");
  }

  const initial = await loadKnowledgeFormInitial(clinic.id);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-accent-dark">
          Último passo antes de começar
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
          Treine a <span className="gradient-text">sua IA</span>
        </h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Pra IA responder seus pacientes com a voz da sua clínica (e não como uma IA
          genérica), ela precisa saber tudo que um atendente humano saberia. Isso é
          o que separa um bot que parece humano de um bot que parece, bem, um bot.
        </p>
      </header>

      <KnowledgeForm initial={initial} mode="setup" />
    </div>
  );
}
