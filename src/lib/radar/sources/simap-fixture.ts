import details from "./fixtures/simap-publication-details.json";
import search from "./fixtures/simap-search-response.json";

/**
 * Mocked official simap.ch responses for the Advanced self-check and tests.
 *
 * `createSimapFixtureFetch` matches the `fetch` signature and routes by URL the
 * same way the live API does: the project-search path returns the search page,
 * a publication-detail path returns the matching publication. Injecting it
 * through `SourceFetchOptions.fetchImpl` exercises the whole SIMAP pipeline
 * without a network call, and the recorded URLs make the query assertable.
 */
export const SIMAP_SEARCH_FIXTURE = search as {
  projects: Record<string, unknown>[];
  pagination: { lastItem: string; itemsPerPage: number };
};

export const SIMAP_DETAIL_FIXTURE = details as Record<string, Record<string, unknown>>;

export type SimapFixtureFetch = {
  fetchImpl: typeof fetch;
  requests: string[];
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createSimapFixtureFetch(): SimapFixtureFetch {
  const requests: string[] = [];

  const fetchImpl: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    requests.push(url);

    if (url.includes("/publications/v2/project/project-search")) {
      // A cursor means the walker asked for a second page; the fixture is one
      // page, so an empty result ends the walk exactly as the API would.
      if (url.includes("lastItem=")) return json({ projects: [], pagination: { lastItem: null, itemsPerPage: 20 } });
      return json(SIMAP_SEARCH_FIXTURE);
    }

    const detailMatch = /publication-details\/([0-9a-f-]+)/i.exec(url);
    if (detailMatch?.[1]) {
      const detail = SIMAP_DETAIL_FIXTURE[detailMatch[1]];
      if (detail) return json(detail);
      return json({ message: "not found" }, 404);
    }

    return json({ message: "unexpected fixture request" }, 404);
  };

  return { fetchImpl, requests };
}
