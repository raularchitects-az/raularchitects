"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/cms/auth";
import { createAdminClient } from "@/lib/cms/supabase";
import { runAllSources, runDiscovery } from "./discovery";
import { DEFAULT_ELIGIBILITY } from "./eligibility";
import { runSourceSelfCheck, type SelfCheckResult } from "./self-check";
import {
  DEFAULT_ALERTS,
  DEFAULT_SEARCH,
  RADAR_SETTINGS_KEYS,
  getRadarSettings,
  saveRadarSetting,
} from "./settings";
import { DEFAULT_TAXONOMY, PROJECT_TYPES } from "./taxonomy";
import type { OpportunityState } from "./types";

/**
 * Mirrors the CMS audit helper. Radar writes are recorded in the same
 * `audit_logs` table so staff activity stays in one place, but no CMS content
 * row is ever touched.
 */
async function radarAudit(action: string, entityId: string | null, summary: string, after?: unknown) {
  const { user } = await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) return;
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    entity_type: "radar",
    entity_id: entityId,
    summary,
    before: null,
    after: after ?? null,
  });
}

function refresh() {
  revalidatePath("/admin/radar");
  revalidatePath("/admin/radar/advanced");
}

async function setState(id: string, state: OpportunityState, summary: string) {
  const { user } = await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase
    .from("radar_opportunities")
    .update({
      state,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message || "Status yenilənmədi");
  await radarAudit("radar_state", id, summary, { state });
  refresh();
  revalidatePath(`/admin/radar/${id}`);
}

export async function markReviewLater(id: string) {
  await setState(id, "review_later", "İmkan sonraya saxlanıldı");
}

export async function markNotRelevant(id: string) {
  await setState(id, "not_relevant", "İmkan uyğun deyil olaraq işarələndi");
}

export async function restoreOpportunity(id: string) {
  await setState(id, "active", "İmkan aktiv siyahıya qaytarıldı");
}

/** Without a source id every enabled official source runs, exactly like the schedule. */
export async function runRadarNow(sourceId?: string) {
  await requireStaff();
  const result = sourceId
    ? await runDiscovery({ trigger: "manual", sourceId })
    : await runAllSources({ trigger: "manual" });
  await radarAudit("radar_run", result.runId, `Manual axtarış: ${result.status}`, {
    created: result.created,
    updated: result.updated,
    archived: result.archived,
    error: result.error,
  });
  refresh();
  return result;
}

export async function toggleRadarSource(id: string, enabled: boolean) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase
    .from("radar_sources")
    .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message || "Mənbə yenilənmədi");
  await radarAudit("radar_source", id, `${id} mənbəyi ${enabled ? "aktiv" : "söndürülmüş"} edildi`);
  refresh();
}

export async function runRadarSelfCheckAction(): Promise<SelfCheckResult[]> {
  await requireStaff();
  return runSourceSelfCheck();
}

