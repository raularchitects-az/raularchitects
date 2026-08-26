# Raul Architects Business Radar — Phase 1 Report

Private, admin-only opportunity intelligence for architecture tenders. Discovers, filters, scores and explains TED Europe notices for Raul Architects.

Nothing in this feature is public: every screen sits behind `requireStaff()` inside the existing admin panel, no route is added to the sitemap, and the admin tree is already `noindex`. No CMS content, translation, public page or public design file was modified.

---

## 1. Implemented files and migrations

### Migration

| File | Contents |
|---|---|
| `supabase/patch-business-radar.sql` | Additive, re-runnable. Creates `radar_sources`, `radar_settings`, `radar_opportunities`, `radar_runs`. Staff-only RLS through the existing `public.is_staff()` helper, no `anon` grant and no public read policy on any of them. Seeds the two source rows (`ted` enabled, `simap` planned). |

The patch never touches an existing table, column, policy or row. It follows the same shape as `supabase/patch-insights.sql`.

### Domain layer — `src/lib/radar/`

| File | Role |
|---|---|
| `types.ts` | Shared types plus the Azerbaijani display labels for score bands, deadline states, recommendations and workflow states. |
| `config.ts` | Pure defaults and config types (`RadarSearchConfig`, `RadarAlertConfig`). Deliberately free of Supabase/Next imports so the pipeline can run outside the framework. |
| `taxonomy.ts` | CPV families, multilingual project-type terminology, exclusion rules, core terms, and the text/CPV matching helpers. |
| `eligibility.ts` | The Raul Eligibility Profile and its conservative defaults. |
| `settings.ts` | Supabase persistence for the four setting keys, merged over the defaults. |
| `deadline.ts` | Deadline parsing, day counting and status classification. |
| `scoring.ts` | Deterministic 0–100 scoring with a recorded factor for every point. |
| `analysis.ts` | Deterministic analysis generator plus the documented `RadarAnalysisAdapter` AI hook. |
| `discovery.ts` | The pipeline: fetch → score → deduplicate → persist → archive → alert → run log. |
| `notify.ts` | Alert planning (pure) and dispatch through the existing Resend configuration. |
| `queries.ts` | Admin read queries for the dashboard, detail page, runs, sources and archive. |
| `actions.ts` | Server actions: review states, manual run, source toggle, self-check, settings forms. |
| `self-check.ts` | Runs the whole pipeline against a mocked official response and returns pass/fail rows. |
| `sources/types.ts` | The `RadarSource` interface every source implements. |
| `sources/index.ts` | Source registry. TED is available; SIMAP is registered as `planned`. |
| `sources/ted-query.ts` | Expert-query construction, field lists and the page-budget rule. Pure. |
| `sources/ted-mapper.ts` | Raw TED notice → normalized opportunity. Pure and defensive. |
| `sources/ted.ts` | HTTP client with timeout, retry, standby host and unknown-field fallback. |
| `sources/ted-fixture.ts` | Injectable `fetch` replacement backed by the fixture, recording request bodies. |
| `sources/fixtures/ted-search-response.json` | Four realistic TED notices: a German design contest, a road-engineering notice, a Swiss general-planning/BIM notice and a software purchase. |

### Routes and UI

| File | Role |
|---|---|
| `src/app/api/radar/cron/route.ts` | Scheduled discovery endpoint, gated on `CRON_SECRET` with a timing-safe comparison and `X-Robots-Tag: noindex`. |
| `src/app/admin/(panel)/radar/page.tsx` | The default Radar screen: Recommended Today, Today, Top, All + filters. |
| `src/app/admin/(panel)/radar/[id]/page.tsx` | Opportunity detail with official facts and Radar assessment visually separated. |
| `src/app/admin/(panel)/radar/advanced/page.tsx` | Sources, manual run, run history, archive, search profile, eligibility profile, alerts, taxonomy. |
| `src/components/admin/radar/opportunity-card.tsx` | Card and score badge. |
| `src/components/admin/radar/opportunity-actions.tsx` | View official tender / Review later / Not relevant. |
| `src/components/admin/radar/run-panel.tsx` | Manual run, self-check output, source enable/disable. |
| `scripts/radar-selftest.mts` | Command-line runner for the same self-check. |

### Modified existing files

| File | Change |
|---|---|
| `src/components/admin/shell.tsx` | One line: `Business Radar` added to the `nav` array. |
| `vercel.json` | New file. Contains only the cron entry. |
| `.env.example` | Documents `CRON_SECRET`, `RADAR_ALERT_TO_EMAIL`, `RADAR_FROM_EMAIL`. |

