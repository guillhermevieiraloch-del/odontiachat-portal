// Types and constants for AI configuration (real data comes from the DB
// via /configuracoes/ia server component).

export type Tone = "formal" | "casual" | "acolhedor";

export interface AIProcedure {
  id: string;
  name: string;
  duration: number;
  price: number;
  acceptsInsurance: boolean;
  showPrice: boolean;
}

export interface AIConfig {
  tone: Tone;
  greeting: string;
  outOfHoursMsg: string;
  farewell: string;
  useEmojis: boolean;
  description: string;
  specialties: string[];
  acceptedInsurance: string[];
  paymentMethods: string[];
  procedures: AIProcedure[];
  triageQuestions: string[];
  escalationKeywords: string[];
}

export const PROCEDURE_SUGGESTIONS = [
  { name: "Limpeza e profilaxia", duration: 60, price: 180 },
  { name: "Avaliação inicial", duration: 30, price: 0 },
  { name: "Clareamento dental", duration: 90, price: 800 },
  { name: "Restauração", duration: 60, price: 250 },
  { name: "Canal", duration: 90, price: 1200 },
  { name: "Implante - 1ª etapa", duration: 90, price: 2500 },
  { name: "Ajuste ortodôntico", duration: 30, price: 150 },
  { name: "Extração simples", duration: 45, price: 350 },
];

export const COMMON_INSURANCES = [
  "Unimed",
  "Bradesco Saúde",
  "Amil",
  "SulAmérica",
  "Hapvida",
  "NotreDame Intermédica",
  "Porto Seguro Saúde",
  "Allianz Saúde",
];

export const COMMON_PAYMENT_METHODS = [
  "Dinheiro",
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Boleto",
  "Parcelamento próprio",
];

export const ESCALATION_SUGGESTIONS = [
  "dor forte",
  "emergência",
  "reclamação",
  "advogado",
  "urgente",
  "sangramento",
  "trauma",
  "acidente",
];

export const TRIAGE_SUGGESTIONS = [
  "Você está sentindo dor agora?",
  "É sua primeira consulta?",
  "Tem alguma alergia ou condição médica?",
  "Está com convênio? Qual?",
  "Como soube da clínica?",
];
