export type RadarSourceId = "ted" | "simap";

export type ScoreBand = "excellent" | "potential" | "review" | "low";

export type DeadlineStatus = "urgent" | "high" | "normal" | "unknown";

export type OpportunityState = "active" | "review_later" | "not_relevant" | "archived";

/** The only recommendations Phase 1 is allowed to produce. */
export type RadarRecommendation =
  | "review_documents"
  | "assess_consortium"
  | "check_local_eligibility"
  | "monitor_only";

export type RunTrigger = "schedule" | "manual";

export type RunStatus = "running" | "success" | "partial" | "failed";

/**
 * Verified facts from an official source, normalized but never enriched.
 * Anything the source did not supply stays null.
 */
export type SourceOpportunity = {
  sourceId: RadarSourceId;
  sourceRef: string;
  sourceLot: string;
  sourceUrl: string;
  procedureRef: string | null;
  noticeVersion: string | null;
  title: string;
  buyerName: string | null;
  country: string | null;
  city: string | null;
  cpvCodes: string[];
  publishedAt: string | null;
  deadlineAt: string | null;
  valueAmount: number | null;
  valueCurrency: string | null;
  formType: string | null;
  noticeType: string | null;
  languages: string[];
  raw: Record<string, unknown>;
};

export type ScoreFactor = {
  key: string;
  label: string;
  points: number;
  detail?: string;
};

export type ScoreResult = {
  score: number;
  band: ScoreBand;
  factors: ScoreFactor[];
  services: string[];
  projectType: string | null;
  excluded: boolean;
  exclusionReasons: string[];
  unknowns: string[];
};

export type RadarAnalysis = {
  whyItMatters: string;
  fit: string;
  verifiedRequirements: string[];
  risks: string[];
  deadlineNote: string;
  recommendation: RadarRecommendation;
  /** Phase 1 ships deterministic text only; see analysis.ts for the AI hook. */
  generatedBy: "deterministic" | "ai";
};

export type RadarOpportunityRow = {
  id: string;
  source_id: RadarSourceId;
  source_ref: string;
  source_lot: string;
  source_url: string;
  procedure_ref: string | null;
  notice_version: string | null;
  raw: Record<string, unknown>;
  title: string;
  buyer_name: string | null;
  country: string | null;
  city: string | null;
  cpv_codes: string[];
  project_type: string | null;
  published_at: string | null;
  deadline_at: string | null;
  deadline_status: DeadlineStatus;
  value_amount: number | null;
  value_currency: string | null;
  score: number;
  score_band: ScoreBand;
  score_factors: ScoreFactor[];
  services: string[];
  analysis: RadarAnalysis | Record<string, never>;
  state: OpportunityState;
  reviewed_at: string | null;
  reviewed_by: string | null;
  new_alert_sent_at: string | null;
  urgent_alert_sent_at: string | null;
  first_seen_at: string;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
};

export type RadarRunRow = {
  id: string;
  source_id: string;
  trigger: RunTrigger;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  fetched_count: number;
  created_count: number;
  updated_count: number;
  archived_count: number;
  alert_count: number;
  error: string | null;
  details: Record<string, unknown>;
};

export type RadarSourceRow = {
  id: string;
  label: string;
  availability: "available" | "planned";
  is_enabled: boolean;
  last_run_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
};

export const SCORE_BAND_LABEL: Record<ScoreBand, string> = {
  excellent: "Güclü uyğunluq",
  potential: "Potensial uyğunluq",
  review: "Yalnız nəzərdən keçir",
  low: "Aşağı uyğunluq",
};

export const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  urgent: "Təcili",
  high: "Yüksək diqqət",
  normal: "Normal",
  unknown: "Son tarix bilinmir",
};

export const RECOMMENDATION_LABEL: Record<RadarRecommendation, string> = {
  review_documents: "Tender sənədlərini nəzərdən keçir",
  assess_consortium: "Konsorsium imkanını qiymətləndir",
  check_local_eligibility: "Yerli uyğunluğu yoxla",
  monitor_only: "Yalnız izlə",
};

export const STATE_LABEL: Record<OpportunityState, string> = {
  active: "Aktiv",
  review_later: "Sonra baxılacaq",
  not_relevant: "Uyğun deyil",
  archived: "Arxiv",
};
