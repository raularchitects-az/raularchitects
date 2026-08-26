import { countryLabel, isPriorityCountry, type EligibilityProfile } from "./eligibility";
import { daysUntilDeadline, deadlineSummary } from "./deadline";
import type { RadarAnalysis, RadarRecommendation, ScoreResult, SourceOpportunity } from "./types";

/**
 * Phase 1 analysis is deterministic.
 *
 * Every sentence below is derived from a value the source actually returned or
 * from a scoring factor that is already visible in the UI. Nothing is inferred,
 * and no wording implies certainty the notice does not provide.
 *
 * AI hook (deferred to Phase 2): this repository has no general-purpose
 * server-side LLM configuration — DeepL is present but is a translation API
 * only. When a reviewed server-side AI configuration is added, implement
 * `RadarAnalysisAdapter` against it and return it from `resolveAnalysisAdapter`.
 * The adapter must receive only verified source facts plus the score factors,
 * and its output must keep the same shape so the UI keeps official facts and
 * Radar assessment visually separate. No paid AI dependency or secret is added
 * in this phase.
 */
export type RadarAnalysisAdapter = {
  id: "deterministic" | "ai";
  build: (input: {
    opportunity: SourceOpportunity;
    score: ScoreResult;
    profile: EligibilityProfile;
    now: Date;
  }) => RadarAnalysis;
};

function recommendationFor(
  opportunity: SourceOpportunity,
  score: ScoreResult,
  profile: EligibilityProfile,
  now: Date,
): RadarRecommendation {
  if (score.excluded || score.band === "low") return "monitor_only";

  const days = daysUntilDeadline(opportunity.deadlineAt, now);
  const localUnclear = !isPriorityCountry(profile, opportunity.country) && !profile.hasLocalPartnerNetwork;
  if (localUnclear) return "check_local_eligibility";

  const large =
    opportunity.valueAmount !== null &&
    profile.idealValueEur !== null &&
    opportunity.valueAmount >= profile.idealValueEur * 2;
  if (large && !profile.hasLocalPartnerNetwork) return "assess_consortium";

  if (score.band === "review" && days !== null && days <= 3) return "monitor_only";
  return "review_documents";
}

function whyItMatters(opportunity: SourceOpportunity, score: ScoreResult, profile: EligibilityProfile) {
  if (score.excluded) {
    return `Bu elan Raul üçün uyğun görünmür: ${score.exclusionReasons.join(", ") || "memarlıq xidməti deyil"}.`;
  }

  const parts: string[] = [];
  const country = countryLabel(profile, opportunity.country);
  if (isPriorityCountry(profile, opportunity.country)) {
    parts.push(`${country} Raul üçün prioritet bazardır`);
  } else if (country) {
    parts.push(`${country} ikinci dərəcəli prioritetdir`);
  }
  if (score.projectType) parts.push(`layihə tipi «${score.projectType}» studiyanın hədəf sahələrindədir`);
  if (score.services.length) parts.push(`tələb olunan xidmətlər: ${score.services.join(", ")}`);

  if (!parts.length) return "Elan memarlıq CPV ailəsinə düşür, lakin mənbə əlavə kontekst vermir.";
  return `${parts.join("; ")}.`;
}

function fitSummary(score: ScoreResult) {
  if (score.excluded) return "Uyğunluq yoxdur.";
  const positives = score.factors.filter((factor) => factor.points > 0);
  if (!positives.length) return "Mənbə məlumatı uyğunluğu təsdiqləmək üçün kifayət etmir.";
  return positives
    .slice()
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((factor) => `${factor.label} (+${factor.points})`)
    .join(", ");
}

function verifiedRequirements(opportunity: SourceOpportunity) {
  const out: string[] = [];
  if (opportunity.buyerName) out.push(`Sifarişçi: ${opportunity.buyerName}`);
  if (opportunity.country) out.push(`Ölkə: ${opportunity.country}`);
  if (opportunity.city) out.push(`Şəhər: ${opportunity.city}`);
  if (opportunity.cpvCodes.length) out.push(`CPV: ${opportunity.cpvCodes.join(", ")}`);
  if (opportunity.noticeType) out.push(`Elan tipi: ${opportunity.noticeType}`);
  if (opportunity.languages.length) out.push(`Rəsmi dil: ${opportunity.languages.join(", ")}`);
  if (opportunity.valueAmount !== null) {
    out.push(`Dəyər: ${opportunity.valueAmount.toLocaleString("az-AZ")} ${opportunity.valueCurrency ?? ""}`.trim());
  }
  return out;
}

function risks(score: ScoreResult, profile: EligibilityProfile) {
  const out: string[] = [];
  for (const factor of score.factors) {
    if (factor.points < 0) out.push(`${factor.label}${factor.detail ? ` — ${factor.detail}` : ""}`);
  }
  for (const unknown of score.unknowns) out.push(unknown);
  if (!profile.hasLocalPartnerNetwork) {
    out.push("Yerli partnyor şəbəkəsi profildə təsdiqlənməyib.");
  }
  for (const limitation of profile.licenceLimitations) out.push(limitation);
  return [...new Set(out)];
}

export const deterministicAdapter: RadarAnalysisAdapter = {
  id: "deterministic",
  build: ({ opportunity, score, profile, now }) => ({
    whyItMatters: whyItMatters(opportunity, score, profile),
    fit: fitSummary(score),
    verifiedRequirements: verifiedRequirements(opportunity),
    risks: risks(score, profile),
    deadlineNote: deadlineSummary(opportunity.deadlineAt, now),
    recommendation: recommendationFor(opportunity, score, profile, now),
    generatedBy: "deterministic",
  }),
};

/**
 * Returns the deterministic adapter until a reviewed server-side AI
 * configuration exists in this repository.
 */
export function resolveAnalysisAdapter(): RadarAnalysisAdapter {
  return deterministicAdapter;
}

export function buildAnalysis(
  opportunity: SourceOpportunity,
  score: ScoreResult,
  profile: EligibilityProfile,
  now: Date = new Date(),
): RadarAnalysis {
  return resolveAnalysisAdapter().build({ opportunity, score, profile, now });
}
