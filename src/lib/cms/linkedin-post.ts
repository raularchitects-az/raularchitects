import { productionAbsoluteUrl } from "@/lib/site";

export const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/raularchitects/";

const HASHTAGS_BY_CATEGORY: Record<string, readonly [string, string]> = {
  bim: ["#BIM", "#Memarliq"],
  architecture: ["#Memarliq", "#Architecture"],
  interior: ["#InteriorDesign", "#Memarliq"],
  construction: ["#Tikinti", "#Memarliq"],
  urban: ["#UrbanDesign", "#Memarliq"],
  visualization: ["#3DVisualization", "#Memarliq"],
  planning: ["#Planning", "#Memarliq"],
};

export function publicBlogPostUrl(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) return "";
  return productionAbsoluteUrl("az", `/bloq/${trimmed}`);
}

export function linkedInHashtags(category?: string | null): string[] {
  const pair = HASHTAGS_BY_CATEGORY[category ?? ""] ?? HASHTAGS_BY_CATEGORY.architecture;
  return [pair[0], pair[1], "#RaulArchitects"].slice(0, 3);
}

export function defaultLinkedInPost({
  title,
  excerpt,
  slug,
  category,
}: {
  title: string;
  excerpt: string;
  slug: string;
  category?: string | null;
}) {
  const url = publicBlogPostUrl(slug);
  const tags = linkedInHashtags(category).join(" ");
  return [title.trim(), excerpt.trim(), url, tags].filter(Boolean).join("\n\n");
}

export function canShareLinkedInPost(status: string | undefined, slug: string) {
  return status === "published" && Boolean(slug.trim());
}
