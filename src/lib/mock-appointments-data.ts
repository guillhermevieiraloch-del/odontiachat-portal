// Mock appointments data for UI development.
// TODO: replace with Prisma queries scoped to clinic.id

import { addDays, addMinutes, setHours, setMinutes, startOfDay } from "date-fns";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface MockPatient {
  id: string;
  name: string;
  phone: string;
}

export interface MockProcedure {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
}

export interface MockDentist {
  id: string;
  name: string;
  specialty: string;
}

export interface MockAppointment {
  id: string;
  patientId: string;
  procedureId: string;
  dentistId: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  notes?: string;
}

export const MOCK_PATIENTS: MockPatient[] = [
  { id: "p1", name: "Mariana Souza", phone: "+55 48 99876-5432" },
  { id: "p2", name: "João Pedro Almeida", phone: "+55 48 99123-4567" },
  { id: "p3", name: "Ana Lúcia Pereira", phone: "+55 48 98765-1122" },
  { id: "p4", name: "Roberto Lima", phone: "+55 48 99555-2233" },
  { id: "p5", name: "Patrícia Mendes", phone: "+55 48 98888-1010" },
  { id: "p6", name: "Carolina Nunes", phone: "+55 48 98444-5678" },
  { id: "p7", name: "Rafael Costa", phone: "+55 48 99222-1133" },
  { id: "p8", name: "Beatriz Almeida", phone: "+55 48 98111-2244" },
];

export const MOCK_PROCEDURES: MockProcedure[] = [
  { id: "pr1", name: "Limpeza e profilaxia", duration: 60, price: 180 },
  { id: "pr2", name: "Avaliação inicial", duration: 30, price: 0 },
  { id: "pr3", name: "Clareamento dental", duration: 90, price: 800 },
  { id: "pr4", name: "Restauração", duration: 60, price: 250 },
  { id: "pr5", name: "Implante - 1ª etapa", duration: 90, price: 2500 },
  { id: "pr6", name: "Ajuste ortodôntico", duration: 30, price: 150 },
  { id: "pr7", name: "Canal", duration: 90, price: 1200 },
];

export const MOCK_DENTISTS: MockDentist[] = [
  { id: "d1", name: "Dra. Camila Ferreira", specialty: "Clínica Geral" },
  { id: "d2", name: "Dr. Rodrigo Almeida", specialty: "Implantodontia" },
  { id: "d3", name: "Dr. Paulo Mendes", specialty: "Cirurgia Buco-Maxilo" },
];

// Helper to build an appointment with timing
function buildAppt(
  id: string,
  patientId: string,
  procedureId: string,
  dentistId: string,
  daysFromToday: number,
  hour: number,
  minute: number,
  status: AppointmentStatus = "confirmed",
  notes?: string,
): MockAppointment {
  const proc = MOCK_PROCEDURES.find((p) => p.id === procedureId)!;
  const startsAt = setMinutes(setHours(startOfDay(addDays(new Date(), daysFromToday)), hour), minute);
  const endsAt = addMinutes(startsAt, proc.duration);
  return { id, patientId, procedureId, dentistId, startsAt, endsAt, status, notes };
}

// Spread appointments across the next 2 weeks for calendar visualization
export const MOCK_APPOINTMENTS: MockAppointment[] = [
  // Today
  buildAppt("a1", "p1", "pr1", "d1", 0, 9, 0, "completed"),
  buildAppt("a2", "p2", "pr2", "d1", 0, 14, 0, "confirmed"),
  buildAppt("a3", "p3", "pr6", "d2", 0, 16, 30, "confirmed"),

  // Tomorrow
  buildAppt("a4", "p4", "pr5", "d2", 1, 9, 0, "confirmed", "Retorno do implante"),
  buildAppt("a5", "p5", "pr3", "d1", 1, 11, 0, "pending"),
  buildAppt("a6", "p6", "pr1", "d1", 1, 14, 30, "confirmed"),
  buildAppt("a7", "p7", "pr4", "d3", 1, 16, 0, "confirmed"),

  // +2 days
  buildAppt("a8", "p1", "pr2", "d1", 2, 10, 0, "confirmed"),
  buildAppt("a9", "p8", "pr6", "d2", 2, 14, 0, "confirmed"),

  // +3 days
  buildAppt("a10", "p2", "pr1", "d1", 3, 9, 30, "confirmed"),
  buildAppt("a11", "p3", "pr6", "d2", 3, 11, 0, "confirmed"),
  buildAppt("a12", "p4", "pr7", "d3", 3, 14, 0, "pending"),
  buildAppt("a13", "p5", "pr2", "d1", 3, 16, 30, "cancelled", "Paciente cancelou"),

  // +4 days
  buildAppt("a14", "p6", "pr3", "d1", 4, 10, 0, "confirmed"),
  buildAppt("a15", "p7", "pr1", "d2", 4, 15, 0, "confirmed"),

  // +7 days (next week)
  buildAppt("a16", "p1", "pr4", "d1", 7, 9, 0, "confirmed"),
  buildAppt("a17", "p8", "pr6", "d2", 7, 11, 30, "confirmed"),
  buildAppt("a18", "p2", "pr2", "d3", 7, 14, 0, "pending"),

  // +8 days
  buildAppt("a19", "p3", "pr6", "d2", 8, 10, 0, "confirmed"),
  buildAppt("a20", "p4", "pr5", "d2", 8, 14, 0, "confirmed", "Implante - 2ª etapa"),

  // +10 days
  buildAppt("a21", "p5", "pr1", "d1", 10, 9, 0, "confirmed"),
  buildAppt("a22", "p6", "pr3", "d1", 10, 11, 0, "pending"),
];

// Helpers
export function getPatient(id: string) {
  return MOCK_PATIENTS.find((p) => p.id === id);
}
export function getProcedure(id: string) {
  return MOCK_PROCEDURES.find((p) => p.id === id);
}
export function getDentist(id: string) {
  return MOCK_DENTISTS.find((d) => d.id === id);
}
