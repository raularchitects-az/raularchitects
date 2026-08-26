import "server-only";

import { createAdminClient } from "@/lib/cms/supabase";
import { isMissingRelationError } from "@/lib/cms/missing-table";
import type {
  DeadlineStatus,
  RadarOpportunityRow,
  RadarRunRow,
  RadarSourceRow,
  ScoreBand,
} from "./types";

const COLUMNS =
  "id, source_id, source_ref, source_lot, source_url, procedure_ref, notice_version, raw, title, buyer_name, country, city, cpv_codes, project_type, published_at, deadline_at, deadline_status, value_amount, value_currency, score, score_band, score_factors, services, analysis, state, reviewed_at, reviewed_by, new_alert_sent_at, urgent_alert_sent_at, first_seen_at, last_checked_at, created_at, updated_at";

/** Card lists never need the raw notice payload. */
const LIST_COLUMNS =
  "id, source_id, source_ref, source_url, title, buyer_name, country, city, cpv_codes, project_type, published_at, deadline_at, deadline_status, value_amount, value_currency, score, score_band, services, analysis, state, first_seen_at, last_checked_at";

export type RadarFilters = {
  country?: string;
  band?: ScoreBand | "";
  deadline?: DeadlineStatus | "";
  projectType?: string;
};

export type RadarListItem = Pick<
  RadarOpportunityRow,
  | "id"
  | "source_id"
  | "source_ref"
  | "source_url"
  | "title"
  | "buyer_name"
  | "country"
  | "city"
  | "cpv_codes"
  | "project_type"
  | "published_at"
  | "deadline_at"
  | "deadline_status"
  | "value_amount"
  | "value_currency"
  | "score"
  | "score_band"
  | "services"
  | "analysis"
  | "state"
  | "first_seen_at"
  | "last_checked_at"
>;

export type RadarOverview = {
  recommended: RadarListItem[];
  today: RadarListItem[];
  top: RadarListItem[];
  all: RadarListItem[];
  countries: string[];
  projectTypes: string[];
  lastRun: RadarRunRow | null;
  lastSuccessfulRun: RadarRunRow | null;
  /** Set when the radar tables are missing or unreadable. */
  setupError: string | null;
};

const EMPTY_OVERVIEW: RadarOverview = {
  recommended: [],
  today: [],
  top: [],
  all: [],
  countries: [],
  projectTypes: [],
  lastRun: null,
  lastSuccessfulRun: null,
  setupError: null,
};

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function describe(error: { code?: string; message?: string } | null) {
  if (!error) return null;
  if (isMissingRelationError(error)) {
    return "Radar cədvəlləri tapılmadı. supabase/patch-business-radar.sql faylını Supabase SQL Editor-də icra edin.";
  }
  return error.message || "Radar məlumatları oxunmadı.";
}

export async function loadRadarOverview(filters: RadarFilters = {}): Promise<RadarOverview> {
  const supabase = await createAdminClient();
  if (!supabase) return { ...EMPTY_OVERVIEW, setupError: "Supabase konfiqurasiya olunmayıb." };

  // Active lists exclude archived (expired) items by construction.
  const activeQuery = supabase
    .from("radar_opportunities")
    .select(LIST_COLUMNS)
    .in("state", ["active", "review_later"])
    .order("score", { ascending: false })
    .order("deadline_at", { ascending: true, nullsFirst: false })
    .limit(400);

  const [{ data: activeRows, error: activeError }, runs] = await Promise.all([
    activeQuery,
    supabase.from("radar_runs").select("*").order("started_at", { ascending: false }).limit(20),
  ]);

  const setupError = describe(activeError) ?? describe(runs.error);
  if (setupError) return { ...EMPTY_OVERVIEW, setupError };

  const active = (activeRows ?? []) as RadarListItem[];
  const runRows = (runs.data ?? []) as RadarRunRow[];
  const strictlyActive = active.filter((item) => item.state === "active");

  const countries = [...new Set(active.map((item) => item.country).filter((item): item is string => Boolean(item)))].sort();
  const projectTypes = [
    ...new Set(active.map((item) => item.project_type).filter((item): item is string => Boolean(item))),
  ].sort();

  const today = startOfToday();

  const recommended = strictlyActive
    .filter((item) => item.score >= 70)
    .filter((item) => (item.analysis as { recommendation?: string })?.recommendation !== "monitor_only")
    .slice(0, 3);

  const todayItems = strictlyActive.filter(
    (item) => item.first_seen_at >= today || item.deadline_status === "urgent",
  );

  const top = strictlyActive.slice(0, 10);

  const all = active.filter((item) => {
    if (filters.country && item.country !== filters.country) return false;
    if (filters.band && item.score_band !== filters.band) return false;
    if (filters.deadline && item.deadline_status !== filters.deadline) return false;
    if (filters.projectType && item.project_type !== filters.projectType) return false;
    return true;
  });

  return {
    recommended,
    today: todayItems,
    top,
    all,
    countries,
    projectTypes,
    lastRun: runRows[0] ?? null,
    lastSuccessfulRun: runRows.find((run) => run.status === "success" || run.status === "partial") ?? null,
    setupError: null,
  };
}

export async function loadOpportunity(id: string) {
  const supabase = await createAdminClient();
  if (!supabase) return { item: null as RadarOpportunityRow | null, error: "Supabase konfiqurasiya olunmayıb." };
  const { data, error } = await supabase.from("radar_opportunities").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) return { item: null as RadarOpportunityRow | null, error: describe(error) };
  return { item: (data as RadarOpportunityRow | null) ?? null, error: null };
}

export async function loadRadarRuns(limit = 25) {
  const supabase = await createAdminClient();
  if (!supabase) return { runs: [] as RadarRunRow[], error: "Supabase konfiqurasiya olunmayıb." };
  const { data, error } = await supabase
    .from("radar_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) return { runs: [] as RadarRunRow[], error: describe(error) };
  return { runs: (data ?? []) as RadarRunRow[], error: null };
}

export async function loadRadarSources() {
  const supabase = await createAdminClient();
  if (!supabase) return { sources: [] as RadarSourceRow[], error: "Supabase konfiqurasiya olunmayıb." };
  const { data, error } = await supabase.from("radar_sources").select("*").order("id");
  if (error) return { sources: [] as RadarSourceRow[], error: describe(error) };
  return { sources: (data ?? []) as RadarSourceRow[], error: null };
}

export async function loadRadarArchive(limit = 50) {
  const supabase = await createAdminClient();
  if (!supabase) return { items: [] as RadarListItem[], error: "Supabase konfiqurasiya olunmayıb." };
  const { data, error } = await supabase
    .from("radar_opportunities")
    .select(LIST_COLUMNS)
    .in("state", ["archived", "not_relevant"])
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return { items: [] as RadarListItem[], error: describe(error) };
  return { items: (data ?? []) as RadarListItem[], error: null };
}