No other existing file was touched.

---

## 2. Scheduler approach and its deployment requirement

Discovery runs server-side on a schedule; admins never need to press anything for normal use.

- **Endpoint:** `GET /api/radar/cron`.
- **Schedule:** `vercel.json` declares one daily run at `30 8 * * *` (08:30 UTC). TED states the daily edition is published by 09:30 CET, so the run lands safely after publication.
- **Auth:** the route reads `CRON_SECRET` and compares it to the `Authorization: Bearer …` header using `timingSafeEqual`. Vercel sends that header automatically once the environment variable exists. **If `CRON_SECRET` is not set the endpoint returns 503 and refuses to run** — it never falls back to an open trigger.
- **Manual fallback:** Advanced → *İndi axtar* calls the same pipeline with `trigger: "manual"`, and every run is recorded in `radar_runs` either way.

**Deployment requirement:** Vercel Cron is only invoked on deployed environments, and the Hobby plan permits one cron job triggered once per day at an approximate time. That is why a single daily run is configured. On a Pro plan a second entry (for example `30 14 * * *`) can be added to `vercel.json` safely — the pipeline is idempotent, because it deduplicates on the official publication reference and only updates rows it has already seen.

If discovery must instead run on a non-Vercel host, point any external scheduler at the same URL with the `Authorization: Bearer $CRON_SECRET` header.

---

## 3. TED query and taxonomy approach

**Source contract.** `POST https://api.ted.europa.eu/v3/notices/search`, the official public Search API. No authentication, no scraping, no HTML parsing. `https://tedweb.api.ted.europa.eu/v3/notices/search` is used as the documented standby host on retry.

**Query.** Built in `ted-query.ts` from the configured taxonomy, using descriptive field names rather than aliases:

```
classification-cpv IN (71000000 71200000 71220000 71221000 71222000 71230000
                       71240000 71241000 71242000 71243000 71245000
                       71400000 71410000 71420000)
AND publication-date = (20260805 <> 20260826)
```

A `buyer-country IN (…)` clause is appended only when a country filter is configured; by default every country TED returns is eligible and geographic priority is handled by scoring instead, so nothing outside Germany and Switzerland is silently dropped.

**Request shape.** `scope: ACTIVE`, `onlyLatestVersions: true`, `paginationMode: PAGE_NUMBER`, `checkQuerySyntax: false`. The page limit is derived from TED's live budget rule, `size(set(fields) ∪ {publication-number, links}) × limit ≤ 10 000` with `1 ≤ limit ≤ 250`, so a larger field list automatically shrinks the page rather than producing a 400.

**Fields.** Thirteen core fields verified against the published request example (`publication-number`, `publication-date`, `notice-identifier`, `notice-version`, `procedure-identifier`, `form-type`, `notice-type`, `official-language`, `notice-title`, `buyer-name`, `buyer-country`, `classification-cpv`, `deadline-receipt-tender-date-lot`) plus three optional ones (`total-value`, `total-value-cur`, `place-of-performance`). TED documents that the field catalogue can change without a version bump, so if the API rejects a field the client retries once with the core list only and records a warning on the run.

**Parsing.** `notice-title` is a language→string map and `buyer-name` a language→string[] map, so text is read in the notice's own official language before falling back to a translation. CPV and lot deadlines are arrays; the earliest officially supplied deadline is used and all values are kept. TED has confirmed that Search results cannot be reliably zipped back to individual lots, so no lot association is invented. The untouched notice is stored in `raw` and shown on the detail page under *Emal olunmamış mənbə məlumatı*.

**Deduplication.** `unique (source_id, source_ref, source_lot)`, where `source_ref` is the TED publication number. `source_lot` defaults to an empty string rather than NULL so the constraint actually holds. A corrected or newer notice updates the existing row and can bring an archived item back to active; a reviewer's *Not relevant* or *Review later* decision is never overwritten by the source.

**Taxonomy.** CPV families and multilingual terminology are separate signals, because a German notice rarely contains the English word "architecture". Sixteen project types carry terms in English, German, French and Italian, including all the required German ones — `Architekturleistungen`, `Architektenleistungen`, `Objektplanung`, `Generalplanung`/`Generalplaner`, `Planungsleistungen`, `Städtebau`/`Stadtplanung`, `Hochbau`, `Machbarkeitsstudie`, `Realisierungswettbewerb`/`Architekturwettbewerb`, `BIM-Planung`, `Innenarchitektur`, `Landschaftsarchitektur`. The whole object is editable as JSON in Advanced → Taksonomiya and is read from settings at scoring time, so no UI component hardcodes it.

