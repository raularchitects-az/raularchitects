/**
 * Removable `13 project` import.
 *
 * source: "raul-13-project-import"
 *
 * To remove later:
 * 1. Delete this file and `raul-13-project-manifest.json`
 * 2. Delete `public/images/import-13/` and `public/videos/import-13/`
 * 3. Remove the spread of imported13ProjectMetas in `projects.ts`
 * 4. Leave the 2026 portfolio-folder import untouched
 */
import type { Category } from "@/data/categories";
import manifest from "@/data/raul-13-project-manifest.json";

type ImportedCategory = Exclude<Category, "all">;
type ImportedCountry = "azerbaijan" | "germany" | "switzerland";

export const RAUL_13_PROJECT_IMPORT_SOURCE = "raul-13-project-import" as const;

export type Imported13GalleryKind = "exterior" | "interior" | "plan" | "section" | "construction";

export type Imported13Media = {
  src: string;
  objectPosition: string;
  width: number;
  height: number;
};

export type Imported13GalleryImage = Imported13Media & {
  kind: Imported13GalleryKind;
  caption?: string | null;
};

export type Imported13Video = {
  src: string;
  poster: string;
  width: number;
  height: number;
};

export type Imported13Entry = {
  source: typeof RAUL_13_PROJECT_IMPORT_SOURCE;
  slug: string;
  section: "projects";
  category: ImportedCategory;
  country: ImportedCountry | null;
  title: string;
  note: "competition-concept" | null;
  cover: Imported13Media;
  hero: Imported13Media;
  gallery: Imported13GalleryImage[];
  video: Imported13Video | null;
};

export const imported13Entries = manifest.projects as Imported13Entry[];

export function get13ProjectEntry(slug: string) {
  return imported13Entries.find((item) => item.slug === slug);
}

export const imported13ProjectMetas = imported13Entries.map((item) => ({
  slug: item.slug,
  category: item.category,
  image: item.cover.src,
  source: RAUL_13_PROJECT_IMPORT_SOURCE,
  objectPosition: item.cover.objectPosition,
  heroImage: item.hero.src,
  title: item.title,
}));
