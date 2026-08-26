import Link from "next/link";
import { Field, Select, SubmitButton, TextArea, TextInput, inputClass } from "@/components/admin/fields";
import { OpportunityCard } from "@/components/admin/radar/opportunity-card";
import { RunPanel, SourceToggle } from "@/components/admin/radar/run-panel";
import {
  saveRadarAlertSettings,
  saveRadarEligibilitySettings,
  saveRadarSearchSettings,
  saveRadarTaxonomySettings,
} from "@/lib/radar/actions";
import { loadRadarArchive, loadRadarRuns, loadRadarSources } from "@/lib/radar/queries";
import { getRadarSettings } from "@/lib/radar/settings";
import { PROJECT_TYPES } from "@/lib/radar/taxonomy";

export const metadata = { robots: { index: false, follow: false } };

function moment(value: string | null) {
  return value ? new Date(value).toLocaleString("az-AZ") : "—";
}

export default async function RadarAdvancedPage() {
  const [{ sources, error: sourcesError }, { runs }, { items: archive }, settings] = await Promise.all([
    loadRadarSources(),
    loadRadarRuns(20),
    loadRadarArchive(20),
    getRadarSettings(),
  ]);

  const alertsReady = Boolean(settings.alerts.recipient.trim() || process.env["RADAR_ALERT_TO_EMAIL"]?.trim());

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link href="/admin/radar" className="text-[11px] uppercase tracking-[0.14em] text-charcoal/50 hover:text-charcoal">
          ← Business Radar
        </Link>
        <h1 className="text-3xl font-semibold">Advanced</h1>
        <p className="text-xs text-charcoal/45">
          Texniki idarəetmə: mənbələr, manual axtarış, tarixçə, arxiv və axtarış profili.
        </p>
      </div>

      {sourcesError ? (
        <p className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{sourcesError}</p>
      ) : null}

      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Mənbələr</h2>
        <ul className="flex flex-col divide-y divide-charcoal/5">
          {sources.map((source) => (
            <li key={source.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="text-sm text-charcoal">
                {source.label}
                <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-charcoal/40">
                  {source.availability === "available" ? "aktiv mərhələ" : "Phase 2"}
                </span>
                <span className="block text-[11px] text-charcoal/40">
                  Son işləmə: {moment(source.last_run_at)} · Son uğurlu: {moment(source.last_success_at)}
                </span>
                {source.last_error ? (
                  <span className="block text-[11px] text-red-700">Son xəta: {source.last_error}</span>
                ) : null}
              </div>
              <SourceToggle
                id={source.id}
                enabled={source.is_enabled}
                disabled={source.availability !== "available"}
              />
            </li>
          ))}
          {sources.length === 0 ? <li className="py-3 text-xs text-charcoal/45">Mənbə qeydə alınmayıb.</li> : null}
        </ul>
      </section>

      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Manual axtarış</h2>
        <RunPanel />
      </section>

      <section className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Axtarış tarixçəsi</h2>
        {runs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">
                <tr>
                  <th className="py-2">Başlama</th>
                  <th className="py-2">Tetik</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Oxundu</th>
                  <th className="py-2">Yeni</th>
                  <th className="py-2">Yeniləndi</th>
                  <th className="py-2">Arxiv</th>
                  <th className="py-2">Bildiriş</th>
                  <th className="py-2">Qeyd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5 text-charcoal/70">
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td className="py-2">{moment(run.started_at)}</td>
                    <td className="py-2">{run.trigger}</td>
                    <td className={`py-2 ${run.status === "failed" ? "text-red-700" : ""}`}>{run.status}</td>
                    <td className="py-2">{run.fetched_count}</td>
                    <td className="py-2">{run.created_count}</td>
                    <td className="py-2">{run.updated_count}</td>
                    <td className="py-2">{run.archived_count}</td>
                    <td className="py-2">{run.alert_count}</td>
                    <td className="py-2 text-[11px] text-charcoal/45">
                      {run.error ?? (Array.isArray(run.details?.warnings) ? run.details.warnings.join(" ") : "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-charcoal/45">Hələ axtarış işlədilməyib.</p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Arxiv</h2>
        <p className="text-xs text-charcoal/45">
          Son tarixi keçmiş və ya uyğun olmayan kimi işarələnmiş elanlar. Aktiv siyahılarda görünmür.
        </p>
        {archive.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {archive.map((item) => (
              <OpportunityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-charcoal/15 bg-white px-5 py-6 text-xs text-charcoal/45">
            Arxivdə elan yoxdur.
          </p>
        )}
      </section>

      <form action={saveRadarSearchSettings} className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Axtarış profili</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Geriyə baxış (gün)">
            <TextInput name="lookbackDays" type="number" min={1} max={365} defaultValue={settings.search.lookbackDays} />
          </Field>
          <Field label="Səhifə həcmi (1–250)">
            <TextInput name="pageLimit" type="number" min={1} max={250} defaultValue={settings.search.pageLimit} />
          </Field>
          <Field label="Maksimum səhifə">
            <TextInput name="maxPages" type="number" min={1} max={20} defaultValue={settings.search.maxPages} />
          </Field>
          <Field label="Əhatə (scope)">
            <Select name="scope" defaultValue={settings.search.scope}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LATEST">LATEST</option>
              <option value="ALL">ALL</option>
            </Select>
          </Field>
          <Field label="Ölkə filtri (ISO3, boş = hamısı)">
            <TextInput name="countryFilter" defaultValue={settings.search.countryFilter.join(" ")} placeholder="DEU CHE" />
          </Field>
          <Field label="Əlavə mənbə sahələri">
            <TextInput name="extraFields" defaultValue={settings.search.extraFields.join(" ")} />
          </Field>
        </div>
        <Field label="CPV kodları">
          <TextArea name="cpvCodes" defaultValue={settings.search.cpvCodes.join(" ")} />
        </Field>
        <label className="flex items-center gap-2 text-xs text-charcoal/70">
          <input type="checkbox" name="onlyLatestVersions" defaultChecked={settings.search.onlyLatestVersions} />
          Yalnız elanın son versiyası
        </label>
        <SubmitButton>Yadda saxla</SubmitButton>
      </form>

      <form action={saveRadarEligibilitySettings} className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Raul uyğunluq profili</h2>
        <Field label="Ölkə prioritetləri (KOD:Ad:çəki — hər sətirdə bir)">
          <TextArea
            name="countryPriorities"
            defaultValue={settings.eligibility.countryPriorities
              .map((item) => `${item.code}:${item.label}:${item.weight}`)
              .join("\n")}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Digər Avropa çəkisi">
            <TextInput name="otherEuropeWeight" type="number" defaultValue={settings.eligibility.otherEuropeWeight} />
          </Field>
          <Field label="Minimum dəyər (EUR)">
            <TextInput name="minValueEur" type="number" defaultValue={settings.eligibility.minValueEur ?? ""} />
          </Field>
          <Field label="İdeal dəyər (EUR)">
            <TextInput name="idealValueEur" type="number" defaultValue={settings.eligibility.idealValueEur ?? ""} />
          </Field>
        </div>
        <Field label="Təqdim edilə bilən dillər (kod)">
          <TextInput name="submissionLanguages" defaultValue={settings.eligibility.submissionLanguages.join(" ")} />
        </Field>
        <Field label={`Hədəf layihə tipləri (${PROJECT_TYPES.map((type) => type.key).join(", ")})`}>
          <TextArea name="targetProjectTypes" defaultValue={settings.eligibility.targetProjectTypes.join(" ")} />
        </Field>
        <Field label="Dəstəklənən xidmətlər (hər sətirdə bir)">
          <TextArea name="supportedServices" defaultValue={settings.eligibility.supportedServices.join("\n")} />
        </Field>
        <Field label="Portfolio kateqoriyaları (hər sətirdə bir)">
          <TextArea name="portfolioCategories" defaultValue={settings.eligibility.portfolioCategories.join("\n")} />
        </Field>
        <Field label="Lisenziya məhdudiyyətləri (hər sətirdə bir)">
          <TextArea name="licenceLimitations" defaultValue={settings.eligibility.licenceLimitations.join("\n")} />
        </Field>
        <label className="flex items-center gap-2 text-xs text-charcoal/70">
          <input
            type="checkbox"
            name="hasLocalPartnerNetwork"
            defaultChecked={settings.eligibility.hasLocalPartnerNetwork}
          />
          Təsdiqlənmiş yerli partnyor/konsorsium şəbəkəsi var
        </label>
        <SubmitButton>Yadda saxla</SubmitButton>
      </form>

      <form action={saveRadarAlertSettings} className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Bildirişlər</h2>
        <p className="text-xs text-charcoal/45">
          {alertsReady
            ? "Alıcı ünvanı konfiqurasiya olunub. RESEND_API_KEY mövcuddursa bildirişlər göndəriləcək."
            : "Alıcı ünvanı boşdur, ona görə heç bir e-poçt göndərilmir. Ünvanı burada və ya RADAR_ALERT_TO_EMAIL dəyişənində təyin edin."}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Alıcı e-poçt">
            <TextInput name="recipient" type="email" defaultValue={settings.alerts.recipient} placeholder="boş = göndərmə" />
          </Field>
          <Field label="Minimum qiymət">
            <TextInput name="minScore" type="number" min={0} max={100} defaultValue={settings.alerts.minScore} />
          </Field>
          <Field label="Təcili həddi (gün)">
            <TextInput name="urgentWithinDays" type="number" min={1} max={30} defaultValue={settings.alerts.urgentWithinDays} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-xs text-charcoal/70">
          <input type="checkbox" name="enabled" defaultChecked={settings.alerts.enabled} />
          Bildirişlər aktivdir
        </label>
        <SubmitButton>Yadda saxla</SubmitButton>
      </form>

      <form action={saveRadarTaxonomySettings} className="flex flex-col gap-4 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em] text-charcoal/70">Taksonomiya</h2>
        <p className="text-xs text-charcoal/45">
          CPV ailələri, layihə tipləri, istisnalar və çoxdilli terminologiya. Boş saxlansa, standart taksonomiyaya
          qayıdır.
        </p>
        <textarea
          name="taxonomy"
          defaultValue={JSON.stringify(settings.taxonomy, null, 2)}
          className={`${inputClass} min-h-96 font-mono text-[11px]`}
        />
        <SubmitButton>Yadda saxla</SubmitButton>
      </form>
    </div>
  );
}
