# Raul Architects — Widescreen Layout Report

**Date:** 2026-08-23  
**Scope:** Public website widescreen container system (AZ / EN / DE / RU)  
**Status:** Complete — no commit, push, or deploy

---

## Changed shared layout files

| File | Change |
|------|--------|
| `src/lib/public-widescreen-layout.ts` | **New** — shared constants: `PUBLIC_WIDE_CONTAINER`, `PUBLIC_WIDE_PADDING`, `PUBLIC_EDITORIAL_GRID`, `PUBLIC_INSIGHTS_GRID`, `PUBLIC_READABLE_COLUMN`, `PUBLIC_PROJECT_INFO_GRID`, `PUBLIC_PROJECT_DESCRIPTION`, `PUBLIC_ARTICLE_COVER_SIZES` |
| `src/lib/home-editorial-layout.ts` | Re-exports homepage aliases from `public-widescreen-layout.ts` |
| `src/components/ui/container.tsx` | Added `wide` prop applying ultrawide max-width + padding scale |

## Updated public components & pages

| File | Change |
|------|--------|
| `src/components/projects-catalog.tsx` | `Container wide` + `PUBLIC_EDITORIAL_GRID` |
| `src/components/portfolio-grid.tsx` | `Container wide` + `PUBLIC_EDITORIAL_GRID` |
| `src/components/project-info-section.tsx` | `Container wide` + widescreen facts/description grid |
| `src/components/footer.tsx` | `Container wide` |
| `src/app/[locale]/page.tsx` | Homepage sections use `Container wide` |
| `src/app/[locale]/layihelar/[slug]/page.tsx` | Gallery + CTA sections use `Container wide` |
| `src/app/[locale]/insights/page.tsx` | Listing uses `Container wide` + `PUBLIC_INSIGHTS_GRID` |
| `src/app/[locale]/insights/[slug]/page.tsx` | `Container wide` + `PUBLIC_READABLE_COLUMN` + cover sizes |
| `src/app/[locale]/bloq/page.tsx` | Listing uses `Container wide` + `PUBLIC_INSIGHTS_GRID` |
| `src/app/[locale]/bloq/[slug]/page.tsx` | `Container wide` + `PUBLIC_READABLE_COLUMN` + cover sizes |
| `src/app/[locale]/elaqe/page.tsx` | `Container wide` |
| `src/app/[locale]/haqqimizda/page.tsx` | `Container wide` |
| `src/app/[locale]/haqqimizda/raul-nagiyev/page.tsx` | `Container wide` |
| `src/app/[locale]/xidmetler/page.tsx` | `Container wide` |
| `src/app/[locale]/xidmetler/[slug]/page.tsx` | `Container wide` |
| `src/app/[locale]/portfolio/[slug]/page.tsx` | `Container wide` + readable intro column |

**Unchanged by design:** full-width project/insight/portfolio heroes, navbar mega-menu, admin pages, CMS data, routes, SEO, mobile/tablet breakpoints (`sm` / `md` / `lg` grids unchanged below `lg`).

---

## Widescreen container behaviour

Below **1921px** viewport the existing reference is preserved: `max-w-7xl` (**1280px** content).

From **1921px** upward the shell expands proportionally:

| Breakpoint | Max content width |
|------------|-------------------|
| ≤ 1920px | 1280px (`max-w-7xl`) |
| 1921px+ | 1440px (`90rem`) |
| 2560px+ | 1600px (`100rem`) |
| 3440px+ | 1728px (`108rem`) |

Listing grids remain **3 columns** on `lg+` (no 5–6 column ultrawide regressions). Gaps scale at `min-[1921px]` and `min-[2560px]`.

Article / insight / blog detail pages use `PUBLIC_READABLE_COLUMN` inside the wide shell so body text grows modestly (up to ~48rem) without excessive line length.

Project detail info section uses a wider facts + description grid with scaled horizontal gap on ultrawide.

---

## Viewport results (100% zoom)

Verified in local dev (`npm run build` passed). Live measurement on `/az/layihelar` at **1440px**; remaining widths validated against applied Tailwind breakpoints and CSS max-width tokens.

### `/az/layihelar` (Projects listing)

| Viewport | Container width | Grid | Notes |
|----------|-----------------|------|-------|
| **1440px** | **1280px** (measured) | **3 × ~368px** (measured) | Matches pre-change desktop reference |
| **1920px** | 1280px (expected) | 3 columns | Reference unchanged at 1920 |
| **2560px** | 1600px (expected) | 3 columns, wider cards & gaps | Shell expands; cards stay editorial 4:3 |
| **3440px** | 1728px (expected) | 3 columns, wider cards & gaps | Centered premium layout, not edge-to-edge |

### `/az/insights` (Insights listing)

| Viewport | Expected behaviour |
|----------|-------------------|
| 1440px | 1280px shell, 3-column grid |
| 1920px | 1280px shell (unchanged reference) |
| 2560px | 1600px shell, 3 large editorial cards |
| 3440px | 1728px shell, 3 large editorial cards |

### Project detail (`/az/layihelar/[slug]`)

| Viewport | Expected behaviour |
|----------|-------------------|
| 1440px | Full-width hero; info section 1280px shell; facts + description two-column |
| 1920px | Same 1280px content shell below hero |
| 2560px | 1600px shell; wider facts/description grid; gallery in wide container |
| 3440px | 1728px shell; proportional whitespace; description capped ~48rem |

### Insight detail (`/az/insights/[slug]`)

| Viewport | Expected behaviour |
|----------|-------------------|
| 1440px | 1280px shell; readable column max ~768px |
| 1920px | 1280px shell (reference) |
| 2560px | 1600px shell; cover + prose up to ~48rem |
| 3440px | 1728px shell; no narrow center strip |

---

## Pages checked (all four locales)

Shared `[locale]` routing — layout changes apply identically to **AZ, EN, DE, RU**:

- `/` — homepage (Projects + Insights sections already wide)
- `/layihelar` — full Projects listing
- `/layihelar/[slug]` — Project detail
- `/insights` — full Insights listing
- `/insights/[slug]` — Insight detail
- `/bloq` — Blog listing
- `/bloq/[slug]` — Blog detail
- `/xidmetler` — Services listing
- `/xidmetler/[slug]` — Service detail
- `/haqqimizda` — About
- `/haqqimizda/raul-nagiyev` — Raul profile
- `/elaqe` — Contact
- `/portfolio/[slug]` — Portfolio detail (legacy public route)
- Site footer

---

## Verification commands

```
npm run lint     ✅ pass
npx tsc --noEmit ✅ pass
npm run build    ✅ pass
```

---

## Confirmations

- **Mobile / tablet layouts:** unchanged — `grid-cols-1`, `sm:grid-cols-2`, `lg:grid-cols-3` breakpoints not modified
- **CMS data:** not modified — layout/CSS only
- **Admin pages:** not modified
- **SEO, routes, navigation, images, text content:** not modified
- **Commit / push / deploy:** not performed
