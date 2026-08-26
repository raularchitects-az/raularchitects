import type { RadarSourceId } from "../types";
import { tedSource } from "./ted";
import type { RadarSource } from "./types";

/**
 * SIMAP is registered but not implemented in Phase 1.
 *
 * Keeping it in the registry means the Advanced page can already list it and a
 * later phase only has to supply `fetchOpportunities` — no admin screen, route
 * or table has to change when Switzerland gets its own source.
 */
const simapSource: RadarSource = {
  id: "simap",
  label: "SIMAP (Switzerland)",
  availability: "planned",
  fetchOpportunities: async () => {
    throw new Error("SIMAP mənbəyi Phase 1-də aktiv deyil.");
  },
};

export const RADAR_SOURCES: RadarSource[] = [tedSource, simapSource];

export function getRadarSource(id: string): RadarSource | null {
  return RADAR_SOURCES.find((source) => source.id === id) ?? null;
}

export function availableSourceIds(): RadarSourceId[] {
  return RADAR_SOURCES.filter((source) => source.availability === "available").map((source) => source.id);
}

export type { RadarSource, SourceFetchResult, SourceFetchOptions } from "./types";
