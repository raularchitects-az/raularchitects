import type { ProjectTypeKey } from "./taxonomy";

/**
 * What Raul Architects can realistically deliver and where.
 *
 * Defaults are deliberately conservative: anything the studio has not
 * confirmed is treated as unknown rather than as an advantage. Scoring adds
 * points for confirmed capability and flags unknowns as risks, so an
 * optimistic profile here would silently inflate every score.
 */
export type CountryPriority = {
  /** ISO 3166-1 alpha-3, matching the codes TED returns. */
  code: string;
  label: string;
  /** Points added for this country. */
  weight: number;
};

export type EligibilityProfile = {
  countryPriorities: CountryPriority[];
  /** Points for any European country not listed above. */
  otherEuropeWeight: number;
  supportedServices: string[];
  /** Languages a tender may realistically be submitted in. */
  submissionLanguages: string[];
  /** Leave false until a partner network is actually confirmed. */
  hasLocalPartnerNetwork: boolean;
  targetProjectTypes: ProjectTypeKey[];
  /** Below this, an opportunity is too small to be worth the effort. */
  minValueEur: number | null;
  idealValueEur: number | null;
  portfolioCategories: string[];
  /** Known limitations, surfaced as risks instead of being scored as fatal. */
  licenceLimitations: string[];
};

export const DEFAULT_ELIGIBILITY: EligibilityProfile = {
  countryPriorities: [
    { code: "DEU", label: "Almaniya", weight: 15 },
    { code: "CHE", label: "İsveçrə", weight: 15 },
    { code: "AUT", label: "Avstriya", weight: 8 },
  ],
  otherEuropeWeight: 4,
  supportedServices: [
    "Architectural design",
    "General planning",
    "BIM planning",
    "Masterplanning",
    "Urban design",
    "Concept and feasibility studies",
    "Interior architecture (architecture-led)",
    "Design competitions",
  ],
  submissionLanguages: ["de", "en"],
  hasLocalPartnerNetwork: false,
  targetProjectTypes: [
    "architecture_general",
    "general_planning",
    "bim",
    "masterplanning",
    "urban_planning",
    "housing",
    "mixed_use",
    "hospitality",
    "luxury_residential",
    "commercial",
    "public_cultural",
    "education",
    "feasibility",
    "competition",
  ],
  minValueEur: 100000,
  idealValueEur: 500000,
  portfolioCategories: ["Residential", "Mixed-use", "Hospitality", "Villa", "Urban design", "Public"],
  licenceLimitations: [
    "Yerli memarlıq palatası (Architektenkammer) qeydiyyatı təsdiqlənməyib.",
    "Yerli ofis tələbi olan tenderlər üçün partnyor lazım ola bilər.",
  ],
};

export function countryWeight(profile: EligibilityProfile, country: string | null) {
  if (!country) return 0;
  const code = country.trim().toUpperCase();
  const match = profile.countryPriorities.find((item) => item.code.toUpperCase() === code);
  if (match) return match.weight;
  return profile.otherEuropeWeight;
}

export function isPriorityCountry(profile: EligibilityProfile, country: string | null) {
  if (!country) return false;
  const code = country.trim().toUpperCase();
  return profile.countryPriorities.some((item) => item.code.toUpperCase() === code && item.weight >= 10);
}

export function countryLabel(profile: EligibilityProfile, country: string | null) {
  if (!country) return "";
  const code = country.trim().toUpperCase();
  return profile.countryPriorities.find((item) => item.code.toUpperCase() === code)?.label || code;
}
