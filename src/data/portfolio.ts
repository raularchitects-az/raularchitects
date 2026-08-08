export const portfolioCountries = ["all", "azerbaijan", "germany", "switzerland"] as const;
export type PortfolioCountry = (typeof portfolioCountries)[number];

export const portfolioTypes = ["architecture", "bim", "interior", "construction"] as const;
export type PortfolioType = (typeof portfolioTypes)[number];

export type PortfolioMeta = {
  slug: string;
  country: Exclude<PortfolioCountry, "all">;
  types: PortfolioType[];
  image: string;
};

export const portfolioItems: PortfolioMeta[] = [
  {
    slug: "az-residential-01",
    country: "azerbaijan",
    types: ["architecture", "interior"],
    image: "/images/portfolio/azerbaijan-01.jpg",
  },
  {
    slug: "az-residential-02",
    country: "azerbaijan",
    types: ["architecture", "construction"],
    image: "/images/portfolio/azerbaijan-02.jpg",
  },
  {
    slug: "de-residential-01",
    country: "germany",
    types: ["architecture", "bim"],
    image: "/images/portfolio/germany-01.jpg",
  },
  {
    slug: "de-residential-02",
    country: "germany",
    types: ["bim", "construction"],
    image: "/images/portfolio/germany-02.jpg",
  },
  {
    slug: "ch-residential-01",
    country: "switzerland",
    types: ["architecture", "bim"],
    image: "/images/portfolio/switzerland-01.jpg",
  },
  {
    slug: "ch-residential-02",
    country: "switzerland",
    types: ["interior", "architecture"],
    image: "/images/portfolio/switzerland-02.jpg",
  },
];

export function getPortfolioItem(slug: string) {
  return portfolioItems.find((p) => p.slug === slug);
}
