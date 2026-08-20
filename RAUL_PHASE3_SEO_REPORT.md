# Phase 3 — English URLs and SEO metadata

Date: 2026-08-20  
Scope: public routing and metadata only. CMS/Supabase data, media, admin UI, Vercel, and public visual design were not changed. No commit, push, or deploy.

## Result

Clean English public URLs work. Old English paths return one **308** to the matching clean URL (query string kept). AZ / DE / RU keep their existing Azerbaijani pathnames. Canonical, sitemap, robots, Open Graph, and LinkedIn share URLs use `https://www.raularchitects.com` only.

Lint, typecheck, and production build passed.

## Architecture

App Router folders are unchanged (`[locale]/layihelar`, `[locale]/bloq`, and so on). next-intl `pathnames` maps those internal routes to English public paths. `src/proxy.ts` 308s leftover `/en/layihelar`, `/en/bloq`, … before intl middleware, so old English URLs never loop and never 404.

Internal `Link` hrefs still use `/layihelar`, `/bloq`, `/xidmetler`, `/elaqe`, `/haqqimizda`. next-intl emits `/en/projects`, `/en/blog`, `/en/services`, `/en/contact`, `/en/about` for English.

## Changed files

### Routing and URL helpers

- `src/i18n/routing.ts` — English pathnames; `asLocale()`
- `src/global.ts` — next-intl `Pathnames` typing (new)
- `src/lib/public-paths.ts` — localize / legacy 308 / `toIntlHref` (new)
- `src/proxy.ts` — 308 old English paths, preserve query
- `src/lib/site.ts` — production host, canonical sanitizer, localized absolute URLs
- `src/lib/cms/metadata.ts` — listing/detail metadata (canonical, hreflang, OG, twitter)
- `src/lib/cms/public-mappers.ts` — no AZ SEO fallback when the requested locale has copy
- `src/lib/cms/actions.ts` — revalidate both filesystem paths and English public paths
- `src/lib/blog-body.tsx` — in-body links go through `toIntlHref`

`src/app/sitemap.ts` and `src/lib/blog-urls.ts` / `src/lib/cms/linkedin-post.ts` were not edited. They already call `absoluteUrl` / `productionAbsoluteUrl`, which now localize and use the production host.

### Pages and metadata

- `src/app/layout.tsx` — `metadataBase` = production host
- `src/app/robots.ts` — sitemap/host = production host
- `src/app/[locale]/layout.tsx` — `metadataBase` = production host
- `src/app/[locale]/page.tsx` — homepage `generateMetadata` + localized category links
- `src/app/[locale]/layihelar/page.tsx`
- `src/app/[locale]/layihelar/[slug]/page.tsx`
- `src/app/[locale]/portfolio/page.tsx`
- `src/app/[locale]/portfolio/[slug]/page.tsx`
- `src/app/[locale]/bloq/page.tsx`
- `src/app/[locale]/bloq/[slug]/page.tsx`
- `src/app/[locale]/xidmetler/page.tsx`
- `src/app/[locale]/xidmetler/[slug]/page.tsx`
- `src/app/[locale]/haqqimizda/page.tsx`
- `src/app/[locale]/haqqimizda/raul-nagiyev/page.tsx`
- `src/app/[locale]/elaqe/page.tsx`

### Navigation (English public hrefs, no visual restyle)

- `src/components/navbar.tsx` — unchanged source; pathnames localize `/xidmetler` and `/layihelar`
- `src/components/footer.tsx` — same
- `src/components/mega-menu.tsx`
- `src/components/language-switcher.tsx`
- `src/components/locale-switch-context.tsx`
- `src/components/projects-catalog.tsx`
- `src/components/portfolio-grid.tsx`
- `src/components/home-hero.tsx`
- `src/components/blog-card.tsx`

### Copy keys only (not CMS rows)

- `messages/en.json`, `messages/az.json`, `messages/de.json`, `messages/ru.json`  
  Added `metaDescription` under `servicesPage`, `aboutPage`, `raulPage`, `contactPage`.

## Redirect tests (local `next start` on port 3001)

All checks used `--max-redirs 0` unless noted. Followed legacy request used `-L --max-redirs 2`.

