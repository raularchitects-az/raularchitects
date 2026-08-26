import "server-only";

import { createAdminClient } from "@/lib/cms/supabase";
import { buildAnalysis } from "./analysis";
import { deadlineStatus, isExpired } from "./deadline";
import { dispatchRadarAlerts } from "./notify";
import { scoreOpportunity } from "./scoring";
import { getRadarSettings } from "./settings";
import { getRadarSource, RADAR_SOURCES } from "./sources";
import type {
  RadarOpportunityRow,
  RunStatus,
  RunTrigger,
  ScoreResult,
  SourceOpportunity,
} from "./types";

/**
 * Discovery pipeline: fetch → score → deduplicate → persist → archive → alert.
 *
 * It never throws at the caller. Every failure is written to `radar_runs` and
 * returned as a status, so a TED outage degrades the admin page to "last
 * successful run" instead of breaking it.
 */
export type DiscoveryResult = {
  runId: string | null;
  status: RunStatus;
  fetched: number;
  created: number;
  updated: number;
  archived: number;
  alerts: number;
  warnings: string[];
  error: string | null;
};

const OPPORTUNITY_COLUMNS =
  "id, source_id, source_ref, source_lot, source_url, procedure_ref, notice_version, raw, title, buyer_name, country, city, cpv_codes, project_type, published_at, deadline_at, deadline_status, value_amount, value_currency, score, score_band, score_factors, services, analysis, state, reviewed_at, reviewed_by, new_alert_sent_at, urgent_alert_sent_at, first_seen_at, last_checked_at, created_at, updated_at";

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

function buildPayload(
  item: SourceOpportunity,
  score: ScoreResult,
  analysis: ReturnType<typeof buildAnalysis>,
  now: Date,
) {
  const expired = isExpired(item.deadlineAt, now);
  return {
    source_id: item.sourceId,
    source_ref: item.sourceRef,
    source_lot: item.sourceLot,
    source_url: item.sourceUrl,
    procedure_ref: item.procedureRef,
    notice_version: item.noticeVersion,
    raw: item.raw,
    title: item.title,
    buyer_name: item.buyerName,
    country: item.country,
    city: item.city,
    cpv_codes: item.cpvCodes,
    project_type: score.projectType,
    published_at: item.publishedAt ? item.publishedAt.slice(0, 10) : null,
    deadline_at: item.deadlineAt,
    deadline_status: deadlineStatus(item.deadlineAt, now),
    value_amount: item.valueAmount,
    value_currency: item.valueCurrency,
    score: score.score,
    score_band: score.band,
    score_factors: score.factors,
    services: score.services,
    analysis,
    last_checked_at: now.toISOString(),
    updated_at: now.toISOString(),
    excludedOrExpired: score.excluded || expired,
  };
}

