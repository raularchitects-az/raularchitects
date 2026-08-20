import { blogPosts as staticBlog, type BlogPost } from "@/data/blog";
import { portfolioItems as staticPortfolio, type PortfolioMeta } from "@/data/portfolio";
import { projects as staticProjects, getProjectGalleryGroups, type ProjectMeta } from "@/data/projects";
import { services as staticServices } from "@/data/services";
import { fallbackBlogSlugs, findBlogByAnySlug, getBlogLocaleSlug, isBlogLocaleLive } from "@/lib/blog-urls";
import { isCmsConfigured } from "./env";
import { mediaPublicUrl } from "./media-url";
import { findRedirect, getCatalogRows, getPublished, getSettings } from "./queries";
import { cmsTakesPublic, LEGACY_HIDDEN_SETTINGS_KEY, legacyItemVisibility, legacySourceId, parseHiddenLegacyIds, type LegacyKind } from "./legacy";
import type { CmsRow, TranslationBlock } from "./types";

/** True when CMS env is configured. Public listings still merge with unmigrated legacy items. */
export function isPublicCmsLive() {
  return isCmsConfigured();
}

function pickT(row: CmsRow, locale: string): TranslationBlock {
  const t = row.translations ?? {};
  return t[locale] ?? t.az ?? t.en ?? t.de ?? {};
}

function pickLocaleT(row: CmsRow, locale: string): TranslationBlock {
  return row.translations?.[locale] ?? {};
}

function cover(row: CmsRow) {
  return mediaPublicUrl(row.cover_path) || mediaPublicUrl(row.image_path) || "";
}

export function cmsProjectToMeta(row: CmsRow, locale: string): ProjectMeta & {
  title: string;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  videoUrl?: string | null;
  location?: string | null;
  area?: string | null;
  gallery: string[];
  sections: NonNullable<CmsRow["sections"]>;
  ogImage?: string;
} {
  const t = pickT(row, locale);
  const gallery = (row.gallery ?? []).map((item) => mediaPublicUrl(item.path)).filter(Boolean);
  return {
    slug: row.slug,
    category: (row.category ?? "villa") as ProjectMeta["category"],
    image: cover(row) || gallery[0] || "/images/projects/compact-villa.jpg",
    source: "cms",
    title: t.name || t.title || row.slug,
    description: t.full || t.short || "",
    seoTitle: row.seo_title || t.seoTitle || t.title,
    metaDescription: row.meta_description || t.description || t.short,
    canonicalUrl: row.canonical_url,
    videoUrl: row.video_url,
    location: row.location,
    area: row.area_m2,
    gallery,
    sections: row.sections ?? {},
    ogImage: mediaPublicUrl(row.og_image_path) || cover(row),
  };
}

export function cmsPortfolioToMeta(row: CmsRow, locale: string): PortfolioMeta & {
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  videoUrl?: string | null;
  ogImage?: string;
  gallery: string[];
} {
  const t = pickT(row, locale);
  const gallery = (row.gallery ?? []).map((item) => mediaPublicUrl(item.path)).filter(Boolean);
  return {
    slug: row.slug,
    category: (row.category ?? "villa") as PortfolioMeta["category"],
    country: (row.country as PortfolioMeta["country"]) ?? null,
    image: cover(row) || gallery[0] || "/images/portfolio/azerbaijan-01.jpg",
    source: "cms",
    title: t.name || t.title || row.slug,
    description: t.full || t.short || "",
    seoTitle: row.seo_title || t.seoTitle,
    metaDescription: row.meta_description || t.description,
    canonicalUrl: row.canonical_url,
    videoUrl: row.video_url,
    ogImage: mediaPublicUrl(row.og_image_path) || cover(row),
    gallery,
  };
}

function markdownToBlocks(body: string) {
  const chunks = body.trim().split(/\n{2,}/);
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
    publishedAt: row.published_at?.slice(0, 10) || row.created_at.slice(0, 10),
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

function staticProjectPublic(item: ProjectMeta) {
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
    sections: {
      exterior: { media: groups.exteriorImages.map((path) => ({ path })) },
      interior: { media: groups.interiorImages.map((path) => ({ path })) },
      plan: { media: groups.planningImages.map((path) => ({ path })) },
      bim: { media: [] },
    },
  };
}

