# RAUL CMS Cleanup Report

**Date:** 2026-08-21  
**Scope:** Simplify Raul’s admin UI; replace Insights covers with original series visuals; remove obsolete generated reports.  
**Constraints honored:** no commit, push, deploy; no CMS import/migration/delete of Projects, Insights, Blog, images in Supabase, or public design changes.

---

## Verdict

Admin navigation is reduced to content-editor essentials. Technical routes remain reachable by URL but are hidden from the sidebar and dashboard. Ten original Insights cover WebPs were generated and wired into `insights-seed.ts`. Obsolete report artifacts were deleted from the working tree.

`npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.

---

## Admin simplification

### Visible sidebar (only)

- Ana səhifə  
- Layihələr  
- Insights  
- Bloq  
- Çıxış  

### Removed from visible nav / dashboard / list actions

| Hidden from UI | Still works internally? |
|----------------|-------------------------|
| Mövcud saytı import et | Yes (`ImportStaticButton` / actions remain in codebase) |
| Legacy kataloqu CMS-ə köçür | Yes (legacy migrate actions unchanged) |
| Insights rollout | Yes (`/admin/rollout` still exists) |
| Səhifələr | Yes (`/admin/pages`) |
| Fayllar / Media | Yes (`/admin/media` + inline MediaPicker upload/select) |
| Jurnal | Yes (`/admin/audit`) |
| İstifadəçilər | Yes (`/admin/users`) |
| Portfolio | Yes (`/admin/portfolio`) |
| Seed Insights button | Yes (`seedInitialInsights` + `/admin/rollout`) |
| Blog draft import button | Yes (component retained) |

### Admin homepage

Shows only:

- Counts for Layihələr / Insights / Bloq  
- Buttons: **Yeni layihə**, **Yeni Insight**, **Yeni bloq yazısı**

No import, legacy migrate, rollout notices, or audit feed.

### Not changed

- Public website design and Services pages  
- Existing Projects / Blog / migrated Portfolio→Projects content (no DB writes)  
- Media upload & image picker inside content forms  

---

## Insights cover images

Original generated editorial series (16:9 → optimized WebP 1600×900), stored under `public/images/insights/`:

| Insight slug | Cover file | AZ alt (summary) |
|--------------|------------|------------------|
| `bim-tikinti-evvel-problemler` | `bim-technology.webp` | Şəffaf BIM modeli + fasad |
| `boyuk-layihelerde-budce` | `cost-planning.webp` | Material nümunələri / planlama |
| `avropa-azerbaycan-5-yanasma` | `european-practice.webp` | Avropa yaşayış fasadı |
| `masterplan-kommersiya-deyeri` | `masterplanning.webp` | Masterplan elevasiya görünüşü |
| `memarliq-xerc-deyil` | `architecture-investment.webp` | İnvestisiya villa memarlığı |
| `bina-30-il-ucun` | `sustainability.webp` | Dayanıqlı fasad + yaşıl həyət |
| `developer-7-qerar` | `developer-insights.webp` | Yaşayış kompleksi fasadı |
| `digital-twin-nedir` | `digital-twin.webp` | Rəqəmsal əkiz konsepsiyası |
| `konseptden-icraya-bim` | `case-study-bim.webp` | Konseptdən icraya detal |
| `ai-ve-memarin-rolu` | `future-architecture-ai.webp` | Gələcək / AI memarlıq forması |

Seed paths + Azerbaijani `imageAlt` updated in `src/data/insights-seed.ts`.  
Fallback mapper image updated away from deleted `placeholder.svg`.

**Important:** Live Supabase Insight rows were **not** updated in this session. After you review, re-run admin Seed Insights (via `/admin/rollout` or the seed action) if DB covers must match the new seed files—or set covers manually in each Insight edit form.

---

## GitHub / repo cleanup (deleted)

- `RAUL_CMS_SITE_AUDIT.md`  
- `RAUL_PHASE1_STABILITY_REPORT.md`  
- `RAUL_PHASE2_CMS_SYNC_REPORT.md`  
- `RAUL_MEDIA_UPLOAD_FIX_REPORT.md`  
- `RAUL_PHASE3_SEO_REPORT.md`  
- `RAUL_INSIGHTS_RESTRUCTURE_REPORT.md`  
- `RAUL_INSIGHTS_ROLLOUT_SAFETY_REPORT.md`  
- `scripts/cms-inventory.json`  
- `public/images/insights/placeholder.svg` (replaced by series covers)

**Kept:** `README.md`, `SETUP.md`, SQL patches, source, `RAUL_HOMEPAGE_CMS_CARDS_REPORT.md` (not in the requested removal list).

---

## Changed / added files

**Admin**

- `src/components/admin/shell.tsx`  
- `src/app/admin/(panel)/page.tsx`  
- `src/app/admin/(panel)/projects/page.tsx`  
- `src/app/admin/(panel)/insights/page.tsx`  
- `src/app/admin/(panel)/blog/page.tsx`  

**Insights visuals**

- `public/images/insights/*.webp` (10 files)  
- `src/data/insights-seed.ts`  
- `src/lib/cms/public-mappers.ts`  

**This report**

- `RAUL_CMS_CLEANUP_REPORT.md`

---

## Test results

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |

---

## What you should review next

1. Open `/admin` as Raul — confirm only the four content links + Çıxış.  
2. Spot-check Insights cover WebPs under `public/images/insights/`.  
3. Decide when to re-seed or manually update live Insight covers.  
4. Commit when ready (not done in this session).
