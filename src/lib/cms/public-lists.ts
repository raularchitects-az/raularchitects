import type { BlogPost } from "@/data/blog";
import type { InsightPost } from "@/data/insights/types";
import { blogPosts as staticBlog } from "@/data/blog";
import { portfolioItems as staticPortfolio } from "@/data/portfolio";
import { projects as staticProjects } from "@/data/projects";
import { services as staticServices } from "@/data/services";
import { findBlogByAnySlug } from "@/lib/blog-urls";
import { findInsightByAnySlug } from "@/lib/insights-urls";
import {
  cmsHidesUnpublishedLegacy,
  cmsTakesPublic,
  hiddenSetHasLegacy,
  pickPublicCatalogRow,
  resolveCatalogItem,
  sortOrderRank,
  sortRowsBySortOrder,
  type LegacyKind,
} from "./legacy";
import {
  cmsBlogToPost,
  cmsInsightToPost,
  cmsPortfolioToMeta,
  cmsProjectToMeta,
  cmsServiceToPublic,
  hiddenLegacyIdsForMerge,
  staticPortfolioPublic,
  staticProjectPublic,
  staticServicePublic,
} from "./public-mappers";
import { getCatalogRows } from "./queries";
import type { CmsRow } from "./types";

function mapOrSkip<T>(row: CmsRow, map: (row: CmsRow) => T): T | null {
  try {
    return map(row);
  } catch (error) {
    console.error("[cms] skip malformed row", row.id, row.slug, error);
    return null;
  }
}

function mergeHardCatalog<TStatic extends { slug: string }, TCms, TLegacy>(options: {
  kind: LegacyKind;
  staticItems: TStatic[];
  cmsRows: CmsRow[];
  hiddenIds: string[];
  toCms: (row: CmsRow) => TCms;
  toLegacy: (item: TStatic) => TLegacy;
}): Array<TCms | TLegacy> {
  const used = new Set<string>();
  const merged: Array<TCms | TLegacy> = [];

  for (const item of options.staticItems) {
    const resolved = resolveCatalogItem({
      kind: options.kind,
      slug: item.slug,
      cmsRows: options.cmsRows,
      hiddenIds: options.hiddenIds,
    });
    if (resolved.visibility === "hidden") continue;
    if (resolved.visibility === "cms" && resolved.row) {
      const mapped = mapOrSkip(resolved.row, options.toCms);
      if (!mapped) continue;
      merged.push(mapped);
      used.add(resolved.row.id);
      continue;
    }
    merged.push(options.toLegacy(item));
  }

  for (const row of options.cmsRows) {
    if (!cmsTakesPublic(row) || used.has(row.id)) continue;
    const mapped = mapOrSkip(row, options.toCms);
    if (mapped) merged.push(mapped);
  }
  return merged;
}

function resolveHardDetail<TStatic extends { slug: string }, TCms, TLegacy>(options: {
  kind: LegacyKind;
  slug: string;
  staticItems: TStatic[];
  cmsRows: CmsRow[];
  hiddenIds: string[];
  toCms: (row: CmsRow) => TCms;
  toLegacy: (item: TStatic) => TLegacy;
}): TCms | TLegacy | null {
  const resolved = resolveCatalogItem({
    kind: options.kind,
    slug: options.slug,
    cmsRows: options.cmsRows,
    hiddenIds: options.hiddenIds,
  });
  if (resolved.visibility === "hidden") return null;
  if (resolved.visibility === "cms" && resolved.row) {
    return mapOrSkip(resolved.row, options.toCms);
  }
  const fallback = options.staticItems.find((item) => item.slug === options.slug);
  return fallback ? options.toLegacy(fallback) : null;
}

