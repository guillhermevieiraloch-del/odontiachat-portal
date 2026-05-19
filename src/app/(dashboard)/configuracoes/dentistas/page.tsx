import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DentistsPage } from "@/components/settings/dentists-page";

export const dynamic = "force-dynamic";

export default async function DentistasPage() {
  const { clinic } = await requireUser();

  const [dentists, eligibleUsers] = await Promise.all([
    db.dentist.findMany({
      where: { clinicId: clinic.id },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    db.user.findMany({
      where: { clinicId: clinic.id, role: "DENTIST" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <DentistsPage
      dentists={dentists.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        cro: d.cro ?? "",
        email: d.email ?? "",
        phone: d.phone ?? "",
        bio: d.bio ?? "",
        userId: d.userId ?? "",
        active: d.active,
        createdAt: d.createdAt.toISOString(),
      }))}
      eligibleUsers={eligibleUsers}
    />
  );
}
