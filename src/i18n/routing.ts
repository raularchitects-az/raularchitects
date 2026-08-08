import { defineRouting } from "next-intl/routing";

export const locales = ["az", "en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export const localeNames: Record<Locale, string> = {
  az: "Azərbaycan",
  en: "English",
  ru: "Русский",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "az",
  localePrefix: "as-needed",
});
