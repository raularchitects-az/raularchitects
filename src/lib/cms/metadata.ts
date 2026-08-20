import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteMediaUrl,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
  publicCanonicalUrl,
} from "@/lib/site";
import { mediaPublicUrl } from "./media-url";

export function entryMetadata({
  locale,
  path,
  title,
  description,
  image,
  canonicalUrl,
  type = "website",
}: {
  locale: string;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  canonicalUrl?: string | null;
  type?: "website" | "article";
}): Metadata {
  const canonical = publicCanonicalUrl(locale, path, canonicalUrl);
  const imageUrl = absoluteMediaUrl(image ? mediaPublicUrl(image) || image : DEFAULT_OG_IMAGE);
  const fullTitle = title.includes("Raul Architects") ? title : `${title} — Raul Architects`;

  return {
    title: fullTitle,
    description: description || undefined,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      title: fullTitle,
      description: description || undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || undefined,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export function whatsappHref(raw?: string | null) {
  if (!raw) return "https://wa.me/491578970708";
  if (raw.startsWith("http")) return raw;
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}