| Request | Status | Location / notes |
|---|---|---|
| `/en/layihelar` | **308** | `/en/projects` |
| `/en/layihelar?category=villa` | **308** | `/en/projects?category=villa` |
| `/en/layihelar?category=villa` followed | **200** after **1** redirect | `…/en/projects?category=villa` |
| `/en/bloq` | **308** | `/en/blog` |
| `/en/xidmetler` | **308** | `/en/services` |
| `/en/elaqe` | **308** | `/en/contact` |
| `/en/haqqimizda` | **308** | `/en/about` |
| `/en/haqqimizda/raul-nagiyev` | **308** | `/en/about/raul-nagiyev` |
| `/en/layihelar/ictimai-01` | **308** | `/en/projects/ictimai-01` |
| `/en/bloq/what-is-bim-architecture` | **308** | `/en/blog/what-is-bim-architecture` |
| `/en/projects` | **200**, 0 redirects | no `Location` |
| `/en/portfolio` | **200** | |
| `/en/blog` | **200** | |
| `/en/services` | **200** | |
| `/en/contact` | **200** | |
| `/en/about` | **200** | |
| `/en/about/raul-nagiyev` | **200** | |
| `/en` | **200** | |
| `/en/projects/ictimai-01` | **200** | |
| `/en/blog/what-is-bim-architecture` | **200** | |
| `/az/layihelar` | **200**, 0 redirects | unchanged |
| `/az/bloq`, `/az/xidmetler`, `/az/elaqe`, `/az/haqqimizda`, `/az/haqqimizda/raul-nagiyev`, `/az/portfolio` | **200** | |
| `/de/layihelar`, `/de/bloq`, `/de/xidmetler`, `/de/elaqe`, `/de/haqqimizda`, `/de/portfolio` | **200** | |
| `/ru/layihelar`, `/ru/bloq`, `/ru/xidmetler`, `/ru/elaqe`, `/ru/haqqimizda`, `/ru/portfolio` | **200** | |

No redirect loop on `/en/projects`. English listing HTML contained **0** `/en/layihelar`, `/en/xidmetler`, `/en/elaqe`, `/en/haqqimizda`, or `/en/bloq` hrefs, and many `/en/projects`, `/en/services`, `/en/contact`, `/en/about` hrefs.

## Metadata results

Host in every canonical / OG / hreflang / robots / sitemap URL: `https://www.raularchitects.com`. No `localhost`.

`robots.txt`:

```
Host: https://www.raularchitects.com
Sitemap: https://www.raularchitects.com/sitemap.xml
```

Sitemap: HTTP 200, 89 `<url>` entries, 0 localhost. English loc values use `/en/projects`, `/en/blog`, `/en/services`, `/en/about`, `/en/contact`.

| Page | Canonical | og:locale | Title / description |
|---|---|---|---|
| `/en` | `https://www.raularchitects.com/en` | `en_US` | EN home title + description; OG image `/images/raul-hero.jpg` |
| `/az` | `https://www.raularchitects.com/az` | `az_AZ` | AZ home copy |
| `/en/projects` | `…/en/projects` | `en_US` | Projects — Raul Architects |
| `/de/layihelar` | `…/de/layihelar` | `de_DE` | Projekte — Raul Architects (DE copy) |
| `/en/portfolio` | `…/en/portfolio` | `en_US` | Real Experience — Raul Architects |
| `/en/blog` | `…/en/blog` | `en_US` | EN blog metaTitle / metaDescription |
| `/en/services` | `…/en/services` | `en_US` | Services — Raul Architects + new metaDescription |
| `/en/projects/ictimai-01` | `…/en/projects/ictimai-01` | `en_US` | **Public Building** (English, not AZ) |
| `/en/blog/what-is-bim-architecture` | `…/en/blog/what-is-bim-architecture` | `en_US` | English BIM article title + description |

hreflang on listings and home: `az`, `en`, `de`, `ru`, `x-default` (x-default = English URL). Blog detail also emits localized slugs (`/az/bloq/bim-memarliq-nedir`, `/de/bloq/was-ist-bim-architektur`, `/ru/bloq/chto-takoe-bim-arhitektura`).

LinkedIn share helper: `https://www.raularchitects.com/en/blog/what-is-bim-architecture` (encoded into LinkedIn `share-offsite` URL). AZ share still uses `/az/bloq/…`.

No visible “This page could not load” heading. (`notFoundBody` appears only inside next-intl message JSON in the HTML payload.)

## Checks run

- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass (Next.js 16.3.0)

## Not changed / not fixed

- CMS rows, Storage, RLS, admin screens, and Vercel project settings were not touched.
- Public CSS / layout / copy on screen was not restyled. Only URL strings and `<head>` metadata.
- Detail slugs remain the current CMS/localized slugs (`ictimai-01`, `bim-ile-layihelendirme`, English blog slug `what-is-bim-architecture`). This phase did not invent new English entity slugs.
- Markdown stored in blog posts still contains internal paths such as `/elaqe`; `BlogBody` maps them at render so English pages emit `/en/contact`. Source markdown in the repo was not rewritten.
- Language switcher uses `as never` to satisfy next-intl’s typed pathname union (templates vs filled paths). Runtime switching still uses next-intl `router.replace` + pathnames.
- Production was not deployed. Live `www.raularchitects.com` will keep old English URLs until this branch is released.
