import Link from "next/link";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS, formatPriceBRL, type PlanConfig } from "@/lib/plans";

export const dynamic = "force-static";

interface FeatureRow {
  label: string;
  values: (string | boolean)[];
}

const VISIBLE_PLANS: PlanConfig[] = [
  PLANS.solo,
  PLANS.clinica,
  PLANS.pro,
  PLANS.enterprise,
];

function limitText(n: number): string {
  if (n === Infinity) return "Ilimitado";
  return n.toLocaleString("pt-BR");
}

function dentistsText(n: number): string {
  if (n === Infinity) return "Ilimitado";
  return n === 1 ? "1 dentista" : `Até ${n} dentistas`;
}

function teamText(n: number): string {
  if (n === Infinity) return "Ilimitado";
  return n === 1 ? "1 acesso" : `Até ${n} acessos`;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    label: "Mensagens/mês",
    values: VISIBLE_PLANS.map((p) => limitText(p.monthlyMessageLimit)),
  },
  {
    label: "Dentistas cadastrados",
    values: VISIBLE_PLANS.map((p) => dentistsText(p.maxDentists)),
  },
  {
    label: "Acessos no portal",
    values: VISIBLE_PLANS.map((p) => teamText(p.maxTeamMembers)),
  },
  {
    label: "Linhas de WhatsApp",
    values: VISIBLE_PLANS.map((p) =>
      p.maxWhatsappLines === Infinity ? "Múltiplas" : `${p.maxWhatsappLines}`,
    ),
  },
  {
    label: "Agendamento automático via IA",
    values: VISIBLE_PLANS.map(() => true),
  },
  { label: "Google Calendar integrado", values: VISIBLE_PLANS.map(() => true) },
  {
    label: "Lembretes 24h antes da consulta",
    values: VISIBLE_PLANS.map(() => true),
  },
  {
    label: "Conhecimento custom da clínica (treinar IA)",
    values: VISIBLE_PLANS.map(() => true),
  },
  {
    label: "Cadastro de procedimentos e convênios",
    values: VISIBLE_PLANS.map(() => true),
  },
  { label: "Dashboard de uso", values: VISIBLE_PLANS.map(() => true) },
  { label: "Inbox de conversas", values: VISIBLE_PLANS.map(() => true) },
  {
    label: "Analytics avançado (conversão, ROI)",
    values: VISIBLE_PLANS.map((p) => p.features.advancedAnalytics),
  },
  {
    label: "Exportação de dados (CSV)",
    values: VISIBLE_PLANS.map((p) => p.features.csvExport),
  },
  {
    label: "Onboarding assistido (call 1h)",
    values: VISIBLE_PLANS.map((p) => p.features.assistedOnboarding),
  },
  {
    label: "Multi-unidade (várias clínicas)",
    values: VISIBLE_PLANS.map((p) => p.features.multiUnit),
  },
  {
    label: "API pública",
    values: VISIBLE_PLANS.map((p) => p.features.publicApi),
  },
  {
    label: "White-label (marca própria)",
    values: VISIBLE_PLANS.map((p) => p.features.whiteLabel),
  },
];

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-bg-soft py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-accent-dark">
            Preços simples e justos
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-display font-extrabold text-text-primary tracking-tight">
            Escolha o plano que <span className="gradient-text">cabe na sua clínica</span>
          </h1>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
            Todos os planos incluem 14 dias de teste grátis. Sem cartão pra
            começar. Cancele quando quiser.
          </p>
        </header>

        {/* Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-16">
          {VISIBLE_PLANS.map((p) => {
            const isFeatured = p.id === "clinica";
            return (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-2xl border bg-bg-base p-6 flex flex-col",
                  isFeatured
                    ? "border-brand-primary shadow-lg ring-2 ring-brand-primary/20"
                    : "border-border",
                )}
              >
                {isFeatured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-primary text-white text-xs font-bold uppercase tracking-wider">
                    Mais popular
                  </span>
                )}
                <h2 className="font-display font-bold text-xl text-text-primary">
                  {p.label}
                </h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl text-text-primary">
                    {formatPriceBRL(p.priceCents)}
                  </span>
                  {p.priceCents > 0 && (
                    <span className="text-sm text-text-muted">/mês</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {p.id === "solo" &&
                    "Dentista autônomo ou consultório pequeno."}
                  {p.id === "clinica" && "Clínica com 2-5 dentistas. ★"}
                  {p.id === "pro" &&
                    "Clínica em expansão com volume alto."}
                  {p.id === "enterprise" &&
                    "Rede com múltiplas unidades e necessidades específicas."}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-text-secondary flex-1">
                  <li className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="text-success flex-shrink-0 mt-0.5"
                    />
                    <span>
                      <strong className="text-text-primary tabular-nums">
                        {limitText(p.monthlyMessageLimit)}
                      </strong>{" "}
                      mensagens/mês
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="text-success flex-shrink-0 mt-0.5"
                    />
                    <span>{dentistsText(p.maxDentists)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="text-success flex-shrink-0 mt-0.5"
                    />
                    <span>{teamText(p.maxTeamMembers)} no portal</span>
                  </li>
                  {p.features.advancedAnalytics && (
                    <li className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span>Analytics avançado</span>
                    </li>
                  )}
                  {p.features.csvExport && (
                    <li className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span>Exportação CSV</span>
                    </li>
                  )}
                  {p.features.multiUnit && (
                    <li className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span>Multi-unidade</span>
                    </li>
                  )}
                  {p.features.publicApi && (
                    <li className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span>API pública</span>
                    </li>
                  )}
                  {p.features.whiteLabel && (
                    <li className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span>White-label</span>
                    </li>
                  )}
                </ul>
                <Link
                  href={p.id === "enterprise" ? "mailto:contato@odontiachat.com.br" : "/signup"}
                  className={cn(
                    "mt-6 inline-flex items-center justify-center px-4 h-12 rounded-md font-semibold transition-colors",
                    isFeatured
                      ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                      : "bg-bg-mist text-text-primary hover:bg-bg-soft border border-border",
                  )}
                >
                  {p.id === "enterprise" ? "Falar com vendas" : "Começar trial"}
                </Link>
                {p.checkoutUrl && (
                  <a
                    href={p.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-center text-xs font-semibold text-brand-primary hover:underline"
                  >
                    ou assinar agora →
                  </a>
                )}
              </div>
            );
          })}
        </section>

        {/* Comparação completa */}
        <section>
          <h2 className="font-display font-bold text-2xl text-text-primary mb-6">
            Comparação completa
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border bg-bg-base">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-soft border-b border-border">
                  <th className="text-left font-semibold text-text-primary px-4 py-3">
                    Recurso
                  </th>
                  {VISIBLE_PLANS.map((p) => (
                    <th
                      key={p.id}
                      className="text-center font-semibold text-text-primary px-4 py-3"
                    >
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      idx % 2 === 1 && "bg-bg-soft/30",
                    )}
                  >
                    <td className="px-4 py-3 text-text-secondary">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check
                              size={18}
                              className="inline text-success"
                            />
                          ) : (
                            <X size={18} className="inline text-text-muted" />
                          )
                        ) : (
                          <span className="text-text-primary font-medium">
                            {v}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-text-muted">
          <p>
            Mensagem excedente: <strong>R$ 0,15/msg</strong>. WhatsApp extra: <strong>+R$ 197/mês</strong>.
          </p>
          <p className="mt-2">
            Dúvidas?{" "}
            <a
              href="mailto:contato@odontiachat.com.br"
              className="text-brand-primary hover:underline"
            >
              contato@odontiachat.com.br
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
