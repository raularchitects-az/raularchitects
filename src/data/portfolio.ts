import { projectCategories, type Category } from "@/data/categories";
import { importedPortfolioMetas } from "@/data/raul-portfolio-import";

export { projectCategories as portfolioCategories };
export type PortfolioCategory = Exclude<Category, "all">;

export const portfolioCountries = ["azerbaijan", "germany", "switzerland"] as const;
export type PortfolioCountry = (typeof portfolioCountries)[number];

export type PortfolioMeta = {
  slug: string;
  category: PortfolioCategory;
  country: PortfolioCountry | null;
  image: string;
  source?: string;
  objectPosition?: string;
  heroImage?: string;
  title?: string;
};

const existingPortfolioItems: PortfolioMeta[] = [
  { slug: "az-villa-01", category: "villa", country: "azerbaijan", image: "/images/portfolio/azerbaijan-01.jpg" },
  { slug: "az-ferdi-01", category: "ferdi-yasayis-evi", country: "azerbaijan", image: "/images/portfolio/azerbaijan-02.jpg" },
  { slug: "de-kottec-01", category: "kottec", country: "germany", image: "/images/portfolio/germany-01.jpg" },
  { slug: "de-kommersiya-01", category: "kommersiya", country: "germany", image: "/images/portfolio/germany-02.jpg" },
  { slug: "ch-duplex-01", category: "duplex", country: "switzerland", image: "/images/portfolio/switzerland-01.jpg" },
  { slug: "ch-hotel-01", category: "hotel", country: "switzerland", image: "/images/portfolio/switzerland-02.jpg" },
  { slug: "az-bag-evi-01", category: "bag-evi", country: "azerbaijan", image: "/images/projects/bag-evi.jpg" },
  { slug: "de-townhouse-01", category: "townhouse", country: "germany", image: "/images/projects/townhouse.jpg" },
  { slug: "ch-yasayis-kompleksi-01", category: "yasayis-kompleksi", country: "switzerland", image: "/images/projects/yasayis-kompleksi.jpg" },
  { slug: "az-ictimai-01", category: "ictimai", country: "azerbaijan", image: "/images/projects/ictimai.jpg" },
];

export const portfolioItems: PortfolioMeta[] = [...existingPortfolioItems, ...importedPortfolioMetas];

export const categoryCoverImage: Record<PortfolioCategory, string> = {
  villa: "/images/portfolio/azerbaijan-01.jpg",
  "bag-evi": "/images/projects/bag-evi.jpg",
  "ferdi-yasayis-evi": "/images/portfolio/azerbaijan-02.jpg",
  kottec: "/images/portfolio/germany-01.jpg",
  duplex: "/images/portfolio/switzerland-01.jpg",
  townhouse: "/images/projects/townhouse.jpg",
  "yasayis-kompleksi": "/images/projects/yasayis-kompleksi.jpg",
  kommersiya: "/images/portfolio/germany-02.jpg",
  hotel: "/images/portfolio/switzerland-02.jpg",
  ictimai: "/images/projects/ictimai.jpg",
};

export function getPortfolioItem(slug: string) {
  return portfolioItems.find((p) => p.slug === slug);
}
