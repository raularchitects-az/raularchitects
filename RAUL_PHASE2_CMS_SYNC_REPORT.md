# Raul Architects — Phase 2 CMS sync report

**Date:** 20 August 2026  
**Branch:** `main` (uncommitted local changes only)  
**Mode:** no commit, push, deploy, Vercel edits, or SQL/RLS changes.  
**Migration button:** not clicked. `migrateLegacyCatalog()` was not executed.

Phase 1 public merge/resolver behavior is preserved.

---

## Files changed

### New
- `src/lib/cms/media-usage.ts` — usage scan across projects, portfolio, blog, services, and `site_settings`
- `scripts/phase2-cms-sync-test.ts` — temporary `cms-phase2-test-*` create/publish/hide/delete cycle (excluded from Next typecheck)

### Modified
- `src/lib/cms/actions.ts` — `legacy_hidden` sync on non-public states and delete; admin-only project/portfolio hard delete; skip-only migration; media usage block; confirmed writes; xidmətlər + cache tag revalidation
- `src/lib/cms/legacy.ts` — `blog` / `service` hidden keys; helper `hiddenSetHasLegacy`
- `src/lib/cms/public-lists.ts` — Blog/Services merge also honors `legacy_hidden` after deactivate/archive/delete
- `src/lib/cms/legacy-import.ts` — “unmigrated” means no CMS row at all (slug or stamp)
- `src/components/admin/entity-table.tsx` — editors cannot hard-delete projects/portfolio; confirm remains for admins
- `src/components/admin/list-page.tsx` — passes `canHardDelete` from staff role
- `src/components/admin/migrate-legacy-button.tsx` — copy and result text: skip existing, no overwrite, no auto-publish
- `src/components/admin/unmigrated-legacy-list.tsx` — copy updated
- `src/components/admin/media-library.tsx` — delete errors (including in-use) shown in-page
- `src/components/admin/content-form.tsx` — preserves `legacySourceId` on save
- `tsconfig.json` — exclude `scripts/` from app typecheck

Admin-only visibility of “Legacy kataloqu CMS-ə köçür” was already in place and was left that way.

---

## Behavior implemented

### Projects / Portfolio
Deactivate, archive, draft/unpublish, or delete syncs `legacy_hidden` and uses the Phase 1 resolver, so matching static content cannot reappear. Detail URLs 404 when hidden. Permanent delete is `admin` only; confirmation is unchanged.

### Blog / Services
Phase 1 per-item merge is unchanged. Seed **draft + active** services are not written into `legacy_hidden` (so `/xidmetler` stays populated). Deactivate, archive, unpublish, or delete of a matching CMS row hides the legacy twin via `legacy_hidden` + merge. Public blog and xidmətlər list/detail paths are revalidated after CMS writes (`layout` invalidation + `updateTag("cms")`).

### Migration
`migrateLegacyCatalog` no longer inserts or updates CMS rows. Existing stamped or slug-matched items are skipped. Missing slugs are reported as `pending` only. Live content cannot be overwritten or force-published by that button.

### Media
Delete is refused if the file is referenced as cover/gallery/og/video/settings image. The error lists each use. Successful upload, alt edit, or unused delete updates CMS cache tags and public paths immediately.

---

## Tests (`cms-phase2-test-*`)

Ran against the configured Supabase project using service-role writes, then deleted only those rows. `compact-villa` was read-only in the check.

| Step | Project `cms-phase2-test-project` | Portfolio `cms-phase2-test-portfolio` |
| --- | --- | --- |
| create + publish | resolver `cms` | resolver `cms` |
| deactivate | resolver `hidden` | resolver `hidden` |
| reactivate | resolver `cms` | resolver `cms` |
| delete | resolver `hidden` (static cannot return) | resolver `hidden` |
| cleanup | no leftover rows | no leftover rows |

`compact-villa` resolver remained `cms`. Hidden-id list restored (test ids removed).

HTTP after cleanup (local `http://localhost:3000`):

| Route | Result |
| --- | --- |
| `/az/layihelar` | 200, Compact Villa present, no test title, no crash overlay |
| `/en/layihelar` | 200, Compact Villa present |
| `/az/portfolio` | 200, real items, no test title |
| `/az/bloq` | 200 |
| `/en/xidmetler` | 200 |
| `/az/layihelar/compact-villa` | 200 |
| `/az/layihelar/cms-phase2-test-project` | **404**, no crash overlay |

Mid-cycle HTTP of the published test slugs was not separately asserted (Next `unstable_cache` is 60s unless a server action revalidates). Visibility was confirmed with the same `resolveCatalogItem` used by public list/detail.

---

## Confirmation: no real Raul content changed

- No existing project, portfolio, blog, service, or media row was updated.
- Only `cms-phase2-test-*` rows were inserted and then deleted.
- `legacy_hidden` was restored without those test ids.
- Migration was not run.
- Vercel / SQL / RLS were not changed.

---

## Lint / typecheck / build

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass (Next.js 16.3.0, 331 pages) |

---

## Remaining blockers (not this phase)

1. Live anon `SELECT` still denied; public CMS reads still use the server service role.
2. Homepage project/portfolio **category tiles** are still static covers, not individual CMS items.
3. English pathnames (`/en/projects`) and list-page hreflang/canonical remain as in the audit.
4. `deleteMedia` now blocks in-use files; leftover unused storage on project delete still best-effort (errors logged, not thrown) so a content delete is not blocked by storage.
5. Skip-only migration will not auto-create truly missing legacy slugs; admins add those one-by-one.

No commit, push, or deploy was made.
