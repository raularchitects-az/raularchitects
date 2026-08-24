# Existing Project CMS → Public Sync Fix

Scope: make the CMS the public source of truth for **existing imported/migrated projects**, without changing how newly created projects behave and without migrating, recreating or deleting any content.

---

## 1. Root cause

Every project that came from one of the two static import files carries a CMS row **and** a static entry with the same slug:

- `src/data/raul-portfolio-manifest.json` (source `raul-portfolio-folder-2026`)
- `src/data/raul-13-project-manifest.json` (source `raul-13-project-import`)

`src/app/[locale]/layihelar/[slug]/page.tsx` looked the static entry up with `getImportedEntry(slug)` and then let it win over the CMS row:

| Field | Old expression | Effect |
| --- | --- | --- |
| Hero image | `imported?.hero.src ?? cmsProject?.image` | static hero always beat the CMS cover |
| Gallery | `{!imported && gallery.length > 0 ? … }` / `{imported && … importedGallery … }` | an imported project could **never** render its CMS gallery |
| Video | `{!imported && cmsVideo ? … }` | CMS video suppressed on imported projects |
| Description | CMS first, `""` when imported | text was already correct |

The listing and homepage do not use `getImportedEntry`; they read the mapped CMS row through `mergeHardCatalog`. That is exactly the reported asymmetry: **the homepage picked up edits while the detail page did not.**

Concretely, for `space-port-helgoland` the CMS row held 7 gallery images and an uploaded Supabase cover, while the detail page rendered the 9 static manifest images and the static hero file. Two images that had already been deleted in admin were still public.

A second, smaller source of stale media: when a CMS gallery was emptied, the detail page fell back to the legacy `sections` column and then to `getProjectGalleryGroups()`, so deleting the last images in admin could resurrect old ones.

This was **not** a caching problem. All content routes build as `ƒ` (server-rendered on demand), so there is no full route cache to go stale; `revalidatePublic()` already covered the homepage, the listing and the detail URL in all four locales.

---

## 2. Changed files

### `src/app/[locale]/layihelar/[slug]/page.tsx`
- Split the static lookup into `legacyEntry` (raw) and `imported` (fallback-only).
- `imported` is now `null` whenever `cmsProject.source === "cms"`, so a project with a CMS row takes its hero, gallery, video, title and description from the CMS.
- `galleryImageUrls` renders the CMS `gallery` array verbatim for CMS-backed projects. The legacy `sections` column and the static gallery groups remain fallbacks only for slugs with no CMS row.
- Description/title fallbacks now key off `legacyEntry` rather than `imported`, so imported slugs never hit `t("items.<slug>.title")` for a message that does not exist.
- The hero caption block still renders on the same condition as before (`legacyEntry`), so the layout is unchanged — only its content now comes from the CMS.
- `generateMetadata` got the same precedence rule.

### `src/app/[locale]/portfolio/[slug]/page.tsx`
Same shared pattern (`gallery = importedGallery.length ? importedGallery : cmsGallery` and the static hero) fixed identically. No visible content or design change.

### `src/lib/cms/actions.ts`
`revalidateMedia()` now also calls `revalidatePublic()`. Media rows are referenced by content rows, so a media upload/delete/alt-edit can change any public page that renders a cover or gallery image; previously only `/admin/media` was invalidated.

### `scripts/` (new, diagnostics only — not part of the app)
- `inspect-project-row.mjs` — dump one CMS project row.
- `audit-static-vs-cms.mjs` — compare every static import entry against its CMS row (regression guard).
- `verify-project-sync.mjs` — snapshot → edit → verify → restore round trip.
- `verify-new-draft-project.mjs` — throwaway draft insert → publish → delete.

---

## 3. Pre-flight safety audit

Before switching precedence, `audit-static-vs-cms.mjs` compared all 28 static import entries with their CMS rows:

```
--- would-regress ---
none
```

- 31 project rows total; **0** rows carry media only in the legacy `sections` column, so ignoring `sections` cannot blank out any project.
- `casa-del-rio` is the only project with a video; it exists in both the CMS row and the static entry, so the switch to the CMS video is lossless.
- `senftenberg-shehersalma` has an empty gallery in the CMS — and also an empty static gallery, so nothing was lost. It renders its cover only, which is what the CMS actually contains.
- Two rows had already diverged because admin deletions were being ignored publicly: `space-port-helgoland` (CMS 7 vs static 9) and `nar` (CMS 7 vs static 8). Both now render the CMS truth.

---

## 4. Space Port Helgoland test result

`node scripts/verify-project-sync.mjs space-port-helgoland` snapshotted the row, applied one safe text edit plus one gallery removal and one gallery addition, checked all four locales, then restored the snapshot.

Applied: body marker in az/en/de/ru, removed `…/g09.webp`, added `…/g01.webp`.

