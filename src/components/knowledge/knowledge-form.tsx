"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  Baby,
  XCircle,
  ClipboardList,
  Award,
  Sparkles,
  Ban,
  HelpCircle,
  StickyNote,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  saveClinicKnowledgeAction,
  skipKnowledgeSetup,
  type KnowledgeInput,
} from "@/app/(dashboard)/configuracoes/conhecimento/actions";

type FaqItem = { question: string; answer: string };

export interface KnowledgeFormInitial {
  addressReferences: string;
  parkingInfo: string;
  accessibilityInfo: string;
  publicTransportInfo: string;
  acceptsChildren: boolean;
  childrenMinAge: string;
  emergencyInfo: string;
  averageWaitTime: string;
  languagesSpoken: string[];
  cancellationPolicy: string;
  latenessPolicy: string;
  noShowPolicy: string;
  firstVisitInfo: string;
  firstVisitDuration: string;
  yearsInBusiness: number | null;
  differentiators: string;
  teamDescription: string;
  notOfferedProcedures: string;
  partnerReferrals: string;
  faqs: FaqItem[];
  additionalNotes: string;
}

interface Props {
  initial: KnowledgeFormInitial;
  /** When true, shows "first-time setup" framing + redirects after save */
  mode: "setup" | "edit";
}

const COMMON_LANGUAGES = ["Português", "Inglês", "Espanhol", "Libras"];

