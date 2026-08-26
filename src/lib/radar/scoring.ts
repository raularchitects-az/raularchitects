import {
  countryWeight,
  hasCountryPreferences,
  isPriorityCountry,
  type EligibilityProfile,
} from "./eligibility";
import {
  cpvMatchesFamily,
  cpvMatchesPrefix,
  matchesTerm,
  normalizeText,
  type ProjectTypeKey,
  type RadarTaxonomy,
} from "./taxonomy";
import { daysUntilDeadline } from "./deadline";
import type { ScoreBand, ScoreFactor, ScoreResult, SourceOpportunity } from "./types";

/**
 * Deterministic, explainable scoring.
 *
 * Every point that lands in the total is recorded as a factor, so the admin UI
 * can show exactly why a tender scored what it scored. Nothing here infers
 * facts: when the source is silent the result is an entry in `unknowns`, and
 * unknowns cost points rather than earning them.
 *
 * Phase 1 only has the notice title, buyer and CPV codes to work with, so the
 * scorer must stay conservative. A tender never scores well just because the
 * word "architecture" appears somewhere in it — CPV evidence carries the
 * weight, and the exclusion pass runs first.
 */

const MAX_CPV_POINTS = 32;
const MAX_TYPE_POINTS = 16;
const MAX_COUNTRY_POINTS = 16;
const MAX_BOOSTER_POINTS = 10;

const BOOSTER_TYPES: ProjectTypeKey[] = ["bim", "competition", "general_planning"];

const SERVICE_BY_TYPE: Partial<Record<ProjectTypeKey, string[]>> = {
  architecture_general: ["Memarlıq layihələndirmə"],
  general_planning: ["Baş planlaşdırma (Generalplanung)"],
  bim: ["BIM planlaşdırma"],
  masterplanning: ["Masterplan"],
  urban_planning: ["Şəhərsalma"],
  housing: ["Memarlıq layihələndirmə", "Yaşayış kompleksləri"],
  mixed_use: ["Memarlıq layihələndirmə", "Qarışıq təyinatlı komplekslər"],
  hospitality: ["Memarlıq layihələndirmə", "Otel və turizm obyektləri"],
  luxury_residential: ["Memarlıq layihələndirmə", "Villa və premium yaşayış"],
  commercial: ["Memarlıq layihələndirmə", "Kommersiya obyektləri"],
  public_cultural: ["Memarlıq layihələndirmə", "İctimai və mədəni obyektlər"],
  education: ["Memarlıq layihələndirmə", "Təhsil obyektləri"],
  interior: ["İnteryer memarlığı"],
  landscape: ["Landşaft planlaşdırma"],
  feasibility: ["Feasibility və konsepsiya"],
  competition: ["Memarlıq müsabiqəsi"],
};

