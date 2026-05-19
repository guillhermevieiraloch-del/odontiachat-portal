import { requireUser } from "@/lib/auth";
import { IntegrationsPage } from "@/components/integrations/integrations-page";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { clinic } = await requireUser();
  const { connected, error } = await searchParams;

  return (
    <IntegrationsPage
      google={{
        connectedEmail: clinic.googleAccountEmail,
        connectedAt: clinic.googleConnectedAt
          ? clinic.googleConnectedAt.toISOString()
          : null,
        calendarId: clinic.googleCalendarId,
      }}
      flashSuccess={connected === "1"}
      flashError={error ?? null}
    />
  );
}
