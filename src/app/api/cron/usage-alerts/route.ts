/**
 * Vercel Cron endpoint — fires usage-threshold emails (80/95/100%)
 * and trial-ending emails (3 days, 1 day, 0).
 *
 * Configured in vercel.json. Triggers every 6 hours.
 * Protected by CRON_SECRET (Vercel injects Authorization: Bearer <secret> header).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { sendUsageAlertEmail, sendTrialEndingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const THRESHOLDS = [80, 95, 100] as const;

function nextThresholdToAlert(
  currentPct: number,
  lastAlertedPct: number,
): 80 | 95 | 100 | null {
  for (const t of THRESHOLDS) {
    if (currentPct >= t && lastAlertedPct < t) return t;
  }
  return null;
}

function daysUntil(date: Date): number {
  return Math.max(
    0,
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

export async function GET(req: NextRequest) {
  // Auth: Vercel sends `Authorization: Bearer <CRON_SECRET>`
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.odontiachat.com.br";
  const upgradeUrl = `${baseUrl}/precos`;

  const clinics = await db.clinic.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      trialEndsAt: true,
      billingCycleStart: true,
      lastUsageAlertPct: true,
      lastUsageAlertAt: true,
    },
  });

  const stats = {
    total: clinics.length,
    usageAlertsSent: 0,
    trialAlertsSent: 0,
    skipped: 0,
    errors: 0,
  };

  for (const clinic of clinics) {
    try {
      const plan = getPlan(clinic.plan);

      // ── Usage alerts (paid plans only — trial uses dashboard banner) ──
      if (!plan.isTrial && plan.monthlyMessageLimit !== Infinity) {
        const used = await db.usageEvent.count({
          where: {
            clinicId: clinic.id,
            type: "ai_message",
            createdAt: { gte: clinic.billingCycleStart },
          },
        });

        const pct = Math.floor((used / plan.monthlyMessageLimit) * 100);

        // Reset alert counter if a new cycle started since last alert
        const lastAlertedPct =
          clinic.lastUsageAlertAt && clinic.lastUsageAlertAt < clinic.billingCycleStart
            ? 0
            : clinic.lastUsageAlertPct;

        const threshold = nextThresholdToAlert(pct, lastAlertedPct);
        if (threshold !== null) {
          await sendUsageAlertEmail({
            to: clinic.email,
            clinicName: clinic.name,
            threshold,
            messagesUsed: used,
            messageLimit: plan.monthlyMessageLimit,
            planLabel: plan.label,
            cycleEnd: new Date(
              clinic.billingCycleStart.getFullYear(),
              clinic.billingCycleStart.getMonth() + 1,
              clinic.billingCycleStart.getDate(),
            ),
            upgradeUrl,
          });
          await db.clinic.update({
            where: { id: clinic.id },
            data: {
              lastUsageAlertPct: threshold,
              lastUsageAlertAt: new Date(),
            },
          });
          stats.usageAlertsSent++;
          continue;
        }
      }

      // ── Trial ending (only when plan=trial) ──
      if (plan.isTrial && clinic.trialEndsAt) {
        const days = daysUntil(clinic.trialEndsAt);
        // Use lastUsageAlertPct field as a tri-state: 0=not sent, 3=sent 3d, 1=sent 1d, 100=sent expired
        const alreadySent = clinic.lastUsageAlertPct;

        let toSend: 3 | 1 | 0 | null = null;
        if (days === 0 && alreadySent !== 100) toSend = 0;
        else if (days === 1 && alreadySent < 1) toSend = 1;
        else if (days <= 3 && alreadySent < 3) toSend = 3;

        if (toSend !== null) {
          await sendTrialEndingEmail({
            to: clinic.email,
            clinicName: clinic.name,
            daysLeft: toSend,
            trialEndsAt: clinic.trialEndsAt,
            upgradeUrl,
          });
          await db.clinic.update({
            where: { id: clinic.id },
            data: {
              lastUsageAlertPct: toSend === 0 ? 100 : toSend,
              lastUsageAlertAt: new Date(),
            },
          });
          stats.trialAlertsSent++;
          continue;
        }
      }

      stats.skipped++;
    } catch (err) {
      console.error(`[cron/usage-alerts] clinic ${clinic.id}:`, err);
      stats.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...stats });
}