function staticPortfolioPublic(item: PortfolioMeta) {
  return {
    ...item,
    description: "",
    seoTitle: undefined as string | undefined,
    metaDescription: undefined as string | undefined,
    canonicalUrl: null as string | null,
    videoUrl: null as string | null,
    ogImage: item.heroImage || item.image,
    gallery: [] as string[],
  };
}

async function hiddenLegacyIds() {
  const settings = await getSettings(LEGACY_HIDDEN_SETTINGS_KEY);
  return parseHiddenLegacyIds(settings);
}

function matchingCmsRow(kind: LegacyKind, slug: string, rows: CmsRow[]) {
  const id = legacySourceId(kind, slug);
  return (
    rows.find((row) => {
      const translations = row.translations ?? {};
      return ["az", "en", "de", "ru"].some((locale) => translations[locale]?.legacySourceId === id);
    }) ?? rows.find((row) => row.slug === slug)
  );
}

export async function getPublicProjects(locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("projects"), hiddenLegacyIds()]);
  const merged = [];
  const used = new Set<string>();

  for (const item of staticProjects) {
    const visibility = legacyItemVisibility({ kind: "project", slug: item.slug, cmsRows: rows, hiddenIds: hidden });
    if (visibility === "hidden") continue;
    if (visibility === "cms") {
      const row = matchingCmsRow("project", item.slug, rows);
      if (row && cmsTakesPublic(row)) {
        merged.push(cmsProjectToMeta(row, locale));
        used.add(row.id);
        continue;
      }
    }
    merged.push(staticProjectPublic(item));
  }

  for (const row of rows) {
    if (!cmsTakesPublic(row) || used.has(row.id)) continue;
    merged.push(cmsProjectToMeta(row, locale));
  }
  return merged;
}

export async function getPublicProject(slug: string, locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("projects"), hiddenLegacyIds()]);
  const visibility = legacyItemVisibility({ kind: "project", slug, cmsRows: rows, hiddenIds: hidden });
  if (visibility === "hidden") return null;
  if (visibility === "cms") {
    const row = matchingCmsRow("project", slug, rows);
    return row && cmsTakesPublic(row) ? cmsProjectToMeta(row, locale) : null;
  }
  const cmsOnly = rows.find((row) => cmsTakesPublic(row) && row.slug === slug);
  if (cmsOnly) return cmsProjectToMeta(cmsOnly, locale);
  const fallback = staticProjects.find((item) => item.slug === slug);
  return fallback ? staticProjectPublic(fallback) : null;
}

export async function getPublicPortfolio(locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("portfolio"), hiddenLegacyIds()]);
  const merged = [];
  const used = new Set<string>();

  for (const item of staticPortfolio) {
    const visibility = legacyItemVisibility({ kind: "portfolio", slug: item.slug, cmsRows: rows, hiddenIds: hidden });
    if (visibility === "hidden") continue;
    if (visibility === "cms") {
      const row = matchingCmsRow("portfolio", item.slug, rows);
      if (row && cmsTakesPublic(row)) {
        merged.push(cmsPortfolioToMeta(row, locale));
        used.add(row.id);
        continue;
      }
    }
    merged.push(staticPortfolioPublic(item));
  }

  for (const row of rows) {
    if (!cmsTakesPublic(row) || used.has(row.id)) continue;
    merged.push(cmsPortfolioToMeta(row, locale));
  }
  return merged;
}

