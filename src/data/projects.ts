import { projectCategories, type Category } from "@/data/categories";

export { projectCategories };
export type ProjectCategory = Exclude<Category, "all">;

export type ProjectMeta = {
  slug: string;
  category: ProjectCategory;
  image: string;
};

export const projects: ProjectMeta[] = [
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

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
