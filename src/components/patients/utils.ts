import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatRelativeBR(dateStr: string): string {
  const date = new Date(dateStr);
  const days = differenceInDays(new Date(), date);

  if (days < 0) {
    if (days === -1) return "amanhã";
    if (days >= -7) return `em ${Math.abs(days)} dias`;
    return format(date, "dd 'de' MMM", { locale: ptBR });
  }
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  if (days < 30) return `há ${Math.floor(days / 7)} sem`;
  if (days < 365) return `há ${Math.floor(days / 30)} mês${days >= 60 ? "es" : ""}`;
  return format(date, "dd/MM/yyyy");
}

export function formatDateBR(dateStr: string): string {
  return format(new Date(dateStr), "dd/MM/yyyy");
}

export function formatCurrencyBR(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