---

## 4. Scoring model

Deterministic and fully explainable: every point that reaches the total is stored as a labelled factor in `score_factors` and rendered on the detail page, so a score can always be traced back to the evidence that produced it.

**Exclusions run first.** Construction execution, engineering/MEP/surveying-only work, road/rail/bridge/water/utility engineering, BIM software and IT procurement, and goods supply are matched by CPV prefix and by multilingual terms. Facility management is a soft exclusion. A hard rule only excludes when the notice carries no strong architecture CPV — a design-and-build notice legitimately carries both, so in that case the rule becomes a penalty and a visible risk instead. Expired notices are excluded and archived.

**Positive factors (maximum contribution):**

| Factor | Max | Notes |
|---|---|---|
| CPV family evidence | 32 | Weighted per family; hierarchical, so 71221000 also counts under 71220000 and 71200000. |
| Project type fit | 16 | Full weight when the type is in the profile's target list, otherwise 4. |
| Country priority | 16 | Germany and Switzerland 14, Austria 9, every other eligible European country 7. All editable in the Eligibility Profile. See `RAUL_RADAR_COUNTRY_PRIORITY_REPORT.md`. |
| Deadline | 10 | 15+ days 10, 4–14 days 5, 0–3 days 1. |
| Strategic relevance | 10 | BIM, competition or general planning. |
| Scale | 8 | Only when a value is officially supplied. |
| Language | 5 | Notice language against accepted submission languages. |
| Portfolio fit | 6 | Matched project type against the profile's reference categories. |

**Penalties:** unknown deadline −8, value below the profile minimum −10, unusable submission language −6, unclear local-office/partner situation outside a priority market −4, soft exclusion −6 or −8, and up to −8 for accumulated unknowns.

**Bands:** 85–100 Excellent, 70–84 Potential, 50–69 Review Only, below 50 Low Relevance. **Deadline states:** 0–3 days Urgent, 4–14 High attention, 15+ Normal, missing deadline Unknown and penalised.

A notice cannot score well merely for containing the word "architecture": with only the generic 71000000 family the CPV contribution is 4 points, which cannot reach a meaningful band even in Germany with a comfortable deadline.

**Unknowns are never treated as eligibility.** Selection criteria, reference requirements and local-licence rules do not appear in the Search field projection at all, so they are always recorded as unknowns, cost points, and surface as risks. The default Eligibility Profile is deliberately conservative — `hasLocalPartnerNetwork` is `false` and the licence limitations note that Architektenkammer registration is unconfirmed — because an optimistic profile would silently inflate every score.

**Analysis** is deterministic in Phase 1. Every sentence is derived from a value the source returned or from a factor already visible in the UI, and recommendations are restricted to the four allowed values (*Review tender documents*, *Assess consortium opportunity*, *Check local eligibility*, *Monitor only*). Official facts and Radar assessment are rendered in two separate, differently styled panels.

---

## 5. Email configuration requirement

The notification logic is complete but **deliberately inert until a recipient is configured**. No address is guessed anywhere in the code.

- **Provider:** the existing Resend setup is reused (`RESEND_API_KEY`), so no second provider and no new paid dependency was introduced.
- **Recipient:** `radar.alerts.recipient` in Advanced → Bildirişlər, or the `RADAR_ALERT_TO_EMAIL` environment variable. With both empty, `dispatchRadarAlerts` returns a skip reason that is recorded on the run and shown in the run history — it never sends and never fails the run.
- **Sender:** `RADAR_FROM_EMAIL`, falling back to `INQUIRY_FROM_EMAIL`.

**Rules.** One "new opportunity" email per official opportunity, only when it is new, active, scoring at or above the configured threshold (default 80) and actionable — an opportunity whose recommendation is *Monitor only* is not actionable and is not emailed. One urgent email, only once, when the deadline falls within the configured window (default 7 days). Low-relevance, expired, duplicate and unchanged opportunities are never emailed. Both are enforced by the `new_alert_sent_at` and `urgent_alert_sent_at` columns, which are stamped only after a successful send.

**Subjects:** `[RAUL RADAR] New high-fit architecture opportunity — {country}` and `[URGENT TENDER] Architectural services — {n} days remaining`.

---

## 6. Manual setup steps still required

Nothing was committed, pushed or deployed. These steps are outstanding:

