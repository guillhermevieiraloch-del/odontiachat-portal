import "server-only";
import { db } from "@/lib/db";
import { getPlan, type PlanConfig } from "@/lib/plans";

export interface UsageSummary {
  /** Messages consumed in the current billing cycle. */
  messagesUsed: number;
  /** Plan's hard cap on messages per cycle (Infinity for enterprise). */
  messageLimit: number;
  /** 0-1 ratio. Clamped at 1 for display, even when over. */
  usageRatio: number;
  /** True when over the limit (used to enable overage billing UI). */
  isOver: boolean;
  /** Estimated cost in cents BRL accumulated this cycle. */
  estimatedCostCents: number;
  /** Start of the current billing cycle. */
  cycleStart: Date;
  /** Next cycle start (typically cycleStart + 1 month). */
  cycleEnd: Date;
  plan: PlanConfig;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/**
 * Aggregate this clinic's usage events since the current cycle started.
 * "Message" = one ai_message event. Tool calls are auxiliary tokens but
 * don't count toward the customer-facing message limit (kept as separate
 * type for cost analysis).
 */
export async function getCurrentMonthUsage(
  clinicId: string,
  planId: string,
  cycleStart: Date,
): Promise<UsageSummary> {
  const plan = getPlan(planId);
  const cycleEnd = addMonths(cycleStart, 1);

  const events = await db.usageEvent.findMany({
    where: {
      clinicId,
      createdAt: { gte: cycleStart, lt: cycleEnd },
    },
    select: { type: true, estimatedCostCents: true },
  });

  const messagesUsed = events.filter((e) => e.type === "ai_message").length;
  const estimatedCostCents = events.reduce(
    (sum, e) => sum + e.estimatedCostCents,
    0,
  );

  const limit = plan.monthlyMessageLimit;
  const usageRatio =
    limit === Infinity ? 0 : Math.min(1, messagesUsed / limit);

  return {
    messagesUsed,
    messageLimit: limit,
    usageRatio,
    isOver: limit !== Infinity && messagesUsed > limit,
    estimatedCostCents,
    cycleStart,
    cycleEnd,
    plan,
  };
}
