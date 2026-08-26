import type { RadarSearchConfig } from "../config";

/**
 * TED expert-query construction.
 *
 * Kept free of I/O so the exact query string can be asserted in tests. The
 * descriptive field names are used rather than the short aliases (PC, PD)
 * because TED documents aliases as interchangeable but only guarantees the
 * descriptive names to stay readable in application code.
 */

/** TED expects publication dates as YYYYMMDD. */
export function tedDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function sanitizeCode(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "");
}

export function buildTedQuery(config: RadarSearchConfig, now: Date = new Date()): string {
  const cpv = [...new Set(config.cpvCodes.map(sanitizeCode).filter(Boolean))];
  if (!cpv.length) {
    throw new Error("Radar axtarışı üçün ən azı bir CPV kodu lazımdır.");
  }

  const clauses: string[] = [`classification-cpv IN (${cpv.join(" ")})`];

  const lookback = Math.max(1, Math.min(365, Math.trunc(config.lookbackDays)));
  const from = new Date(now.getTime() - lookback * 24 * 60 * 60 * 1000);
  clauses.push(`publication-date = (${tedDate(from)} <> ${tedDate(now)})`);

  const countries = [...new Set(config.countryFilter.map(sanitizeCode).filter(Boolean))];
  if (countries.length) {
    clauses.push(`buyer-country IN (${countries.join(" ")})`);
  }

  return clauses.join(" AND ");
}

/**
 * Fields confirmed against the published TED v3 request example. The client
 * falls back to this list when the API rejects an optional field.
 */
export const TED_CORE_FIELDS = [
  "publication-number",
  "publication-date",
  "notice-identifier",
  "notice-version",
  "procedure-identifier",
  "form-type",
  "notice-type",
  "official-language",
  "notice-title",
  "buyer-name",
  "buyer-country",
  "classification-cpv",
  "deadline-receipt-tender-date-lot",
] as const;

/** Useful but less certain; dropped automatically if TED reports them unknown. */
export const TED_OPTIONAL_FIELDS = ["total-value", "total-value-cur", "place-of-performance"] as const;

/**
 * TED budgets `size(set(fields) ∪ {publication-number, links}) × limit` at
 * 10,000 cells per page and caps `limit` at 250.
 */
export function resolvePageLimit(fields: string[], requested: number) {
  const effective = new Set([...fields, "publication-number", "links"]).size;
  const budget = Math.floor(10000 / Math.max(1, effective));
  return Math.max(1, Math.min(250, budget, Math.trunc(requested) || 1));
}

export function buildTedFields(config: RadarSearchConfig, includeOptional: boolean) {
  const fields = new Set<string>(TED_CORE_FIELDS);
  if (includeOptional) {
    for (const field of TED_OPTIONAL_FIELDS) fields.add(field);
    for (const field of config.extraFields) {
      const clean = field.trim();
      if (clean) fields.add(clean);
    }
  }
  return [...fields];
}