export async function getPublicPortfolioItem(slug: string, locale: string) {
  const [rows, hidden] = await Promise.all([getCatalogRows("portfolio"), hiddenLegacyIds()]);
  const visibility = legacyItemVisibility({ kind: "portfolio", slug, cmsRows: rows, hiddenIds: hidden });
  if (visibility === "hidden") return null;
  if (visibility === "cms") {
    const row = matchingCmsRow("portfolio", slug, rows);
    return row && cmsTakesPublic(row) ? cmsPortfolioToMeta(row, locale) : null;
  }
  const cmsOnly = rows.find((row) => cmsTakesPublic(row) && row.slug === slug);
  if (cmsOnly) return cmsPortfolioToMeta(cmsOnly, locale);
  const item = staticPortfolio.find((entry) => entry.slug === slug);
  return item ? staticPortfolioPublic(item) : null;
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  const rows = await getPublished("blog_posts");
  if (rows.length) {
    return rows
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(cmsBlogToPost);
  }
  return staticBlog;
}

export async function getPublicBlogPost(slug: string) {
  const rows = await getPublished("blog_posts");
  if (rows.length) {
    const posts = rows.map(cmsBlogToPost);
    return findBlogByAnySlug(posts, slug);
  }
  return findBlogByAnySlug(staticBlog, slug);
}

export async function getPublicServices(locale: string) {
  const rows = await getPublished("services");
  if (!rows.length) {
    return staticServices.map((service) => ({
      ...service,
      title: service.slug,
      intro: "",
      body: "",
      home: true,
      seoTitle: undefined as string | undefined,
      metaDescription: undefined as string | undefined,
      image: "",
      videoUrl: null as string | null,
    }));
  }
  return rows
    .filter((row) => row.is_active)
    .map((row) => {
      const t = pickT(row, locale);
      return {
        slug: row.slug,
        number: row.number || "",
        icon: row.icon || "Boxes",
        title: t.title || row.slug,
        intro: t.intro || t.short || "",
        body: t.body || t.full || "",
        home: row.show_on_home !== false,
        seoTitle: row.seo_title || t.seoTitle,
        metaDescription: row.meta_description || t.description,
        image: mediaPublicUrl(row.image_path),
        videoUrl: row.video_url,
      };
    });
}

export async function getPublicService(slug: string, locale: string) {
  const all = await getPublicServices(locale);
  return all.find((item) => item.slug === slug) ?? null;
}

export async function getSiteSettings() {
  const [hero, contact, about, footer, home] = await Promise.all([
    getSettings("hero"),
    getSettings("contact"),
    getSettings("about"),
    getSettings("footer"),
    getSettings("home"),
  ]);
  return { hero, contact, about, footer, home };
}

export async function getHomeBlogPosts() {
  const rows = await getPublished("blog_posts");
  if (!rows.length) return [];
  return rows
    .filter((row) => row.show_on_home || row.featured)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(cmsBlogToPost);
}

export async function getPublicContact() {
  const contact = (await getSettings("contact")) ?? {};
  const region = (key: string) => (contact[key] as { phone?: string; address?: string } | undefined) ?? {};
  return {
    email: typeof contact.email === "string" ? contact.email : "",
    whatsapp: typeof contact.whatsapp === "string" ? contact.whatsapp : "",
    azerbaijan: region("azerbaijan"),
    germany: region("germany"),
    switzerland: region("switzerland"),
  };
}

export async function resolveSlugRedirect(kind: "layihelar" | "portfolio" | "bloq" | "xidmetler", slug: string) {
  return findRedirect(`/${kind}/${slug}`);
}

export async function resolvePublicBlog(locale: string, slug: string) {
  const redirected = await resolveSlugRedirect("bloq", slug);
  const viaRedirect = redirected?.to_path.replace(/^\/bloq\//, "") ?? "";
  const post =
    (await getPublicBlogPost(slug)) ??
    (viaRedirect ? await getPublicBlogPost(viaRedirect) : null);
  if (!post) return { post: null as BlogPost | null, live: false, redirectTo: null as string | null };

  const live = isBlogLocaleLive(post, locale);
  const canonicalSlug = getBlogLocaleSlug(post, locale);
  if (live && canonicalSlug && canonicalSlug !== slug) {
    return { post, live, redirectTo: `/bloq/${canonicalSlug}` };
  }
  return { post, live, redirectTo: null as string | null };
}

export { getPublished };
