/**
 * Runs the Business Radar discovery pipeline against a mocked official TED
 * response. No network access, no database, no secrets.
 *
 *   npx tsx scripts/radar-selftest.mts
 *
 * The same checks are available to staff in Admin → Business Radar → Advanced.
 */
import { runSourceSelfCheck } from "../src/lib/radar/self-check";

const results = await runSourceSelfCheck();
for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"}  ${result.name}  |  ${result.detail}`);
}
process.exit(results.every((result) => result.passed) ? 0 : 1);