// --- Settings ------------------------------------------------------------

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function tokens(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function integer(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveRadarSearchSettings(formData: FormData) {
  await requireStaff();
  const scope = String(formData.get("scope") ?? "ACTIVE");
  const value = {
    lookbackDays: Math.max(1, Math.min(365, integer(formData.get("lookbackDays"), DEFAULT_SEARCH.lookbackDays))),
    pageLimit: Math.max(1, Math.min(250, integer(formData.get("pageLimit"), DEFAULT_SEARCH.pageLimit))),
    maxPages: Math.max(1, Math.min(20, integer(formData.get("maxPages"), DEFAULT_SEARCH.maxPages))),
    scope: scope === "LATEST" || scope === "ALL" ? scope : "ACTIVE",
    onlyLatestVersions: formData.get("onlyLatestVersions") === "on",
    cpvCodes: tokens(formData.get("cpvCodes")),
    countryFilter: tokens(formData.get("countryFilter")).map((code) => code.toUpperCase()),
    extraFields: tokens(formData.get("extraFields")),
  };
  if (!value.cpvCodes.length) throw new Error("Ən azı bir CPV kodu lazımdır.");
  await saveRadarSetting(RADAR_SETTINGS_KEYS.search, value);
  await radarAudit("radar_settings", RADAR_SETTINGS_KEYS.search, "Axtarış profili yeniləndi", value);
  refresh();
}

export async function saveRadarEligibilitySettings(formData: FormData) {
  await requireStaff();
  const validTypes = new Set(PROJECT_TYPES.map((type) => type.key));

  const countryPriorities = lines(formData.get("countryPriorities"))
    .map((line) => {
      const [code, label, weight] = line.split(":").map((part) => part.trim());
      if (!code) return null;
      return {
        code: code.toUpperCase(),
        label: label || code.toUpperCase(),
        weight: Number.isFinite(Number(weight)) ? Number(weight) : 5,
      };
    })
    .filter((item): item is { code: string; label: string; weight: number } => item !== null);

  const value = {
    countryPriorities: countryPriorities.length ? countryPriorities : DEFAULT_ELIGIBILITY.countryPriorities,
    otherEuropeWeight: integer(formData.get("otherEuropeWeight"), DEFAULT_ELIGIBILITY.otherEuropeWeight),
    supportedServices: lines(formData.get("supportedServices")),
    submissionLanguages: tokens(formData.get("submissionLanguages")).map((code) => code.toLowerCase()),
    hasLocalPartnerNetwork: formData.get("hasLocalPartnerNetwork") === "on",
    targetProjectTypes: tokens(formData.get("targetProjectTypes")).filter((key) => validTypes.has(key as never)),
    minValueEur: optionalNumber(formData.get("minValueEur")),
    idealValueEur: optionalNumber(formData.get("idealValueEur")),
    portfolioCategories: lines(formData.get("portfolioCategories")),
    licenceLimitations: lines(formData.get("licenceLimitations")),
  };

  await saveRadarSetting(RADAR_SETTINGS_KEYS.eligibility, value);
  await radarAudit("radar_settings", RADAR_SETTINGS_KEYS.eligibility, "Uyğunluq profili yeniləndi", value);
  refresh();
}

export async function saveRadarAlertSettings(formData: FormData) {
  await requireStaff();
  const value = {
    enabled: formData.get("enabled") === "on",
    recipient: String(formData.get("recipient") ?? "").trim(),
    minScore: Math.max(0, Math.min(100, integer(formData.get("minScore"), DEFAULT_ALERTS.minScore))),
    urgentWithinDays: Math.max(1, Math.min(30, integer(formData.get("urgentWithinDays"), DEFAULT_ALERTS.urgentWithinDays))),
  };
  await saveRadarSetting(RADAR_SETTINGS_KEYS.alerts, value);
  await radarAudit("radar_settings", RADAR_SETTINGS_KEYS.alerts, "Bildiriş ayarları yeniləndi", {
    ...value,
    recipient: value.recipient ? "konfiqurasiya olundu" : "boş",
  });
  refresh();
}

export async function saveRadarTaxonomySettings(formData: FormData) {
  await requireStaff();
  const raw = String(formData.get("taxonomy") ?? "").trim();
  if (!raw) {
    await saveRadarSetting(RADAR_SETTINGS_KEYS.taxonomy, DEFAULT_TAXONOMY as unknown as Record<string, unknown>);
    refresh();
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Taksonomiya JSON formatında deyil.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Taksonomiya obyekt olmalıdır.");
  }
  const value = parsed as Record<string, unknown>;
  for (const key of ["cpvFamilies", "projectTypes", "exclusions", "coreTerms"]) {
    if (key in value && !Array.isArray(value[key])) {
      throw new Error(`Taksonomiyada «${key}» massiv olmalıdır.`);
    }
  }

  await saveRadarSetting(RADAR_SETTINGS_KEYS.taxonomy, value);
  await radarAudit("radar_settings", RADAR_SETTINGS_KEYS.taxonomy, "Taksonomiya yeniləndi");
  refresh();
}

export async function getRadarSettingsForAdmin() {
  await requireStaff();
  return getRadarSettings();
}