function blogAliases(post: { slug: string; slugs?: BlogPost["slugs"] }) {
  return new Set(
    [post.slug, ...Object.values(post.slugs ?? {})]
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function relatedBlogRows(post: { slug: string; slugs?: BlogPost["slugs"] }, rows: CmsRow[]) {
  const id = `blog:${post.slug}`;
  const stamped = rows.filter((row) =>
    ["az", "en", "de", "ru"].some((locale) => row.translations?.[locale]?.legacySourceId?.trim() === id),
  );
  if (stamped.length) return stamped;
  const aliases = blogAliases(post);
  return rows.filter((row) => {
    if (aliases.has(row.slug)) return true;
    return ["az", "en", "de", "ru"].some((locale) => {
      const slug = row.translations?.[locale]?.slug?.trim();
      return Boolean(slug && aliases.has(slug));
    });
  });
}

function relatedServiceRows(slug: string, rows: CmsRow[]) {
  const id = `service:${slug}`;
  const stamped = rows.filter((row) =>
    ["az", "en", "de", "ru"].some((locale) => row.translations?.[locale]?.legacySourceId?.trim() === id),
  );
  if (stamped.length) return stamped;
  return rows.filter((row) => row.slug === slug);
}

function comparePublicProjectOrder(
  a: { sortOrder?: number | null; slug: string },
  b: { sortOrder?: number | null; slug: string },
) {
  const order = sortOrderRank(a.sortOrder) - sortOrderRank(b.sortOrder);
  if (order !== 0) return order;
  return a.slug.localeCompare(b.slug);
}

function sortPublicProjects<T extends { sortOrder?: number | null; slug: string }>(items: T[]) {
  return [...items].sort(comparePublicProjectOrder);
}

export async function getPublicProjects(locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("projects"), hiddenLegacyIdsForMerge()]);
  return sortPublicProjects(
    mergeHardCatalog({
      kind: "project",
      staticItems: staticProjects,
      cmsRows: rows,
      hiddenIds: hidden,
      toCms: (row) => cmsProjectToMeta(row, locale),
      toLegacy: staticProjectPublic,
    }),
  );
}

export async function getPublicProject(slug: string, locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("projects"), hiddenLegacyIdsForMerge()]);
  return resolveHardDetail({
    kind: "project",
    slug,
    staticItems: staticProjects,
    cmsRows: rows,
    hiddenIds: hidden,
    toCms: (row) => cmsProjectToMeta(row, locale),
    toLegacy: staticProjectPublic,
  });
}

export async function getPublicPortfolio(locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("portfolio"), hiddenLegacyIdsForMerge()]);
  return mergeHardCatalog({
    kind: "portfolio",
    staticItems: staticPortfolio,
    cmsRows: rows,
    hiddenIds: hidden,
    toCms: (row) => cmsPortfolioToMeta(row, locale),
    toLegacy: staticPortfolioPublic,
  });
}

export async function getPublicPortfolioItem(slug: string, locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("portfolio"), hiddenLegacyIdsForMerge()]);
  return resolveHardDetail({
    kind: "portfolio",
    slug,
    staticItems: staticPortfolio,
    cmsRows: rows,
    hiddenIds: hidden,
    toCms: (row) => cmsPortfolioToMeta(row, locale),
    toLegacy: staticPortfolioPublic,
  });
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  const [rows, hidden] = await Promise.all([getCatalogRows("blog_posts"), hiddenLegacyIdsForMerge()]);
  const hiddenIds = new Set(hidden);
  const used = new Set<string>();
  const merged: BlogPost[] = [];

  for (const item of staticBlog) {
    if (hiddenSetHasLegacy(hiddenIds, "blog", item.slug, blogAliases(item))) continue;
    const related = relatedBlogRows(item, rows);
    const publicRow = pickPublicCatalogRow(related);
    if (publicRow) {
      const mapped = mapOrSkip(publicRow, cmsBlogToPost);
      if (mapped) {
        merged.push(mapped);
        used.add(publicRow.id);
      }
      continue;
    }
    if (related.some(cmsHidesUnpublishedLegacy)) continue;
    merged.push(item);
  }

  for (const row of rows) {
    if (!cmsTakesPublic(row) || used.has(row.id)) continue;
    if (hiddenSetHasLegacy(hiddenIds, "blog", row.slug)) continue;
    const mapped = mapOrSkip(row, cmsBlogToPost);
    if (mapped) merged.push(mapped);
  }
  return merged;
}

