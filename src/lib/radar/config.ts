import { CPV_FAMILIES } from "./taxonomy";

/**
 * Pure radar configuration: types and defaults with no database or framework
 * dependency, so the whole discovery pipeline can be exercised outside Next.js
 * (see self-check.ts). `settings.ts` layers Supabase persistence on top.
 */

export const RADAR_SETTINGS_KEYS = {
  taxonomy: "radar.taxonomy",
  eligibility: "radar.eligibility",
  search: "radar.search",
  alerts: "radar.alerts",
} as const;

export type RadarSearchConfig = {
  /** Publication-date window sent to the source, in days. */
  lookbackDays: number;
  /** Notices per page. The source contract allows 1–250. */
  pageLimit: number;
  maxPages: number;
  scope: "ACTIVE" | "LATEST" | "ALL";
  onlyLatestVersions: boolean;
  cpvCodes: string[];
  /** Optional extra source fields; unknown names are dropped on retry. */
  extraFields: string[];
  /** ISO3 codes. Empty means every country the source returns. */
  countryFilter: string[];
};

export type RadarAlertConfig = {
  enabled: boolean;
  /**
   * Empty means "do not send". The recipient is never guessed; it must be set
   * in Advanced Settings or through RADAR_ALERT_TO_EMAIL.
   */
  recipient: string;
  minScore: number;
  urgentWithinDays: number;
};

export const DEFAULT_SEARCH: RadarSearchConfig = {
  lookbackDays: 21,
  pageLimit: 100,
  maxPages: 5,
  scope: "ACTIVE",
  onlyLatestVersions: true,
  cpvCodes: CPV_FAMILIES.map((family) => family.code),
  extraFields: [],
  countryFilter: [],
};

export const DEFAULT_ALERTS: RadarAlertConfig = {
  enabled: true,
  recipient: "",
  minScore: 80,
  urgentWithinDays: 7,
};
