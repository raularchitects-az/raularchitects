export const projectCategories = [
  "all",
  "villa",
  "family-house",
  "cabin",
  "duplex",
  "commercial",
  "hospitality",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export type ProjectMeta = {
  slug: string;
  category: Exclude<ProjectCategory, "all">;
  image: string;
  featuredOnHome?: boolean;
};

export const projects: ProjectMeta[] = [
  {
    slug: "compact-villa",
    category: "villa",
    image: "/images/projects/compact-villa.jpg",
    featuredOnHome: true,
  },
  {
    slug: "family-villa",
    category: "villa",
    image: "/images/projects/family-villa.jpg",
    featuredOnHome: true,
  },
  {
    slug: "premium-villa",
    category: "villa",
    image: "/images/projects/premium-villa.jpg",
    featuredOnHome: true,
  },
  {
    slug: "courtyard-house",
    category: "family-house",
    image: "/images/projects/courtyard-house.jpg",
  },
  {
    slug: "modern-family-house",
    category: "family-house",
    image: "/images/projects/modern-family-house.jpg",
  },
  {
    slug: "a-frame-cabin",
    category: "cabin",
    image: "/images/projects/a-frame-cabin.jpg",
    featuredOnHome: true,
  },
  {
    slug: "premium-cabin",
    category: "cabin",
    image: "/images/projects/premium-cabin.jpg",
  },
  {
    slug: "duplex-townhouse",
    category: "duplex",
    image: "/images/projects/duplex-townhouse.jpg",
  },
  {
    slug: "commercial",
    category: "commercial",
    image: "/images/projects/commercial.jpg",
  },
  {
    slug: "hospitality",
    category: "hospitality",
    image: "/images/projects/hospitality.jpg",
  },
];

export const galleryImages = {
  interior: "/images/projects/gallery-interior.jpg",
  plan: "/images/projects/gallery-plan.jpg",
  bim: "/images/projects/gallery-bim.jpg",
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
