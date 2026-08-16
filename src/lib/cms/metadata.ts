import type { Metadata } from "next";
import {
  SITE_NAME,
  absoluteUrl,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
} from "@/lib/site";
import { mediaPublicUrl } from "./media-url";

export function entryMetadata({
  locale,
  path,
  title,
  description,
  image,
  canonicalUrl,
}: {
  locale: string;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  canonicalUrl?: string | null;
}): Metadata {
  const canonical = canonicalUrl || absoluteUrl(locale, path);
  const imageUrl = image ? mediaPublicUrl(image) : undefined;
  const fullTitle = title.includes("Raul Architects") ? title : `${title} — Raul Architects`;

  return {
    title: fullTitle,
    description: description || undefined,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      title: fullTitle,
      description: description || undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export function whatsappHref(raw?: string | null) {
  if (!raw) return "https://wa.me/491578970708";
  if (raw.startsWith("http")) return raw;
  return `https://wa.me/${raw.replace(/\D/g, "")}`;
}
