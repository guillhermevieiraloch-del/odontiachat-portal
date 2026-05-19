import { requireUser } from "@/lib/auth";
import { ClinicForm, type ClinicFormInitial } from "@/components/settings/clinic-form";

export const dynamic = "force-dynamic";

const DEFAULT_HOURS = {
  monday:    { open: true,  start: "09:00", end: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  tuesday:   { open: true,  start: "09:00", end: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  wednesday: { open: true,  start: "09:00", end: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  thursday:  { open: true,  start: "09:00", end: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  friday:    { open: true,  start: "09:00", end: "18:00", lunchStart: "12:00", lunchEnd: "13:00" },
  saturday:  { open: true,  start: "09:00", end: "13:00" },
  sunday:    { open: false },
};

export default async function ClinicaPage() {
  const { clinic } = await requireUser();

  const workingHours = (clinic.workingHours as unknown as ClinicFormInitial["workingHours"]) ?? DEFAULT_HOURS;

  const initial: ClinicFormInitial = {
    name: clinic.name,
    cnpj: clinic.cnpj ?? "",
    email: clinic.email,
    phone: clinic.phone ?? "",
    zipCode: clinic.zipCode ?? "",
    address: clinic.address ?? "",
    addressNumber: clinic.addressNumber ?? "",
    addressComplement: clinic.addressComplement ?? "",
    neighborhood: clinic.neighborhood ?? "",
    city: clinic.city ?? "",
    state: clinic.state ?? "",
    description: clinic.description ?? "",
    workingHours,
  };

  return <ClinicForm initial={initial} />;
}
