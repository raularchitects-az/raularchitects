export type StaffRole = "admin" | "editor";
export type ContentStatus = "draft" | "published" | "archived";

export type TranslationBlock = {
  title?: string;
  name?: string;
  short?: string;
  full?: string;
  excerpt?: string;
  body?: string;
  intro?: string;
  seoTitle?: string;
  description?: string;
  imageAlt?: string;
  year?: string;
  status?: string;
  client?: string;
  location?: string;
  area?: string;
  categoryLabel?: string;
  ctaLabel?: string;
  ctaText?: string;
  linkedinText?: string;
  slug?: string;
  published?: boolean;
  legacySourceId?: string;
  migratedFromPortfolioId?: string;
  migratedToProjectSlug?: string;
};

export type Translations = Record<string, TranslationBlock>;

export type GalleryItem = {
  path: string;
  alt?: string;
};

export type ProjectSections = {
  exterior?: { content?: string; media?: GalleryItem[] };
  interior?: { content?: string; media?: GalleryItem[] };
  plan?: { content?: string; media?: GalleryItem[] };
  bim?: { content?: string; media?: GalleryItem[] };
};

export type CmsRow = {
  id: string;
  slug: string;
  status: ContentStatus;
  is_active: boolean;
  sort_order: number;
  cover_path: string | null;
  og_image_path: string | null;
  video_url: string | null;
  canonical_url: string | null;
  seo_title: string | null;
  meta_description: string | null;
  translations: Translations;
  gallery?: GalleryItem[];
  sections?: ProjectSections;
  category?: string | null;
  location?: string | null;
  area_m2?: string | null;
  country?: string | null;
  service_filter?: string | null;
  icon?: string | null;
  number?: string | null;
  show_on_home?: boolean;
  featured?: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  image_path?: string | null;
};

export type MediaRow = {
  id: string;
  path: string;
  bucket: string;
  mime: string;
  size_bytes: number;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  role: StaffRole;
  full_name: string | null;
};

export type AuditRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string | null;
  created_at: string;
};

export const PROJECT_CATEGORIES = [
  { value: "villa", label: "Villa" },
  { value: "ferdi-yasayis-evi", label: "Ailə evi" },
  { value: "kottec", label: "Cabin" },
  { value: "duplex", label: "Duplex" },
  { value: "kommersiya", label: "Commercial" },
  { value: "hotel", label: "Hospitality" },
  { value: "bag-evi", label: "Bağ evi" },
  { value: "townhouse", label: "Townhouse" },
  { value: "yasayis-kompleksi", label: "Yaşayış kompleksi" },
  { value: "ictimai", label: "İctimai" },
] as const;

export const BLOG_CATEGORIES = [
  "bim",
  "architecture",
  "interior",
  "construction",
  "urban",
  "visualization",
  "planning",
] as const;

export const INSIGHT_CATEGORIES = [
  "bim",
  "architecture",
  "planning",
  "sustainability",
  "investment",
  "technology",
  "urban",
] as const;

export const COUNTRIES = [
  { value: "azerbaijan", label: "Azərbaycan" },
  { value: "germany", label: "Almaniya" },
  { value: "switzerland", label: "İsveçrə" },
] as const;

export const SERVICE_FILTERS = [
  { value: "architecture", label: "Architecture" },
  { value: "bim", label: "BIM" },
  { value: "interior", label: "Interior" },
  { value: "construction", label: "Construction" },
] as const;

export const ADMIN_LOCALES = ["az", "en", "de", "ru"] as const;
