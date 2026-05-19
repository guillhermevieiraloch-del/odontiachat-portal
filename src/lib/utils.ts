import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formata um telefone (BR ou internacional) de forma humana.
 *  - "5548999998888"  → "+55 (48) 99999-8888"
 *  - "16050393485399" → "+1 (605) 0393485399" (fallback genérico, números longos)
 *  - "48999998888"    → "(48) 99999-8888"
 */
export function formatPhoneBR(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");

  // BR with country code (5548...)
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    if (rest.length === 9) return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  // BR without country code (48999998888)
  if (digits.length === 11 || digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  // International — try +CC then group
  if (digits.length > 10) {
    const cc = digits.slice(0, digits.length - 10);
    const ddd = digits.slice(-10, -7);
    const part1 = digits.slice(-7, -4);
    const part2 = digits.slice(-4);
    return `+${cc} (${ddd}) ${part1}-${part2}`;
  }

  return raw;
}
