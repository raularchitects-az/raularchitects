import { routing, type Locale } from "@/i18n/routing";
import type { InsightPost } from "@/data/insights/types";
import { productionAbsoluteUrl } from "@/lib/site";

export function fallbackInsightSlugs(canonicalSlug: string): Record<Locale, string> {
  return {
    az: canonicalSlug,
    en: canonicalSlug,
    de: canonicalSlug,
    ru: canonicalSlug,
  };
}

export function getInsightLocaleSlug(post: Pick<InsightPost, "slug" | "slugs">, locale: string) {
  return post.slugs?.[locale as Locale] || (locale === "az" ? post.slug : "") || "";
}

export function isInsightLocaleLive(post: InsightPost, locale: string) {
  const copy = post.copy[locale as Locale];
  const slug = getInsightLocaleSlug(post, locale);
  return Boolean(slug && copy?.title?.trim() && copy.published !== false);
}

export function insightPostPath(post: Pick<InsightPost, "slug" | "slugs">, locale: string) {
  const slug = getInsightLocaleSlug(post, locale);
  return slug ? `/insights/${slug}` : "/insights";
}

export function insightPostUrl(post: Pick<InsightPost, "slug" | "slugs">, locale: string) {
  const path = insightPostPath(post, locale);
  return productionAbsoluteUrl(locale, path);
}

export function insightLanguageAlternates(post: InsightPost) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    if (!isInsightLocaleLive(post, locale)) continue;
    languages[locale] = insightPostUrl(post, locale);
  }
  languages["x-default"] = languages.az || languages.en || Object.values(languages)[0] || "";
  return languages;
}

export function findInsightByAnySlug(posts: InsightPost[], slug: string) {
  return (
    posts.find((post) => post.slug === slug || routing.locales.some((locale) => post.slugs?.[locale] === slug)) ?? null
  );
}
