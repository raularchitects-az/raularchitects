import { routing, type Locale } from "@/i18n/routing";
import { englishLegacyPathname, localizePublicPath } from "@/lib/public-paths";

export const PRODUCTION_SITE_URL = "https://www.raularchitects.com";

export const SITE_URL = PRODUCTION_SITE_URL;

export const SITE_NAME = "Raul Architects";

export const DEFAULT_OG_IMAGE = "/images/raul-hero.jpg";

const ogLocales: Record<Locale, string> = {
  en: "en_US",
  az: "az_AZ",
  ru: "ru_RU",
  de: "de_DE",
};

export function localePath(locale: string, path: string) {
  return localizePublicPath(locale, path);
}

export function isLocalOrigin(value: string) {
  try {
    const host = new URL(value.includes("://") ? value : `https://${value}`).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value);
  }
}

/** Live site origin for metadata and share links. Never returns localhost. */
export function productionSiteUrl() {
  return PRODUCTION_SITE_URL;
}

export function productionAbsoluteUrl(locale: string, path: string) {
  return `${PRODUCTION_SITE_URL}${localizePublicPath(locale, path)}`;
}

/** Canonical URL on the production host. Rewrites legacy English paths and drops localhost. */
export function publicCanonicalUrl(locale: string, path: string, cmsCanonical?: string | null) {
  const built = productionAbsoluteUrl(locale, path);
  if (!cmsCanonical || !/^https?:\/\//i.test(cmsCanonical) || isLocalOrigin(cmsCanonical)) {
    return built;
  }
  try {
    const url = new URL(cmsCanonical);
    url.protocol = "https:";
    url.host = new URL(PRODUCTION_SITE_URL).host;
    const rewritten = englishLegacyPathname(url.pathname);
    if (rewritten) url.pathname = rewritten;
    return `${url.origin}${url.pathname}${url.search}`;
  } catch {
    return built;
  }
}

export function absoluteUrl(locale: string, path: string) {
  return productionAbsoluteUrl(locale, path);
}

export function absoluteMediaUrl(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) {
    return isLocalOrigin(src) ? `${PRODUCTION_SITE_URL}${new URL(src).pathname}` : src;
  }
  return src.startsWith("/") ? `${PRODUCTION_SITE_URL}${src}` : `${PRODUCTION_SITE_URL}/${src}`;
}

export function languageAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": productionAbsoluteUrl("az", path),
  };
  for (const locale of routing.locales) {
    languages[locale] = productionAbsoluteUrl(locale, path);
  }
  return languages;
}

export function ogLocale(locale: string) {
  return ogLocales[locale as Locale] ?? ogLocales.en;
}

export function ogAlternateLocales(locale: string) {
  return routing.locales
    .filter((code) => code !== locale)
    .map((code) => ogLocales[code]);
}
