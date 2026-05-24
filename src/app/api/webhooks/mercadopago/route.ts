/**
 * Mercado Pago webhook — activates a clinic's plan after the subscription is authorized.
 *
 * Configure in MP Dashboard → Webhooks:
 *   URL: https://app.odontiachat.com.br/api/webhooks/mercadopago
 *   Events: "Assinaturas" (subscription_preapproval) — and optionally
 *   "Pagamento de assinatura" (subscription_authorized_payment) for renewals.
 *
 * Flow:
 *   1. MP POSTs { type, data: { id } } here (or sends query params on GET — both supported)
 *   2. We fetch GET /preapproval/{id} via API
 *   3. Read external_reference ("clinic_<id>") + preapproval_plan_id
 *   4. Map preapproval_plan_id → our PlanId, set clinic.plan = <planId> when status=authorized
 *   5. Return 200 quickly so MP doesn't retry
 *
 * Security: MP signs notifications with x-signature when a secret is configured.
 * We validate it when MERCADOPAGO_WEBHOOK_SECRET is set; otherwise we accept (early launch).
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import {
  fetchPreapproval,
  clinicIdFromReference,
} from "@/lib/mercadopago";
import { planIdFromPreapproval } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MpNotification {
  type?: string;
  action?: string;
  data?: { id?: string };
}

function verifySignature(req: NextRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // not enforced until secret is configured

  const sigHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!sigHeader || !requestId) return false;

  // MP signs against the data.id value from the URL query string (not body).
  const urlDataId = new URL(req.url).searchParams.get("data.id");
  if (!urlDataId) return false;

  // x-signature format: "ts=NNNN,v1=HEXSIG"
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Manifest: "id:<data.id>;request-id:<req-id>;ts:<ts>;"
  const manifest = `id:${urlDataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

async function handleNotification(req: NextRequest, payload: MpNotification) {
  const type = payload.type ?? payload.action ?? "";
  const id = payload.data?.id;
  if (!id) {
    return NextResponse.json({ ok: true, skipped: "no data.id" });
  }

  if (!verifySignature(req)) {
    console.warn("[mp-webhook] invalid signature for", id);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // We only care about subscription events. Payment events arrive for renewals
  // but the preapproval status is the source of truth for plan activation.
  if (!type.includes("preapproval") && !type.includes("subscription")) {
    return NextResponse.json({ ok: true, skipped: `type=${type}` });
  }

  const preapproval = await fetchPreapproval(id);
  if (!preapproval) {
    return NextResponse.json({ ok: true, skipped: "preapproval not found" });
  }

  const clinicId = clinicIdFromReference(preapproval.external_reference);
  if (!clinicId) {
    console.warn(
      "[mp-webhook] no clinic external_reference on preapproval",
      id,
      "ref:",
      preapproval.external_reference,
    );
    return NextResponse.json({ ok: true, skipped: "no external_reference" });
  }

  const planId = preapproval.preapproval_plan_id
    ? planIdFromPreapproval(preapproval.preapproval_plan_id)
    : null;
  if (!planId) {
    console.warn(
      "[mp-webhook] unknown preapproval_plan_id",
      preapproval.preapproval_plan_id,
    );
    return NextResponse.json({ ok: true, skipped: "unknown plan" });
  }

  if (preapproval.status === "authorized") {
    // Idempotency: MP retries this event on transient failures, sends it again
    // on payment recovery, and fires it on each renewal. If we always reset the
    // billing cycle, a paying customer gets a fresh message quota every retry.
    // Only reset cycle/alerts when the plan actually changes (trial→paid or
    // upgrade/downgrade between paid plans).
    const current = await db.clinic.findUnique({
      where: { id: clinicId },
      select: { plan: true },
    });
    if (!current) {
      console.warn("[mp-webhook] clinic not found", clinicId);
      return NextResponse.json({ ok: true, skipped: "clinic not found" });
    }

    if (current.plan === planId) {
      console.log(
        `[mp-webhook] clinic ${clinicId} already on ${planId} — no-op`,
      );
      return NextResponse.json({
        ok: true,
        action: "noop",
        reason: "already on plan",
      });
    }

    await db.clinic.update({
      where: { id: clinicId },
      data: {
        plan: planId,
        billingCycleStart: new Date(),
        lastUsageAlertPct: 0,
        lastUsageAlertAt: null,
        trialEndsAt: null,
      },
    });
    console.log(
      `[mp-webhook] activated clinic ${clinicId}: ${current.plan} → ${planId}`,
    );
    return NextResponse.json({
      ok: true,
      action: "activated",
      clinicId,
      planId,
      previousPlan: current.plan,
    });
  }

  if (
    preapproval.status === "cancelled" ||
    preapproval.status === "paused"
  ) {
    // Downgrade to trial when subscription is cancelled.
    // (We keep the data — the clinic just stops being on a paid plan.)
    await db.clinic.update({
      where: { id: clinicId },
      data: { plan: "trial" },
    });
    console.log(
      `[mp-webhook] downgraded clinic ${clinicId} (status=${preapproval.status})`,
    );
    return NextResponse.json({
      ok: true,
      action: "downgraded",
      clinicId,
      status: preapproval.status,
    });
  }

  return NextResponse.json({
    ok: true,
    skipped: `status=${preapproval.status}`,
  });
}

export async function POST(req: NextRequest) {
  let payload: MpNotification;
  try {
    payload = (await req.json()) as MpNotification;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    return await handleNotification(req, payload);
  } catch (err) {
    console.error("[mp-webhook] error:", err);
    // Return 500 so MP retries — but don't leak details.
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// MP also sends notifications as GET with query params for the legacy IPN format.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  const id = url.searchParams.get("id") ?? url.searchParams.get("data.id") ?? "";
  if (!id) {
    return NextResponse.json({ ok: true, skipped: "no id" });
  }

  try {
    return await handleNotification(req, { type, data: { id } });
  } catch (err) {
    console.error("[mp-webhook GET] error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
