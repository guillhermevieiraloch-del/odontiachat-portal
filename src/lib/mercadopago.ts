/**
 * Mercado Pago integration helpers.
 *
 * We use public Assinaturas checkout links (one per plan) and add
 * external_reference=clinic_<id> so the webhook can map a paid subscription
 * back to the clinic that paid.
 *
 * Webhook flow:
 *   1. User clicks plan link in /configuracoes/faturamento
 *   2. checkoutUrlForClinic() appends external_reference + back_url
 *   3. MP redirects to checkout, user pays
 *   4. MP POSTs to /api/webhooks/mercadopago with { type, data: { id } }
 *   5. We GET /preapproval/{id} via API, read external_reference + preapproval_plan_id
 *   6. Map preapproval_plan_id → PlanId, update clinic.plan
 */
import { PLANS, type PlanId } from "./plans";

const MP_API = "https://api.mercadopago.com";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.odontiachat.com.br";
}

/**
 * Builds a per-clinic checkout URL by appending external_reference + back_url
 * to the plan's public Mercado Pago link. Returns null for plans without a
 * configured checkoutUrl (trial, enterprise).
 */
export function checkoutUrlForClinic(planId: PlanId, clinicId: string): string | null {
  const plan = PLANS[planId];
  if (!plan.checkoutUrl) return null;
  const sep = plan.checkoutUrl.includes("?") ? "&" : "?";
  const ref = encodeURIComponent(`clinic_${clinicId}`);
  const back = encodeURIComponent(`${siteUrl()}/configuracoes/faturamento?mp=success`);
  return `${plan.checkoutUrl}${sep}external_reference=${ref}&back_url=${back}`;
}

export interface MpPreapproval {
  id: string;
  status: string; // "authorized" | "pending" | "cancelled" | "paused"
  preapproval_plan_id?: string;
  external_reference?: string;
  payer_email?: string;
}

/** Fetches preapproval details from MP. Returns null on 404. Throws on other errors. */
export async function fetchPreapproval(id: string): Promise<MpPreapproval | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");

  const res = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`MP preapproval ${id} returned ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as MpPreapproval;
}

/** Parses `external_reference` of the form "clinic_<id>" into a clinic ID. */
export function clinicIdFromReference(ref: string | undefined): string | null {
  if (!ref) return null;
  const m = ref.match(/^clinic_(.+)$/);
  return m ? m[1] : null;
}
