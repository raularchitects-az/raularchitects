/**
 * Upsert only batch-2 Insights by slug.
 * Expects scripts/.insights-batch2.json (generated via npx tsx).
 * Uses SUPABASE_SERVICE_ROLE_KEY from .env.local
 */
import { readFileSync, unlinkSync } from "node:fs";
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

async function main() {
  const batch = JSON.parse(readFileSync("scripts/.insights-batch2.json", "utf8"));

  const { data: existing, error: listError } = await supabase
    .from("insights")
    .select("slug, sort_order");
  if (listError) throw listError;

  const maxSort = (existing ?? []).reduce((m, row) => Math.max(m, row.sort_order ?? 0), -1);
  const existingBySlug = new Map((existing ?? []).map((row) => [row.slug, row]));

  const rows = batch.map((item, index) => ({
    slug: item.slug,
    category: item.category,
    cover_path: item.cover_path,
    status: "published",
    is_active: true,
    sort_order: existingBySlug.has(item.slug)
      ? (existingBySlug.get(item.slug)?.sort_order ?? maxSort + 1 + index)
      : maxSort + 1 + index,
    published_at: item.published_at ?? new Date().toISOString(),
    seo_title: item.translations.az?.seoTitle ?? item.translations.az?.title ?? null,
    meta_description: item.translations.az?.description ?? null,
    translations: Object.fromEntries(
      Object.entries(item.translations).map(([locale, copy]) => [
        locale,
        {
          title: copy.title,
          short: copy.excerpt,
          excerpt: copy.excerpt,
          body: copy.body,
          seoTitle: copy.seoTitle,
          description: copy.description,
          imageAlt: copy.imageAlt,
          slug: copy.slug,
          published: copy.published,
        },
      ]),
    ),
  }));

  const { error } = await supabase.from("insights").upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: false,
  });
  if (error) throw error;

  try {
    unlinkSync("scripts/.insights-batch2.json");
  } catch {
    /* ignore */
  }

  console.log(
    JSON.stringify(
      {
        upserted: rows.length,
        slugs: rows.map((r) => r.slug),
        newSlugs: rows.filter((r) => !existingBySlug.has(r.slug)).map((r) => r.slug),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
