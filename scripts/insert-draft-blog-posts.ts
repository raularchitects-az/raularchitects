/**
 * Inserts the 10 new blog articles into CMS as drafts.
 * Does not publish. Safe to re-run: existing slugs are skipped.
 *
 *   npx tsx --env-file=.env.local scripts/insert-draft-blog-posts.ts
 */
import { createClient } from "@supabase/supabase-js";
import { allDraftBlogPosts } from "../src/data/blog/draft-posts-index";
import { blogLocalizedSlugs } from "../src/data/blog/localized-slugs";
import type { BlogBlock } from "../src/data/blog/types";

function blocksToMarkdown(blocks: BlogBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `## ${block.text}`;
      if (block.type === "h3") return `### ${block.text}`;
      if (block.type === "ul") return block.items.map((item) => `- ${item}`).join("\n");
      return block.text;
    })
    .join("\n\n");
}

function trimEnv(name: string) {
  return (process.env[name] ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
}

const url = trimEnv("NEXT_PUBLIC_SUPABASE_URL");
const key = trimEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const locales = ["az", "en", "ru", "de"] as const;

const rows = allDraftBlogPosts.map((post, index) => {
  const slugs = blogLocalizedSlugs[post.slug] ?? {
    az: post.slug,
    en: post.slug,
    de: post.slug,
    ru: post.slug,
  };
  return {
    slug: post.slug,
    category: post.category,
    cover_path: post.image,
    status: "draft",
    is_active: true,
    show_on_home: false,
    featured: false,
    sort_order: 100 + index,
    published_at: post.publishedAt,
    seo_title: post.copy.az.seoTitle,
    meta_description: post.copy.az.description,
    translations: Object.fromEntries(
      locales.map((locale) => {
        const copy = post.copy[locale];
        return [
          locale,
          {
            title: copy.title,
            short: copy.excerpt,
            excerpt: copy.excerpt,
            body: blocksToMarkdown(copy.blocks),
            seoTitle: copy.seoTitle,
            description: copy.description,
            imageAlt: post.imageAlt[locale],
            ctaLabel: copy.ctaLabel,
            ctaText: copy.ctaText,
            slug: slugs[locale],
            published: true,
          },
        ];
      }),
    ),
  };
});

async function main() {
  const { data, error } = await supabase.from("blog_posts").upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: true,
  }).select("slug");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Draft blog posts ready: ${allDraftBlogPosts.length} prepared, ${data?.length ?? 0} inserted (existing slugs skipped).`);
  for (const post of allDraftBlogPosts) {
    console.log(`- ${post.slug}`);
  }
}

main();