export async function runDiscovery(
  options: { trigger: RunTrigger; sourceId?: string } = { trigger: "schedule" },
): Promise<DiscoveryResult> {
  const now = new Date();
  const sourceId = options.sourceId ?? "ted";
  const empty: DiscoveryResult = {
    runId: null,
    status: "failed",
    fetched: 0,
    created: 0,
    updated: 0,
    archived: 0,
    alerts: 0,
    warnings: [],
    error: null,
  };

  const supabase = await createAdminClient();
  if (!supabase) return { ...empty, error: "Supabase konfiqurasiya olunmayıb." };

  const source = getRadarSource(sourceId);
  if (!source) return { ...empty, error: `Naməlum mənbə: ${sourceId}` };
  if (source.availability !== "available") {
    return { ...empty, error: `${source.label} mənbəyi bu mərhələdə aktiv deyil.` };
  }

  const { data: sourceRow } = await supabase
    .from("radar_sources")
    .select("id, is_enabled")
    .eq("id", sourceId)
    .maybeSingle();
  if (sourceRow && sourceRow.is_enabled === false) {
    return { ...empty, error: `${source.label} mənbəyi söndürülüb.` };
  }

  const { data: runRow } = await supabase
    .from("radar_runs")
    .insert({ source_id: sourceId, trigger: options.trigger, status: "running", started_at: now.toISOString() })
    .select("id")
    .maybeSingle();
  const runId = runRow?.id ? String(runRow.id) : null;

  const finish = async (result: DiscoveryResult) => {
    if (runId) {
      await supabase
        .from("radar_runs")
        .update({
          status: result.status,
          finished_at: new Date().toISOString(),
          fetched_count: result.fetched,
          created_count: result.created,
          updated_count: result.updated,
          archived_count: result.archived,
          alert_count: result.alerts,
          error: result.error,
          details: { warnings: result.warnings },
        })
        .eq("id", runId);
    }
    await supabase
      .from("radar_sources")
      .update({
        last_run_at: new Date().toISOString(),
        ...(result.status === "failed"
          ? { last_error: result.error }
          : { last_success_at: new Date().toISOString(), last_error: null }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sourceId);
    return result;
  };

  try {
    const settings = await getRadarSettings();
    const fetched = await source.fetchOpportunities(settings.search, { now });
    const warnings = [...fetched.warnings];
    if (fetched.truncated) {
      warnings.push("Səhifə limiti nəticəsində bütün elanlar oxunmadı; Advanced ayarlarında limit artırıla bilər.");
    }

    const scored = fetched.opportunities.map((item) => {
      const score = scoreOpportunity(item, settings.taxonomy, settings.eligibility, now);
      const analysis = buildAnalysis(item, score, settings.eligibility, now);
      return { item, payload: buildPayload(item, score, analysis, now) };
    });

    // Deduplicate against what is already stored, keyed by the official
    // publication reference plus lot.
    const refs = [...new Set(scored.map((entry) => entry.payload.source_ref))];
    const existing = new Map<string, RadarOpportunityRow>();
    for (const part of chunk(refs, 150)) {
      const { data, error } = await supabase
        .from("radar_opportunities")
        .select(OPPORTUNITY_COLUMNS)
        .eq("source_id", sourceId)
        .in("source_ref", part);
      if (error) throw new Error(error.message);
      for (const row of (data ?? []) as RadarOpportunityRow[]) {
        existing.set(`${row.source_ref}|${row.source_lot}`, row);
      }
    }

    // A Swiss tender above the WTO threshold is published on both SIMAP and
    // TED. When the source hands over the other platform's official reference,
    // an already stored copy of the same tender is not created a second time.
    const crossRefs = [...new Set(scored.flatMap((entry) => entry.item.crossSourceRefs))];
    const storedElsewhere = new Set<string>();
    for (const part of chunk(crossRefs, 150)) {
      const { data } = await supabase
        .from("radar_opportunities")
        .select("source_ref")
        .neq("source_id", sourceId)
        .in("source_ref", part);
      for (const row of (data ?? []) as { source_ref: string }[]) storedElsewhere.add(row.source_ref);
    }

    const inserts: Record<string, unknown>[] = [];
    const updates: { id: string; payload: Record<string, unknown> }[] = [];
    let duplicates = 0;

    for (const entry of scored) {
      const { excludedOrExpired, ...payload } = entry.payload;
      const key = `${payload.source_ref}|${payload.source_lot}`;
      const previous = existing.get(key);

      if (!previous) {
        if (entry.item.crossSourceRefs.some((ref) => storedElsewhere.has(ref))) {
          duplicates += 1;
          continue;
        }
        inserts.push({
          ...payload,
          state: excludedOrExpired ? "archived" : "active",
          first_seen_at: now.toISOString(),
          created_at: now.toISOString(),
        });
        continue;
      }

      // A reviewer's decision outranks the source; only expiry can archive it.
      let state = previous.state;
      if (excludedOrExpired) state = "archived";
      else if (state === "archived") state = "active";

      updates.push({ id: previous.id, payload: { ...payload, state } });
    }

    if (duplicates) {
      warnings.push(`${duplicates} elan başqa rəsmi mənbədə artıq qeydə alındığı üçün təkrar yaradılmadı.`);
    }

    let created = 0;
    for (const part of chunk(inserts, 100)) {
      const { error, count } = await supabase
        .from("radar_opportunities")
        .insert(part, { count: "exact" });
      if (error) throw new Error(error.message);
      created += count ?? part.length;
    }

    let updated = 0;
    for (const item of updates) {
      const { error } = await supabase.from("radar_opportunities").update(item.payload).eq("id", item.id);
      if (error) throw new Error(error.message);
      updated += 1;
    }

    // Anything whose deadline has passed leaves the active lists, including
    // items this run did not touch.
    const { data: expiredRows, error: expiredError } = await supabase
      .from("radar_opportunities")
      .update({ state: "archived", updated_at: now.toISOString() })
      .lt("deadline_at", now.toISOString())
      .neq("state", "archived")
      .select("id");
    if (expiredError) throw new Error(expiredError.message);
    const archived = expiredRows?.length ?? 0;

    // Alert candidates are re-read so items whose deadline only now entered
    // the urgent window are picked up too.
    const { data: candidates } = await supabase
      .from("radar_opportunities")
      .select(OPPORTUNITY_COLUMNS)
      .eq("state", "active")
      .gte("score", settings.alerts.minScore)
      .order("score", { ascending: false })
      .limit(50);

    const dispatch = await dispatchRadarAlerts((candidates ?? []) as RadarOpportunityRow[], settings.alerts, now);
    if (dispatch.skipped) warnings.push(dispatch.skipped);

    for (const alert of dispatch.sent) {
      const stamp =
        alert.kind === "new"
          ? { new_alert_sent_at: now.toISOString() }
          : { urgent_alert_sent_at: now.toISOString() };
      await supabase.from("radar_opportunities").update(stamp).eq("id", alert.opportunity.id);
    }

    return finish({
      runId,
      status: warnings.length ? "partial" : "success",
      fetched: fetched.fetched,
      created,
      updated,
      archived,
      alerts: dispatch.sent.length,
      warnings,
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Naməlum xəta";
    console.error("[radar] discovery", message);
    return finish({ ...empty, runId, error: message });
  }
}

export type MultiSourceDiscoveryResult = DiscoveryResult & {
  sources: { sourceId: string; status: RunStatus; error: string | null }[];
};

/**
 * Runs every enabled official source in registry order and aggregates the
 * outcome.
 *
 * Each source still gets its own `radar_runs` row, so the Advanced run history
 * stays per-source and a TED outage never hides a successful SIMAP run. A
 * source that an admin switched off is skipped rather than reported as failed.
 */
export async function runAllSources(
  options: { trigger: RunTrigger } = { trigger: "schedule" },
): Promise<MultiSourceDiscoveryResult> {
  const empty: MultiSourceDiscoveryResult = {
    runId: null,
    status: "failed",
    fetched: 0,
    created: 0,
    updated: 0,
    archived: 0,
    alerts: 0,
    warnings: [],
    error: null,
    sources: [],
  };

  const supabase = await createAdminClient();
  if (!supabase) return { ...empty, error: "Supabase konfiqurasiya olunmayıb." };

  const { data: sourceRows } = await supabase.from("radar_sources").select("id, is_enabled");
  const disabled = new Set(
    (sourceRows ?? [])
      .filter((row) => (row as { is_enabled?: boolean }).is_enabled === false)
      .map((row) => String((row as { id: unknown }).id)),
  );

  const runnable = RADAR_SOURCES.filter(
    (source) => source.availability === "available" && !disabled.has(source.id),
  );

  if (!runnable.length) {
    return { ...empty, error: "Aktiv mənbə yoxdur." };
  }

  const aggregate: MultiSourceDiscoveryResult = { ...empty, warnings: [] };

  for (const source of runnable) {
    const result = await runDiscovery({ trigger: options.trigger, sourceId: source.id });
    aggregate.sources.push({ sourceId: source.id, status: result.status, error: result.error });
    aggregate.fetched += result.fetched;
    aggregate.created += result.created;
    aggregate.updated += result.updated;
    aggregate.archived += result.archived;
    aggregate.alerts += result.alerts;
    aggregate.warnings.push(...result.warnings.map((warning) => `${source.label}: ${warning}`));
    if (result.error) aggregate.warnings.push(`${source.label}: ${result.error}`);
    // The last run id is enough for the audit trail; the per-source rows hold
    // the detail.
    if (result.runId) aggregate.runId = result.runId;
  }

  const failed = aggregate.sources.filter((item) => item.status === "failed");
  aggregate.status = failed.length === aggregate.sources.length
    ? "failed"
    : failed.length || aggregate.warnings.length
      ? "partial"
      : "success";
  aggregate.error = failed.length ? failed.map((item) => `${item.sourceId}: ${item.error}`).join("; ") : null;

  return aggregate;
}
