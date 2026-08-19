import type { Locale } from "@/i18n/routing";
import type { BlogPost } from "./types";
import { blogLocalizedSlugs } from "./localized-slugs";
import { bimMemarliqNedir } from "./posts/bim-memarliq-nedir";
import { evTikdirmekUcunMemarliqLayihesi } from "./posts/ev-tikdirmek-ucun-memarliq-layihesi";
import { menzilInteryerDizayniBaki } from "./posts/menzil-interyer-dizayni-baki";
import { isciCertyojlarVeIcraSenedleri } from "./posts/isci-certyojlar-ve-icra-senedleri";
import { ucdVizualizasiyaMemarliqLayihesi } from "./posts/3d-vizualizasiya-memarliq-layihesi";
import { funksionalPlanlamaEvPlani } from "./posts/funksional-planlama-ev-plani";
import { villaLayihelendirmesiBaki } from "./posts/villa-layihelendirmesi-baki";
import { kommersiyaMekaniMemarliqLayihesi } from "./posts/kommersiya-mekani-memarliq-layihesi";
import { sehersalmaYasayisKompleksiLayihesi } from "./posts/sehersalma-yasayis-kompleksi-layihesi";
import { tikintiVeTemirLayiheIle } from "./posts/tikinti-ve-temir-layihe-ile";
import { findBlogByAnySlug } from "@/lib/blog-urls";

export type { BlogPost, BlogCategory, BlogLocaleCopy } from "./types";

const rawPosts = [
  bimMemarliqNedir,
  evTikdirmekUcunMemarliqLayihesi,
  menzilInteryerDizayniBaki,
  isciCertyojlarVeIcraSenedleri,
  ucdVizualizasiyaMemarliqLayihesi,
  funksionalPlanlamaEvPlani,
  villaLayihelendirmesiBaki,
  kommersiyaMekaniMemarliqLayihesi,
  sehersalmaYasayisKompleksiLayihesi,
  tikintiVeTemirLayiheIle,
];

export const blogPosts: BlogPost[] = rawPosts.map((post) => ({
  ...post,
  slugs: blogLocalizedSlugs[post.slug] ?? {
    az: post.slug,
    en: post.slug,
    de: post.slug,
    ru: post.slug,
  },
}));

export function getBlogPost(slug: string) {
  return findBlogByAnySlug(blogPosts, slug);
}

export function getLatestBlogPosts(count = 3) {
  return blogPosts.slice(0, count);
}

export function getBlogCopy(post: BlogPost, locale: string) {
  return post.copy[locale as Locale];
}

export function getBlogImageAlt(post: BlogPost, locale: string) {
  return post.imageAlt[locale as Locale] || post.imageAlt.en || post.slug;
}

export function formatBlogDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
