import type { Locale } from "@/i18n/routing";

export const blogCategories = [
  "bim",
  "architecture",
  "interior",
  "construction",
  "urban",
  "visualization",
  "planning",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type BlogLocaleCopy = {
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  ctaLabel: string;
  ctaText: string;
  blocks: BlogBlock[];
};

export type BlogPost = {
  slug: string;
  publishedAt: string;
  image: string;
  imageAlt: Record<Locale, string>;
  category: BlogCategory;
  serviceSlug: string;
  relatedHrefs: readonly [string, string];
  copy: Record<Locale, BlogLocaleCopy>;
};
