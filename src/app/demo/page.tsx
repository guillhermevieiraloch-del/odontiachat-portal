import Link from "next/link";
import { Sparkles, MessageCircle } from "lucide-react";
import { DemoChat } from "@/components/demo/demo-chat";

export const dynamic = "force-static";

export const metadata = {
  title: "Experimente a IA — OdontIAChat",
  description:
    "Converse com uma versão demonstrativa da IA que atende pacientes em clínicas odontológicas. Sem cadastro.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <header className="text-center mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-accent-dark">
            Demonstração ao vivo
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-display font-extrabold text-text-primary tracking-tight">
            Converse com a <span className="gradient-text">IA da Clínica Demo</span>
          </h1>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
            Faça de conta que você é um paciente. Pergunte sobre procedimentos,
            preços, horários, agendamento — veja como a IA responde com a voz
            da clínica. <strong>Sem cadastro, sem WhatsApp real.</strong>
          </p>
        </header>

        <DemoChat />

        <section className="mt-10 rounded-2xl border border-border bg-bg-base p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent-soft text-brand-primary">
              <Sparkles size={24} />
            </div>
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary">
            Curtiu? Conecta no WhatsApp da sua clínica
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Em 14 dias de teste grátis, a IA aprende sobre sua clínica, conecta
            no Google Calendar e começa a agendar pacientes automaticamente.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 h-12 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
            >
              Começar teste grátis
            </Link>
            <Link
              href="/precos"
              className="inline-flex items-center justify-center px-5 h-12 rounded-md border border-border bg-bg-base text-text-primary font-semibold hover:bg-bg-mist transition-colors"
            >
              Ver planos
            </Link>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-text-muted">
          <p className="flex items-center justify-center gap-1.5">
            <MessageCircle size={12} />
            Conversas no demo não são salvas. Cada visita começa do zero.
          </p>
        </footer>
      </div>
    </div>
  );
}
