import { getImportedEntry } from "@/data/folder-imports";
import { portfolioItems } from "@/data/portfolio";
import { getProjectGalleryGroups, projects } from "@/data/projects";
import az from "../../../messages/az.json";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import { hasExplicitLegacySourceId, legacySourceId, withLegacySourceId, type LegacyKind } from "./legacy";
import type { Translations } from "./types";

const messages = { az, en, de, ru } as const;

function messageTitle(locale: keyof typeof messages, slug: string) {
  const items = (messages[locale] as { projectDetail?: { items?: Record<string, { title?: string; description?: string }> } })
    .projectDetail?.items;
  return items?.[slug];
}

function localeCopy(slug: string, fallbackTitle: string) {
  const translations: Translations = {};
  for (const locale of ["az", "en", "de", "ru"] as const) {
    const item = messageTitle(locale, slug);
    translations[locale] = {
      title: item?.title || fallbackTitle || slug,
      name: item?.title || fallbackTitle || slug,
      short: item?.description || "",
      full: item?.description || "",
      description: item?.description || "",
    };
  }
  return translations;
}

function sectionMedia(paths: string[]) {
  return { media: paths.map((path) => ({ path })) };
}

export function listLegacyCatalogCounts() {
  return {
    projects: projects.length,
    portfolio: portfolioItems.length,
  };
}

export function listUnmigratedSlugs(
  kind: LegacyKind,
  cmsRows: Array<{ slug: string; translations?: Translations | null }>,
) {
  const source = kind === "project" ? projects : portfolioItems;
  return source
    .filter((item) => {
      const id = legacySourceId(kind, item.slug);
      const match =
        cmsRows.find((row) => ["az", "en", "de", "ru"].some((locale) => row.translations?.[locale]?.legacySourceId === id)) ??
        cmsRows.find((row) => row.slug === item.slug);
      return !match || !hasExplicitLegacySourceId(match);
    })
    .map((item) => ({ slug: item.slug, title: item.title || item.slug }));
}

export function buildLegacyProjectRows() {
  return projects.map((item, index) => {
    const imported = getImportedEntry(item.slug);
    const groups = getProjectGalleryGroups(item.slug);
    const galleryPaths = imported
      ? imported.gallery.map((image) => image.src)
      : [...groups.exteriorImages, ...groups.interiorImages, ...groups.planningImages];
    const video =
      imported && "video" in imported && imported.video
        ? imported.video.src
        : null;
    const location =
      imported && "country" in imported && imported.country ? imported.country : null;
    const translations = withLegacySourceId(
      localeCopy(item.slug, item.title || item.slug),
      legacySourceId("project", item.slug),
    );

    return {
      slug: item.slug,
      category: item.category,
      location,
      cover_path: item.heroImage || item.image,
      og_image_path: item.image,
      video_url: video,
      status: "published" as const,
      is_active: true,
      sort_order: index,
      published_at: new Date().toISOString(),
      translations,
      gallery: galleryPaths.map((path) => ({ path })),
      sections: imported
        ? {
            exterior: sectionMedia(imported.gallery.filter((image) => image.kind === "exterior").map((image) => image.src)),
            interior: sectionMedia(imported.gallery.filter((image) => image.kind === "interior").map((image) => image.src)),
            plan: sectionMedia(
              imported.gallery.filter((image) => image.kind === "plan" || image.kind === "section").map((image) => image.src),
            ),
            bim: sectionMedia(imported.gallery.filter((image) => image.kind === "construction").map((image) => image.src)),
          }
        : {
            exterior: sectionMedia(groups.exteriorImages),
            interior: sectionMedia(groups.interiorImages),
            plan: sectionMedia(groups.planningImages),
            bim: { media: [] as { path: string }[] },
          },
    };
  });
}

export function buildLegacyPortfolioRows() {
  return portfolioItems.map((item, index) => {
    const imported = getImportedEntry(item.slug);
    const galleryPaths = imported ? imported.gallery.map((image) => image.src) : [item.image];
    const translations = withLegacySourceId(
      localeCopy(item.slug, item.title || item.slug),
      legacySourceId("portfolio", item.slug),
    );

    return {
      slug: item.slug,
      category: item.category,
      country: item.country,
      cover_path: item.heroImage || item.image,
      og_image_path: item.image,
      status: "published" as const,
      is_active: true,
      sort_order: index,
      published_at: new Date().toISOString(),
      translations,
      gallery: galleryPaths.map((path) => ({ path })),
    };
  });
}
