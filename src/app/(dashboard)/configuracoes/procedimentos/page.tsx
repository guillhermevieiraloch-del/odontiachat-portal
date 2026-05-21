import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProceduresPage } from "@/components/settings/procedures-page";

export const dynamic = "force-dynamic";

export default async function ProcedimentosPage() {
  const { clinic } = await requireUser();

  const [procedures, dentists] = await Promise.all([
    db.procedure.findMany({
      where: { clinicId: clinic.id },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: { dentists: { select: { id: true } } },
    }),
    db.dentist.findMany({
      where: { clinicId: clinic.id, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, specialty: true },
    }),
  ]);

  return (
    <ProceduresPage
      procedures={procedures.map((p) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        price: p.price ? Number(p.price) : null,
        acceptsInsurance: p.acceptsInsurance,
        showPrice: p.showPrice,
        active: p.active,
        dentistIds: p.dentists.map((d) => d.id),
      }))}
      dentists={dentists}
    />
  );
}
