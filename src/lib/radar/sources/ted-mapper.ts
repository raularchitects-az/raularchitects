import type { SourceOpportunity } from "../types";

/**
 * Maps a raw TED v3 notice into the normalized shape.
 *
 * TED returns multilingual objects, per-lot arrays and a nested links map, so
 * every reader here is defensive: when a value is missing or has an unexpected
 * shape the field becomes null rather than a guess. The untouched notice is
 * always preserved in `raw` so the admin UI can show official facts separately
 * from anything the radar derived.
 */

export type TedNotice = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number") return String(value);
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Picks text from a `language -> string` or `language -> string[]` object,
 * preferring the notice's own official language over a translation.
 */
export function pickLocalized(value: unknown, officialLanguages: string[]): string | null {
  const direct = asString(value);
  if (direct) return direct;
  if (!isRecord(value)) {
    const first = asArray(value).map(asString).find(Boolean);
    return first ?? null;
  }

  const order = [...officialLanguages.map((code) => code.toUpperCase()), "ENG", "DEU", "FRA"];
  for (const key of order) {
    const candidate = value[key] ?? value[key.toLowerCase()];
    const text = asString(candidate) ?? asArray(candidate).map(asString).find(Boolean);
    if (text) return text;
  }
  for (const candidate of Object.values(value)) {
    const text = asString(candidate) ?? asArray(candidate).map(asString).find(Boolean);
    if (text) return text;
  }
  return null;
}

/** TED dates arrive either as ISO strings or as compact YYYYMMDD. */
export function parseTedDate(value: unknown): string | null {
  const raw = asString(value);
  if (!raw) return null;
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/**
 * Lot deadlines are a flat list that cannot be reliably matched to a lot, so
 * the earliest officially supplied date is used and every value is kept in
 * `raw`. Nothing is synthesised when the list is empty.
 */
export function earliestDeadline(value: unknown): string | null {
  const candidates = asArray(value)
    .map(parseTedDate)
    .filter((item): item is string => Boolean(item))
    .map((item) => new Date(item))
    .filter((item) => !Number.isNaN(item.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  return candidates.length ? candidates[0]!.toISOString() : null;
}

export function pickNoticeUrl(links: unknown, publicationNumber: string): string {
  if (isRecord(links)) {
    // links is format -> language -> url
    for (const format of ["html", "htmlDirect", "pdf", "pdfSigned", "xml"]) {
      const byLanguage = links[format];
      if (!isRecord(byLanguage)) {
        const direct = asString(byLanguage);
        if (direct) return direct;
        continue;
      }
      for (const key of ["ENG", "eng", "MUL", "DEU", "deu"]) {
        const url = asString(byLanguage[key]);
        if (url) return url;
      }
      const first = Object.values(byLanguage).map(asString).find(Boolean);
      if (first) return first;
    }
  }
  // Documented notice route; only reached when TED omits the links object.
  return `https://ted.europa.eu/en/notice/${encodeURIComponent(publicationNumber)}/html`;
}

function parseAmount(value: unknown): number | null {
  const candidates = asArray(value);
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
    const text = asString(candidate);
    if (!text) continue;
    const numeric = Number(text.replace(/[^0-9.,-]/g, "").replace(/,/g, "."));
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return null;
}

export function mapTedNotice(notice: TedNotice): SourceOpportunity | null {
  const publicationNumber = asString(notice["publication-number"]);
  if (!publicationNumber) return null;

  const languages = asArray(notice["official-language"])
    .map(asString)
    .filter((item): item is string => Boolean(item));

  const title = pickLocalized(notice["notice-title"], languages);
  if (!title) return null;

  const cpvCodes = [
    ...new Set(
      asArray(notice["classification-cpv"])
        .map(asString)
        .filter((item): item is string => Boolean(item)),
    ),
  ];

  const country =
    asString(asArray(notice["buyer-country"])[0]) ??
    pickLocalized(notice["buyer-country"], languages);

  return {
    sourceId: "ted",
    sourceRef: publicationNumber,
    // TED Search is notice-based; lot-level identity is not reliable here.
    sourceLot: "",
    sourceUrl: pickNoticeUrl(notice["links"], publicationNumber),
    procedureRef: asString(notice["procedure-identifier"]),
    noticeVersion: asString(notice["notice-version"]),
    title,
    buyerName: pickLocalized(notice["buyer-name"], languages),
    country: country ? country.toUpperCase() : null,
    city: pickLocalized(notice["place-of-performance"], languages),
    cpvCodes,
    publishedAt: parseTedDate(notice["publication-date"]),
    deadlineAt: earliestDeadline(notice["deadline-receipt-tender-date-lot"]),
    valueAmount: parseAmount(notice["total-value"]),
    valueCurrency: asString(asArray(notice["total-value-cur"])[0]),
    formType: pickLocalized(notice["form-type"], languages),
    noticeType: pickLocalized(notice["notice-type"], languages),
    languages,
    // The TED field projection carries no description, and nothing is invented
    // to fill the gap.
    summary: null,
    crossSourceRefs: [],
    raw: notice,
  };
}

export function mapTedNotices(notices: unknown): SourceOpportunity[] {
  return asArray(notices)
    .filter(isRecord)
    .map(mapTedNotice)
    .filter((item): item is SourceOpportunity => item !== null);
}
