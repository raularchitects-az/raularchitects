import type { RadarSearchConfig } from "../config";
import type { RadarSourceId, SourceOpportunity } from "../types";

export type SourceFetchOptions = {
  /** Injected in tests so the source client can run against fixtures. */
  fetchImpl?: typeof fetch;
  now?: Date;
  signal?: AbortSignal;
};

export type SourceFetchResult = {
  opportunities: SourceOpportunity[];
  fetched: number;
  /** True when the page cap stopped the walk before the source ran out. */
  truncated: boolean;
  warnings: string[];
};

export type RadarSource = {
  id: RadarSourceId;
  label: string;
  availability: "available" | "planned";
  fetchOpportunities: (config: RadarSearchConfig, options?: SourceFetchOptions) => Promise<SourceFetchResult>;
};
