import { AppointmentsShell } from "@/components/appointments/appointments-shell";
import { requireUser } from "@/lib/auth";
import {
  listAppointments,
  listAppointmentMetadata,
} from "@/lib/queries/appointments";

export const dynamic = "force-dynamic";

export default async function AgendamentosPage() {
  const { clinic } = await requireUser();

  const [appointments, meta] = await Promise.all([
    listAppointments(clinic.id),
    listAppointmentMetadata(clinic.id),
  ]);

  return (
    <AppointmentsShell
      appointments={appointments}
      patients={meta.patients}
      procedures={meta.procedures}
      dentists={meta.dentists}
    />
  );
}
