import type { SourceOpportunity } from "../types";
import { simapProjectUrl, toAlpha3 } from "./simap-query";

/**
 * Maps official simap.ch responses into the normalized radar shape.
 *
 * A simap opportunity is assembled from two official documents: the
 * project-search entry (identity, lots, address) and the publication detail
 * (deadline, CPV, description, contracting office). Both are kept verbatim in
 * `raw`, and every reader here is defensive — a missing value becomes null
 * instead of a guess.
 */

export type SimapTranslation = Record<string, unknown>;
export type SimapSearchEntry = Record<string, unknown>;
export type SimapPublicationDetail = Record<string, unknown>;

/** How much of the official description is handed to the scorer. */
const SUMMARY_LIMIT = 1200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

/**
 * simap publishes every translatable field as `{ de, fr, it, en }` with nulls
 * for languages the buyer did not supply. The notice's own creation language
 * comes first so the official wording is preserved rather than a summary
 * translation.
 */
export function pickSimapText(value: unknown, preferred: string[] = []): string | null {
  const direct = asString(value);
  if (direct) return direct;
  if (!isRecord(value)) return null;

  const order = [...preferred.map((code) => code.toLowerCase()), "de", "fr", "it", "en"];
  for (const key of order) {
    const text = asString(value[key]);
    if (text) return text;
  }
  for (const candidate of Object.values(value)) {
    const text = asString(candidate);
    if (text) return text;
  }
  return null;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Descriptions arrive as stored rich text; only the words are of interest. */
export function stripHtml(value: string | null): string | null {
  if (!value) return null;
  const text = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

export function parseSimapDate(value: unknown): string | null {
  const raw = asString(value);
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/**
 * Swiss notices above the WTO threshold are published on TED as well. The
 * official TED link simap returns carries the TED publication number, which is
 * what lets discovery recognise the same tender arriving from two sources.
 */
export function tedNoticeRefFromUrl(url: string | null): string | null {
  if (!url) return null;
  const fromUdl = /TED:NOTICE:(\d+-\d{4})/i.exec(url);
  if (fromUdl?.[1]) return fromUdl[1];
  const fromPath = /notice\/(\d+-\d{4})/i.exec(url);
  return fromPath?.[1] ?? null;
}

function collectCpvCodes(detail: SimapPublicationDetail, lot: Record<string, unknown> | null): string[] {
  const base = isRecord(detail["base"]) ? detail["base"] : {};
  const procurement = isRecord(detail["procurement"]) ? detail["procurement"] : {};

  const readCode = (value: unknown): string | null => {
    if (isRecord(value)) return asString(value["code"]);
    return asString(value);
  };

  const codes = [
    readCode(base["cpvCode"]),
    ...asArray(procurement["additionalCpvCodes"]).map(readCode),
    ...(lot ? [readCode(lot["cpvCode"])] : []),
  ];

  return [...new Set(codes.filter((code): code is string => Boolean(code)))];
}

/** "Zürich (ZH)" when both are published, otherwise whichever one is. */
export function formatSimapLocation(address: unknown, preferred: string[] = []): string | null {
  if (!isRecord(address)) return null;
  const city = pickSimapText(address["city"], preferred);
  const canton = asString(address["cantonId"]);
  if (city && canton) return `${city} (${canton})`;
  return city ?? canton;
}

function readLanguages(detail: SimapPublicationDetail): string[] {
  const info = isRecord(detail["project-info"]) ? detail["project-info"] : {};
  const offer = asArray(info["offerLanguages"]).map(asString).filter((code): code is string => Boolean(code));
  if (offer.length) return offer;
  return asArray(info["publicationLanguages"]).map(asString).filter((code): code is string => Boolean(code));
}

/**
 * Builds one opportunity per lot when the project is divided, otherwise a
 * single one. The lot list comes from the search entry, which is the document
 * that officially describes how a project is split.
 */
export function mapSimapPublication(
  entry: SimapSearchEntry,
  detail: SimapPublicationDetail,
): SourceOpportunity[] {
  const base = isRecord(detail["base"]) ? detail["base"] : {};
  const info = isRecord(detail["project-info"]) ? detail["project-info"] : {};
  const dates = isRecord(detail["dates"]) ? detail["dates"] : {};
  const procurement = isRecord(detail["procurement"]) ? detail["procurement"] : {};

  const projectId = asString(base["projectId"]) ?? asString(entry["id"]);
  const projectNumber = asString(base["projectNumber"]) ?? asString(entry["projectNumber"]);
  if (!projectId || !projectNumber) return [];

  const creationLanguage = asString(base["creationLanguage"]);
  const preferred = creationLanguage ? [creationLanguage] : [];

  const title = pickSimapText(base["title"], preferred) ?? pickSimapText(entry["title"], preferred);
  if (!title) return [];

  const procOffice = isRecord(info["procOfficeAddress"]) ? info["procOfficeAddress"] : null;
  const buyerName =
    (procOffice ? pickSimapText(procOffice["name"], preferred) : null) ??
    pickSimapText(entry["procOfficeName"], preferred);

  const publicationNumber = asString(base["publicationNumber"]) ?? asString(entry["publicationNumber"]);
  const publishedAt = parseSimapDate(base["publicationDate"] ?? entry["publicationDate"]);
  const deadlineAt = parseSimapDate(dates["offerDeadline"]);
  const languages = readLanguages(detail);
  const summary = stripHtml(pickSimapText(procurement["orderDescription"], preferred))?.slice(0, SUMMARY_LIMIT) ?? null;

  const tedBlock = isRecord(detail["ted"]) ? detail["ted"] : null;
  const tedRef = tedNoticeRefFromUrl(tedBlock ? asString(tedBlock["url"]) : null);

  const sourceUrl = simapProjectUrl(projectId, creationLanguage ?? "de");
  const raw: Record<string, unknown> = { search: entry, detail };

  const projectAddress = isRecord(entry["orderAddress"])
    ? entry["orderAddress"]
    : isRecord(procurement["orderAddress"])
      ? procurement["orderAddress"]
      : (procOffice ?? null);

  const buildOne = (
    lot: Record<string, unknown> | null,
    detailLot: Record<string, unknown> | null,
  ): SourceOpportunity => {
    const lotNumber = lot ? (asString(lot["lotNumber"]) ?? asString(lot["lotId"])) : null;
    const lotTitle = lot ? pickSimapText(lot["lotTitle"], preferred) : null;
    const lotDeadline = detailLot ? parseSimapDate(detailLot["offerDeadline"]) : null;
    const address = lot && isRecord(lot["orderAddress"]) ? lot["orderAddress"] : projectAddress;

    return {
      sourceId: "simap",
      // The project number is the identity that survives corrections; the
      // publication number changes every time a new version is published and
      // is therefore recorded as the version instead.
      sourceRef: projectNumber,
      sourceLot: lotNumber ?? "",
      sourceUrl,
      procedureRef: projectId,
      noticeVersion: publicationNumber,
      title: lotTitle ? `${title} — ${lotTitle}` : title,
      buyerName,
      country: toAlpha3(isRecord(address) ? asString(address["countryId"]) : null) ?? "CHE",
      city: formatSimapLocation(address, preferred),
      cpvCodes: collectCpvCodes(detail, detailLot),
      publishedAt,
      deadlineAt: lotDeadline ?? deadlineAt,
      // simap tender publications do not carry a contract value; only award
      // publications do, and those are filtered out before this point.
      valueAmount: null,
      valueCurrency: null,
      formType: asString(base["type"]) ?? asString(entry["pubType"]),
      noticeType: asString(entry["projectSubType"]) ?? asString(base["projectType"]),
      languages,
      summary,
      crossSourceRefs: tedRef ? [tedRef] : [],
      raw,
    };
  };

  const lots = asArray(entry["lots"]).filter(isRecord);
  if (!lots.length) return [buildOne(null, null)];

  const detailLots = asArray(base["lots"]).filter(isRecord);
  return lots.map((lot) => {
    const lotId = asString(lot["lotId"]);
    const match = detailLots.find((candidate) => asString(candidate["lotId"]) === lotId) ?? null;
    return buildOne(lot, match);
  });
}
