import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/dashboard/app-shell";
import { ToastProvider } from "@/components/ui/toast";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, clinic } = await requireUser();

  if (!clinic.onboardingDone) {
    redirect("/onboarding");
  }

  // Força preenchimento do conhecimento na primeira vez.
  // A própria página de setup-conhecimento é uma exceção (auto-acessível).
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("next-url") ?? "";
  const isOnSetupPage = pathname.includes("/setup-conhecimento");
  if (!clinic.knowledgeCompletedAt && !isOnSetupPage) {
    redirect("/setup-conhecimento");
  }

  return (
    <ToastProvider>
      <AppShell
        user={{ name: profile.name, email: profile.email }}
        clinic={{ name: clinic.name, plan: clinic.plan }}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
