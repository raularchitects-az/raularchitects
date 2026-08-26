import fixture from "./fixtures/ted-search-response.json";

/**
 * Mocked official TED response for tests and the Advanced self-check.
 *
 * `createFixtureFetch` matches the `fetch` signature, so it can be injected
 * into `fetchTedOpportunities` through `SourceFetchOptions.fetchImpl` without
 * touching the network. It also records the request bodies TED would have
 * received, which makes the expert query itself assertable.
 */
export const TED_FIXTURE = fixture as {
  notices: Record<string, unknown>[];
  totalNoticeCount: number;
  timedOut: boolean;
};

export type FixtureFetch = {
  fetchImpl: typeof fetch;
  requests: { url: string; body: Record<string, unknown> }[];
};

export function createFixtureFetch(response: unknown = TED_FIXTURE): FixtureFetch {
  const requests: { url: string; body: Record<string, unknown> }[] = [];

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    let body: Record<string, unknown> = {};
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body) as Record<string, unknown>;
      } catch {
        body = {};
      }
    }
    requests.push({ url, body });

    // The fixture is a single page: an empty second page ends the walk.
    const page = Number(body["page"] ?? 1);
    const payload = page > 1 ? { notices: [], totalNoticeCount: 0, timedOut: false } : response;

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  return { fetchImpl, requests };
}
