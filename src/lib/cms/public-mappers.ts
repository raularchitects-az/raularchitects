import type { BlogPost } from "@/data/blog";
import type { PortfolioMeta } from "@/data/portfolio";
import { getProjectGalleryGroups, type ProjectMeta } from "@/data/projects";
import type { ServiceMeta } from "@/data/services";
import { fallbackBlogSlugs } from "@/lib/blog-urls";
import { mediaPublicUrl } from "./media-url";
import { getSettings } from "./queries";
import { LEGACY_HIDDEN_SETTINGS_KEY, parseHiddenLegacyIds } from "./legacy";
import type { CmsRow, TranslationBlock } from "./types";

export function pickT(row: CmsRow, locale: string): TranslationBlock {
  const t = row.translations ?? {};
  return t[locale] ?? t.az ?? t.en ?? t.de ?? {};
}

function pickLocaleT(row: CmsRow, locale: string): TranslationBlock {
  return row.translations?.[locale] ?? {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function localeHasCopy(block: TranslationBlock) {
  return Boolean(
    text(block.title) ||
      text(block.name) ||
      text(block.seoTitle) ||
      text(block.description) ||
      text(block.short) ||
      text(block.full) ||
      text(block.intro) ||
      text(block.body) ||
      text(block.excerpt),
  );
}

function localizedField(row: CmsRow, locale: string, keys: (keyof TranslationBlock)[], rowFallback?: string | null) {
  const loc = pickLocaleT(row, locale);
  const source = localeHasCopy(loc) ? loc : pickT(row, locale);
  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }
  if (!localeHasCopy(loc) && text(rowFallback)) return text(rowFallback);
  return "";
}

function cover(row: CmsRow) {
  return mediaPublicUrl(row.cover_path) || mediaPublicUrl(row.image_path) || "";
}

function galleryUrls(row: CmsRow) {
  return (row.gallery ?? [])
    .map((item) => mediaPublicUrl(item && typeof item === "object" ? item.path : String(item ?? "")))
    .filter(Boolean);
}

export function cmsProjectToMeta(row: CmsRow, locale: string): ProjectMeta & {
  title: string;
  description: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  videoUrl?: string | null;
  location?: string | null;
  area?: string | null;
  gallery: string[];
  sections: NonNullable<CmsRow["sections"]>;
  ogImage?: string;
  publishedAt: string | null;
  createdAt: string | null;
} {
  const gallery = galleryUrls(row);
  return {
    slug: row.slug,
    category: (row.category ?? "villa") as ProjectMeta["category"],
    image: cover(row) || gallery[0] || "/images/projects/compact-villa.jpg",
    source: "cms",
    title: localizedField(row, locale, ["name", "title"]) || row.slug,
    description: localizedField(row, locale, ["full", "short"]),
    seoTitle: localizedField(row, locale, ["seoTitle", "title", "name"], locale === "az" ? row.seo_title : null),
    metaDescription: localizedField(row, locale, ["description", "short"], locale === "az" ? row.meta_description : null),
    canonicalUrl: row.canonical_url,
    videoUrl: row.video_url,
    location: row.location,
    area: row.area_m2,
    gallery,
    sections: row.sections ?? {},
    ogImage: mediaPublicUrl(row.og_image_path) || cover(row),
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

export function cmsPortfolioToMeta(row: CmsRow, locale: string): PortfolioMeta & {
  description: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  videoUrl?: string | null;
  ogImage?: string;
  gallery: string[];
  publishedAt: string | null;
  createdAt: string | null;
} {
  const gallery = galleryUrls(row);
  return {
    slug: row.slug,
    category: (row.category ?? "villa") as PortfolioMeta["category"],
    country: (row.country as PortfolioMeta["country"]) ?? null,
    image: cover(row) || gallery[0] || "/images/portfolio/azerbaijan-01.jpg",
    source: "cms",
    title: localizedField(row, locale, ["name", "title"]) || row.slug,
    description: localizedField(row, locale, ["full", "short"]),
    seoTitle: localizedField(row, locale, ["seoTitle", "title", "name"], locale === "az" ? row.seo_title : null),
    metaDescription: localizedField(row, locale, ["description", "short"], locale === "az" ? row.meta_description : null),
    canonicalUrl: row.canonical_url,
    videoUrl: row.video_url,
    ogImage: mediaPublicUrl(row.og_image_path) || cover(row),
    gallery,
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

function markdownToBlocks(body: unknown) {
  const text = typeof body === "string" ? body : "";
  const chunks = text.trim().split(/\n{2,}/);
  return chunks.map((chunk) => {
    if (chunk.startsWith("### ")) return { type: "h3" as const, text: chunk.replace(/^### /, "") };
    if (chunk.startsWith("## ")) return { type: "h2" as const, text: chunk.replace(/^## /, "") };
    if (chunk.startsWith("- ")) {
      return {
        type: "ul" as const,
        items: chunk
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => line.replace(/^- /, "")),
      };
    }
    return { type: "p" as const, text: chunk };
  });
}

function cmsDatePrefix(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

export function cmsBlogToPost(row: CmsRow): BlogPost {
  const locales = ["az", "en", "ru", "de"] as const;
  const mapped = fallbackBlogSlugs(row.slug);
  const slugs = Object.fromEntries(
    locales.map((locale) => {
      const t = pickLocaleT(row, locale);
      const explicit = t.slug?.trim();
      if (explicit) return [locale, explicit];
      if (mapped[locale] && mapped[locale] !== row.slug) return [locale, mapped[locale]];
      if (t.title?.trim() || locale === "az") return [locale, row.slug];
      return [locale, ""];
    }),
  ) as BlogPost["slugs"];

  const copy = Object.fromEntries(
    locales.map((locale) => {
      const t = pickLocaleT(row, locale);
      const title = t.title?.trim() || "";
      return [
        locale,
        {
          title,
          seoTitle: t.seoTitle || (locale === "az" ? row.seo_title : "") || title,
          description: t.description || t.excerpt || t.short || (locale === "az" ? row.meta_description || "" : ""),
          excerpt: t.excerpt || t.short || "",
          ctaLabel: t.ctaLabel || "",
          ctaText: t.ctaText || "",
          blocks: markdownToBlocks(t.body || t.full || ""),
          published: t.published !== false,
        },
      ];
    }),
  ) as BlogPost["copy"];

  return {
    slug: row.slug,
    slugs,
    publishedAt: cmsDatePrefix(row.published_at) || cmsDatePrefix(row.created_at) || "1970-01-01",
    image: cover(row),
    imageAlt: {
      az: pickLocaleT(row, "az").imageAlt || pickLocaleT(row, "az").title || row.slug,
      en: pickLocaleT(row, "en").imageAlt || pickLocaleT(row, "en").title || row.slug,
      ru: pickLocaleT(row, "ru").imageAlt || pickLocaleT(row, "ru").title || row.slug,
      de: pickLocaleT(row, "de").imageAlt || pickLocaleT(row, "de").title || row.slug,
    },
    category: (row.category as BlogPost["category"]) || "architecture",
    serviceSlug: "bim-ile-layihelendirme",
    relatedHrefs: ["/xidmetler", "/elaqe"],
    copy,
  };
}

export function cmsServiceToPublic(row: CmsRow, locale: string) {
  return {
    slug: row.slug,
    number: row.number || "",
    icon: row.icon || "Boxes",
    title: localizedField(row, locale, ["title", "name"]) || row.slug,
    intro: localizedField(row, locale, ["intro", "short"]),
    body: localizedField(row, locale, ["body", "full"]),
    home: row.show_on_home !== false,
    seoTitle: localizedField(row, locale, ["seoTitle", "title"], locale === "az" ? row.seo_title : null) || undefined,
    metaDescription: localizedField(row, locale, ["description", "intro", "short"], locale === "az" ? row.meta_description : null) || undefined,
    image: mediaPublicUrl(row.image_path),
    videoUrl: row.video_url,
  };
}

export function staticServicePublic(service: ServiceMeta) {
  return {
    ...service,
    title: service.slug,
    intro: "",
    body: "",
    home: true,
    seoTitle: undefined as string | undefined,
    metaDescription: undefined as string | undefined,
    image: "",
    videoUrl: null as string | null,
  };
}

export function staticProjectPublic(item: ProjectMeta) {
  const groups = getProjectGalleryGroups(item.slug);
  return {
    ...item,
    description: "",
    seoTitle: undefined as string | undefined,
    metaDescription: undefined as string | undefined,
    canonicalUrl: null as string | null,
    videoUrl: null as string | null,
    location: null as string | null,
    area: null as string | null,
    ogImage: item.heroImage || item.image,
    gallery: [...groups.exteriorImages, ...groups.interiorImages, ...groups.planningImages],
    publishedAt: null as string | null,
    createdAt: null as string | null,
    sections: {
      exterior: { media: groups.exteriorImages.map((path) => ({ path })) },
      interior: { media: groups.interiorImages.map((path) => ({ path })) },
      plan: { media: groups.planningImages.map((path) => ({ path })) },
      bim: { media: [] },
    },
  };
}

export function staticPortfolioPublic(item: PortfolioMeta) {
  return {
    ...item,
    description: "",
    seoTitle: undefined as string | undefined,
    metaDescription: undefined as string | undefined,
    canonicalUrl: null as string | null,
    videoUrl: null as string | null,
    ogImage: item.heroImage || item.image,
    gallery: [] as string[],
    publishedAt: null as string | null,
    createdAt: null as string | null,
  };
}

export async function hiddenLegacyIdsForMerge() {
  const settings = await getSettings(LEGACY_HIDDEN_SETTINGS_KEY);
  return parseHiddenLegacyIds(settings);
}
