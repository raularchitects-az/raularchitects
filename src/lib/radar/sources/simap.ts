import type { RadarSearchConfig } from "../config";
import type { SourceOpportunity } from "../types";
import { mapSimapPublication, type SimapPublicationDetail, type SimapSearchEntry } from "./simap-mapper";
import {
  buildSimapSearchParams,
  SIMAP_API_BASE,
  SIMAP_SEARCH_PATH,
  simapCoversConfiguredCountries,
  simapDetailPath,
} from "./simap-query";
import type { RadarSource, SourceFetchOptions, SourceFetchResult } from "./types";

/**
 * Official simap.ch read API client (Swiss public procurement).
 *
 * simap publishes an OpenAPI 3 document at /api/specifications/simap.yaml and
 * serves the public search and publication-detail endpoints over anonymous
 * HTTPS GET. No credentials exist for them and none are sent. Rendered pages
 * are never requested: simap's robots.txt disallows the `/*\/project-detail`
 * UI route, so that URL is only ever stored for an admin to click.
 *
 * The search endpoint returns project identity but neither a deadline nor a
 * CPV code, so one publication-detail request follows per candidate. That is
 * the reason for the request cap below — a run must stay polite towards a
 * public service that charges nothing for access.
 */

const REQUEST_TIMEOUT_MS = 20000;
const MAX_ATTEMPTS = 3;
/** Upper bound on publication-detail requests in a single run. */
const MAX_DETAIL_REQUESTS = 60;
/** Detail requests in flight at once. */
const DETAIL_CONCURRENCY = 4;

type SimapSearchResponse = {
  projects?: unknown;
  pagination?: { lastItem?: string | null; itemsPerPage?: number | null } | null;
};

class SimapRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string,
  ) {
    super(message);
    this.name = "SimapRequestError";
  }
}

function timeoutSignal(external?: AbortSignal) {
  if (typeof AbortSignal.timeout !== "function") return external;
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  if (!external) return timeout;
  if (typeof AbortSignal.any === "function") return AbortSignal.any([external, timeout]);
  return external;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Bad requests and not-found are permanent; retrying cannot change them. */
function isPermanent(status: number) {
  return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

async function simapGet<T>(url: string, options: SourceFetchOptions): Promise<T> {
  const doFetch = options.fetchImpl ?? fetch;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await doFetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: timeoutSignal(options.signal),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        const error = new SimapRequestError(
          `SIMAP sorğusu uğursuz oldu (${response.status})`,
          response.status,
          detail || response.statusText,
        );
        if (isPermanent(response.status)) throw error;
        lastError = error;
      } else {
        return (await response.json()) as T;
      }
    } catch (error) {
      if (error instanceof SimapRequestError && isPermanent(error.status)) throw error;
      lastError = error;
    }

    if (attempt < MAX_ATTEMPTS - 1) await delay(500 * (attempt + 1));
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("SIMAP mənbəsi cavab vermədi.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Walks the rolling pagination until the pages run out or the cap is hit. */
async function collectEntries(
  config: RadarSearchConfig,
  now: Date,
  options: SourceFetchOptions,
): Promise<{ entries: SimapSearchEntry[]; truncated: boolean }> {
  const maxPages = Math.max(1, Math.min(20, Math.trunc(config.maxPages) || 1));
  const entries: SimapSearchEntry[] = [];
  const seenProjects = new Set<string>();
  const seenCursors = new Set<string>();
  let lastItem: string | null = null;
  let truncated = false;

  for (let page = 0; page < maxPages; page += 1) {
    const url: string = `${SIMAP_API_BASE}${SIMAP_SEARCH_PATH}?${buildSimapSearchParams(config, now, lastItem).toString()}`;
    const payload: SimapSearchResponse = await simapGet<SimapSearchResponse>(url, options);
    const projects = Array.isArray(payload.projects) ? payload.projects.filter(isRecord) : [];

    for (const project of projects) {
      const key = String(project["projectNumber"] ?? project["id"] ?? "");
      if (!key || seenProjects.has(key)) continue;
      seenProjects.add(key);
      entries.push(project);
    }

    const cursor: string | null = payload.pagination?.lastItem ?? null;
    const perPage = payload.pagination?.itemsPerPage ?? projects.length;
    if (!cursor || projects.length < perPage || seenCursors.has(cursor)) break;
    seenCursors.add(cursor);
    lastItem = cursor;

    if (page === maxPages - 1) truncated = true;
  }

  return { entries, truncated };
}

async function fetchDetails(
  entries: SimapSearchEntry[],
  options: SourceFetchOptions,
): Promise<{ opportunities: SourceOpportunity[]; warnings: string[] }> {
  const opportunities: SourceOpportunity[] = [];
  const warnings: string[] = [];
  let failures = 0;

  for (let index = 0; index < entries.length; index += DETAIL_CONCURRENCY) {
    const batch = entries.slice(index, index + DETAIL_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (entry) => {
        const projectId = String(entry["id"] ?? "");
        const publicationId = String(entry["publicationId"] ?? "");
        if (!projectId || !publicationId) return null;
        try {
          const detail = await simapGet<SimapPublicationDetail>(
            `${SIMAP_API_BASE}${simapDetailPath(projectId, publicationId)}`,
            options,
          );
          return mapSimapPublication(entry, detail);
        } catch {
          // One unreadable publication must not lose the rest of the run.
          failures += 1;
          return null;
        }
      }),
    );

    for (const mapped of results) {
      if (mapped) opportunities.push(...mapped);
    }
  }

  if (failures) {
    warnings.push(`SIMAP: ${failures} elanın detalları oxunmadı və nəticəyə daxil edilmədi.`);
  }

  return { opportunities, warnings };
}

export async function fetchSimapOpportunities(
  config: RadarSearchConfig,
  options: SourceFetchOptions = {},
): Promise<SourceFetchResult> {
  const now = options.now ?? new Date();

  if (!simapCoversConfiguredCountries(config)) {
    return {
      opportunities: [],
      fetched: 0,
      truncated: false,
      warnings: ["SIMAP yalnız İsveçrə elanlarını dərc edir; axtarış profilindəki ölkə filtri İsveçrəni əhatə etmir."],
    };
  }

  const { entries, truncated } = await collectEntries(config, now, options);
  const warnings: string[] = [];

  let candidates = entries;
  if (candidates.length > MAX_DETAIL_REQUESTS) {
    candidates = candidates.slice(0, MAX_DETAIL_REQUESTS);
    warnings.push(
      `SIMAP: bir icrada ${MAX_DETAIL_REQUESTS} elandan çoxunun detalı oxunmur; qalan elanlar növbəti icrada yoxlanacaq.`,
    );
  }

  const { opportunities, warnings: detailWarnings } = await fetchDetails(candidates, options);

  return {
    opportunities,
    fetched: entries.length,
    truncated,
    warnings: [...warnings, ...detailWarnings],
  };
}

export const simapSource: RadarSource = {
  id: "simap",
  label: "SIMAP Switzerland",
  availability: "available",
  fetchOpportunities: fetchSimapOpportunities,
};
