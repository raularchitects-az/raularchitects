/**
 * Architecture taxonomy for the Raul radar.
 *
 * Two independent signals are kept apart on purpose:
 *   - CPV families, which are structured and reliable;
 *   - multilingual terminology, because a German notice rarely contains the
 *     English word "architecture".
 *
 * Everything here is a default. `radar_settings` may override the whole object
 * from Advanced Settings, so UI components must never import these constants
 * for display logic — read the resolved taxonomy from settings.ts instead.
 */

export type ProjectTypeKey =
  | "architecture_general"
  | "general_planning"
  | "bim"
  | "masterplanning"
  | "urban_planning"
  | "housing"
  | "mixed_use"
  | "hospitality"
  | "luxury_residential"
  | "commercial"
  | "public_cultural"
  | "education"
  | "interior"
  | "landscape"
  | "feasibility"
  | "competition";

export type CpvFamily = {
  code: string;
  label: string;
  /** Points contributed when a notice carries this family. */
  weight: number;
};

export type ProjectTypeDefinition = {
  key: ProjectTypeKey;
  label: string;
  /** Lowercase terms, matched as whole words against normalized text. */
  terms: string[];
  /** Points contributed when the type matches a target project type. */
  weight: number;
};

export type ExclusionRule = {
  key: string;
  label: string;
  cpvPrefixes: string[];
  terms: string[];
  /** `hard` removes the opportunity from consideration, `soft` only penalises. */
  severity: "hard" | "soft";
};

export type RadarTaxonomy = {
  cpvFamilies: CpvFamily[];
  projectTypes: ProjectTypeDefinition[];
  exclusions: ExclusionRule[];
  /** Terms that signal architecture-led work regardless of project type. */
  coreTerms: string[];
};

export const CPV_FAMILIES: CpvFamily[] = [
  { code: "71000000", label: "Architectural, construction, engineering and inspection services", weight: 4 },
  { code: "71200000", label: "Architectural and related services", weight: 14 },
  { code: "71220000", label: "Architectural design services", weight: 16 },
  { code: "71221000", label: "Architectural services for buildings", weight: 16 },
  { code: "71222000", label: "Architectural services for outdoor areas", weight: 10 },
  { code: "71230000", label: "Organisation of architectural design contests", weight: 14 },
  { code: "71240000", label: "Architectural, engineering and planning services", weight: 14 },
  { code: "71241000", label: "Feasibility study, advisory service, analysis", weight: 8 },
  { code: "71242000", label: "Project and design preparation, estimation of costs", weight: 10 },
  { code: "71243000", label: "Draft plans (systems and integration)", weight: 9 },
  { code: "71245000", label: "Approval plans, working drawings and specifications", weight: 9 },
  { code: "71400000", label: "Urban planning and landscape architectural services", weight: 13 },
  { code: "71410000", label: "Urban planning services", weight: 13 },
  { code: "71420000", label: "Landscape architectural services", weight: 8 },
];

/**
 * German terminology is intentionally as rich as English because Germany is a
 * priority market and German notices are the least likely to be discoverable
 * through English keywords. French and Italian cover the remaining volume.
 */
