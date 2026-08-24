import { routing, type Locale } from "@/i18n/routing";
import type { BlogPost } from "@/data/blog/types";
import { blogLocalizedSlugs } from "@/data/blog/localized-slugs";
import { productionAbsoluteUrl } from "@/lib/site";

export function fallbackBlogSlugs(canonicalSlug: string): Record<Locale, string> {
  return (
    blogLocalizedSlugs[canonicalSlug] ?? {
      az: canonicalSlug,
      en: canonicalSlug,
      de: canonicalSlug,
      ru: canonicalSlug,
    }
  );
}

export function getBlogLocaleSlug(post: Pick<BlogPost, "slug" | "slugs">, locale: string) {
  return post.slugs?.[locale as Locale] || (locale === "az" ? post.slug : "") || "";
}

export function isBlogLocaleLive(post: BlogPost, locale: string) {
  const copy = post.copy[locale as Locale];
  const slug = getBlogLocaleSlug(post, locale);
  return Boolean(slug && copy?.title?.trim() && copy.published !== false);
}

export function blogPostPath(post: Pick<BlogPost, "slug" | "slugs">, locale: string) {
  const slug = getBlogLocaleSlug(post, locale);
  return slug ? `/bloq/${slug}` : "/bloq";
}

export function blogPostUrl(post: Pick<BlogPost, "slug" | "slugs">, locale: string) {
  const path = blogPostPath(post, locale);
  return productionAbsoluteUrl(locale, path);
}

export function blogLanguageAlternates(post: BlogPost) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    if (!isBlogLocaleLive(post, locale)) continue;
    languages[locale] = blogPostUrl(post, locale);
  }
  languages["x-default"] = languages.az || languages.en || Object.values(languages)[0] || "";
  return languages;
}

export function findBlogByAnySlug(posts: BlogPost[], slug: string) {
  return (
    posts.find((post) => post.slug === slug || routing.locales.some((locale) => post.slugs?.[locale] === slug)) ?? null
  );
}
