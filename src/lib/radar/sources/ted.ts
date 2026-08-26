import type { RadarSearchConfig } from "../config";
import type { SourceOpportunity } from "../types";
import { mapTedNotices } from "./ted-mapper";
import { buildTedFields, buildTedQuery, resolvePageLimit, TED_CORE_FIELDS } from "./ted-query";
import type { RadarSource, SourceFetchOptions, SourceFetchResult } from "./types";

/**
 * Official TED Search API v3 client.
 *
 * The API is public and requires no authentication, so there is no secret to
 * protect here — but it is still called only from the server. Pages are never
 * scraped: every request goes to the documented JSON endpoint and every
 * opportunity keeps the official notice link TED returns.
 */
const TED_PRIMARY = "https://api.ted.europa.eu/v3/notices/search";
/** TED publishes this as the standby host for the same endpoint. */
const TED_SECONDARY = "https://tedweb.api.ted.europa.eu/v3/notices/search";

const REQUEST_TIMEOUT_MS = 20000;
const MAX_ATTEMPTS = 3;

type TedSearchResponse = {
  notices?: unknown;
  totalNoticeCount?: number | null;
  iterationNextToken?: string | null;
  timedOut?: boolean;
};

type TedRequestBody = {
  query: string;
  fields: string[];
  page: number;
  limit: number;
  scope: RadarSearchConfig["scope"];
  checkQuerySyntax: boolean;
  paginationMode: "PAGE_NUMBER";
  onlyLatestVersions: boolean;
};

class TedRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail: string,
  ) {
    super(message);
    this.name = "TedRequestError";
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

/** Unknown-field and syntax problems are permanent; retrying cannot help. */
function isPermanent(status: number) {
  return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

async function postSearch(body: TedRequestBody, options: SourceFetchOptions): Promise<TedSearchResponse> {
  const doFetch = options.fetchImpl ?? fetch;
  const endpoints = [TED_PRIMARY, TED_SECONDARY];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const endpoint = endpoints[Math.min(attempt, endpoints.length - 1)]!;
    try {
      const response = await doFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: timeoutSignal(options.signal),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        const error = new TedRequestError(
          `TED sorğusu uğursuz oldu (${response.status})`,
          response.status,
          detail || response.statusText,
        );
        if (isPermanent(response.status)) throw error;
        lastError = error;
      } else {
        return (await response.json()) as TedSearchResponse;
      }
    } catch (error) {
      if (error instanceof TedRequestError && isPermanent(error.status)) throw error;
      lastError = error;
    }

    if (attempt < MAX_ATTEMPTS - 1) await delay(500 * (attempt + 1));
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("TED mənbəsi cavab vermədi.");
}

function looksLikeFieldProblem(error: unknown) {
  if (!(error instanceof TedRequestError)) return false;
  if (error.status !== 400) return false;
  return /field|unknown|invalid|unsupported/i.test(error.detail);
}

async function collect(
  config: RadarSearchConfig,
  fields: string[],
  options: SourceFetchOptions,
): Promise<{ opportunities: SourceOpportunity[]; fetched: number; truncated: boolean; warnings: string[] }> {
  const now = options.now ?? new Date();
  const query = buildTedQuery(config, now);
  const limit = resolvePageLimit(fields, config.pageLimit);
  const maxPages = Math.max(1, Math.min(20, Math.trunc(config.maxPages) || 1));

  const seen = new Set<string>();
  const opportunities: SourceOpportunity[] = [];
  const warnings: string[] = [];
  let fetched = 0;
  let truncated = false;

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await postSearch(
      {
        query,
        fields,
        page,
        limit,
        scope: config.scope,
        checkQuerySyntax: false,
        paginationMode: "PAGE_NUMBER",
        onlyLatestVersions: config.onlyLatestVersions,
      },
      options,
    );

    if (payload.timedOut) {
      warnings.push(`TED axtarışı ${page}-ci səhifədə vaxt limitini keçdi; nəticə tam olmaya bilər.`);
    }

    const mapped = mapTedNotices(payload.notices);
    fetched += Array.isArray(payload.notices) ? payload.notices.length : mapped.length;

    for (const item of mapped) {
      const key = `${item.sourceRef}|${item.sourceLot}`;
      if (seen.has(key)) continue;
      seen.add(key);
      opportunities.push(item);
    }

    const returned = Array.isArray(payload.notices) ? payload.notices.length : 0;
    if (returned < limit) break;
    if (page === maxPages) {
      const total = payload.totalNoticeCount ?? 0;
      truncated = total > page * limit;
    }
  }

  return { opportunities, fetched, truncated, warnings };
}

export async function fetchTedOpportunities(
  config: RadarSearchConfig,
  options: SourceFetchOptions = {},
): Promise<SourceFetchResult> {
  const fields = buildTedFields(config, true);
  try {
    return await collect(config, fields, options);
  } catch (error) {
    if (!looksLikeFieldProblem(error)) throw error;
    // One optional field was rejected; fall back to the verified core list.
    const result = await collect(config, [...TED_CORE_FIELDS], options);
    return {
      ...result,
      warnings: [
        ...result.warnings,
        "TED bəzi əlavə sahələri qəbul etmədi; yalnız təsdiqlənmiş sahələrlə davam edildi.",
      ],
    };
  }
}

export const tedSource: RadarSource = {
  id: "ted",
  label: "TED Europe",
  availability: "available",
  fetchOpportunities: fetchTedOpportunities,
};
