# Homepage CMS project and portfolio cards

Date: 2026-08-20  
Scope: homepage Projects and Portfolio sections only. No CMS/Supabase writes, no Vercel changes, no commit, push, or deploy.

## Result

The homepage no longer uses static category tiles. It now shows the same public Projects and Portfolio items as the list pages, newest first, up to 10 each. Cards keep the existing tile layout (aspect, overlay, hover, spacing). Empty catalogs render the section heading and “all” link with **no** fake cards.

## What changed

### Data

- Homepage calls `getPublicProjects(locale)` and `getPublicPortfolio(locale)` — the same loaders as `/layihelar` and `/portfolio`.
- Visibility still goes through `cmsTakesPublic` (published + active), archive/inactive/delete, and legacy-hidden merge. Locale titles come from the same mappers.
- `takeLatestPublic(items, 10)` sorts `published_at DESC`, then `created_at DESC`, then the loader’s existing order. Missing dates sort last.
- CMS rows expose `publishedAt` / `createdAt`. Legacy/static fallbacks have null dates and only appear if they are still public on the list pages.
- Homepage `revalidate = 60`. CMS writes already `revalidatePath("/${locale}")` and `updateTag("cms")`, so publish / deactivate / delete refresh the homepage with the list pages.

### UI

- Same cream Projects section and gradient Portfolio section.
- Same `aspect-[4/5]` cards, borders, shadows, image zoom, overlay, `Reveal` stagger.
- Cover, title, and category subtitle per item instead of category-cover maps.
- CTAs in the existing “All services” style:
  - AZ: Bütün layihələr / Bütün portfolio
  - EN: All projects / All portfolio
  - DE: Alle Projekte / Gesamtes Portfolio
  - RU: Все проекты / Все портфолио
- Links: `/layihelar/${slug}` and `/portfolio/${slug}` via next-intl (EN → `/en/projects/…`, `/en/portfolio/…`).

## Changed files

- `src/app/[locale]/page.tsx`
- `src/lib/cms/public-lists.ts` (`takeLatestPublic`)
- `src/lib/cms/public.ts` (re-export)
- `src/lib/cms/public-mappers.ts` (dates on public project/portfolio objects)
- `messages/en.json`, `messages/az.json`, `messages/de.json`, `messages/ru.json`

## Local checks (`next start` :3002)

| Locale | Status | Project cards | Portfolio cards | Category `?category=` hrefs | Error overlay |
|---|---|---|---|---|---|
| `/en` | 200 | 10 → `/en/projects/{slug}` | 3 → `/en/portfolio/{slug}` | 0 | no |
| `/az` | 200 | 10 → `/az/layihelar/{slug}` | 3 → `/az/portfolio/{slug}` | 0 | no |
| `/de` | 200 | 10 → `/de/layihelar/{slug}` | 3 → `/de/portfolio/{slug}` | 0 | no |
| `/ru` | 200 | 10 → `/ru/layihelar/{slug}` | 3 → `/ru/portfolio/{slug}` | 0 | no |

Portfolio had only 3 public items; the grid showed those three, not filler tiles. Listing CTAs `/en/projects` and `/en/portfolio` (and AZ/DE/RU equivalents) are present.

Sort helper: `new,mid,old,none` for mixed dates; `takeLatestPublic([], 10)` → `[]`.

## Publish / hide (code path, no CMS writes)

Supabase was not modified. Behavior follows the existing public catalog:

- Newly published + active rows are included by `getPublicProjects` / `getPublicPortfolio` and rise to the top when `published_at` is newest.
- Deactivate, archive, delete, or legacy-hide removes the row from those loaders, so it leaves the homepage after the same revalidate the list pages already use.

## Lint / typecheck / build

- `npm run lint` — pass
- `npx tsc --noEmit` — pass
- `npm run build` — pass

## Not done

- Did not change list-page sort (still catalog merge order).
- Did not write CMS rows to live-test publish/unpublish.
- Did not commit, push, or deploy.
