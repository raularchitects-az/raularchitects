import { defineRouting } from "next-intl/routing";

export const locales = ["en", "az", "ru", "de"] as const;

export type Locale = (typeof locales)[number];

export function asLocale(value: string): Locale {
  return (locales as readonly string[]).includes(value) ? (value as Locale) : "en";
}

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  az: "AZ",
  ru: "RU",
  de: "DE",
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  az: "Azərbaycan",
  ru: "Русский",
  de: "Deutsch",
};

function localized(internal: string, english: string) {
  return { en: english, az: internal, de: internal, ru: internal } as const;
}

export const pathnames = {
  "/": "/",
  "/portfolio": "/portfolio",
  "/portfolio/[slug]": "/portfolio/[slug]",
  "/layihelar": localized("/layihelar", "/projects"),
  "/layihelar/[slug]": localized("/layihelar/[slug]", "/projects/[slug]"),
  "/bloq": localized("/bloq", "/blog"),
  "/bloq/[slug]": localized("/bloq/[slug]", "/blog/[slug]"),
  "/xidmetler": localized("/xidmetler", "/services"),
  "/xidmetler/[slug]": localized("/xidmetler/[slug]", "/services/[slug]"),
  "/elaqe": localized("/elaqe", "/contact"),
  "/haqqimizda": localized("/haqqimizda", "/about"),
  "/haqqimizda/raul-nagiyev": localized("/haqqimizda/raul-nagiyev", "/about/raul-nagiyev"),
} as const;

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
  pathnames,
});
