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
  if (locale === routing.defaultLocale) return normalized;
  return `/${locale}${normalized}`;
}

export function absoluteUrl(locale: string, path: string) {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function languageAlternates(path: string) {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(routing.defaultLocale, path),
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
