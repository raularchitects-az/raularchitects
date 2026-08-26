import { buildAnalysis } from "./analysis";
import { DEFAULT_ELIGIBILITY } from "./eligibility";
import { scoreOpportunity } from "./scoring";
import { DEFAULT_SEARCH } from "./config";
import { createFixtureFetch } from "./sources/ted-fixture";
import { fetchTedOpportunities } from "./sources/ted";
import { DEFAULT_TAXONOMY } from "./taxonomy";

/**
 * Runs the whole discovery pipeline against a mocked official TED response.
 *
 * This never touches the network or the database, so an admin can confirm that
 * parsing, scoring and exclusions still behave after a settings change — and a
 * future test runner can call the same function.
 */
export type SelfCheckResult = {
  name: string;
  passed: boolean;
  detail: string;
};

/** Fixed clock so fixture deadlines stay meaningful regardless of run date. */
const FIXTURE_NOW = new Date("2030-01-01T00:00:00.000Z");

export async function runSourceSelfCheck(): Promise<SelfCheckResult[]> {
  const results: SelfCheckResult[] = [];
  const { fetchImpl, requests } = createFixtureFetch();

  const fetched = await fetchTedOpportunities(DEFAULT_SEARCH, { fetchImpl, now: FIXTURE_NOW });

  const query = String(requests[0]?.body?.["query"] ?? "");
  results.push({
    name: "Ekspert sorğusu CPV və tarix aralığı ilə qurulur",
    passed: query.includes("classification-cpv IN (") && query.includes("publication-date = ("),
    detail: query || "sorğu qurulmadı",
  });

  results.push({
    name: "Bütün elanlar normallaşdırılır",
    passed: fetched.opportunities.length === 4,
    detail: `${fetched.opportunities.length} elan map edildi`,
  });

  const byRef = new Map(fetched.opportunities.map((item) => [item.sourceRef, item]));

  const competition = byRef.get("556964-2026");
  results.push({
    name: "Rəsmi TED linki qorunur",
    passed: competition?.sourceUrl === "https://ted.europa.eu/en/notice/556964-2026/html",
    detail: competition?.sourceUrl ?? "link yoxdur",
  });

  const swiss = byRef.get("557012-2026");
  results.push({
    name: "Bir neçə lot son tarixindən ən erkəni götürülür",
    passed: swiss?.deadlineAt === new Date("2030-04-30T16:00:00+02:00").toISOString(),
    detail: swiss?.deadlineAt ?? "son tarix yoxdur",
  });

  const scored = fetched.opportunities.map((item) => ({
    item,
    score: scoreOpportunity(item, DEFAULT_TAXONOMY, DEFAULT_ELIGIBILITY, FIXTURE_NOW),
  }));
  const scoreByRef = new Map(scored.map((entry) => [entry.item.sourceRef, entry.score]));

  const roads = scoreByRef.get("556970-2026");
  results.push({
    name: "Yol və körpü mühəndisliyi istisna edilir",
    passed: Boolean(roads?.excluded),
    detail: roads?.exclusionReasons.join(", ") || "istisna edilmədi",
  });

  const software = scoreByRef.get("557044-2026");
  results.push({
    name: "BIM proqram təminatı alışı istisna edilir",
    passed: Boolean(software?.excluded),
    detail: software?.exclusionReasons.join(", ") || "istisna edilmədi",
  });

  const competitionScore = scoreByRef.get("556964-2026");
  results.push({
    name: "Almaniya memarlıq müsabiqəsi güclü qiymət alır",
    passed: Boolean(competitionScore && !competitionScore.excluded && competitionScore.score >= 70),
    detail: competitionScore ? `${competitionScore.score} / ${competitionScore.band}` : "qiymətləndirilmədi",
  });

  const swissScore = scoreByRef.get("557012-2026");
  results.push({
    name: "İsveçrə generalplanung + BIM qiymətləndirilir",
    passed: Boolean(swissScore && !swissScore.excluded && swissScore.score >= 70),
    detail: swissScore ? `${swissScore.score} / ${swissScore.band}` : "qiymətləndirilmədi",
  });

  if (competition && competitionScore) {
    const analysis = buildAnalysis(competition, competitionScore, DEFAULT_ELIGIBILITY, FIXTURE_NOW);
    results.push({
      name: "Analiz yalnız icazə verilən tövsiyə qaytarır",
      passed: ["review_documents", "assess_consortium", "check_local_eligibility", "monitor_only"].includes(
        analysis.recommendation,
      ),
      detail: analysis.recommendation,
    });
  }

  return results;
}
