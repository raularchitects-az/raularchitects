import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://raularchitects.com";

export const SITE_NAME = "Raul Architects";

const ogLocales: Record<Locale, string> = {
  en: "en_US",
  az: "az_AZ",
  ru: "ru_RU",
  de: "de_DE",
};

export function localePath(locale: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: string, path: string) {
  return `${SITE_URL}${localePath(locale, path)}`;
}

function isLocalOrigin(value: string) {
  try {
    const host = new URL(value.includes("://") ? value : `https://${value}`).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value);
  }
}

/** Live site origin for share links. Never returns localhost. */
export function productionSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  if (raw && !isLocalOrigin(raw)) return raw;
  if (!isLocalOrigin(SITE_URL)) return SITE_URL;
  return "https://www.raularchitects.com";
}

export function productionAbsoluteUrl(locale: string, path: string) {
  return `${productionSiteUrl()}${localePath(locale, path)}`;
}

export function absoluteMediaUrl(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  const origin = productionSiteUrl();
  return src.startsWith("/") ? `${origin}${src}` : `${origin}/${src}`;
}

export function languageAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl("en", path),
  };
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
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
