import type { CmsRow, GalleryItem, Translations } from "./types";

export const PORTFOLIO_TO_PROJECTS_MIGRATION_KEY = "portfolio_to_projects_migration";

/** Only these real published Portfolio works may be copied into Projects. */
export const REAL_PORTFOLIO_MIGRATE_SLUGS = [
  "merdekan-villa",
  "sharur-yasayis-kompleksi",
  "exhibition-stands",
] as const;

export type RealPortfolioMigrateSlug = (typeof REAL_PORTFOLIO_MIGRATE_SLUGS)[number];

export type PortfolioMigrationPlanItem = {
  portfolioId: string;
  portfolioSlug: string;
  action: "create" | "skip-already-migrated" | "skip-slug-conflict" | "update-same-migration";
  projectSlug: string;
  projectId?: string;
  reason?: string;
};

export type PortfolioMigrationPlan = {
  items: PortfolioMigrationPlanItem[];
  create: number;
  skipAlreadyMigrated: number;
  skipSlugConflict: number;
  updateSameMigration: number;
};

const COUNTRY_LOCATION: Record<string, string> = {
  azerbaijan: "Azerbaijan",
  germany: "Germany",
  switzerland: "Switzerland",
};

export function locationFromPortfolioCountry(country: string | null | undefined) {
  if (!country) return null;
  return COUNTRY_LOCATION[country] ?? country;
}

export function readMigratedFromPortfolioId(row: { translations?: Translations | null }) {
  const translations = row.translations ?? {};
  for (const locale of ["az", "en", "de", "ru"] as const) {
    const id = translations[locale]?.migratedFromPortfolioId?.trim();
    if (id) return id;
  }
  return null;
}

export function stampProjectTranslationsFromPortfolio(
  translations: Translations | null | undefined,
  portfolio: Pick<CmsRow, "id" | "slug">,
): Translations {
  const source = translations ?? {};
  const legacyId = `portfolio:${portfolio.slug}`;
  const next: Translations = {};
  for (const locale of ["az", "en", "de", "ru"] as const) {
    const block = source[locale] ?? {};
    next[locale] = {
      ...block,
      migratedFromPortfolioId: portfolio.id,
      legacySourceId: block.legacySourceId?.trim() || legacyId,
    };
  }
  return next;
}

export function stampPortfolioMigratedToProject(
  translations: Translations | null | undefined,
  projectSlug: string,
): Translations {
  const source = translations ?? {};
  const next: Translations = {};
  for (const locale of ["az", "en", "de", "ru"] as const) {
    next[locale] = {
      ...(source[locale] ?? {}),
      migratedToProjectSlug: projectSlug,
    };
  }
  return next;
}

export function conflictSlugForPortfolio(portfolioSlug: string) {
  return `${portfolioSlug}-from-portfolio`;
}

export function mapPortfolioToProjectPayload(portfolio: CmsRow, projectSlug: string) {
  return {
    slug: projectSlug,
    category: portfolio.category ?? "villa",
    cover_path: portfolio.cover_path,
    og_image_path: portfolio.og_image_path,
    gallery: (portfolio.gallery ?? []) as GalleryItem[],
    video_url: portfolio.video_url,
    canonical_url: portfolio.canonical_url,
    seo_title: portfolio.seo_title,
    meta_description: portfolio.meta_description,
    translations: stampProjectTranslationsFromPortfolio(portfolio.translations, portfolio),
    status: portfolio.status,
    is_active: portfolio.is_active,
    sort_order: portfolio.sort_order,
    published_at: portfolio.published_at ?? null,
    location: locationFromPortfolioCountry(portfolio.country),
    sections: {},
  };
}

function findProjectByMigrationStamp(projects: CmsRow[], portfolioId: string) {
  return projects.find((row) => readMigratedFromPortfolioId(row) === portfolioId) ?? null;
}

function findProjectBySlug(projects: CmsRow[], slug: string) {
  return projects.find((row) => row.slug === slug) ?? null;
}

/**
 * Pure dry-run planner. Never mutates rows.
 * Only the 3 real published Portfolio works are eligible.
 * Draft placeholders are ignored entirely (not listed as create/skip).
 * - Re-run with same stamp → skip-already-migrated
 * - Slug taken by unrelated project → try `{slug}-from-portfolio`, else skip-slug-conflict
 * - Never overwrite a project that was not created from this portfolio
 */
export function planPortfolioToProjects(
  portfolios: CmsRow[],
  projects: CmsRow[],
): PortfolioMigrationPlan {
  const items: PortfolioMigrationPlanItem[] = [];
  const eligible = portfolios.filter((row) =>
    (REAL_PORTFOLIO_MIGRATE_SLUGS as readonly string[]).includes(row.slug),
  );

  for (const portfolio of eligible) {
    const stamped = findProjectByMigrationStamp(projects, portfolio.id);
    if (stamped) {
      items.push({
        portfolioId: portfolio.id,
        portfolioSlug: portfolio.slug,
        action: "skip-already-migrated",
        projectSlug: stamped.slug,
        projectId: stamped.id,
        reason: "Artıq bu portfolio-dan köçürülüb (migratedFromPortfolioId)",
      });
      continue;
    }

    const sameSlug = findProjectBySlug(projects, portfolio.slug);
    let projectSlug = portfolio.slug;

    if (sameSlug) {
      const alt = conflictSlugForPortfolio(portfolio.slug);
      const altRow = findProjectBySlug(projects, alt);
      if (altRow) {
        // Both preferred and deterministic conflict slugs are taken by unrelated projects.
        items.push({
          portfolioId: portfolio.id,
          portfolioSlug: portfolio.slug,
          action: "skip-slug-conflict",
          projectSlug: alt,
          projectId: altRow.id,
          reason: `Slug conflict: “${portfolio.slug}” və “${alt}” artıq mövcuddur`,
        });
        continue;
      }
      projectSlug = alt;
    }

    items.push({
      portfolioId: portfolio.id,
      portfolioSlug: portfolio.slug,
      action: "create",
      projectSlug,
      reason: projectSlug === portfolio.slug ? undefined : `Slug conflict → “${projectSlug}”`,
    });
  }

  return {
    items,
    create: items.filter((item) => item.action === "create").length,
    skipAlreadyMigrated: items.filter((item) => item.action === "skip-already-migrated").length,
    skipSlugConflict: items.filter((item) => item.action === "skip-slug-conflict").length,
    updateSameMigration: items.filter((item) => item.action === "update-same-migration").length,
  };
}
