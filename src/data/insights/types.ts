import type { Locale } from "@/i18n/routing";
import type { BlogBlock } from "@/data/blog/types";
import { INSIGHT_CATEGORIES } from "@/lib/cms/types";

export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number];

export type InsightBlock = BlogBlock;

export type InsightLocaleCopy = {
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  ctaLabel: string;
  ctaText: string;
  blocks: InsightBlock[];
  published?: boolean;
};

export type InsightPost = {
  slug: string;
  slugs?: Record<Locale, string>;
  publishedAt: string;
  image: string;
  imageAlt: Record<Locale, string>;
  category: InsightCategory;
  relatedHrefs: readonly [string, string];
  copy: Record<Locale, InsightLocaleCopy>;
};

export function getInsightCopy(post: InsightPost, locale: string) {
  return post.copy[locale as Locale];
}

export function getInsightImageAlt(post: InsightPost, locale: string) {
  return post.imageAlt[locale as Locale] || post.imageAlt.en || post.slug;
}

export function formatInsightDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
