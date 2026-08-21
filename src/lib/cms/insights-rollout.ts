import { cache } from "react";
import { insightSeedRows } from "@/data/insights-seed";
import { cmsTakesPublic } from "./legacy";
import { isMissingRelationError } from "./missing-table";
import { getCatalogRows, getSettings, getSettingsAdmin } from "./queries";
import { createAdminClient, createPublicReadClient, createServiceClient } from "./supabase";
import type { CmsRow } from "./types";
import {
  REAL_PORTFOLIO_MIGRATE_SLUGS,
  readMigratedFromPortfolioId,
  type RealPortfolioMigrateSlug,
} from "./portfolio-to-projects";

/** site_settings key — value shape: `{ active: boolean }`. Default false. */
export const INSIGHTS_RESTRUCTURE_ACTIVE_KEY = "insights_restructure_active";

export { REAL_PORTFOLIO_MIGRATE_SLUGS, type RealPortfolioMigrateSlug };

export const EXPECTED_INSIGHT_SEED_SLUGS = insightSeedRows.map((row) => row.slug);

function parseActiveFlag(value: Record<string, unknown> | null | undefined): boolean {
  if (!value) return false;
  if (typeof value.active === "boolean") return value.active;
  if (typeof (value as { value?: unknown }).value === "boolean") {
    return Boolean((value as { value: boolean }).value);
  }
  // Accidental bare store: { "true": ... } — only accept explicit true on `active`
  return false;
}

/** Public/admin-safe: missing setting, CMS down, or parse failure → false. Never throws. */
export const isInsightsRestructureActive = cache(async (): Promise<boolean> => {
  try {
    const value = await getSettings(INSIGHTS_RESTRUCTURE_ACTIVE_KEY);
    return parseActiveFlag(value);
  } catch (error) {
    console.error("[cms] insights_restructure_active", error);
    return false;
  }
});

export async function isInsightsRestructureActiveAdmin(): Promise<boolean> {
  try {
    const value = await getSettingsAdmin(INSIGHTS_RESTRUCTURE_ACTIVE_KEY);
    return parseActiveFlag(value);
  } catch {
    return false;
  }
}

export async function insightsTableExists(): Promise<boolean> {
  try {
    const client = createServiceClient() ?? createPublicReadClient() ?? (await createAdminClient());
    if (!client) return false;
    const { error } = await client.from("insights").select("id").limit(1);
    if (!error) return true;
    if (isMissingRelationError(error)) return false;
    console.error("[cms] insights table probe", error.code, error.message);
    return false;
  } catch (error) {
    console.error("[cms] insights table probe", error);
    return false;
  }
}

export function isRealPortfolioMigrateSlug(slug: string): slug is RealPortfolioMigrateSlug {
  return (REAL_PORTFOLIO_MIGRATE_SLUGS as readonly string[]).includes(slug);
}

export type ActivationBlocker = {
  code: string;
  message: string;
};

export type ActivationReadiness = {
  ok: boolean;
  blockers: ActivationBlocker[];
  checks: {
    insightsTable: boolean;
    restructureActive: boolean;
    migratedCount: number;
    expectedMigrate: number;
    migrationConflicts: number;
    insightsPublishedActive: number;
    expectedInsights: number;
    missingInsightSlugs: string[];
  };
};

export async function getInsightsActivationReadiness(): Promise<ActivationReadiness> {
  const blockers: ActivationBlocker[] = [];
  const expectedMigrate = REAL_PORTFOLIO_MIGRATE_SLUGS.length;
  const expectedInsights = EXPECTED_INSIGHT_SEED_SLUGS.length;

  const [tableOk, restructureActive, projects, portfolios] = await Promise.all([
    insightsTableExists(),
    isInsightsRestructureActiveAdmin(),
    getCatalogRows("projects"),
    getCatalogRows("portfolio"),
  ]);

  let insights: CmsRow[] = [];
  if (tableOk) {
    try {
      insights = await getCatalogRows("insights");
    } catch {
      insights = [];
    }
  }

  if (!tableOk) {
    blockers.push({
      code: "insights_table_missing",
      message: "public.insights cədvəli yoxdur — əvvəl supabase/patch-insights.sql işə salın.",
    });
  }

  const portfolioBySlug = new Map(portfolios.map((row) => [row.slug, row]));
  let migratedCount = 0;
  let migrationConflicts = 0;

  for (const slug of REAL_PORTFOLIO_MIGRATE_SLUGS) {
    const portfolio = portfolioBySlug.get(slug);
    if (!portfolio) {
      blockers.push({
        code: "portfolio_missing",
        message: `Portfolio qeydi tapılmadı: ${slug}`,
      });
      continue;
    }
    const stamped = projects.find((row) => readMigratedFromPortfolioId(row) === portfolio.id);
    if (stamped) {
      migratedCount += 1;
      continue;
    }
    const sameSlug = projects.find((row) => row.slug === slug);
    if (sameSlug) {
      migrationConflicts += 1;
      blockers.push({
        code: "slug_conflict",
        message: `Layihə slug conflict (köçürmə tamamlanmayıb): ${slug}`,
      });
    } else {
      blockers.push({
        code: "not_migrated",
        message: `Hələ Projects-ə köçürülməyib: ${slug}`,
      });
    }
  }

  const publishedActive = insights.filter((row) => cmsTakesPublic(row));
  const presentSlugs = new Set(publishedActive.map((row) => row.slug));
  const missingInsightSlugs = EXPECTED_INSIGHT_SEED_SLUGS.filter((slug) => !presentSlugs.has(slug));

  if (tableOk && (publishedActive.length < expectedInsights || missingInsightSlugs.length)) {
    blockers.push({
      code: "insights_incomplete",
      message: `Published+active Insights: ${publishedActive.length}/${expectedInsights}. Çatışmayan: ${missingInsightSlugs.join(", ") || "—"}.`,
    });
  }

  return {
    ok: blockers.length === 0,
    blockers,
    checks: {
      insightsTable: tableOk,
      restructureActive,
      migratedCount,
      expectedMigrate,
      migrationConflicts,
      insightsPublishedActive: publishedActive.length,
      expectedInsights,
      missingInsightSlugs,
    },
  };
}

export function findMigratedProjectSlugForPortfolio(
  portfolioSlug: string,
  projects: CmsRow[],
  portfolios: CmsRow[],
): string | null {
  const portfolio = portfolios.find((row) => row.slug === portfolioSlug);
  if (portfolio) {
    const stamped = projects.find((row) => readMigratedFromPortfolioId(row) === portfolio.id);
    if (stamped) return stamped.slug;
  }
  const byLegacy = projects.find((row) =>
    ["az", "en", "de", "ru"].some(
      (code) => row.translations?.[code]?.legacySourceId?.trim() === `portfolio:${portfolioSlug}`,
    ),
  );
  if (byLegacy) return byLegacy.slug;
  const sameSlug = projects.find((row) => row.slug === portfolioSlug);
  return sameSlug?.slug ?? null;
}
