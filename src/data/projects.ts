import { projectCategories, type Category } from "@/data/categories";
import { getImportedEntry } from "@/data/folder-imports";
import { importedProjectMetas } from "@/data/raul-portfolio-import";
import { imported13ProjectMetas } from "@/data/raul-13-project-import";

export { projectCategories };
export type ProjectCategory = Exclude<Category, "all">;

export type ProjectMeta = {
  slug: string;
  category: ProjectCategory;
  image: string;
  source?: string;
  objectPosition?: string;
  heroImage?: string;
  title?: string;
};

const existingProjects: ProjectMeta[] = [
  { slug: "compact-villa", category: "villa", image: "/images/projects/compact-villa.jpg" },
  { slug: "family-villa", category: "villa", image: "/images/projects/family-villa.jpg" },
  { slug: "premium-villa", category: "villa", image: "/images/projects/premium-villa.jpg" },
  { slug: "bag-evi-01", category: "bag-evi", image: "/images/projects/bag-evi.jpg" },
  { slug: "courtyard-house", category: "ferdi-yasayis-evi", image: "/images/projects/courtyard-house.jpg" },
  { slug: "modern-family-house", category: "ferdi-yasayis-evi", image: "/images/projects/modern-family-house.jpg" },
  { slug: "a-frame-cabin", category: "kottec", image: "/images/projects/a-frame-cabin.jpg" },
  { slug: "premium-cabin", category: "kottec", image: "/images/projects/premium-cabin.jpg" },
  { slug: "duplex-01", category: "duplex", image: "/images/projects/duplex-townhouse.jpg" },
  { slug: "townhouse-01", category: "townhouse", image: "/images/projects/townhouse.jpg" },
  { slug: "yasayis-kompleksi-01", category: "yasayis-kompleksi", image: "/images/projects/yasayis-kompleksi.jpg" },
  { slug: "commercial", category: "kommersiya", image: "/images/projects/commercial.jpg" },
  { slug: "hotel-01", category: "hotel", image: "/images/projects/hospitality.jpg" },
  { slug: "ictimai-01", category: "ictimai", image: "/images/projects/ictimai.jpg" },
];

export const projects: ProjectMeta[] = [
  ...existingProjects,
  ...importedProjectMetas,
  ...imported13ProjectMetas,
];

export const categoryCoverImage: Record<ProjectCategory, string> = {
  villa: "/images/projects/premium-villa.jpg",
  "bag-evi": "/images/projects/bag-evi.jpg",
  "ferdi-yasayis-evi": "/images/projects/modern-family-house.jpg",
  kottec: "/images/projects/a-frame-cabin.jpg",
  duplex: "/images/projects/duplex-townhouse.jpg",
  townhouse: "/images/projects/townhouse.jpg",
  "yasayis-kompleksi": "/images/projects/yasayis-kompleksi.jpg",
  kommersiya: "/images/projects/commercial.jpg",
  hotel: "/images/projects/hospitality.jpg",
  ictimai: "/images/projects/ictimai.jpg",
};

export const galleryImages = {
  interior: "/images/projects/gallery-interior.jpg",
  plan: "/images/projects/gallery-plan.jpg",
  bim: "/images/projects/gallery-bim.jpg",
};

const exteriorImages = [
  ...existingProjects.map((item) => item.image),
  "/images/portfolio/azerbaijan-01.jpg",
  "/images/portfolio/germany-01.jpg",
  "/images/portfolio/switzerland-01.jpg",
] as const;

const interiorImages = [
  "/images/projects/gallery-interior.jpg",
  "/images/portfolio/switzerland-02.jpg",
  "/images/projects/compact-villa-interior.jpg",
] as const;

const planningImages = [
  "/images/projects/gallery-plan.jpg",
  "/images/projects/gallery-bim.jpg",
  "/images/portfolio/germany-02.jpg",
] as const;

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

function takeUnique(candidates: readonly string[], used: Set<string>, count: number) {
  const result: string[] = [];
  for (const src of candidates) {
    if (!src || used.has(src)) continue;
    used.add(src);
    result.push(src);
    if (result.length === count) break;
  }
  return result;
}

export function getProjectGalleryGroups(slug: string) {
  if (getImportedEntry(slug)) {
    return { exteriorImages: [], interiorImages: [], planningImages: [] };
  }

  const project = getProject(slug);
  if (!project) {
    return { exteriorImages: [], interiorImages: [], planningImages: [] };
  }

  const used = new Set<string>();
  const sameCategory = existingProjects
    .filter((item) => item.category === project.category && item.slug !== project.slug)
    .map((item) => item.image);

  return {
    exteriorImages: takeUnique([project.image, ...sameCategory, ...exteriorImages], used, 3),
    interiorImages: takeUnique(interiorImages, used, 3),
    planningImages: takeUnique(planningImages, used, 3),
  };
}

export function getProjectGallery(slug: string) {
  const groups = getProjectGalleryGroups(slug);
  return [...groups.exteriorImages, ...groups.interiorImages, ...groups.planningImages];
}
