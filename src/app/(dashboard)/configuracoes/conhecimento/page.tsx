import { requireUser } from "@/lib/auth";
import { loadKnowledgeFormInitial } from "@/lib/queries/knowledge";
import { KnowledgeForm } from "@/components/knowledge/knowledge-form";

export const dynamic = "force-dynamic";

export default async function ConhecimentoPage() {
  const { clinic } = await requireUser();
  const initial = await loadKnowledgeFormInitial(clinic.id);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary tracking-tight">
          Base de conhecimento
        </h1>
        <p className="mt-2 text-text-secondary">
          Informações que a IA usa para responder seus pacientes com precisão.
          Mantenha atualizado sempre que algo mudar na clínica.
        </p>
      </header>

      <KnowledgeForm initial={initial} mode="edit" />
    </div>
  );
}