export async function getPublicBlogPost(slug: string) {
  return findBlogByAnySlug(await getPublicBlogPosts(), slug);
}

export async function getPublicServices(locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("services"), hiddenLegacyIdsForMerge()]);
  const hiddenIds = new Set(hidden);
  const used = new Set<string>();
  const merged: ReturnType<typeof cmsServiceToPublic>[] = [];

  for (const item of staticServices) {
    if (hiddenSetHasLegacy(hiddenIds, "service", item.slug)) continue;
    const related = relatedServiceRows(item.slug, rows);
    const publicRow = pickPublicCatalogRow(related);
    if (publicRow) {
      const mapped = mapOrSkip(publicRow, (row) => cmsServiceToPublic(row, locale));
      if (mapped) {
        merged.push(mapped);
        used.add(publicRow.id);
      }
      continue;
    }
    if (related.some(cmsHidesUnpublishedLegacy)) continue;
    merged.push(staticServicePublic(item));
  }

  for (const row of rows) {
    if (!cmsTakesPublic(row) || used.has(row.id)) continue;
    if (hiddenSetHasLegacy(hiddenIds, "service", row.slug)) continue;
    const mapped = mapOrSkip(row, (item) => cmsServiceToPublic(item, locale));
    if (mapped) merged.push(mapped);
  }
  return merged;
}

export async function getPublicService(slug: string, locale: string) {
  const all = await getPublicServices(locale);
  return all.find((item) => item.slug === slug) ?? null;
}

function timestamp(value?: string | null) {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
}

function publicDate(item: unknown, key: "publishedAt" | "createdAt") {
  if (!item || typeof item !== "object") return null;
  const value = (item as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

/** Newest public catalog items. Dates DESC, then the loader’s existing order. */
export function takeLatestPublic<T>(items: T[], limit = 10): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const published = timestamp(publicDate(b.item, "publishedAt")) - timestamp(publicDate(a.item, "publishedAt"));
      if (published) return published;
      const created = timestamp(publicDate(b.item, "createdAt")) - timestamp(publicDate(a.item, "createdAt"));
      if (created) return created;
      return a.index - b.index;
    })
    .slice(0, Math.max(0, limit))
    .map(({ item }) => item);
}

export async function getHomeBlogPosts() {
  const rows = await getCatalogRows("blog_posts");
  return rows
    .filter((row) => cmsTakesPublic(row) && (row.show_on_home || row.featured))
    .sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )
    .map((row) => mapOrSkip(row, cmsBlogToPost))
    .filter((post): post is BlogPost => Boolean(post));
}

function insightTimestamp(value?: string | null) {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? 0 : ms;
}

export async function getPublicInsights(): Promise<InsightPost[]> {
  const rows = await getCatalogRows("insights");
  return rows
    .filter((row) => cmsTakesPublic(row))
    .sort(
      (a, b) =>
        insightTimestamp(b.published_at) - insightTimestamp(a.published_at) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )
    .map((row) => mapOrSkip(row, cmsInsightToPost))
    .filter((post): post is InsightPost => Boolean(post));
}

export async function getPublicInsight(slug: string) {
  return findInsightByAnySlug(await getPublicInsights(), slug);
}

export async function getHomeInsights(): Promise<InsightPost[]> {
  const rows = await getCatalogRows("insights");
  return rows
    .filter((row) => cmsTakesPublic(row))
    .sort(
      (a, b) =>
        insightTimestamp(b.published_at) - insightTimestamp(a.published_at) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )
    .map((row) => mapOrSkip(row, cmsInsightToPost))
    .filter((post): post is InsightPost => Boolean(post));
}
