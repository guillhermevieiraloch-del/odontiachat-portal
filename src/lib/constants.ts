export const SPECIALTIES = [
  { id: "clinica-geral", label: "Clínica Geral" },
  { id: "ortodontia", label: "Ortodontia" },
  { id: "implantes", label: "Implantes" },
  { id: "endodontia", label: "Endodontia" },
  { id: "periodontia", label: "Periodontia" },
  { id: "estetica", label: "Estética" },
  { id: "odontopediatria", label: "Odontopediatria" },
  { id: "cirurgia", label: "Cirurgia" },
  { id: "protese", label: "Prótese" },
  { id: "harmonizacao", label: "Harmonização Orofacial" },
] as const;

export const WEEKDAYS = [
  { id: "monday", label: "Segunda" },
  { id: "tuesday", label: "Terça" },
  { id: "wednesday", label: "Quarta" },
  { id: "thursday", label: "Quinta" },
  { id: "friday", label: "Sexta" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
] as const;

export const ROLES = [
  { id: "ADMIN", label: "Administrador" },
  { id: "ATTENDANT", label: "Atendente" },
  { id: "DENTIST", label: "Dentista" },
] as const;

export const ONBOARDING_STEPS = [
  { id: 1, label: "Dados da clínica" },
  { id: 2, label: "Especialidades" },
  { id: 3, label: "Horário" },
  { id: 4, label: "Equipe" },
] as const;
