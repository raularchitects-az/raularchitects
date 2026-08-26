import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreBadge } from "@/components/admin/radar/opportunity-card";
import { OpportunityActions } from "@/components/admin/radar/opportunity-actions";
import { daysUntilDeadline, formatDeadline } from "@/lib/radar/deadline";
import { loadOpportunity } from "@/lib/radar/queries";
import {
  DEADLINE_STATUS_LABEL,
  RECOMMENDATION_LABEL,
  STATE_LABEL,
  type RadarAnalysis,
  type ScoreFactor,
} from "@/lib/radar/types";

export const metadata = { robots: { index: false, follow: false } };

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-charcoal/5 py-2 last:border-b-0">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">{label}</dt>
      <dd className="text-sm text-charcoal">{value}</dd>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">{title}</h3>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-sm leading-relaxed text-charcoal/75">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function RadarOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { item, error } = await loadOpportunity(id);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">İmkan</h1>
        <p className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</p>
      </div>
    );
  }
  if (!item) notFound();

  const analysis = (item.analysis ?? {}) as Partial<RadarAnalysis>;
  const factors = (item.score_factors ?? []) as ScoreFactor[];
  const days = daysUntilDeadline(item.deadline_at);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/radar" className="text-[11px] uppercase tracking-[0.14em] text-charcoal/50 hover:text-charcoal">
        ← Business Radar
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ScoreBadge score={item.score} band={item.score_band} />
          <span className="text-[11px] uppercase tracking-[0.14em] text-charcoal/50">{STATE_LABEL[item.state]}</span>
        </div>
        <h1 className="max-w-4xl text-2xl font-semibold leading-snug">{item.title}</h1>
        <OpportunityActions id={item.id} sourceUrl={item.source_url} state={item.state} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2 border border-charcoal/10 bg-white p-5">
          <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Rəsmi mənbə faktları</h2>
          <p className="mb-2 text-[11px] text-charcoal/40">
            Yalnız TED elanında göstərilən məlumatlar. Boş sahələr mənbədə yoxdur.
          </p>
          <dl className="flex flex-col">
            <Fact label="Sifarişçi təşkilat" value={item.buyer_name} />
            <Fact label="Ölkə" value={item.country} />
            <Fact label="Şəhər" value={item.city} />
            <Fact label="CPV kodları" value={item.cpv_codes.join(", ") || null} />
            <Fact label="Elan tipi" value={item.notice_version ? `${item.source_ref} (v${item.notice_version})` : item.source_ref} />
            <Fact label="Dərc tarixi" value={item.published_at} />
            <Fact
              label="Təklif son tarixi"
              value={`${formatDeadline(item.deadline_at)} · ${DEADLINE_STATUS_LABEL[item.deadline_status]}${
                days !== null ? ` · ${days} gün qalıb` : ""
              }`}
            />
            <Fact
              label="Müqavilə dəyəri"
              value={
                item.value_amount
                  ? `${Number(item.value_amount).toLocaleString("az-AZ")} ${item.value_currency ?? ""}`.trim()
                  : null
              }
            />
            <Fact label="Prosedur ID" value={item.procedure_ref} />
            <Fact label="Mənbə" value={`${item.source_id.toUpperCase()} · ${item.source_ref}`} />
            <Fact label="Son yoxlanma" value={new Date(item.last_checked_at).toLocaleString("az-AZ")} />
          </dl>
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-[11px] uppercase tracking-[0.14em] text-bronze-dark hover:underline"
          >
            Rəsmi TED elanını aç
          </a>
        </section>

        <section className="flex flex-col gap-4 border border-charcoal/10 bg-[#fdfaf6] p-5">
          <div>
            <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Radar qiymətləndirməsi</h2>
            <p className="mt-1 text-[11px] text-charcoal/40">
              Bu bölmə mənbə faktlarından hesablanır və rəsmi məlumat deyil.
            </p>
          </div>

          {analysis.whyItMatters ? (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Niyə Raul üçün vacibdir</h3>
              <p className="text-sm leading-relaxed text-charcoal/75">{analysis.whyItMatters}</p>
            </div>
          ) : null}

          {analysis.fit ? (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Potensial uyğunluq</h3>
              <p className="text-sm leading-relaxed text-charcoal/75">{analysis.fit}</p>
            </div>
          ) : null}

          {item.services.length ? (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Uyğun Raul xidmətləri</h3>
              <p className="text-sm text-charcoal/75">{item.services.join(", ")}</p>
            </div>
          ) : null}

          <List title="Təsdiqlənmiş tələblər" items={analysis.verifiedRequirements ?? []} />
          <List title="Risklər və naməlumlar" items={analysis.risks ?? []} />

          {analysis.deadlineNote ? (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Son tarix</h3>
              <p className="text-sm text-charcoal/75">{analysis.deadlineNote}</p>
            </div>
          ) : null}

          {analysis.recommendation ? (
            <p className="border border-charcoal/15 bg-white px-4 py-3 text-sm font-medium text-charcoal">
              Tövsiyə olunan addım: {RECOMMENDATION_LABEL[analysis.recommendation]}
            </p>
          ) : null}
        </section>
      </div>

      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Qiymət amilləri</h2>
        {factors.length ? (
          <ul className="flex flex-col divide-y divide-charcoal/5">
            {factors.map((factor) => (
              <li key={factor.key} className="flex items-start justify-between gap-4 py-2">
                <span className="text-sm text-charcoal/75">
                  {factor.label}
                  {factor.detail ? <span className="block text-[11px] text-charcoal/40">{factor.detail}</span> : null}
                </span>
                <span
                  className={`shrink-0 text-sm font-medium ${factor.points < 0 ? "text-red-700" : "text-charcoal"}`}
                >
                  {factor.points > 0 ? `+${factor.points}` : factor.points}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-charcoal/45">Amil qeydə alınmayıb.</p>
        )}
      </section>

      <details className="border border-charcoal/10 bg-white p-5">
        <summary className="cursor-pointer text-sm uppercase tracking-[0.16em] text-charcoal/70">
          Emal olunmamış mənbə məlumatı
        </summary>
        <pre className="mt-3 max-h-96 overflow-auto bg-[#f7f2ec] p-4 text-[11px] leading-relaxed text-charcoal/70">
          {JSON.stringify(item.raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}
