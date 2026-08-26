import { createAdminClient } from "@/lib/cms/supabase";
import {
  DEFAULT_ALERTS,
  DEFAULT_SEARCH,
  RADAR_SETTINGS_KEYS,
  type RadarAlertConfig,
  type RadarSearchConfig,
} from "./config";
import { DEFAULT_ELIGIBILITY, type EligibilityProfile } from "./eligibility";
import { DEFAULT_TAXONOMY, type RadarTaxonomy } from "./taxonomy";

export { DEFAULT_ALERTS, DEFAULT_SEARCH, RADAR_SETTINGS_KEYS };
export type { RadarAlertConfig, RadarSearchConfig };

export type RadarSettings = {
  taxonomy: RadarTaxonomy;
  eligibility: EligibilityProfile;
  search: RadarSearchConfig;
  alerts: RadarAlertConfig;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Shallow merge: a stored partial overrides only the keys it actually sets. */
function merge<T extends Record<string, unknown>>(fallback: T, stored: unknown): T {
  if (!isRecord(stored)) return fallback;
  const out = { ...fallback } as Record<string, unknown>;
  for (const [key, value] of Object.entries(stored)) {
    if (value === undefined || value === null) continue;
    if (!(key in fallback)) continue;
    out[key] = value;
  }
  return out as T;
}

export function alertRecipient(config: RadarAlertConfig) {
  const fromSettings = config.recipient?.trim();
  if (fromSettings) return fromSettings;
  return process.env["RADAR_ALERT_TO_EMAIL"]?.trim() || "";
}

export async function getRadarSettings(): Promise<RadarSettings> {
  const fallback: RadarSettings = {
    taxonomy: DEFAULT_TAXONOMY,
    eligibility: DEFAULT_ELIGIBILITY,
    search: DEFAULT_SEARCH,
    alerts: DEFAULT_ALERTS,
  };

  const supabase = await createAdminClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase.from("radar_settings").select("key, value");
  if (error) {
    console.error("[radar] settings read", error.code, error.message);
    return fallback;
  }

  const byKey = new Map((data ?? []).map((row) => [String(row.key), row.value]));
  const read = <T>(key: string, base: T) =>
    merge(base as unknown as Record<string, unknown>, byKey.get(key)) as unknown as T;

  return {
    taxonomy: read(RADAR_SETTINGS_KEYS.taxonomy, DEFAULT_TAXONOMY),
    eligibility: read(RADAR_SETTINGS_KEYS.eligibility, DEFAULT_ELIGIBILITY),
    search: read(RADAR_SETTINGS_KEYS.search, DEFAULT_SEARCH),
    alerts: read(RADAR_SETTINGS_KEYS.alerts, DEFAULT_ALERTS),
  };
}

export async function saveRadarSetting(key: string, value: Record<string, unknown>) {
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase
    .from("radar_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message || "Radar ayarı yazılmadı");
}
