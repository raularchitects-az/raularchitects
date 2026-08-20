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

export function legacyItemVisibility(options: {
  kind: LegacyKind;
  slug: string;
  cmsRows: Array<Pick<CmsRow, "slug" | "status" | "is_active" | "translations">>;
  hiddenIds: Iterable<string>;
}): LegacyVisibility {
  const id = legacySourceId(options.kind, options.slug);
  const hidden = new Set(options.hiddenIds);
  if (hidden.has(id)) return "hidden";

  const matches = options.cmsRows.filter(
    (row) => readLegacySourceId(row, options.kind) === id || row.slug === options.slug,
  );
  if (matches.some(cmsTakesPublic)) return "cms";
  if (matches.some(cmsSuppressesLegacy)) return "hidden";
  return "legacy";
}

export function parseHiddenLegacyIds(value: Record<string, unknown> | null | undefined) {
  const raw = value?.ids;
  if (!Array.isArray(raw)) return [] as string[];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}