export function KnowledgeForm({ initial, mode }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<KnowledgeFormInitial>(initial);
  const [pending, start] = useTransition();
  const [skipping, startSkip] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  const filledCount = useMemo(() => {
    let n = 0;
    const textFields: (keyof KnowledgeFormInitial)[] = [
      "addressReferences", "parkingInfo", "accessibilityInfo", "publicTransportInfo",
      "childrenMinAge", "emergencyInfo", "averageWaitTime",
      "cancellationPolicy", "latenessPolicy", "noShowPolicy",
      "firstVisitInfo", "firstVisitDuration",
      "differentiators", "teamDescription",
      "notOfferedProcedures", "partnerReferrals",
      "additionalNotes",
    ];
    for (const f of textFields) {
      const v = state[f];
      if (typeof v === "string" && v.trim().length > 0) n++;
    }
    if (state.languagesSpoken.length > 0) n++;
    if (state.faqs.length > 0) n++;
    if (state.yearsInBusiness && state.yearsInBusiness > 0) n++;
    return n;
  }, [state]);

  const update = <K extends keyof KnowledgeFormInitial>(k: K, v: KnowledgeFormInitial[K]) => {
    setState((s) => ({ ...s, [k]: v }));
    setJustSaved(false);
  };

  const toggleLanguage = (lang: string) => {
    setState((s) => ({
      ...s,
      languagesSpoken: s.languagesSpoken.includes(lang)
        ? s.languagesSpoken.filter((l) => l !== lang)
        : [...s.languagesSpoken, lang],
    }));
    setJustSaved(false);
  };

  const addFaq = () =>
    setState((s) => ({ ...s, faqs: [...s.faqs, { question: "", answer: "" }] }));

  const updateFaq = (idx: number, key: "question" | "answer", value: string) =>
    setState((s) => ({
      ...s,
      faqs: s.faqs.map((f, i) => (i === idx ? { ...f, [key]: value } : f)),
    }));

  const removeFaq = (idx: number) =>
    setState((s) => ({ ...s, faqs: s.faqs.filter((_, i) => i !== idx) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const payload: KnowledgeInput = {
        addressReferences: state.addressReferences || undefined,
        parkingInfo: state.parkingInfo || undefined,
        accessibilityInfo: state.accessibilityInfo || undefined,
        publicTransportInfo: state.publicTransportInfo || undefined,
        acceptsChildren: state.acceptsChildren,
        childrenMinAge: state.childrenMinAge || undefined,
        emergencyInfo: state.emergencyInfo || undefined,
        averageWaitTime: state.averageWaitTime || undefined,
        languagesSpoken: state.languagesSpoken,
        cancellationPolicy: state.cancellationPolicy || undefined,
        latenessPolicy: state.latenessPolicy || undefined,
        noShowPolicy: state.noShowPolicy || undefined,
        firstVisitInfo: state.firstVisitInfo || undefined,
        firstVisitDuration: state.firstVisitDuration || undefined,
        yearsInBusiness: state.yearsInBusiness ?? null,
        differentiators: state.differentiators || undefined,
        teamDescription: state.teamDescription || undefined,
        notOfferedProcedures: state.notOfferedProcedures || undefined,
        partnerReferrals: state.partnerReferrals || undefined,
        faqs: state.faqs.filter((f) => f.question.trim() && f.answer.trim()),
        additionalNotes: state.additionalNotes || undefined,
      };

      const result = await saveClinicKnowledgeAction(payload);
      if (!result.ok) {
        toast.error("Erro ao salvar", result.error);
        return;
      }
      setJustSaved(true);
      toast.success("Informações salvas", "A IA já está usando essas respostas.");
      if (mode === "setup" && filledCount >= 5) {
        router.push("/dashboard");
      } else {
        router.refresh();
      }
    });
  };

  const canFinishSetup = filledCount >= 5;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-32">
      {mode === "setup" && (
        <div className="rounded-2xl border border-brand-accent/30 bg-brand-accent-soft/40 p-5 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-primary)_0%,var(--brand-accent-dark)_100%)] text-white flex-shrink-0">
              <Sparkles size={18} />
            </span>
            <div className="flex-1">
              <h2 className="font-display font-bold text-text-primary">
                Conta pra IA tudo sobre a sua clínica
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Quanto mais detalhes você der aqui, melhor a IA responde seus pacientes
                — sem inventar e sem precisar te chamar pra cada dúvida. Mínimo de
                <strong> 5 campos </strong> pra concluir.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-bg-base overflow-hidden">
                  <div
                    className="h-full bg-[linear-gradient(90deg,var(--brand-primary-light)_0%,var(--brand-accent)_100%)] transition-all duration-700 ease-out-soft"
                    style={{ width: `${Math.min((filledCount / 5) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-brand-primary tabular-nums">
                  {filledCount}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Localização e logística */}
      <Section icon={MapPin} title="Localização e logística">
        <Field label="Referências do endereço" htmlFor="addressReferences" hint="Ex: 'Próximo ao Shopping X, em frente à farmácia Y'">
          <Textarea id="addressReferences" value={state.addressReferences} onChange={(v) => update("addressReferences", v)} placeholder="Como o paciente identifica a clínica..." />
        </Field>
        <Field label="Estacionamento" htmlFor="parkingInfo" hint="Tem? É gratuito? Quantas vagas?">
          <Textarea id="parkingInfo" value={state.parkingInfo} onChange={(v) => update("parkingInfo", v)} placeholder="Ex: Temos estacionamento gratuito no local com 10 vagas." />
        </Field>
        <Field label="Acessibilidade" htmlFor="accessibilityInfo" hint="Rampa, banheiro adaptado, elevador, etc.">
          <Textarea id="accessibilityInfo" value={state.accessibilityInfo} onChange={(v) => update("accessibilityInfo", v)} placeholder="Ex: Clínica 100% acessível. Rampa de acesso, banheiro adaptado e cadeira odontológica adaptável." />
        </Field>
        <Field label="Transporte público próximo" htmlFor="publicTransportInfo" hint="Metrô, ônibus, etc.">
          <Textarea id="publicTransportInfo" value={state.publicTransportInfo} onChange={(v) => update("publicTransportInfo", v)} placeholder="Ex: A 5 min a pé da estação X. Ônibus 123 e 456 param na porta." />
        </Field>
      </Section>

      {/* Atendimento */}
      <Section icon={Users} title="Atendimento">
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-bg-soft">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
              <Baby size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Atendemos crianças</p>
              <p className="text-xs text-text-secondary">A IA vai dizer se a clínica é pediátrica ou não</p>
            </div>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.acceptsChildren}
              onChange={(e) => update("acceptsChildren", e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-bg-mist rounded-full peer peer-checked:bg-brand-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>
        {state.acceptsChildren && (
          <Field label="Idade mínima" htmlFor="childrenMinAge" hint="A partir de qual idade aceitam crianças?">
            <Input id="childrenMinAge" value={state.childrenMinAge} onChange={(e) => update("childrenMinAge", e.target.value)} placeholder="Ex: A partir de 3 anos" />
          </Field>
        )}
        <Field label="Emergências" htmlFor="emergencyInfo" hint="Atende dor/emergência? Em que horário?">
          <Textarea id="emergencyInfo" value={state.emergencyInfo} onChange={(v) => update("emergencyInfo", v)} placeholder="Ex: Em casos de dor forte, atendemos com encaixe no mesmo dia entre 8h e 18h." />
        </Field>
        <Field label="Tempo médio de espera" htmlFor="averageWaitTime" hint="Quanto tempo o paciente espera após chegar?">
          <Input id="averageWaitTime" value={state.averageWaitTime} onChange={(e) => update("averageWaitTime", e.target.value)} placeholder="Ex: Cerca de 10 minutos" />
        </Field>
        <Field label="Idiomas atendidos" htmlFor="languages" hint="Marque os idiomas que a equipe atende">
          <div className="flex flex-wrap gap-2 mt-1">
            {COMMON_LANGUAGES.map((lang) => {
              const active = state.languagesSpoken.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`inline-flex items-center px-3 min-h-10 rounded-md border text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                      : "bg-bg-base text-text-secondary border-border hover:border-brand-accent"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* Políticas */}
      <Section icon={XCircle} title="Políticas da clínica">
        <Field label="Cancelamento" htmlFor="cancellationPolicy" hint="Com quanto tempo de antecedência o paciente pode cancelar?">
          <Textarea id="cancellationPolicy" value={state.cancellationPolicy} onChange={(v) => update("cancellationPolicy", v)} placeholder="Ex: Cancelamentos com até 4 horas de antecedência sem multa." />
        </Field>
        <Field label="Atraso" htmlFor="latenessPolicy" hint="Até quantos minutos atrasado a clínica ainda atende?">
          <Textarea id="latenessPolicy" value={state.latenessPolicy} onChange={(v) => update("latenessPolicy", v)} placeholder="Ex: Atendemos com até 15 minutos de atraso. Acima disso, é necessário reagendar." />
        </Field>
        <Field label="Falta sem aviso (no-show)" htmlFor="noShowPolicy" hint="Como a clínica lida com faltas sem aviso?">
          <Textarea id="noShowPolicy" value={state.noShowPolicy} onChange={(v) => update("noShowPolicy", v)} placeholder="Ex: Na primeira falta apenas reagendamos. Na segunda, pedimos pagamento de uma taxa pra remarcar." />
        </Field>
      </Section>

      {/* Primeira consulta */}
      <Section icon={ClipboardList} title="Primeira consulta">
        <Field label="O que levar na primeira consulta?" htmlFor="firstVisitInfo" hint="Documentos, exames, etc.">
          <Textarea id="firstVisitInfo" value={state.firstVisitInfo} onChange={(v) => update("firstVisitInfo", v)} placeholder="Ex: RG e cartão do convênio (se houver). Radiografias recentes ajudam." />
        </Field>
        <Field label="Duração média da primeira consulta" htmlFor="firstVisitDuration">
          <Input id="firstVisitDuration" value={state.firstVisitDuration} onChange={(e) => update("firstVisitDuration", e.target.value)} placeholder="Ex: 45 minutos" />
        </Field>
      </Section>

      {/* Equipe e diferenciais */}
      <Section icon={Award} title="Equipe e diferenciais">
        <Field label="Anos de mercado" htmlFor="yearsInBusiness">
          <Input
            id="yearsInBusiness"
            type="number"
            min={0}
            value={state.yearsInBusiness ?? ""}
            onChange={(e) => update("yearsInBusiness", e.target.value ? Number(e.target.value) : null)}
            placeholder="Ex: 12"
          />
        </Field>
        <Field label="Diferenciais da clínica" htmlFor="differentiators" hint="Equipamentos modernos, especialidades raras, etc.">
          <Textarea id="differentiators" value={state.differentiators} onChange={(v) => update("differentiators", v)} placeholder="Ex: Único da região com microscopia para endodontia. Atendimento humanizado focado em pacientes com ansiedade." />
        </Field>
        <Field label="Sobre a equipe" htmlFor="teamDescription" hint="Descreva o time sem expor dados pessoais sensíveis">
          <Textarea id="teamDescription" value={state.teamDescription} onChange={(v) => update("teamDescription", v)} placeholder="Ex: Equipe formada por 4 dentistas especialistas em ortodontia, endodontia, estética e clínica geral." />
        </Field>
      </Section>

      {/* O que NÃO oferece */}
      <Section icon={Ban} title="O que a clínica NÃO faz">
        <Field label="Procedimentos não oferecidos" htmlFor="notOfferedProcedures" hint="Pra IA dizer 'não fazemos X aqui' em vez de inventar">
          <Textarea id="notOfferedProcedures" value={state.notOfferedProcedures} onChange={(v) => update("notOfferedProcedures", v)} placeholder="Ex: Não realizamos cirurgia bucomaxilofacial nem ortognática. Não atendemos pelo SUS." />
        </Field>
        <Field label="Pra onde indicamos quando não fazemos?" htmlFor="partnerReferrals">
          <Textarea id="partnerReferrals" value={state.partnerReferrals} onChange={(v) => update("partnerReferrals", v)} placeholder="Ex: Para casos cirúrgicos complexos, indicamos a Clínica Z (parceira)." />
        </Field>
      </Section>

      {/* FAQs */}
      <Section icon={HelpCircle} title="Perguntas frequentes (FAQ)">
        <p className="text-sm text-text-secondary -mt-2">
          Cadastre perguntas que pacientes fazem com frequência e a resposta padrão.
        </p>
        <div className="space-y-3">
          {state.faqs.map((f, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2 bg-bg-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  FAQ {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                  aria-label="Remover pergunta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Input
                placeholder="Pergunta (ex: 'Vocês fazem clareamento dentário em casa?')"
                value={f.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
              />
              <textarea
                placeholder="Resposta padrão"
                value={f.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/22 transition-all duration-200 resize-y"
              />
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addFaq}>
          <Plus size={14} />
          Adicionar pergunta
        </Button>
      </Section>

      {/* Notas livres */}
      <Section icon={StickyNote} title="Outras observações">
        <Field label="Qualquer outra informação relevante" htmlFor="additionalNotes" hint="Tudo que você acha que a IA deveria saber pra responder seus pacientes melhor">
          <Textarea id="additionalNotes" value={state.additionalNotes} onChange={(v) => update("additionalNotes", v)} rows={5} placeholder="Ex: A clínica tem TV nas salas de espera. Café e água disponíveis. Wi-fi grátis. Pets de assistência são bem-vindos." />
        </Field>
      </Section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t border-border bg-bg-base/95 backdrop-blur shadow-[0_-4px_20px_rgba(13,59,102,0.08)]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-sm">
            {mode === "setup" ? (
              <span className="font-semibold text-text-primary">
                {canFinishSetup ? (
                  <>
                    <span className="text-success">✓ Pronto pra concluir</span>
                    {" — "}
                    <span className="text-text-secondary">você pode salvar e continuar</span>
                  </>
                ) : (
                  <span className="text-text-secondary">
                    Preencha pelo menos <strong className="text-text-primary">{5 - filledCount}</strong> {5 - filledCount === 1 ? "campo a mais" : "campos a mais"} pra concluir
                  </span>
                )}
              </span>
            ) : justSaved ? (
              <span className="text-success font-semibold">✓ Alterações salvas</span>
            ) : (
              <span className="text-text-secondary">
                Quanto mais detalhes, melhor a IA atende.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mode === "setup" && (
              <button
                type="button"
                onClick={() => startSkip(() => skipKnowledgeSetup())}
                disabled={pending || skipping}
                title="Você pode preencher isso depois em Configurações → Conhecimento. Sem isso, a IA responde de forma mais genérica."
                className="text-sm font-semibold text-text-muted hover:text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {skipping ? "Pulando..." : "Configurar depois"}
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={pending || skipping || (mode === "setup" && !canFinishSetup)}
            >
              {pending ? "Salvando..." : mode === "setup" ? "Concluir e ir pro dashboard" : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ---------- helpers ----------

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg-base shadow-card">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-primary">
          <Icon size={16} />
        </span>
        <h3 className="font-display font-bold text-text-primary">{title}</h3>
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-muted shadow-xs focus:outline-none focus:border-brand-accent focus:ring-[3px] focus:ring-brand-accent/22 transition-all duration-200 ease-out-soft resize-y"
    />
  );
}