```
EDIT CHECK PASS
 az | en | de | ru   →  status 200, textUpdated ✓, removedGone ✓, addedVisible ✓
RESTORE EXACT PASS
RESTORE CHECK PASS
 az | en | de | ru   →  markerGone ✓, removedBack ✓, addedGone ✓
```

The row was restored byte for byte — `translations`, `gallery` and even `updated_at` (`2026-08-23T19:48:44.632+00:00`) are identical to the pre-test snapshot.

Before/after on the live page:

| | Before | After |
| --- | --- | --- |
| Hero | `/images/import/space-port-helgoland/hero.webp` | `…/storage/v1/object/public/media/1787514205635-space-port-helgoland.webp` |
| Gallery | 9 static images (g01–g09) | 7 CMS images (g03–g09) |

### Cross-page consistency

Detail hero, All Projects card and homepage card now resolve to the same file for every project checked:

| Slug | Detail hero | Listing | Homepage | Gallery |
| --- | --- | --- | --- | --- |
| space-port-helgoland | `1787514205635-…webp` | same | same | 7 |
| nar | `hero.webp` | same | same | 7 |
| co-re-tower | `1787487695001-…jpg` | same | same | 2 |
| casa-del-rio | `hero.webp` | same | not in top 9 | 4 |
| merdekan-villa | `hero.webp` | same | not in top 9 | 6 |
| klassik-villa | `hero.webp` | same | not in top 9 | 5 |
| senftenberg-shehersalma | `hero.webp` | same | not in top 9 | 0 |

### New project behaviour

`node scripts/verify-new-draft-project.mjs` inserted a throwaway draft with no static counterpart:

```
DRAFT HIDDEN PASS       az/en/de/ru → 404
PUBLISHED VISIBLE PASS  az/en/de/ru → 200 with its CMS gallery
cleanup delete status 204 · rows left: 0
```

New projects are provably unaffected by the change: they have no static entry, so `legacyEntry` is `null` and the code path is identical to before.

---

## 5. Tested URLs

- `http://localhost:3000/az/layihelar/space-port-helgoland`
- `http://localhost:3000/en/projects/space-port-helgoland`
- `http://localhost:3000/de/layihelar/space-port-helgoland`
- `http://localhost:3000/ru/layihelar/space-port-helgoland`
- `http://localhost:3000/az/layihelar` (All Projects)
- `http://localhost:3000/az` (homepage)
- Detail pages for `nar`, `casa-del-rio`, `co-re-tower`, `merdekan-villa`, `klassik-villa`, `senftenberg-shehersalma`

Note: DE and RU keep the Azerbaijani path segment (`/de/layihelar/…`, `/ru/layihelar/…`); only EN is localised to `/en/projects/…`.

---

## 6. Items reviewed and deliberately left alone

**Storage deletion safety** — already correct. `deleteMedia()` calls `findMediaUsages()` across all content tables plus `site_settings` and refuses to delete a file that is still referenced, so shared files cannot be removed without confirmed ownership.

**Admin save error reporting** — already correct. `upsertRecord()` runs every write through `throwIfError()` and additionally throws when the `.select()` after an update returns no row, so a failed database write can never surface as success. The admin form awaits the action and only navigates after it resolves.

**Insights and Blog** — their detail pages read exclusively from the CMS with no static fallback, so the old-record-versus-CMS class of bug cannot occur there. No change made.

**Services** — `src/app/[locale]/xidmetler/[slug]/page.tsx` already gives the CMS precedence (`cms.title && cms.title !== slug ? cms.title : static`, `cms.intro || static`, body/image/video straight from the CMS). The only static values it uses are `number`, `icon` and `points`, which are not CMS-editable fields. No change made.

---

## 7. Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | pass |
| `npm run lint` | pass (1 pre-existing warning: unused `sortRowsBySortOrder` in `src/lib/cms/public-lists.ts`, untouched by this work) |
| `npm run build` | pass — 348 static pages generated, all content routes remain `ƒ` |

Nothing was committed, pushed, deployed or migrated. No project content was recreated or deleted.

---

## 8. Follow-up worth considering

**`senftenberg-shehersalma` has no gallery images in the CMS.** It previously showed nothing either (its static entry is also empty), so this is not a regression — but it is the one published project with a cover and no gallery. Adding images in admin will now work normally.

**Legacy `sections` data is still stored on the rows.** It is no longer rendered for CMS-backed projects, but it is still serialised into the RSC payload by `cmsProjectToMeta`, which adds some transfer weight on the listing page. Clearing the column, or dropping `sections` from the public mapper, would be a safe tidy-up once you are happy the galleries look right.

**DeepL failures block saving.** `applyAutoTranslations()` runs before the database write, so a DeepL outage or quota error fails the whole save with a visible error. That is an honest failure rather than a false success, but if you would rather have edits persist regardless, the translation step can be made non-fatal with a warning surfaced in the admin UI.
