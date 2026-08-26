import Link from "next/link";
import { daysUntilDeadline, formatDeadline } from "@/lib/radar/deadline";
import type { RadarListItem } from "@/lib/radar/queries";
import {
  DEADLINE_STATUS_LABEL,
  RECOMMENDATION_LABEL,
  SCORE_BAND_LABEL,
  SOURCE_LABEL,
  STATE_LABEL,
  type RadarAnalysis,
  type ScoreBand,
} from "@/lib/radar/types";

const BAND_CLASS: Record<ScoreBand, string> = {
  excellent: "bg-charcoal text-cream",
  potential: "bg-bronze-dark/15 text-charcoal",
  review: "bg-charcoal/10 text-charcoal/70",
  low: "bg-charcoal/5 text-charcoal/50",
};

const DEADLINE_CLASS: Record<string, string> = {
  urgent: "text-red-700",
  high: "text-bronze-dark",
  normal: "text-charcoal/60",
  unknown: "text-charcoal/40",
};

export function ScoreBadge({ score, band }: { score: number; band: ScoreBand }) {
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${BAND_CLASS[band]}`}>
      <strong className="text-sm tracking-normal">{score}</strong>
      {SCORE_BAND_LABEL[band]}
    </span>
  );
}

export function OpportunityCard({ item }: { item: RadarListItem }) {
  const analysis = (item.analysis ?? {}) as Partial<RadarAnalysis>;
  const days = daysUntilDeadline(item.deadline_at);
  const location = [item.country, item.city].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ScoreBadge score={item.score} band={item.score_band} />
          <span className="border border-charcoal/15 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-charcoal/50">
            {SOURCE_LABEL[item.source_id] ?? item.source_id}
          </span>
        </div>
        <span className={`text-[11px] uppercase tracking-[0.14em] ${DEADLINE_CLASS[item.deadline_status] ?? ""}`}>
          {DEADLINE_STATUS_LABEL[item.deadline_status]}
          {days !== null ? ` · ${days} gün` : ""}
        </span>
      </div>

      <Link href={`/admin/radar/${item.id}`} className="text-base font-semibold leading-snug text-charcoal hover:underline">
        {item.title}
      </Link>

      <dl className="grid gap-1 text-xs text-charcoal/60 sm:grid-cols-2">
        {item.buyer_name ? (
          <div>
            <dt className="inline text-charcoal/40">Sifarişçi: </dt>
            <dd className="inline">{item.buyer_name}</dd>
          </div>
        ) : null}
        {location ? (
          <div>
            <dt className="inline text-charcoal/40">Yer: </dt>
            <dd className="inline">{location}</dd>
          </div>
        ) : null}
        {item.project_type ? (
          <div>
            <dt className="inline text-charcoal/40">Layihə tipi: </dt>
            <dd className="inline">{item.project_type}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline text-charcoal/40">Son tarix: </dt>
          <dd className="inline">{formatDeadline(item.deadline_at)}</dd>
        </div>
        {item.value_amount ? (
          <div>
            <dt className="inline text-charcoal/40">Dəyər: </dt>
            <dd className="inline">
              {Number(item.value_amount).toLocaleString("az-AZ")} {item.value_currency ?? ""}
            </dd>
          </div>
        ) : null}
        {item.state !== "active" ? (
          <div>
            <dt className="inline text-charcoal/40">Status: </dt>
            <dd className="inline">{STATE_LABEL[item.state]}</dd>
          </div>
        ) : null}
      </dl>

      {item.services.length ? (
        <p className="text-xs text-charcoal/60">
          <span className="text-charcoal/40">Raul xidmətləri: </span>
          {item.services.join(", ")}
        </p>
      ) : null}

      {analysis.whyItMatters ? (
        <p className="border-l-2 border-bronze-dark/40 pl-3 text-xs leading-relaxed text-charcoal/70">
          <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Radar qiymətləndirməsi</span>
          <br />
          {analysis.whyItMatters}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-charcoal/10 pt-3 text-[11px] text-charcoal/40">
        <span>
          {analysis.recommendation ? RECOMMENDATION_LABEL[analysis.recommendation] : "Tövsiyə yoxdur"} · Mənbə ID:{" "}
          {item.source_ref}
        </span>
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="uppercase tracking-[0.14em] hover:text-charcoal">
          Rəsmi elan
        </a>
      </div>
    </article>
  );
}
