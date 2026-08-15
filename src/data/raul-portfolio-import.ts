/**
 * Removable 2026 portfolio-folder import.
 *
 * source: "raul-portfolio-folder-2026"
 *
 * To remove later:
 * 1. Delete this file and `raul-portfolio-manifest.json`
 * 2. Delete `public/images/import/`
 * 3. Remove the spread of imported items in `projects.ts` and `portfolio.ts`
 * 4. Revert the imported-entry branches on detail/catalog pages
 */
import type { Category } from "@/data/categories";
import manifest from "@/data/raul-portfolio-manifest.json";

type ImportedCategory = Exclude<Category, "all">;

type ImportedCountry = "azerbaijan" | "germany" | "switzerland";

export const RAUL_PORTFOLIO_IMPORT_SOURCE = "raul-portfolio-folder-2026" as const;

export type ImportedGalleryKind = "exterior" | "interior" | "plan" | "section" | "construction";

export type ImportedMedia = {
  src: string;
  objectPosition: string;
  width: number;
  height: number;
};

export type ImportedGalleryImage = ImportedMedia & {
  kind: ImportedGalleryKind;
};

export type ImportedEntry = {
  source: typeof RAUL_PORTFOLIO_IMPORT_SOURCE;
  slug: string;
  section: "projects" | "portfolio";
  category: ImportedCategory;
  country: ImportedCountry | null;
  title: string;
  cover: ImportedMedia;
  hero: ImportedMedia;
  gallery: ImportedGalleryImage[];
};

export type ImportedCertificate = {
  source: typeof RAUL_PORTFOLIO_IMPORT_SOURCE;
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const importedEntries = manifest.projects as ImportedEntry[];

export const importedCertificates = manifest.certificates.items as ImportedCertificate[];

export const importedProjectEntries = importedEntries.filter((item) => item.section === "projects");

export const importedPortfolioEntries = importedEntries.filter((item) => item.section === "portfolio");

export function getImportedEntry(slug: string) {
  return importedEntries.find((item) => item.slug === slug);
}

export const importedProjectMetas = importedProjectEntries.map((item) => ({
  slug: item.slug,
  category: item.category,
  image: item.cover.src,
  source: RAUL_PORTFOLIO_IMPORT_SOURCE,
  objectPosition: item.cover.objectPosition,
  heroImage: item.hero.src,
  title: item.title,
}));

export const importedPortfolioMetas = importedPortfolioEntries.map((item) => ({
  slug: item.slug,
  category: item.category,
  country: item.country,
  image: item.cover.src,
  source: RAUL_PORTFOLIO_IMPORT_SOURCE,
  objectPosition: item.cover.objectPosition,
  heroImage: item.hero.src,
  title: item.title,
}));
