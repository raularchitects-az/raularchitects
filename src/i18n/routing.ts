import { defineRouting } from "next-intl/routing";

export const locales = ["az", "en", "ru", "de"] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
  de: "DE",
};

export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "az",
  localePrefix: "as-needed",
});
