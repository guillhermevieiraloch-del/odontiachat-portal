// Mock inbox data for UI development.
// TODO: replace with real Prisma queries scoped to clinic.id

export type Sender = "patient" | "ai" | "attendant";

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  time: string;
}

export interface PatientHistoryItem {
  id: string;
  procedure: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  history: PatientHistoryItem[];
}

export interface InboxConversation {
  id: string;
  patient: Patient;
  preview: string;
  time: string;
  unread: number;
  handledBy: "ai" | "attendant";
  status: "online" | "offline";
  messages: Message[];
}

export const MOCK_CONVERSATIONS: InboxConversation[] = [
  {
    id: "c1",
    patient: {
      id: "p1",
      name: "Mariana Souza",
      phone: "+55 48 99876-5432",
      email: "mariana.souza@email.com",
      birthDate: "1992-04-15",
      notes:
        "Paciente alérgica a látex. Prefere atendimentos pela manhã. Sempre confirma com 1 dia de antecedência.",
      history: [
        { id: "h1", procedure: "Limpeza e profilaxia", date: "12/02/2026", status: "completed" },
        { id: "h2", procedure: "Avaliação ortodôntica", date: "08/11/2025", status: "completed" },
        { id: "h3", procedure: "Limpeza e profilaxia", date: "08/05/2026", status: "scheduled" },
      ],
    },
    preview: "Perfeito, confirmo quinta às 14h!",
    time: "agora",
    unread: 2,
    handledBy: "ai",
    status: "online",
    messages: [
      { id: "m1", sender: "patient", content: "Oi, gostaria de marcar uma limpeza", time: "14:32" },
      {
        id: "m2",
        sender: "ai",
        content:
          "Olá, Mariana! 😊 Que bom te ver por aqui. Tenho disponibilidade quinta-feira às 14h ou sexta-feira às 10h. Qual prefere?",
        time: "14:32",
      },
      { id: "m3", sender: "patient", content: "Quinta às 14h vai ser perfeito!", time: "14:33" },
      {
        id: "m4",
        sender: "ai",
        content:
          "✅ Agendado! Limpeza e profilaxia, quinta-feira 08/05/2026 às 14h. Vou te enviar um lembrete um dia antes. Posso ajudar com mais alguma coisa?",
        time: "14:33",
      },
      { id: "m5", sender: "patient", content: "Perfeito, confirmo quinta às 14h!", time: "14:34" },
    ],
  },
  {
    id: "c2",
    patient: {
      id: "p2",
      name: "João Pedro Almeida",
      phone: "+55 48 99123-4567",
      email: "joaopedro@email.com",
      history: [],
    },
    preview: "Oi, vocês atendem convênio Unimed?",
    time: "5 min",
    unread: 1,
    handledBy: "ai",
    status: "online",
    messages: [
      {
        id: "m1",
        sender: "patient",
        content: "Oi, vocês atendem convênio Unimed?",
        time: "14:28",
      },
      {
        id: "m2",
        sender: "ai",
        content:
          "Olá! Atendemos sim a Unimed para os procedimentos de limpeza, restauração e avaliação. Para outros tratamentos, posso te passar valores particulares. Qual seria seu interesse?",
        time: "14:28",
      },
    ],
  },
  {
    id: "c3",
    patient: {
      id: "p3",
      name: "Ana Lúcia Pereira",
      phone: "+55 48 98765-1122",
      email: "analucia.p@email.com",
      birthDate: "1985-08-22",
      notes: "Tratamento ortodôntico em andamento. Ajustes mensais.",
      history: [
        { id: "h1", procedure: "Ajuste ortodôntico", date: "10/04/2026", status: "completed" },
        { id: "h2", procedure: "Ajuste ortodôntico", date: "10/05/2026", status: "scheduled" },
      ],
    },
    preview: "Preciso remarcar minha consulta de quinta...",
    time: "12 min",
    unread: 0,
    handledBy: "attendant",
    status: "offline",
    messages: [
      {
        id: "m1",
        sender: "patient",
        content: "Oi, preciso remarcar minha consulta de quinta",
        time: "14:21",
      },
      {
        id: "m2",
        sender: "ai",
        content:
          "Sem problemas, Ana! Posso te oferecer: terça 13/05 às 14h, quarta 14/05 às 10h ou sexta 16/05 às 16h. Algum desses funciona?",
        time: "14:21",
      },
      {
        id: "m3",
        sender: "patient",
        content: "Hmm, nenhum desses. Pode ser semana que vem?",
        time: "14:23",
      },
      {
        id: "m4",
        sender: "attendant",
        content:
          "Oi Ana, aqui é a Camila. Vou olhar a agenda da semana que vem com você direto. Pode me ligar quando puder?",
        time: "14:25",
      },
    ],
  },
  {
    id: "c4",
    patient: {
      id: "p4",
      name: "Roberto Lima",
      phone: "+55 48 99555-2233",
      history: [
        { id: "h1", procedure: "Implante - 1ª etapa", date: "20/03/2026", status: "completed" },
      ],
    },
    preview: "Obrigado, até quinta!",
    time: "1 h",
    unread: 0,
    handledBy: "ai",
    status: "offline",
    messages: [
      {
        id: "m1",
        sender: "patient",
        content: "Bom dia! Queria confirmar minha consulta de quinta de retorno do implante",
        time: "13:10",
      },
      {
        id: "m2",
        sender: "ai",
        content:
          "Bom dia, Roberto! Sua consulta está confirmada para quinta-feira 08/05/2026 às 16h, com o Dr. Paulo. Implante - retorno e avaliação.",
        time: "13:10",
      },
      { id: "m3", sender: "patient", content: "Obrigado, até quinta!", time: "13:11" },
    ],
  },
  {
    id: "c5",
    patient: {
      id: "p5",
      name: "Patrícia Mendes",
      phone: "+55 48 98888-1010",
      email: "patricia.m@email.com",
      history: [],
    },
    preview: "Quanto custa um clareamento?",
    time: "2 h",
    unread: 0,
    handledBy: "ai",
    status: "offline",
    messages: [
      {
        id: "m1",
        sender: "patient",
        content: "Olá, quanto custa um clareamento dental aí?",
        time: "12:14",
      },
      {
        id: "m2",
        sender: "ai",
        content:
          "Olá! Temos duas opções de clareamento:\n\n• Clareamento caseiro com moldeiras: R$ 800\n• Clareamento a laser (em consultório): R$ 1.500\n\nIncluem avaliação inicial e acompanhamento. Quer agendar uma avaliação sem custo para conversarmos?",
        time: "12:14",
      },
      { id: "m3", sender: "patient", content: "Vou pensar e volto a falar, obrigada!", time: "12:18" },
      {
        id: "m4",
        sender: "ai",
        content: "Claro, Patrícia! Estou aqui sempre que precisar. 😊",
        time: "12:18",
      },
    ],
  },
];
