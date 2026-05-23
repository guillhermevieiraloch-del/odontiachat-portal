import { requireUser } from "@/lib/auth";
import { getCurrentMonthUsage } from "@/lib/queries/usage";
import { db } from "@/lib/db";
import { BillingPage, type PlanCheckoutLink } from "@/components/settings/billing-page";
import { checkoutUrlForClinic } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

interface SearchParams {
  searchParams?: Promise<{ mp?: string }>;
}

export default async function FaturamentoPage({ searchParams }: SearchParams) {
  const { clinic } = await requireUser();
  const params = (await searchParams) ?? {};

  const [usage, dailyEvents] = await Promise.all([
    getCurrentMonthUsage(clinic.id, clinic.plan, clinic.billingCycleStart),
    db.usageEvent.groupBy({
      by: ["createdAt"],
      where: {
        clinicId: clinic.id,
        createdAt: { gte: clinic.billingCycleStart },
        type: "ai_message",
      },
      _count: { _all: true },
    }),
  ]);

  // Bucket events by day for the chart
  const dayMap = new Map<string, number>();
  for (const e of dailyEvents) {
    const day = e.createdAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + e._count._all);
  }
  const daily = Array.from(dayMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const checkoutLinks: PlanCheckoutLink[] = (
    ["solo", "clinica", "pro"] as const
  )
    .map((id) => {
      const url = checkoutUrlForClinic(id, clinic.id);
      return url ? { id, url } : null;
    })
    .filter((x): x is PlanCheckoutLink => x !== null);

  return (
    <BillingPage
      usage={{
        messagesUsed: usage.messagesUsed,
        messageLimit:
          usage.messageLimit === Infinity ? null : usage.messageLimit,
        usageRatio: usage.usageRatio,
        isOver: usage.isOver,
      }}
      plan={{
        id: usage.plan.id,
        label: usage.plan.label,
        priceCents: usage.plan.priceCents,
      }}
      trialEndsAt={clinic.trialEndsAt?.toISOString() ?? null}
      cycleStart={usage.cycleStart.toISOString()}
      cycleEnd={usage.cycleEnd.toISOString()}
      daily={daily}
      checkoutLinks={checkoutLinks}
      showPostCheckoutBanner={params.mp === "success"}
    />
  );
}
