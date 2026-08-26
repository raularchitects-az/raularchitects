import type { RadarSourceId } from "../types";
import { simapSource } from "./simap";
import { tedSource } from "./ted";
import type { RadarSource } from "./types";

/**
 * Every official source the radar can read.
 *
 * Order matters for one reason: Swiss notices above the WTO threshold are
 * published on TED as well as SIMAP, and discovery suppresses the second copy
 * of a tender it has already stored. Running TED first keeps that decision
 * stable from run to run.
 */
export const RADAR_SOURCES: RadarSource[] = [tedSource, simapSource];

export function getRadarSource(id: string): RadarSource | null {
  return RADAR_SOURCES.find((source) => source.id === id) ?? null;
}

export function availableSourceIds(): RadarSourceId[] {
  return RADAR_SOURCES.filter((source) => source.availability === "available").map((source) => source.id);
}

export type { RadarSource, SourceFetchResult, SourceFetchOptions } from "./types";
