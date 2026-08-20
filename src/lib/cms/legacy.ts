import type { CmsRow, Translations } from "./types";

export const LEGACY_HIDDEN_SETTINGS_KEY = "legacy_hidden";
export const LEGACY_MIGRATION_SETTINGS_KEY = "legacy_migration";

export type LegacyKind = "project" | "portfolio";

export function legacySourceId(kind: LegacyKind, slug: string) {
  return `${kind}:${slug}`;
}

export function readLegacySourceId(row: { slug: string; translations?: Translations | null }, kind: LegacyKind) {
  const translations = row.translations ?? {};
  for (const locale of ["az", "en", "de", "ru"] as const) {
    const id = translations[locale]?.legacySourceId?.trim();
    if (id) return id;
  }
  return legacySourceId(kind, row.slug);
}

export function withLegacySourceId(translations: Translations, id: string): Translations {
  const next: Translations = { ...translations };
  for (const locale of ["az", "en", "de", "ru"] as const) {
    next[locale] = { ...(next[locale] ?? {}), legacySourceId: id };
  }
  return next;
}

export function cmsTakesPublic(row: Pick<CmsRow, "status" | "is_active">) {
  return row.status === "published" && row.is_active !== false;
}

export function hasExplicitLegacySourceId(row: { translations?: Translations | null }) {
  const translations = row.translations ?? {};
  return ["az", "en", "de", "ru"].some((locale) => Boolean(translations[locale]?.legacySourceId?.trim()));
}

/** Inactive/archived, or a migrated CMS row that is no longer public, must not be replaced by static files. */
export function cmsSuppressesLegacy(row: Pick<CmsRow, "status" | "is_active" | "translations">) {
  if (row.is_active === false) return true;
  if (row.status === "archived") return true;
  if (hasExplicitLegacySourceId(row) && !cmsTakesPublic(row)) return true;
  return false;
}

export type LegacyVisibility = "cms" | "legacy" | "hidden";

type CatalogRow = Pick<CmsRow, "id" | "slug" | "status" | "is_active" | "translations" | "sort_order">;

export type CatalogResolution<T extends CatalogRow = CatalogRow> = {
  visibility: LegacyVisibility;
  row: T | null;
};

function hasStamp(row: { translations?: Translations | null }, id: string) {
  const translations = row.translations ?? {};
  return ["az", "en", "de", "ru"].some((locale) => translations[locale]?.legacySourceId?.trim() === id);
}

/**
 * Prefer explicit legacySourceId. If no stamp exists, bind by slug so unstamped
 * CMS rows (known gap: project `compact-villa`) still hide when they are not public.
 */
export function relatedCatalogRows<T extends CatalogRow>(options: {
  kind: LegacyKind;
  slug: string;
  cmsRows: T[];
}): T[] {
  const id = legacySourceId(options.kind, options.slug);
  const stamped = options.cmsRows.filter((row) => hasStamp(row, id));
  if (stamped.length) return stamped;
  return options.cmsRows.filter((row) => row.slug === options.slug);
}

export function pickPublicCatalogRow<T extends CatalogRow>(rows: T[]): T | null {
  const publicRows = rows.filter(cmsTakesPublic);
  if (!publicRows.length) return null;
  return [...publicRows].sort((a, b) => {
    const order = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (order !== 0) return order;
    return a.id.localeCompare(b.id);
  })[0];
}

/**
 * Single rule for project/portfolio list AND detail.
 * - no related CMS → legacy/static
 * - related published+active → that CMS row (deterministic if duplicates)
 * - related but none public (draft/archived/inactive/hidden) → hidden, never static fallback
 */
export function resolveCatalogItem<T extends CatalogRow>(options: {
  kind: LegacyKind;
  slug: string;
  cmsRows: T[];
  hiddenIds: Iterable<string>;
}): CatalogResolution<T> {
  const id = legacySourceId(options.kind, options.slug);
  if (new Set(options.hiddenIds).has(id)) {
    return { visibility: "hidden", row: null };
  }
  const related = relatedCatalogRows(options);
  const publicRow = pickPublicCatalogRow(related);
  if (publicRow) return { visibility: "cms", row: publicRow };
  if (related.length) return { visibility: "hidden", row: null };
  return { visibility: "legacy", row: null };
}

export function legacyItemVisibility(options: {
  kind: LegacyKind;
  slug: string;
  cmsRows: CatalogRow[];
  hiddenIds: Iterable<string>;
}): LegacyVisibility {
  return resolveCatalogItem(options).visibility;
}

/** Blog/services: archived or inactive hide matching legacy; drafts do not (unmigrated seeds stay public). */
export function cmsHidesUnpublishedLegacy(row: Pick<CmsRow, "status" | "is_active">) {
  return row.is_active === false || row.status === "archived";
}

export function parseHiddenLegacyIds(value: Record<string, unknown> | null | undefined) {
  const raw = value?.ids;
  if (!Array.isArray(raw)) return [] as string[];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}
