/**
 * Minimal CSV serializer — RFC 4180-ish:
 * - Always quotes fields that contain comma, quote, newline, or leading/trailing spaces
 * - Escapes inner quotes by doubling them
 * - Prepends UTF-8 BOM so Excel pt-BR opens accented characters correctly
 */

const NEEDS_QUOTE = /[",\n\r]/;

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (NEEDS_QUOTE.test(s) || s.startsWith(" ") || s.endsWith(" ")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV(
  rows: Record<string, unknown>[],
  columns: { key: string; header: string }[],
): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(",");
  const bodyLines = rows.map((r) =>
    columns.map((c) => escapeCell(r[c.key])).join(","),
  );
  const bom = "﻿";
  return bom + [headerLine, ...bodyLines].join("\r\n");
}
