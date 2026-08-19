import { defineRouting } from "next-intl/routing";

export const locales = ["en", "az", "ru", "de"] as const;

export type Locale = (typeof locales)[number];

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

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});
