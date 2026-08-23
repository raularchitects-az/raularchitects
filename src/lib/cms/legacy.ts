import type { CmsRow, Translations } from "./types";

export const LEGACY_HIDDEN_SETTINGS_KEY = "legacy_hidden";
export const LEGACY_MIGRATION_SETTINGS_KEY = "legacy_migration";

export type LegacyKind = "project" | "portfolio" | "blog" | "service";

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

export function sortOrderRank(value: number | null | undefined) {
  if (value == null || value <= 0) return Number.MAX_SAFE_INTEGER;
  return value;
}

export function compareBySortOrder(
  a: { sort_order?: number | null; slug?: string },
  b: { sort_order?: number | null; slug?: string },
) {
  const order = sortOrderRank(a.sort_order) - sortOrderRank(b.sort_order);
  if (order !== 0) return order;
  return (a.slug ?? "").localeCompare(b.slug ?? "");
}

export function sortRowsBySortOrder<T extends { sort_order?: number | null; slug?: string }>(rows: T[]) {
  return [...rows].sort(compareBySortOrder);
}

export function pickPublicCatalogRow<T extends CatalogRow>(rows: T[]): T | null {
  const publicRows = rows.filter(cmsTakesPublic);
  if (!publicRows.length) return null;
  return [...publicRows].sort((a, b) => {
    const order = compareBySortOrder(a, b);
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

export function legacyKindForTable(table: string): LegacyKind | null {
  if (table === "projects") return "project";
  if (table === "portfolio") return "portfolio";
  if (table === "blog_posts") return "blog";
  if (table === "services") return "service";
  return null;
}

export function legacyHiddenKeysForRow(kind: LegacyKind, row: { slug: string; translations?: Translations | null }) {
  const keys = new Set<string>([readLegacySourceId(row, kind), legacySourceId(kind, row.slug)]);
  if (kind === "blog") {
    for (const locale of ["az", "en", "de", "ru"] as const) {
      const slug = row.translations?.[locale]?.slug?.trim();
      if (slug) keys.add(legacySourceId("blog", slug));
    }
  }
  return [...keys];
}

export function hiddenSetHasLegacy(hiddenIds: Iterable<string>, kind: LegacyKind, slug: string, aliases: Iterable<string> = []) {
  const hidden = hiddenIds instanceof Set ? hiddenIds : new Set(hiddenIds);
  if (hidden.has(legacySourceId(kind, slug))) return true;
  for (const alias of aliases) {
    if (alias && hidden.has(legacySourceId(kind, alias))) return true;
  }
  return false;
}