const PORTFOLIO_BY_TYPE: Partial<Record<ProjectTypeKey, string>> = {
  housing: "Residential",
  luxury_residential: "Villa",
  mixed_use: "Mixed-use",
  hospitality: "Hospitality",
  urban_planning: "Urban design",
  masterplanning: "Urban design",
  public_cultural: "Public",
  education: "Public",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function scoreBandFor(score: number): ScoreBand {
  if (score >= 85) return "excellent";
  if (score >= 70) return "potential";
  if (score >= 50) return "review";
  return "low";
}

export function scoreOpportunity(
  opportunity: SourceOpportunity,
  taxonomy: RadarTaxonomy,
  profile: EligibilityProfile,
  now: Date = new Date(),
): ScoreResult {
  const factors: ScoreFactor[] = [];
  const unknowns: string[] = [];
  const exclusionReasons: string[] = [];
  const services = new Set<string>();

  // What the tender *is*: the officially published subject line. Exclusions
  // read only this. A description routinely names neighbouring disciplines —
  // a Swiss architecture mandate lists the civil engineering and building
  // services lots beside it — and letting that text exclude the notice would
  // bury exactly the combined mandates Raul wants to see.
  const subject = normalizeText([opportunity.title, opportunity.buyerName ?? ""].join(" "));
  // What the tender is *about*: classification may also read the official
  // description, which is often the only place a German, French or Italian
  // notice states the project type.
  const haystack = normalizeText(
    [opportunity.title, opportunity.buyerName ?? "", opportunity.summary ?? ""].join(" "),
  );
  const cpvCodes = opportunity.cpvCodes.filter(Boolean);

  // --- CPV evidence -------------------------------------------------------
  const matchedFamilies = taxonomy.cpvFamilies.filter((family) =>
    cpvCodes.some((code) => cpvMatchesFamily(code, family.code)),
  );
  // Architecture evidence is not only structural. Swiss buyers routinely file
  // an architecture mandate under the umbrella code 71000000, which is too
  // broad to count on its own, while the subject line says "Architekt" or
  // "architecte" outright. Either kind of evidence counterbalances a hard rule.
  const architectureTerminology = taxonomy.coreTerms.some((term) => matchesTerm(subject, term));
  const strongArchitecture = matchedFamilies.some((family) => family.weight >= 10) || architectureTerminology;
  const cpvPoints = clamp(
    matchedFamilies.reduce((sum, family) => sum + family.weight, 0),
    0,
    MAX_CPV_POINTS,
  );

  // --- Exclusions run before anything can earn points ---------------------
  let excluded = false;
  for (const rule of taxonomy.exclusions) {
    const cpvHit = cpvCodes.some((code) => rule.cpvPrefixes.some((prefix) => cpvMatchesPrefix(code, prefix)));
    const termHit = rule.terms.some((term) => matchesTerm(subject, term));
    if (!cpvHit && !termHit) continue;

    // A design-and-build notice can legitimately carry both an architecture
    // CPV and a construction CPV, so a hard rule only excludes when there is
    // no strong architecture evidence to counterbalance it. An `absolute` rule
    // ignores that counterbalance.
    if (rule.severity === "hard" && (rule.absolute || !strongArchitecture)) {
      excluded = true;
      exclusionReasons.push(rule.label);
      factors.push({ key: `exclusion:${rule.key}`, label: `İstisna: ${rule.label}`, points: 0 });
      continue;
    }
    const penalty = rule.severity === "hard" ? -8 : -6;
    factors.push({
      key: `exclusion-soft:${rule.key}`,
      label: `Qismən uyğunsuz: ${rule.label}`,
      points: penalty,
      detail: "Memarlıq CPV kodu mövcud olduğu üçün tam istisna edilmədi.",
    });
  }

  const expired = (daysUntilDeadline(opportunity.deadlineAt, now) ?? 0) < 0 && Boolean(opportunity.deadlineAt);
  if (expired) {
    excluded = true;
    exclusionReasons.push("Son tarix keçib");
  }

  if (excluded) {
    return {
      score: 0,
      band: "low",
      factors,
      services: [],
      projectType: null,
      excluded: true,
      exclusionReasons,
      unknowns,
    };
  }

  if (cpvPoints > 0) {
    factors.push({
      key: "cpv",
      label: "CPV uyğunluğu",
      points: cpvPoints,
      detail: matchedFamilies.map((family) => family.code).join(", "),
    });
  } else {
    const coreHit = taxonomy.coreTerms.some((term) => matchesTerm(haystack, term));
    if (coreHit) {
      factors.push({
        key: "cpv-terminology-only",
        label: "Yalnız terminologiya uyğunluğu",
        points: 6,
        detail: "Memarlıq CPV ailəsi tapılmadı; qiymət ehtiyatlı saxlanıldı.",
      });
    }
    unknowns.push("Mənbədə memarlıq CPV kodu göstərilməyib.");
  }

  // --- Project type -------------------------------------------------------
  const matchedTypes = taxonomy.projectTypes.filter((type) => type.terms.some((term) => matchesTerm(haystack, term)));
  const targeted = new Set<string>(profile.targetProjectTypes);
  const bestType = matchedTypes
    .slice()
    .sort((a, b) => {
      const aTarget = targeted.has(a.key) ? 1 : 0;
      const bTarget = targeted.has(b.key) ? 1 : 0;
      return bTarget - aTarget || b.weight - a.weight;
    })[0];

  if (bestType) {
    const onTarget = targeted.has(bestType.key);
    const points = clamp(onTarget ? bestType.weight + 4 : 4, 0, MAX_TYPE_POINTS);
    factors.push({
      key: "project-type",
      label: `Layihə tipi: ${bestType.label}`,
      points,
      detail: onTarget ? "Hədəf layihə tiplərindədir." : "Hədəf siyahısında deyil.",
    });
    for (const type of matchedTypes) {
      for (const service of SERVICE_BY_TYPE[type.key] ?? []) services.add(service);
    }
  } else {
    unknowns.push("Layihə tipi başlıqdan müəyyən edilmədi.");
  }

  // --- Country ------------------------------------------------------------
  // Raul works internationally, so no country is favoured until the profile
  // says so; until then every eligible country contributes the same weight.
  const countryPreferences = hasCountryPreferences(profile);
  if (opportunity.country) {
    const points = clamp(countryWeight(profile, opportunity.country), 0, MAX_COUNTRY_POINTS);
    factors.push({
      key: "country",
      label: countryPreferences
        ? `Ölkə prioriteti: ${opportunity.country}`
        : `Avropa bazarı: ${opportunity.country}`,
      points,
      detail: countryPreferences
        ? undefined
        : "Uyğunluq profilində ölkə prioriteti təyin edilməyib; bütün ölkələr bərabər sayılır.",
    });
  } else {
    unknowns.push("Mənbədə ölkə göstərilməyib.");
  }

  // --- Scale --------------------------------------------------------------
  if (opportunity.valueAmount !== null && opportunity.valueAmount > 0) {
    const amount = opportunity.valueAmount;
    if (profile.minValueEur !== null && amount < profile.minValueEur) {
      factors.push({
        key: "value-small",
        label: "Büdcə hədəfdən kiçikdir",
        points: -10,
        detail: `${amount.toLocaleString("az-AZ")} ${opportunity.valueCurrency ?? ""}`.trim(),
      });
    } else if (profile.idealValueEur !== null && amount >= profile.idealValueEur) {
      factors.push({
        key: "value-ideal",
        label: "Büdcə ideal həddədir",
        points: 8,
        detail: `${amount.toLocaleString("az-AZ")} ${opportunity.valueCurrency ?? ""}`.trim(),
      });
    } else {
      factors.push({ key: "value-ok", label: "Büdcə qəbul edilə bilər", points: 4 });
    }
  } else {
    unknowns.push("Müqavilə dəyəri rəsmi olaraq göstərilməyib.");
  }

  // --- Deadline -----------------------------------------------------------
  const days = daysUntilDeadline(opportunity.deadlineAt, now);
  if (days === null) {
    factors.push({
      key: "deadline-unknown",
      label: "Son tarix bilinmir",
      points: -8,
      detail: "Mənbədə təklif son tarixi yoxdur.",
    });
    unknowns.push("Təklif son tarixi mənbədə yoxdur.");
  } else if (days >= 15) {
    factors.push({ key: "deadline-normal", label: `Son tarixə ${days} gün var`, points: 10 });
  } else if (days >= 4) {
    factors.push({ key: "deadline-high", label: `Son tarixə ${days} gün qalıb`, points: 5 });
  } else {
    factors.push({
      key: "deadline-urgent",
      label: `Son tarixə ${days} gün qalıb`,
      points: 1,
      detail: "Hazırlıq üçün vaxt çox azdır.",
    });
  }

  // --- Strategic boosters -------------------------------------------------
  const boosters = matchedTypes.filter((type) => BOOSTER_TYPES.includes(type.key));
  if (boosters.length) {
    factors.push({
      key: "strategic",
      label: "Strateji uyğunluq (BIM / müsabiqə / generalplanung)",
      points: MAX_BOOSTER_POINTS,
      detail: boosters.map((type) => type.label).join(", "),
    });
  }

  // --- Language -----------------------------------------------------------
  const accepted = profile.submissionLanguages.map((code) => code.toLowerCase());
  if (opportunity.languages.length) {
    const noticeLanguages = opportunity.languages.map((code) => code.toLowerCase().slice(0, 2));
    const canSubmit = noticeLanguages.some((code) => accepted.includes(code));
    factors.push({
      key: "language",
      label: canSubmit ? "Dil tələbi qarşılanır" : "Dil tələbi problemli ola bilər",
      points: canSubmit ? 5 : -6,
      detail: opportunity.languages.join(", "),
    });
  } else {
    unknowns.push("Tender dili mənbədə göstərilməyib.");
  }

  // --- Portfolio fit ------------------------------------------------------
  const portfolioCategory = bestType ? PORTFOLIO_BY_TYPE[bestType.key] : undefined;
  if (portfolioCategory) {
    const known = profile.portfolioCategories.some(
      (item) => item.toLowerCase() === portfolioCategory.toLowerCase(),
    );
    if (known) {
      factors.push({
        key: "portfolio",
        label: `Portfolio təcrübəsi: ${portfolioCategory}`,
        points: 6,
      });
    }
  }

  // --- Qualification and local presence -----------------------------------
  // The Phase 1 field projection never contains selection criteria, so these
  // are recorded as unknowns instead of being assumed satisfied.
  unknowns.push("İxtisas və referans tələbləri yalnız tender sənədlərində görünür.");
  // Only penalise once the profile actually distinguishes markets. With no
  // country preferences the penalty would apply to every opportunity equally
  // and would therefore say nothing about any of them.
  if (countryPreferences && !isPriorityCountry(profile, opportunity.country) && !profile.hasLocalPartnerNetwork) {
    factors.push({
      key: "local-presence",
      label: "Yerli ofis/partnyor tələbi aydın deyil",
      points: -4,
      detail: "Prioritet olmayan ölkə və təsdiqlənmiş partnyor şəbəkəsi yoxdur.",
    });
    unknowns.push("Yerli ofis və ya lisenziya tələbi təsdiqlənməyib.");
  }

  const unknownPenalty = clamp(unknowns.length * 2, 0, 8);
  if (unknownPenalty > 0) {
    factors.push({
      key: "unknowns",
      label: "Naməlum kritik məlumat",
      points: -unknownPenalty,
      detail: `${unknowns.length} nöqtə mənbədə açıqlanmayıb.`,
    });
  }

  const total = clamp(
    factors.reduce((sum, factor) => sum + factor.points, 0),
    0,
    100,
  );

  return {
    score: total,
    band: scoreBandFor(total),
    factors,
    services: [...services],
    projectType: bestType?.label ?? null,
    excluded: false,
    exclusionReasons,
    unknowns,
  };
}
