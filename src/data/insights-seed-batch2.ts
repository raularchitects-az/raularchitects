import { insightSeedRowsBatch2Part1 } from "./insights-seed-batch2-part1";
import { insightSeedRowsBatch2Part2 } from "./insights-seed-batch2-part2";

/** Second published Insights batch — appended after the original 10 seed rows. */
export const insightSeedRowsBatch2 = [
  ...insightSeedRowsBatch2Part1,
  ...insightSeedRowsBatch2Part2,
];
