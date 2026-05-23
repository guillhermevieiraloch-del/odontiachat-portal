/**
 * Central source of truth for plan tiers, limits and pricing.
 * Mirror in the bot's src/services/aiService.js if it ever needs plan info.
 */

export type PlanId = "trial" | "solo" | "clinica" | "pro" | "enterprise";

export interface PlanFeatures {
  advancedAnalytics: boolean;
  csvExport: boolean;
  multiUnit: boolean;
  publicApi: boolean;
  whiteLabel: boolean;
  assistedOnboarding: boolean;
  multiWhatsapp: boolean;
}

export interface PlanConfig {
  id: PlanId;
  label: string;
  /** Monthly price in BRL cents. 0 = trial. -1 = sob consulta. */
  priceCents: number;
  /** Hard cap on patient messages per billing cycle. Infinity for unlimited. */
  monthlyMessageLimit: number;
  /** Max active Dentist rows. Infinity for unlimited. */
  maxDentists: number;
  /** Max User rows in the clinic (admins + attendants). */
  maxTeamMembers: number;
  /** WhatsApp lines connectable. */
  maxWhatsappLines: number;
  /** Overage cost in cents per extra message. */
  overageCents: number;
  features: PlanFeatures;
  /** True only on trial — used for trialEndsAt logic. */
  isTrial?: boolean;
  /** Public Mercado Pago subscription checkout URL. */
  checkoutUrl?: string;
  /** Mercado Pago preapproval_plan_id — used by the webhook to map back to our PlanId. */
  preapprovalPlanId?: string;
}

const BASE_FEATURES_FREE: PlanFeatures = {
  advancedAnalytics: false,
  csvExport: false,
  multiUnit: false,
  publicApi: false,
  whiteLabel: false,
  assistedOnboarding: false,
  multiWhatsapp: false,
};

export const PLANS: Record<PlanId, PlanConfig> = {
  trial: {
    id: "trial",
    label: "Free Trial",
    priceCents: 0,
    monthlyMessageLimit: 500,
    maxDentists: 1,
    maxTeamMembers: 1,
    maxWhatsappLines: 1,
    overageCents: 0, // não cobra excedente em trial — apenas bloqueia
    features: { ...BASE_FEATURES_FREE },
    isTrial: true,
  },
  solo: {
    id: "solo",
    label: "Solo",
    priceCents: 19700,
    monthlyMessageLimit: 3000,
    maxDentists: 1,
    maxTeamMembers: 1,
    maxWhatsappLines: 1,
    overageCents: 15, // R$ 0,15/msg
    features: { ...BASE_FEATURES_FREE },
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=af9bc5c05d04475fa6ca44ee056e8f85",
    preapprovalPlanId: "af9bc5c05d04475fa6ca44ee056e8f85",
  },
  clinica: {
    id: "clinica",
    label: "Clínica",
    priceCents: 49700,
    monthlyMessageLimit: 8000,
    maxDentists: 5,
    maxTeamMembers: 3,
    maxWhatsappLines: 1,
    overageCents: 15,
    features: {
      ...BASE_FEATURES_FREE,
      advancedAnalytics: false, // analytics básico já é dashboard padrão
    },
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=b4852432170f4ccca70a279623d3dda7",
    preapprovalPlanId: "b4852432170f4ccca70a279623d3dda7",
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceCents: 99700,
    monthlyMessageLimit: 20000,
    maxDentists: Infinity,
    maxTeamMembers: Infinity,
    maxWhatsappLines: 1, // extras vendidas como add-on
    overageCents: 15,
    features: {
      advancedAnalytics: true,
      csvExport: true,
      assistedOnboarding: true,
      multiUnit: false,
      publicApi: false,
      whiteLabel: false,
      multiWhatsapp: false,
    },
    checkoutUrl:
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=0f5ef1e2847e483aa8c5b1587d9535b6",
    preapprovalPlanId: "0f5ef1e2847e483aa8c5b1587d9535b6",
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    priceCents: -1,
    monthlyMessageLimit: Infinity,
    maxDentists: Infinity,
    maxTeamMembers: Infinity,
    maxWhatsappLines: Infinity,
    overageCents: 10,
    features: {
      advancedAnalytics: true,
      csvExport: true,
      assistedOnboarding: true,
      multiUnit: true,
      publicApi: true,
      whiteLabel: true,
      multiWhatsapp: true,
    },
  },
};

export function getPlan(planId: string | null | undefined): PlanConfig {
  if (planId && planId in PLANS) return PLANS[planId as PlanId];
  return PLANS.trial;
}

export function formatPriceBRL(cents: number): string {
  if (cents < 0) return "Sob consulta";
  if (cents === 0) return "Grátis";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

/** Trial cap of 500 msgs is the TOTAL for the 14 days, not monthly. */
export const TRIAL_DURATION_DAYS = 14;

/** Reverse map from Mercado Pago preapproval_plan_id → our PlanId. Used by the MP webhook. */
export function planIdFromPreapproval(preapprovalPlanId: string): PlanId | null {
  for (const id of Object.keys(PLANS) as PlanId[]) {
    if (PLANS[id].preapprovalPlanId === preapprovalPlanId) return id;
  }
  return null;
}
