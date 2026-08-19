import { productionAbsoluteUrl } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";

export const LINKEDIN_SHARE_OFFSITE = "https://www.linkedin.com/sharing/share-offsite/";

export const LINKEDIN_SHARE_LOCALES = routing.locales;
export type LinkedInShareLocale = Locale;

export const LINKEDIN_SHARE_LOCALE_LABELS: Record<LinkedInShareLocale, string> = {
  az: "Azərbaycan dili",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
};

export const LINKEDIN_SHARE_BUTTON_LABELS: Record<LinkedInShareLocale, string> = {
  az: "LinkedIn-də post kimi paylaş",
  en: "Share as a LinkedIn post",
  de: "Als LinkedIn-Beitrag teilen",
  ru: "Опубликовать в LinkedIn",
};

export function publicBlogPostUrl(locale: LinkedInShareLocale, slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) return "";
  return productionAbsoluteUrl(locale, `/bloq/${trimmed}`);
}

export function linkedInShareOffsiteUrl(locale: LinkedInShareLocale, slug: string) {
  const url = publicBlogPostUrl(locale, slug);
  if (!url) return "";
  return `${LINKEDIN_SHARE_OFFSITE}?url=${encodeURIComponent(url)}`;
}

export function localeHasBlogVersion(title: string | undefined) {
  return Boolean(title?.trim());
}

export function canShareLinkedInPost(status: string | undefined, slug: string, title?: string) {
  return status === "published" && Boolean(slug.trim()) && localeHasBlogVersion(title);
}