export const PROJECT_TYPES: ProjectTypeDefinition[] = [
  {
    key: "architecture_general",
    label: "Memarlıq xidmətləri",
    weight: 10,
    terms: [
      "architecture services",
      "architectural services",
      "architectural design",
      "architectural consultancy",
      "architect services",
      "architekturleistungen",
      "architektenleistungen",
      "architekturbüro",
      "objektplanung",
      "planungsleistungen",
      "hochbau",
      "services d'architecture",
      "maîtrise d'oeuvre",
      "servizi di architettura",
      "servicios de arquitectura",
    ],
  },
  {
    key: "general_planning",
    label: "Baş planlaşdırma (Generalplanung)",
    weight: 12,
    terms: [
      "general planning",
      "generalplanung",
      "generalplaner",
      "generalplanerleistungen",
      "gesamtplanung",
      "integrated design services",
    ],
  },
  {
    key: "bim",
    label: "BIM planlaşdırma",
    weight: 12,
    terms: [
      "bim",
      "building information modelling",
      "building information modeling",
      "bim-planung",
      "bim planung",
      "bim-leistungen",
      "bim management",
      "bim-koordination",
      "openbim",
    ],
  },
  {
    key: "masterplanning",
    label: "Masterplan",
    weight: 11,
    terms: [
      "masterplan",
      "master plan",
      "masterplanning",
      "rahmenplanung",
      "strukturkonzept",
      "plan directeur",
      "piano direttore",
    ],
  },
  {
    key: "urban_planning",
    label: "Şəhərsalma",
    weight: 11,
    terms: [
      "urban planning",
      "urban design",
      "urban development",
      "städtebau",
      "stadtplanung",
      "stadtentwicklung",
      "bebauungsplan",
      "quartiersentwicklung",
      "urbanisme",
      "urbanistica",
    ],
  },
  {
    key: "housing",
    label: "Yaşayış",
    weight: 12,
    terms: [
      "housing",
      "residential",
      "apartment",
      "apartments",
      "dwellings",
      "wohnbau",
      "wohnungsbau",
      "wohngebäude",
      "wohnquartier",
      "mehrfamilienhaus",
      "geschosswohnungsbau",
      "logement",
      "residenziale",
    ],
  },
  {
    key: "mixed_use",
    label: "Qarışıq təyinatlı",
    weight: 11,
    terms: ["mixed-use", "mixed use", "mischnutzung", "mischgebiet", "nutzungsmischung"],
  },
  {
    key: "hospitality",
    label: "Otel / turizm",
    weight: 12,
    terms: [
      "hotel",
      "hotels",
      "resort",
      "hospitality",
      "hotelbau",
      "beherbergung",
      "tourismusprojekt",
      "hôtellerie",
      "albergo",
    ],
  },
  {
    key: "luxury_residential",
    label: "Premium yaşayış / villa",
    weight: 11,
    terms: ["villa", "villas", "luxury residential", "premium residential", "luxuswohnen", "penthouse"],
  },
  {
    key: "commercial",
    label: "Kommersiya / ofis",
    weight: 9,
    terms: [
      "office building",
      "commercial building",
      "bürogebäude",
      "verwaltungsgebäude",
      "geschäftshaus",
      "gewerbebau",
      "immeuble de bureaux",
    ],
  },
  {
    key: "public_cultural",
    label: "İctimai / mədəni",
    weight: 10,
    terms: [
      "public building",
      "cultural centre",
      "cultural center",
      "museum",
      "library",
      "theatre",
      "kulturzentrum",
      "bibliothek",
      "rathaus",
      "öffentliches gebäude",
      "bürgerzentrum",
      "bâtiment public",
    ],
  },
  {
    key: "education",
    label: "Təhsil",
    weight: 10,
    terms: [
      "school",
      "kindergarten",
      "university building",
      "campus",
      "schulbau",
      "schulgebäude",
      "kita",
      "hochschule",
      "bildungszentrum",
      "école",
      "scuola",
    ],
  },
  {
    key: "interior",
    label: "İnteryer memarlığı",
    weight: 7,
    terms: ["interior architecture", "interior design", "innenarchitektur", "innenausbau planung", "architecture intérieure"],
  },
  {
    key: "landscape",
    label: "Landşaft / ərazi planlaşdırma",
    weight: 6,
    terms: [
      "landscape architecture",
      "landschaftsarchitektur",
      "freiraumplanung",
      "freianlagen",
      "aussenraumgestaltung",
      "architecture du paysage",
    ],
  },
  {
    key: "feasibility",
    label: "Feasibility / konsepsiya",
    weight: 8,
    terms: [
      "feasibility study",
      "concept design",
      "design development",
      "machbarkeitsstudie",
      "vorplanung",
      "konzeptstudie",
      "entwurfsplanung",
      "étude de faisabilité",
      "studio di fattibilità",
    ],
  },
  {
    key: "competition",
    label: "Memarlıq müsabiqəsi",
    weight: 12,
    terms: [
      "design contest",
      "architectural competition",
      "architecture competition",
      "planning competition",
      "realisierungswettbewerb",
      "architekturwettbewerb",
      "planungswettbewerb",
      "wettbewerb",
      "concours d'architecture",
      "concorso di progettazione",
    ],
  },
];

/**
 * Exclusions stop the radar rewarding a notice just because the word
 * "architecture" appears somewhere in it.
 */
