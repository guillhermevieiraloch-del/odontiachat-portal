import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProgressBar } from "./_components/progress-bar";
import { Step1Clinic } from "./_components/step-1-clinic";
import { Step2Specialties } from "./_components/step-2-specialties";
import { Step3Hours } from "./_components/step-3-hours";
import { Step4Team } from "./_components/step-4-team";
import type { WorkingHoursPayload } from "./actions";

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { clinic } = await requireUser();

  if (clinic.onboardingDone) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const requested = Number(params.step);
  // Allow user to navigate to any step up to (current + 1).
  const maxAllowed = clinic.onboardingStep + 1;
  const step =
    Number.isFinite(requested) && requested >= 1 && requested <= 4
      ? Math.min(requested, maxAllowed)
      : Math.min(clinic.onboardingStep + 1, 4);

  const invites =
    step === 4
      ? await db.invite.findMany({
          where: { clinicId: clinic.id, acceptedAt: null },
          orderBy: { createdAt: "desc" },
          select: { id: true, email: true, role: true },
        })
      : [];

  return (
    <div>
      <ProgressBar current={step} />

      {step === 1 && (
        <Step1Clinic
          defaults={{
            cnpj: clinic.cnpj,
            phone: clinic.phone,
            address: clinic.address,
            city: clinic.city,
            state: clinic.state,
          }}
        />
      )}

      {step === 2 && <Step2Specialties defaults={clinic.specialties} />}

      {step === 3 && (
        <Step3Hours
          initial={
            (clinic.workingHours as unknown as WorkingHoursPayload) ?? null
          }
        />
      )}

      {step === 4 && (
        <Step4Team
          invites={invites.map((i) => ({ ...i, role: i.role as string }))}
        />
      )}
    </div>
  );
}
