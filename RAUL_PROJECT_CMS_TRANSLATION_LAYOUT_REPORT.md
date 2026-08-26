# RAUL Project CMS, Translation & Layout Report

**Date:** 2026-08-23  
**Scope:** Project admin simplification, location + description CMS, AZ→EN/DE/RU auto-translation, hero/gallery fix, Insight body typography.

---

## Summary

| Area | Change |
|------|--------|
| Project admin form | Removed Exterior/Interior/Plan/BIM editor blocks; existing `sections` JSON preserved on save |
| Location | Editable in CMS (AZ source); shown in public info column; localized via translations |
| Description (`Təsvir`) | AZ tab field controls public `TƏSVİR` text; auto-translated to EN/DE/RU |
| Auto-translation | DeepL server-side on save for Projects, Insights, Blog |
| Project detail layout | Hero = cover + title only; gallery below info/description (2-column) |
| Insight typography | Article body `h2`/`h3` match normal paragraph weight (page title unchanged) |

---

## 1. Project admin — removed section blocks

**File:** `src/components/admin/content-form.tsx`

- UI for Exterior/Interior/Plan/BIM text + media removed.
- Cover, OG image, and single **Qalereya** field kept.
- On save, `payload.sections` is copied from the existing row (no DB/storage deletion).

---

## 2. Location field

**Admin:** Global **Lokasiya (AZ mənbə)** + per-locale overrides on EN/DE/RU tabs.  
**Public:** `src/app/[locale]/layihelar/[slug]/page.tsx` — left column shows Date, Status, Client, Building size, **Location**.  
**Mapper:** `src/lib/cms/public-mappers.ts` — `localizedField(..., ["location"], row.location)`.

**Messages:** `projectDetail.info.location` + sample added in `messages/{az,en,de,ru}.json`.

---

## 3. Description (`Təsvir`) + auto-translation

**Admin label:** AZ tab uses **Təsvir**; maps to `translations[locale].body/full`.  
**Public:** `ProjectInfoSection` renders under `TƏSVİR / DESCRIPTION`.

### Translation provider

No prior integration existed. Added **DeepL** (server-only).

| Item | Value |
|------|--------|
| **Environment variable** | `DEEPL_API_KEY` |
| **Location in code** | `src/lib/cms/deepl-translate.ts` |
| **Hook** | `src/lib/cms/auto-translate-content.ts` → called from `upsertRecord()` in `src/lib/cms/actions.ts` |

Free API keys (suffix `:fx`) use `api-free.deepl.com`; paid keys use `api.deepl.com`.

### AZ source → auto-translate on save

**Projects:** title, category label, location, year, status, client, area, Təsvir, SEO title, meta description.  
**Insights & Blog:** title, category, excerpt, body, SEO title, meta description, image alt.

- Azerbaijani is the source; EN/DE/RU are regenerated on each save.
- Other locale tabs remain editable; next save re-syncs from AZ unless AZ fields are empty.
- Missing `DEEPL_API_KEY` throws a clear server error (no fake translations).

---

## 4. Hero & gallery layout fix

**File:** `src/app/[locale]/layihelar/[slug]/page.tsx`

- Removed `ProjectGallery` from hero overlay (fixes floating thumbnails bug).
- Hero: cover image + back link + title only.
- Gallery: **after** `ProjectInfoSection`, 2-column `ProjectGallery` (`variant="page"`).
- Image priority: CMS `gallery` → legacy section media (read-only fallback) → static project groups.

---

## 5. Insight article body typography

**File:** `src/lib/blog-body.tsx` — `variant="insight"` uses normal-weight body styling for `h2`/`h3`.  
**Used in:** `src/app/[locale]/insights/[slug]/page.tsx` only. Blog posts unchanged.

---

## Changed files

- `src/components/admin/content-form.tsx`
- `src/lib/cms/types.ts`
- `src/lib/cms/deepl-translate.ts` *(new)*
- `src/lib/cms/auto-translate-content.ts` *(new)*
- `src/lib/cms/actions.ts`
- `src/lib/cms/public-mappers.ts`
- `src/app/[locale]/layihelar/[slug]/page.tsx`
- `src/lib/blog-body.tsx`
- `src/app/[locale]/insights/[slug]/page.tsx`
- `messages/az.json`, `messages/en.json`, `messages/de.json`, `messages/ru.json`
- `SETUP.md` (documents `DEEPL_API_KEY`)

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (1 pre-existing warning in `public-lists.ts`) |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass (344 static pages) |
| CMS save + DeepL | Requires `DEEPL_API_KEY` in `.env.local` — not run in this session |
| Live Project / Insight / Blog save test | Pending DeepL key + running dev server |

### Manual test checklist (after adding `DEEPL_API_KEY`)

1. Edit one Project in AZ: set Location + Təsvir → Save → confirm EN/DE/RU tabs populated.
2. Open public project page: Location in left column; gallery below description; hero clean.
3. Repeat for one Insight and one Blog post.
4. Confirm public pages refresh immediately (existing `revalidatePublic` / `updateTag`).

---

## Setup

Add to `.env.local`:

```
DEEPL_API_KEY=your-deepl-auth-key
```

Restart the dev server after adding the key.
