import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !key) {
  console.error("Missing Supabase URL or service role key");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function readMigratedFromPortfolioId(row) {
  const translations = row.translations ?? {};
  for (const locale of ["az", "en", "de", "ru"]) {
    const id = translations[locale]?.migratedFromPortfolioId?.trim();
    if (id) return id;
  }
  return null;
}

async function main() {
  const [{ data: projects, error: pErr }, { data: portfolio, error: oErr }, insightsProbe] = await Promise.all([
    supabase.from("projects").select("id, slug, status, is_active, translations"),
    supabase.from("portfolio").select("id, slug, status, is_active, translations"),
    supabase.from("insights").select("id").limit(1),
  ]);
  if (pErr) throw pErr;
  if (oErr) throw oErr;

  const projectSlugs = new Set((projects ?? []).map((r) => r.slug));
  const plan = (portfolio ?? []).map((item) => {
    const stamped = (projects ?? []).find((p) => readMigratedFromPortfolioId(p) === item.id);
    if (stamped) {
      return { portfolioSlug: item.slug, action: "skip-already-migrated", projectSlug: stamped.slug };
    }
    if (projectSlugs.has(item.slug)) {
      return {
        portfolioSlug: item.slug,
        action: "skip-slug-conflict",
        projectSlug: `${item.slug}-from-portfolio`,
        reason: "slug exists on projects with different content stamp",
      };
    }
    return { portfolioSlug: item.slug, action: "create", projectSlug: item.slug };
  });

  console.log(
    JSON.stringify(
      {
        insightsTableOk: !insightsProbe.error,
        insightsError: insightsProbe.error
          ? { code: insightsProbe.error.code, message: insightsProbe.error.message }
          : null,
        projects: projects?.length ?? 0,
        portfolio: portfolio?.length ?? 0,
        planSummary: {
          create: plan.filter((i) => i.action === "create").length,
          skipAlreadyMigrated: plan.filter((i) => i.action === "skip-already-migrated").length,
          skipSlugConflict: plan.filter((i) => i.action === "skip-slug-conflict").length,
        },
        plan,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
