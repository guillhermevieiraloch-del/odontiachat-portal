// Mock CRM patients data for UI development.
// TODO: replace with Prisma queries scoped to clinic.id

export interface CRMPatientHistoryItem {
  id: string;
  procedure: string;
  date: string; // YYYY-MM-DD
  status: "completed" | "scheduled" | "cancelled";
  price?: number;
}

export interface CRMPatient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  notes?: string;
  status: "active" | "inactive";
  createdAt: string; // YYYY-MM-DD
  lastContactAt: string; // YYYY-MM-DD
  totalSpent: number;
  history: CRMPatientHistoryItem[];
}

export const MOCK_CRM_PATIENTS: CRMPatient[] = [
  {
    id: "p1",
    name: "Mariana Souza",
    phone: "+55 48 99876-5432",
    email: "mariana.souza@email.com",
    birthDate: "1992-04-15",
    notes:
      "Paciente alérgica a látex. Prefere atendimentos pela manhã. Sempre confirma com 1 dia de antecedência.",
    status: "active",
    createdAt: "2024-09-12",
    lastContactAt: "2026-05-08",
    totalSpent: 540,
    history: [
      { id: "h1", procedure: "Limpeza e profilaxia", date: "2026-02-12", status: "completed", price: 180 },
      { id: "h2", procedure: "Avaliação ortodôntica", date: "2025-11-08", status: "completed", price: 0 },
      { id: "h3", procedure: "Restauração", date: "2025-09-20", status: "completed", price: 360 },
      { id: "h4", procedure: "Limpeza e profilaxia", date: "2026-05-08", status: "scheduled" },
    ],
  },
  {
    id: "p2",
    name: "João Pedro Almeida",
    phone: "+55 48 99123-4567",
    email: "joaopedro@email.com",
    status: "active",
    createdAt: "2026-04-15",
    lastContactAt: "2026-05-08",
    totalSpent: 0,
    history: [
      { id: "h1", procedure: "Avaliação inicial", date: "2026-05-09", status: "scheduled" },
    ],
  },
  {
    id: "p3",
    name: "Ana Lúcia Pereira",
    phone: "+55 48 98765-1122",
    email: "analucia.p@email.com",
    birthDate: "1985-08-22",
    notes: "Tratamento ortodôntico em andamento. Ajustes mensais.",
    status: "active",
    createdAt: "2024-03-10",
    lastContactAt: "2026-05-07",
    totalSpent: 1850,
    history: [
      { id: "h1", procedure: "Ajuste ortodôntico", date: "2026-04-10", status: "completed", price: 150 },
      { id: "h2", procedure: "Ajuste ortodôntico", date: "2026-03-10", status: "completed", price: 150 },
      { id: "h3", procedure: "Ajuste ortodôntico", date: "2026-02-10", status: "completed", price: 150 },
      { id: "h4", procedure: "Ajuste ortodôntico", date: "2026-05-10", status: "scheduled" },
    ],
  },
  {
    id: "p4",
    name: "Roberto Lima",
    phone: "+55 48 99555-2233",
    email: "roberto.lima@email.com",
    birthDate: "1972-12-03",
    notes: "Paciente diabético. Implante em andamento.",
    status: "active",
    createdAt: "2025-12-05",
    lastContactAt: "2026-05-07",
    totalSpent: 5000,
    history: [
      { id: "h1", procedure: "Implante - 1ª etapa", date: "2026-03-20", status: "completed", price: 2500 },
      { id: "h2", procedure: "Implante - 2ª etapa", date: "2026-05-15", status: "scheduled" },
    ],
  },
  {
    id: "p5",
    name: "Patrícia Mendes",
    phone: "+55 48 98888-1010",
    email: "patricia.m@email.com",
    status: "active",
    createdAt: "2026-05-01",
    lastContactAt: "2026-05-07",
    totalSpent: 0,
    history: [],
  },
  {
    id: "p6",
    name: "Carolina Nunes",
    phone: "+55 48 98444-5678",
    email: "carolina.nunes@email.com",
    birthDate: "1998-06-30",
    status: "active",
    createdAt: "2025-08-22",
    lastContactAt: "2026-05-06",
    totalSpent: 980,
    history: [
      { id: "h1", procedure: "Clareamento dental", date: "2025-11-15", status: "completed", price: 800 },
      { id: "h2", procedure: "Limpeza e profilaxia", date: "2026-02-20", status: "completed", price: 180 },
      { id: "h3", procedure: "Clareamento dental", date: "2026-05-09", status: "scheduled" },
    ],
  },
  {
    id: "p7",
    name: "Rafael Costa",
    phone: "+55 48 99222-1133",
    birthDate: "1990-02-18",
    status: "active",
    createdAt: "2025-10-10",
    lastContactAt: "2026-05-06",
    totalSpent: 1200,
    history: [
      { id: "h1", procedure: "Canal", date: "2026-01-15", status: "completed", price: 1200 },
      { id: "h2", procedure: "Restauração", date: "2026-05-09", status: "scheduled" },
    ],
  },
  {
    id: "p8",
    name: "Beatriz Almeida",
    phone: "+55 48 98111-2244",
    email: "bea.almeida@email.com",
    status: "active",
    createdAt: "2025-06-12",
    lastContactAt: "2026-05-05",
    totalSpent: 750,
    history: [
      { id: "h1", procedure: "Ajuste ortodôntico", date: "2026-04-09", status: "completed", price: 150 },
      { id: "h2", procedure: "Ajuste ortodôntico", date: "2026-05-09", status: "scheduled" },
    ],
  },
  {
    id: "p9",
    name: "Lucas Oliveira",
    phone: "+55 48 99333-4455",
    email: "lucas.oli@email.com",
    birthDate: "2001-09-25",
    status: "active",
    createdAt: "2026-01-08",
    lastContactAt: "2026-05-04",
    totalSpent: 460,
    history: [
      { id: "h1", procedure: "Avaliação inicial", date: "2026-01-10", status: "completed", price: 0 },
      { id: "h2", procedure: "Restauração", date: "2026-02-05", status: "completed", price: 250 },
      { id: "h3", procedure: "Limpeza e profilaxia", date: "2026-04-10", status: "completed", price: 180 },
    ],
  },
  {
    id: "p10",
    name: "Fernanda Ribeiro",
    phone: "+55 48 99888-7766",
    email: "fernanda.r@email.com",
    birthDate: "1988-11-11",
    notes: "Prefere consultas no fim da tarde.",
    status: "active",
    createdAt: "2024-11-30",
    lastContactAt: "2026-05-03",
    totalSpent: 1430,
    history: [
      { id: "h1", procedure: "Limpeza e profilaxia", date: "2025-05-12", status: "completed", price: 180 },
      { id: "h2", procedure: "Restauração", date: "2025-09-08", status: "completed", price: 250 },
      { id: "h3", procedure: "Canal", date: "2026-02-22", status: "completed", price: 1000 },
    ],
  },
  {
    id: "p11",
    name: "Gabriel Santos",
    phone: "+55 48 99777-3344",
    status: "inactive",
    createdAt: "2024-03-20",
    lastContactAt: "2025-08-15",
    totalSpent: 250,
    history: [
      { id: "h1", procedure: "Restauração", date: "2024-04-10", status: "completed", price: 250 },
      { id: "h2", procedure: "Limpeza e profilaxia", date: "2025-08-10", status: "cancelled" },
    ],
  },
  {
    id: "p12",
    name: "Isabela Carvalho",
    phone: "+55 48 99444-2211",
    email: "isabela.c@email.com",
    birthDate: "1995-07-05",
    status: "active",
    createdAt: "2025-04-18",
    lastContactAt: "2026-04-30",
    totalSpent: 800,
    history: [
      { id: "h1", procedure: "Clareamento dental", date: "2025-09-22", status: "completed", price: 800 },
    ],
  },
  {
    id: "p13",
    name: "Tiago Barbosa",
    phone: "+55 48 98555-9911",
    status: "inactive",
    createdAt: "2023-06-01",
    lastContactAt: "2024-12-10",
    totalSpent: 1450,
    history: [
      { id: "h1", procedure: "Implante - 1ª etapa", date: "2023-08-15", status: "completed", price: 1200 },
      { id: "h2", procedure: "Restauração", date: "2024-12-10", status: "completed", price: 250 },
    ],
  },
  {
    id: "p14",
    name: "Amanda Rocha",
    phone: "+55 48 99666-7788",
    email: "amanda.rocha@email.com",
    birthDate: "1993-01-20",
    notes: "Gestante (28 semanas). Evitar raio-X.",
    status: "active",
    createdAt: "2026-02-14",
    lastContactAt: "2026-05-02",
    totalSpent: 180,
    history: [
      { id: "h1", procedure: "Avaliação inicial", date: "2026-02-20", status: "completed", price: 0 },
      { id: "h2", procedure: "Limpeza e profilaxia", date: "2026-04-15", status: "completed", price: 180 },
    ],
  },
  {
    id: "p15",
    name: "Vinícius Martins",
    phone: "+55 48 99000-1122",
    email: "vmartins@email.com",
    birthDate: "1980-05-08",
    status: "active",
    createdAt: "2025-07-08",
    lastContactAt: "2026-04-28",
    totalSpent: 2700,
    history: [
      { id: "h1", procedure: "Implante - 1ª etapa", date: "2025-09-12", status: "completed", price: 2500 },
      { id: "h2", procedure: "Limpeza e profilaxia", date: "2026-01-20", status: "completed", price: 180 },
      { id: "h3", procedure: "Restauração", date: "2026-04-28", status: "cancelled" },
    ],
  },
];
