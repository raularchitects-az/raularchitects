import { buildAnalysis } from "./analysis";
import { DEFAULT_ELIGIBILITY } from "./eligibility";
import { scoreOpportunity } from "./scoring";
import { DEFAULT_SEARCH } from "./config";
import { createFixtureFetch } from "./sources/ted-fixture";
import { createSimapFixtureFetch } from "./sources/simap-fixture";
import { fetchTedOpportunities } from "./sources/ted";
import { fetchSimapOpportunities } from "./sources/simap";
import { DEFAULT_TAXONOMY } from "./taxonomy";

/**
 * Runs the whole discovery pipeline against mocked official TED and SIMAP
 * responses.
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
  const ted = (await tedChecks()).map((check) => ({ ...check, name: `TED — ${check.name}` }));
  const simap = (await simapChecks()).map((check) => ({ ...check, name: `SIMAP — ${check.name}` }));
  return [...ted, ...simap];
}

async function tedChecks(): Promise<SelfCheckResult[]> {
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

async function simapChecks(): Promise<SelfCheckResult[]> {
  const results: SelfCheckResult[] = [];
  const { fetchImpl, requests } = createSimapFixtureFetch();

  const fetched = await fetchSimapOpportunities(DEFAULT_SEARCH, { fetchImpl, now: FIXTURE_NOW });

  const searchUrl = requests[0] ?? "";
  results.push({
    name: "Rəsmi axtarış sorğusu İsveçrə və CPV filtrləri ilə qurulur",
    passed:
      searchUrl.includes("/publications/v2/project/project-search") &&
      searchUrl.includes("orderAddressCountryOnlySwitzerland=true") &&
      searchUrl.includes("projectSubTypes=service") &&
      searchUrl.includes("cpvCodes=71220000") &&
      searchUrl.includes("newestPublicationFrom="),
    detail: searchUrl || "sorğu qurulmadı",
  });

  results.push({
    name: "Detallar rəsmi publication-details endpoint-indən oxunur",
    passed: requests.some((url) => url.includes("/publications/v1/project/") && url.includes("/publication-details/")),
    detail: requests.find((url) => url.includes("publication-details")) ?? "detal sorğusu yoxdur",
  });

  // Five fixture projects, one of them split into two lots.
  results.push({
    name: "Bütün elanlar və lotlar normallaşdırılır",
    passed: fetched.opportunities.length === 6,
    detail: `${fetched.opportunities.length} imkan map edildi (5 layihə, 1-i 2 lotlu)`,
  });

  const byKey = new Map(fetched.opportunities.map((item) => [`${item.sourceRef}|${item.sourceLot}`, item]));

  const zurich = byKey.get("90101|");
  results.push({
    name: "Rəsmi SIMAP linki qorunur",
    passed: zurich?.sourceUrl === "https://www.simap.ch/de/project-detail/11111111-1111-4111-8111-000000090101",
    detail: zurich?.sourceUrl ?? "link yoxdur",
  });

  results.push({
    name: "Təkrarlanma açarı layihə nömrəsi, versiya isə elan nömrəsidir",
    passed: zurich?.sourceRef === "90101" && zurich?.noticeVersion === "90101-01",
    detail: `${zurich?.sourceRef ?? "?"} / ${zurich?.noticeVersion ?? "?"}`,
  });

  results.push({
    name: "Rəsmi son tarix elan detalından oxunur",
    passed: zurich?.deadlineAt === new Date("2030-05-14T16:00:00+02:00").toISOString(),
    detail: zurich?.deadlineAt ?? "son tarix yoxdur",
  });

  results.push({
    name: "Kanton və şəhər saxlanılır",
    passed: zurich?.city === "Zürich (ZH)" && zurich?.country === "CHE",
    detail: `${zurich?.country ?? "?"} · ${zurich?.city ?? "?"}`,
  });

  results.push({
    name: "Müqavilə dəyəri uydurulmur",
    passed: fetched.opportunities.every((item) => item.valueAmount === null),
    detail: "SIMAP tender elanları dəyər dərc etmir; sahə boş qalır",
  });

  results.push({
    name: "TED-də paralel dərc olunan elan üçün rəsmi istinad saxlanılır",
    passed: zurich?.crossSourceRefs.includes("590101-2029") ?? false,
    detail: zurich?.crossSourceRefs.join(", ") || "istinad yoxdur",
  });

  const lotTwo = byKey.get("90103|2");
  results.push({
    name: "Lotlar ayrıca imkan kimi öz son tarixi ilə yazılır",
    passed: lotTwo?.deadlineAt === new Date("2030-07-15T17:00:00+02:00").toISOString(),
    detail: lotTwo ? `${lotTwo.sourceRef}|${lotTwo.sourceLot} · ${lotTwo.deadlineAt}` : "lot tapılmadı",
  });

  const scoreByKey = new Map(
    fetched.opportunities.map((item) => [
      `${item.sourceRef}|${item.sourceLot}`,
      scoreOpportunity(item, DEFAULT_TAXONOMY, DEFAULT_ELIGIBILITY, FIXTURE_NOW),
    ]),
  );

  const zurichScore = scoreByKey.get("90101|");
  results.push({
    name: "Almanca Generalplaner elanı güclü qiymət alır",
    passed: Boolean(zurichScore && !zurichScore.excluded && zurichScore.score >= 70),
    detail: zurichScore ? `${zurichScore.score} / ${zurichScore.band}` : "qiymətləndirilmədi",
  });

  const genevaScore = scoreByKey.get("90102|");
  results.push({
    name: "Fransızca terminologiya tanınır (planificateur général / architecte)",
    passed: Boolean(genevaScore && !genevaScore.excluded && genevaScore.projectType && genevaScore.score >= 50),
    detail: genevaScore
      ? `${genevaScore.score} / ${genevaScore.band} · ${genevaScore.projectType ?? "tip tapılmadı"}`
      : "qiymətləndirilmədi",
  });

  const luganoScore = scoreByKey.get("90103|1");
  results.push({
    name: "İtalyanca müsabiqə terminologiyası tanınır (concorso di progettazione)",
    passed: Boolean(luganoScore && !luganoScore.excluded && luganoScore.score >= 70),
    detail: luganoScore
      ? `${luganoScore.score} / ${luganoScore.band} · ${luganoScore.projectType ?? "tip tapılmadı"}`
      : "qiymətləndirilmədi",
  });

  const roadScore = scoreByKey.get("90104|");
  results.push({
    name: "Yol və kunstbauten mühəndisliyi istisna edilir",
    passed: Boolean(roadScore?.excluded),
    detail: roadScore?.exclusionReasons.join(", ") || "istisna edilmədi",
  });

  const trainingScore = scoreByKey.get("90105|");
  results.push({
    name: "BIM təlimi memarlıq CPV kodu olsa belə istisna edilir",
    passed: Boolean(trainingScore?.excluded),
    detail: trainingScore?.exclusionReasons.join(", ") || "istisna edilmədi",
  });

  results.push({
    name: "İsveçrə olmaq tək başına yüksək qiymət vermir",
    passed: Boolean(roadScore?.score === 0 && trainingScore?.score === 0),
    detail: `yol: ${roadScore?.score ?? "?"} · təlim: ${trainingScore?.score ?? "?"} (hər ikisi İsveçrə elanıdır)`,
  });

  return results;
}
