import Link from "next/link";
import { OpportunityCard } from "@/components/admin/radar/opportunity-card";
import { loadRadarOverview, type RadarFilters, type RadarListItem } from "@/lib/radar/queries";
import { DEADLINE_STATUS_LABEL, SCORE_BAND_LABEL, type RadarRunRow } from "@/lib/radar/types";

export const metadata = { robots: { index: false, follow: false } };

const RUN_STATUS_LABEL: Record<string, string> = {
  running: "davam edir",
  success: "uğurlu",
  partial: "qismən",
  failed: "uğursuz",
};

function formatMoment(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBar({ lastRun, lastSuccessfulRun }: { lastRun: RadarRunRow | null; lastSuccessfulRun: RadarRunRow | null }) {
  const failing = lastRun?.status === "failed";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-charcoal/10 bg-white px-5 py-3 text-xs text-charcoal/60">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <span>
          <span className="text-charcoal/40">Son yoxlama: </span>
          {formatMoment(lastRun?.started_at ?? null)}
          {lastRun ? ` (${RUN_STATUS_LABEL[lastRun.status] ?? lastRun.status})` : ""}
        </span>
        {failing ? (
          <span className="text-red-700">
            Mənbə müvəqqəti əlçatmazdır. Son uğurlu yoxlama: {formatMoment(lastSuccessfulRun?.started_at ?? null)}
          </span>
        ) : null}
      </div>
      <Link href="/admin/radar/advanced" className="uppercase tracking-[0.14em] hover:text-charcoal">
        Advanced
      </Link>
    </div>
  );
}

function Section({
  title,
  description,
  items,
  emptyText,
}: {
  title: string;
  description: string;
  items: RadarListItem[];
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">{title}</h2>
        <p className="mt-1 text-xs text-charcoal/45">{description}</p>
      </div>
      {items.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-charcoal/15 bg-white px-5 py-6 text-xs text-charcoal/45">{emptyText}</p>
      )}
    </section>
  );
}

const selectClass =
  "border border-charcoal/15 bg-white px-3 py-2 text-xs text-charcoal outline-none focus:border-bronze-dark";

export default async function RadarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };

  const filters: RadarFilters = {
    country: single("country"),
    band: single("band") as RadarFilters["band"],
    deadline: single("deadline") as RadarFilters["deadline"],
    projectType: single("projectType"),
  };

  const overview = await loadRadarOverview(filters);

  if (overview.setupError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold">Business Radar</h1>
        <p className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{overview.setupError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Business Radar</h1>
          <p className="mt-1 text-xs text-charcoal/45">
            TED Europe rəsmi elanları. Faktlar mənbədən, qiymətləndirmə Radar tərəfindən hazırlanır.
          </p>
        </div>
      </div>

      <StatusBar lastRun={overview.lastRun} lastSuccessfulRun={overview.lastSuccessfulRun} />

      <Section
        title="Bu gün tövsiyə olunan"
        description="Raul üçün ən güclü aktiv imkanlar (maksimum 3)."
        items={overview.recommended}
        emptyText="Bu gün tövsiyə olunacaq güclü imkan yoxdur."
      />

      <Section
        title="Bugünkü imkanlar"
        description="Bu gün tapılanlar və son tarixi təcili olan aktiv elanlar."
        items={overview.today}
        emptyText="Bu gün yeni və ya təcili imkan tapılmadı."
      />

      <Section
        title="Ən güclü imkanlar"
        description="Hazırda aktiv olan ən yüksək qiymətli elanlar."
        items={overview.top}
        emptyText="Aktiv imkan yoxdur."
      />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Bütün imkanlar</h2>
          <p className="mt-1 text-xs text-charcoal/45">Aktiv elanlar. Filtrlər yalnız mənbə faktlarına əsaslanır.</p>
        </div>

        <form method="get" className="flex flex-wrap items-end gap-3 border border-charcoal/10 bg-white p-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Ölkə</span>
            <select name="country" defaultValue={filters.country} className={selectClass}>
              <option value="">Hamısı</option>
              {overview.countries.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Qiymət bandı</span>
            <select name="band" defaultValue={filters.band} className={selectClass}>
              <option value="">Hamısı</option>
              {Object.entries(SCORE_BAND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Son tarix</span>
            <select name="deadline" defaultValue={filters.deadline} className={selectClass}>
              <option value="">Hamısı</option>
              {Object.entries(DEADLINE_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">Layihə tipi</span>
            <select name="projectType" defaultValue={filters.projectType} className={selectClass}>
              <option value="">Hamısı</option>
              {overview.projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="bg-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-cream">
            Filtrlə
          </button>
          <Link href="/admin/radar" className="text-[11px] uppercase tracking-[0.14em] text-charcoal/50 hover:text-charcoal">
            Sıfırla
          </Link>
        </form>

        {overview.all.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {overview.all.map((item) => (
              <OpportunityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-charcoal/15 bg-white px-5 py-6 text-xs text-charcoal/45">
            Seçilmiş filtrlərə uyğun aktiv imkan yoxdur.
          </p>
        )}
      </section>
    </div>
  );
}
