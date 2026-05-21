import "server-only";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";

export interface AdminClinicRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  planLabel: string;
  status: string;
  trialEndsAt: string | null;
  createdAt: string;
  messagesUsed: number;
  messageLimit: number | null; // null = unlimited
  usageRatio: number;
  estimatedCostCents: number;
  monthlyRevenueCents: number;
}

export interface AdminOverview {
  clinics: AdminClinicRow[];
  totals: {
    totalClinics: number;
    trialClinics: number;
    paidClinics: number;
    mrrCents: number;
    estimatedCostCents: number;
    grossMarginCents: number;
    messagesThisCycle: number;
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const clinics = await db.clinic.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      status: true,
      trialEndsAt: true,
      billingCycleStart: true,
      createdAt: true,
    },
  });

  const rows: AdminClinicRow[] = await Promise.all(
    clinics.map(async (c) => {
      const plan = getPlan(c.plan);
      const events = await db.usageEvent.findMany({
        where: {
          clinicId: c.id,
          createdAt: { gte: c.billingCycleStart },
        },
        select: { type: true, estimatedCostCents: true },
      });

      const messagesUsed = events.filter((e) => e.type === "ai_message").length;
      const estimatedCostCents = events.reduce(
        (s, e) => s + e.estimatedCostCents,
        0,
      );
      const limit = plan.monthlyMessageLimit;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        plan: c.plan,
        planLabel: plan.label,
        status: c.status,
        trialEndsAt: c.trialEndsAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        messagesUsed,
        messageLimit: limit === Infinity ? null : limit,
        usageRatio: limit === Infinity ? 0 : Math.min(1, messagesUsed / limit),
        estimatedCostCents,
        monthlyRevenueCents: plan.priceCents > 0 ? plan.priceCents : 0,
      };
    }),
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalClinics++;
      if (r.plan === "trial") acc.trialClinics++;
      else acc.paidClinics++;
      acc.mrrCents += r.monthlyRevenueCents;
      acc.estimatedCostCents += r.estimatedCostCents;
      acc.messagesThisCycle += r.messagesUsed;
      return acc;
    },
    {
      totalClinics: 0,
      trialClinics: 0,
      paidClinics: 0,
      mrrCents: 0,
      estimatedCostCents: 0,
      grossMarginCents: 0,
      messagesThisCycle: 0,
    },
  );
  totals.grossMarginCents = totals.mrrCents - totals.estimatedCostCents;

  return { clinics: rows, totals };
}
