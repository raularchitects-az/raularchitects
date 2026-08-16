import { blogPosts as staticBlog, getBlogCopy, type BlogPost } from "@/data/blog";
import { portfolioItems as staticPortfolio, type PortfolioMeta } from "@/data/portfolio";
import { projects as staticProjects, getProjectGalleryGroups, type ProjectMeta } from "@/data/projects";
import { services as staticServices, type ServiceMeta } from "@/data/services";
import { mediaPublicUrl } from "./media-url";
import { findRedirect, getPublished, getSettings } from "./queries";
import type { CmsRow, TranslationBlock } from "./types";

function pickT(row: CmsRow, locale: string): TranslationBlock {
  const t = row.translations ?? {};
  return t[locale] ?? t.az ?? t.en ?? t.de ?? {};
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
  const copy = Object.fromEntries(
    locales.map((locale) => {
      const t = pickT(row, locale);
      const title = t.title || row.slug;
      return [
        locale,
        {
          title,
          seoTitle: row.seo_title || t.seoTitle || title,
          description: row.meta_description || t.description || t.excerpt || "",
          excerpt: t.excerpt || t.short || "",
          ctaLabel: t.ctaLabel || "",
          ctaText: t.ctaText || "",
          blocks: markdownToBlocks(t.body || t.full || ""),
        },
      ];
    }),
  ) as BlogPost["copy"];

  return {
    slug: row.slug,
    publishedAt: row.published_at?.slice(0, 10) || row.created_at.slice(0, 10),
    image: cover(row),
    imageAlt: {
      az: pickT(row, "az").imageAlt || pickT(row, "az").title || row.slug,
      en: pickT(row, "en").imageAlt || pickT(row, "en").title || row.slug,
      ru: pickT(row, "ru").imageAlt || pickT(row, "en").title || row.slug,
      de: pickT(row, "de").imageAlt || pickT(row, "de").title || row.slug,
    },
    category: (row.category as BlogPost["category"]) || "architecture",
    serviceSlug: "bim-ile-layihelendirme",
    relatedHrefs: ["/xidmetler", "/elaqe"],
    copy,
  };
}

export async function getPublicProjects(locale: string) {
  const rows = await getPublished("projects");
  if (rows.length) return rows.map((row) => cmsProjectToMeta(row, locale));
  return staticProjects;
}

export async function getPublicProject(slug: string, locale: string) {
  const rows = await getPublished("projects");
  if (rows.length) {
    const row = rows.find((item) => item.slug === slug);
    return row ? cmsProjectToMeta(row, locale) : null;
  }
  const fallback = staticProjects.find((item) => item.slug === slug);
  if (!fallback) return null;
  const groups = getProjectGalleryGroups(slug);
  return {
    ...fallback,
    description: "",
    seoTitle: undefined,
    metaDescription: undefined,
    canonicalUrl: null,
    videoUrl: null,
    location: null,
    area: null,
    ogImage: fallback.image,
    gallery: [...groups.exteriorImages, ...groups.interiorImages, ...groups.planningImages],
    sections: {
      exterior: { media: groups.exteriorImages.map((path) => ({ path })) },
      interior: { media: groups.interiorImages.map((path) => ({ path })) },
      plan: { media: groups.planningImages.map((path) => ({ path })) },
      bim: { media: [] },
    },
  };
}

export async function getPublicPortfolio(locale: string) {
  const rows = await getPublished("portfolio");
  if (rows.length) return rows.map((row) => cmsPortfolioToMeta(row, locale));
  return staticPortfolio;
}

export async function getPublicPortfolioItem(slug: string, locale: string) {
  const rows = await getPublished("portfolio");
  if (rows.length) {
    const row = rows.find((item) => item.slug === slug);
    return row ? cmsPortfolioToMeta(row, locale) : null;
  }
  const item = staticPortfolio.find((entry) => entry.slug === slug);
  if (!item) return null;
  return {
    ...item,
    description: "",
    seoTitle: undefined,
    metaDescription: undefined,
    canonicalUrl: null,
    videoUrl: null,
    ogImage: item.image,
    gallery: [],
  };
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
    const row = rows.find((item) => item.slug === slug);
    return row ? cmsBlogToPost(row) : null;
  }
  return staticBlog.find((post) => post.slug === slug) ?? null;
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

export { getPublished };
