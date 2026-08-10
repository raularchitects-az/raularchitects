export const categories = [
  "all",
  "villa",
  "bag-evi",
  "ferdi-yasayis-evi",
  "kottec",
  "duplex",
  "townhouse",
  "yasayis-kompleksi",
  "kommersiya",
  "hotel",
  "ictimai",
] as const;

export type Category = (typeof categories)[number];

export const projectCategories = categories.filter((c) => c !== "all") as Exclude<Category, "all">[];
