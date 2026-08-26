import type { RadarSearchConfig } from "../config";

/**
 * Pure query construction for the official simap.ch read API.
 *
 * Kept free of I/O so the exact request the radar would send can be asserted
 * in the self-check without touching the network.
 *
 * Reference: the OpenAPI 3 document simap.ch publishes at
 * https://www.simap.ch/api/specifications/simap.yaml (docs: /api-doc).
 */

export const SIMAP_API_BASE = "https://www.simap.ch/api";
export const SIMAP_SEARCH_PATH = "/publications/v2/project/project-search";

export function simapDetailPath(projectId: string, publicationId: string) {
  return `/publications/v1/project/${encodeURIComponent(projectId)}/publication-details/${encodeURIComponent(publicationId)}`;
}

/**
 * The endpoint rejects a search that has neither a search term nor a
 * quick-filter, so `projectSubTypes` is always sent. These are the sub-types an
 * architecture practice can actually bid on: ordinary service mandates plus the
 * competition and study-contract forms Swiss law uses for design procurement.
 * `construction` and `supply` are left out on purpose — those are works and
 * goods contracts.
 */
export const SIMAP_PROJECT_SUB_TYPES = [
  "service",
  "project_competition",
  "idea_competition",
  "overall_performance_competition",
  "project_study",
  "idea_study",
  "overall_performance_study",
] as const;

/**
 * Only publication types that can still be responded to. Awards, abandonments
 * and revocations describe finished procedures and are never opportunities.
 */
export const SIMAP_PUB_TYPES = ["tender", "competition", "study_contract"] as const;

/** ISO 3166-1 alpha-2 codes simap uses, mapped to the alpha-3 codes TED uses. */
const ALPHA2_TO_ALPHA3: Record<string, string> = {
  CH: "CHE",
  LI: "LIE",
  DE: "DEU",
  AT: "AUT",
  FR: "FRA",
  IT: "ITA",
};

export function toAlpha3(code: string | null): string | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  if (!upper) return null;
  if (upper.length === 3) return upper;
  return ALPHA2_TO_ALPHA3[upper] ?? upper;
}

export function simapDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** simap validates CPV codes as full 8-digit codes; shorter prefixes are a 400. */
export function eightDigitCpvCodes(codes: string[]) {
  return [...new Set(codes.map((code) => code.replace(/\D/g, "")).filter((code) => code.length === 8))];
}

/**
 * Switzerland is the only country simap publishes, so a country filter that
 * excludes it means this source has nothing to contribute this run.
 */
export function simapCoversConfiguredCountries(config: RadarSearchConfig) {
  if (!config.countryFilter.length) return true;
  return config.countryFilter.some((code) => {
    const upper = code.trim().toUpperCase();
    return upper === "CHE" || upper === "CH";
  });
}

export function buildSimapSearchParams(
  config: RadarSearchConfig,
  now: Date,
  lastItem?: string | null,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const subType of SIMAP_PROJECT_SUB_TYPES) params.append("projectSubTypes", subType);
  for (const pubType of SIMAP_PUB_TYPES) params.append("newestPubTypes", pubType);
  for (const code of eightDigitCpvCodes(config.cpvCodes)) params.append("cpvCodes", code);

  // Discovery stays inside Switzerland: this is the Swiss national platform and
  // the country is what the radar already scores against.
  params.set("orderAddressCountryOnlySwitzerland", "true");

  const from = new Date(now.getTime() - Math.max(1, config.lookbackDays) * 86400000);
  params.set("newestPublicationFrom", simapDate(from));

  if (lastItem) params.set("lastItem", lastItem);

  return params;
}

export function simapSearchUrl(config: RadarSearchConfig, now: Date, lastItem?: string | null) {
  return `${SIMAP_API_BASE}${SIMAP_SEARCH_PATH}?${buildSimapSearchParams(config, now, lastItem).toString()}`;
}

/**
 * The public project page on simap.ch. It is only ever handed to an admin to
 * click — the radar never requests it, because simap's robots.txt disallows the
 * per-language `project-detail` route for automated clients.
 */
export function simapProjectUrl(projectId: string, language = "de") {
  const lang = ["de", "fr", "it", "en"].includes(language) ? language : "de";
  return `https://www.simap.ch/${lang}/project-detail/${projectId}`;
}