1. **Run the migration.** Open the Supabase SQL Editor and execute `supabase/patch-business-radar.sql`. It is additive and safe to re-run. Until this is done the Radar page shows a setup message instead of failing.
2. **Set `CRON_SECRET`** in the Vercel project (Production, and Preview if you want it there). Use a long random value. The scheduled endpoint stays disabled until this exists.
3. **Deploy** so `vercel.json` takes effect. Vercel Cron only fires against deployed environments, not local development.
4. **Configure the alert recipient** in Admin → Business Radar → Advanced → Bildirişlər, or set `RADAR_ALERT_TO_EMAIL`. Leave it blank if you want the radar to run silently for a while first; alerts stay pending and are reported, not lost.
5. **Verify `RESEND_API_KEY`** is present in the deployed environment if alerts should actually be delivered.
6. **Review the Eligibility Profile** in Advanced. The defaults are intentionally pessimistic; confirming a partner network or an accepted submission language will change scores, so it is worth setting them to reality before judging results.
7. **First run.** Use Advanced → *İndi axtar* once after deploying to populate the tables without waiting for the schedule, and *Mənbə testini işlət* to confirm parsing and scoring behave.

Optional: on a Vercel Pro plan, add a second cron entry to `vercel.json` for a twice-daily run.

---

## 7. Tests run and results

| Command | Result |
|---|---|
| `npm run lint` | Pass. 0 errors, 1 warning — a pre-existing unused import in `src/lib/cms/public-lists.ts`, untouched by this work. |
| `npx tsc --noEmit` | Pass, 0 errors. |
| `npm run build` | Pass. All 356 pages generated. `/admin/radar`, `/admin/radar/[id]`, `/admin/radar/advanced` and `/api/radar/cron` register as dynamic routes; `/sitemap.xml` is unchanged. |
| `npx tsx scripts/radar-selftest.mts` | Pass, 9 of 9 checks. |

Self-check output:

```
PASS  Expert query built with CPV and date range
      classification-cpv IN (71000000 … 71420000) AND publication-date = (20291211 <> 20300101)
PASS  All notices normalized                      | 4 notices mapped
PASS  Official TED link preserved                 | https://ted.europa.eu/en/notice/556964-2026/html
PASS  Earliest of several lot deadlines taken     | 2030-04-30T14:00:00.000Z
PASS  Road and bridge engineering excluded        | roads, rail, bridges, water and utility engineering
PASS  BIM software procurement excluded           | BIM software / IT procurement
PASS  German architecture competition scores high | 100 / excellent
PASS  Swiss general planning + BIM scored         | 84 / potential
PASS  Analysis returns only an allowed action     | assess_consortium
```

The fixture uses fixed 2030 deadlines and the check runs against a fixed clock, so results stay stable regardless of when it is run. No production data was created: the self-check never touches the database, and no sample or placeholder opportunity is written anywhere.

---

## 8. Intentionally deferred to Phase 2

- **SIMAP (Switzerland).** Registered in the source registry as `planned` and shown in Advanced with a Phase 2 marker. Adding it only requires implementing `fetchOpportunities` against the `RadarSource` interface — no admin screen, route, table or scoring change is needed.
- **AI analysis.** This repository has no general-purpose server-side LLM configuration (DeepL is present, but it is a translation API only), so per the brief no paid AI dependency or secret was added. `RadarAnalysisAdapter` in `analysis.ts` is the hook: implement it against a reviewed server-side configuration and return it from `resolveAnalysisAdapter()`. The adapter receives only verified source facts plus score factors, and its output keeps the same shape, so the official-facts / assessment separation is preserved.
- **Notice XML enrichment.** TED's per-notice XML contains selection criteria, lot structure and document links that the Search projection does not. Fetching it would let the radar verify qualification, reference and local-licence requirements that Phase 1 can only mark as unknown. This is the single highest-value improvement available and the main reason several unknowns currently cost points.
- **`ITERATION` pagination.** Phase 1 uses `PAGE_NUMBER` with a configurable page cap, which is ample for an architecture-only CPV filter. A broader taxonomy would justify switching to iteration mode.
- **Per-lot opportunities.** The schema already carries `source_lot`, but the Search API is notice-based and TED has confirmed that values cannot be reliably matched back to lots. Lot-level rows need the notice XML.
- **Twice-daily schedule**, pending confirmation of the Vercel plan.
- **Automated test runner.** The repository has no test framework. The pipeline is fixture-testable today through `scripts/radar-selftest.mts` and the Advanced self-check button; adding Vitest would let those assertions run in CI.