export const EXCLUSIONS: ExclusionRule[] = [
  {
    key: "construction_execution",
    label: "Yalnız tikinti icrası",
    severity: "hard",
    cpvPrefixes: ["45"],
    terms: [
      "construction works",
      "execution of works",
      "bauleistungen",
      "bauausführung",
      "rohbauarbeiten",
      "generalunternehmer",
      "travaux de construction",
    ],
  },
  {
    key: "engineering_only",
    label: "Yalnız mühəndislik / MEP / geodeziya",
    severity: "hard",
    cpvPrefixes: ["71300000", "71310000", "71320000", "71321", "71330000", "71340000", "71350000", "71351", "71355", "71600000", "71630000", "71700000"],
    terms: [
      "structural engineering only",
      "mep services",
      "building services engineering",
      "tragwerksplanung",
      "technische gebäudeausrüstung",
      "haustechnik",
      "elektrotechnik",
      "vermessungsleistungen",
      "baugrundgutachten",
      "geotechnik",
      "prüfstatik",
    ],
  },
  {
    key: "infrastructure_engineering",
    label: "Yol, dəmiryol, körpü, su və kommunal mühəndislik",
    severity: "hard",
    cpvPrefixes: ["71311", "71322", "71323", "45233", "45234", "45231", "45232"],
    terms: [
      "road design",
      "highway",
      "railway",
      "bridge design",
      "water treatment",
      "sewerage",
      "pipeline",
      "straßenplanung",
      "straßenbau",
      "brückenbau",
      "kanalbau",
      "wasserwirtschaft",
      "bahnanlagen",
      "tiefbau",
      "leitungsbau",
    ],
  },
  {
    key: "software_it",
    label: "BIM proqram təminatı / IT satınalma",
    severity: "hard",
    cpvPrefixes: ["48", "72"],
    terms: ["software licence", "software licenses", "software-lizenzen", "it-dienstleistungen", "cad software", "bim software"],
  },
  {
    key: "goods_supply",
    label: "Material və avadanlıq alışı",
    severity: "hard",
    cpvPrefixes: ["03", "09", "14", "15", "16", "18", "19", "22", "24", "30", "31", "32", "33", "34", "35", "37", "38", "39", "42", "43", "44"],
    terms: ["supply of", "delivery of goods", "lieferung von", "beschaffung von", "möbel", "equipment purchase"],
  },
  {
    key: "facility_management",
    label: "İstismar / təmizlik / obyekt idarəetməsi",
    severity: "soft",
    cpvPrefixes: ["79", "90", "50", "71315"],
    terms: ["facility management", "cleaning services", "maintenance services", "gebäudereinigung", "hausmeisterdienste", "instandhaltung"],
  },
];

export const CORE_TERMS = [
  "architect",
  "architectural",
  "architecture",
  "architekt",
  "architektur",
  "planungsleistungen",
  "objektplanung",
  "generalplanung",
  "städtebau",
  "hochbau",
  "urbanisme",
  "architettura",
  "arquitectura",
];

export const DEFAULT_TAXONOMY: RadarTaxonomy = {
  cpvFamilies: CPV_FAMILIES,
  projectTypes: PROJECT_TYPES,
  exclusions: EXCLUSIONS,
  coreTerms: CORE_TERMS,
};

/** Lowercases and flattens punctuation so term matching works across languages. */
export function normalizeText(value: string) {
  return ` ${value.toLowerCase().replace(/[\s\u00a0]+/g, " ").replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ")} `;
}

export function matchesTerm(haystack: string, term: string) {
  const needle = term.toLowerCase().trim();
  if (!needle) return false;
  return haystack.includes(` ${needle} `) || haystack.includes(` ${needle}-`) || haystack.includes(`-${needle} `);
}

export function cpvMatchesFamily(cpv: string, family: string) {
  const code = cpv.replace(/\D/g, "");
  const target = family.replace(/\D/g, "");
  if (!code || !target) return false;
  if (code === target) return true;
  // CPV is hierarchical: 71221000 sits under 71220000 and 71200000.
  const significant = target.replace(/0+$/, "");
  return significant.length > 0 && code.startsWith(significant);
}

export function cpvMatchesPrefix(cpv: string, prefix: string) {
  const code = cpv.replace(/\D/g, "");
  const target = prefix.replace(/\D/g, "");
  return Boolean(code && target && code.startsWith(target));
}
