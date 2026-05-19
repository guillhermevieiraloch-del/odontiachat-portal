import { PatientsShell } from "@/components/patients/patients-shell";
import { requireUser } from "@/lib/auth";
import { listPatients } from "@/lib/queries/patients";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const { clinic } = await requireUser();
  const patients = await listPatients(clinic.id);
  return <PatientsShell patients={patients} />;
}
