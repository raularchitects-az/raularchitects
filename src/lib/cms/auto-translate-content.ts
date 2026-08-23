import type { EntityType } from "./queries";
import { translateFieldsForLocales } from "./deepl-translate";
import { BLOG_CATEGORIES, INSIGHT_CATEGORIES, PROJECT_CATEGORIES, type TranslationBlock, type Translations } from "./types";

const TARGET_LOCALES = ["en", "de", "ru"] as const;

type StringField = keyof Pick<
  TranslationBlock,
  | "title"
  | "short"
  | "excerpt"
  | "body"
  | "seoTitle"
  | "description"
  | "imageAlt"
  | "year"
  | "status"
  | "client"
  | "location"
  | "area"
  | "categoryLabel"
>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function categoryLabelFor(table: EntityType, category: string | null | undefined) {
  const value = text(category);
  if (!value) return "";
  if (table === "projects" || table === "portfolio") {
    return PROJECT_CATEGORIES.find((item) => item.value === value)?.label ?? value;
  }
  if (table === "blog_posts") {
    return BLOG_CATEGORIES.includes(value as (typeof BLOG_CATEGORIES)[number]) ? value : value;
  }
  if (table === "insights") {
    return INSIGHT_CATEGORIES.includes(value as (typeof INSIGHT_CATEGORIES)[number]) ? value : value;
  }
  return value;
}

function applyTranslatedFields(
  translations: Translations,
  locale: (typeof TARGET_LOCALES)[number],
  fields: Partial<Record<StringField, string>>,
) {
  translations[locale] = { ...(translations[locale] ?? {}), ...fields };
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    const block = translations[locale]!;
    if (key === "body") {
      block.body = value;
      block.full = value;
    } else if (key === "short") {
      block.short = value;
      block.excerpt = value;
    } else if (key === "title") {
      block.title = value;
      block.name = value;
    } else {
      (block as Record<string, string>)[key] = value;
    }
  }
}

export async function applyAutoTranslations(
  table: EntityType,
  translations: Translations,
  context: {
    category?: string | null;
    location?: string | null;
    area_m2?: string | null;
  },
) {
  if (table !== "projects" && table !== "blog_posts" && table !== "insights") return;

  const az = { ...(translations.az ?? {}) };
  if (table === "projects") {
    if (context.location) az.location = text(context.location);
    if (context.area_m2) az.area = text(context.area_m2);
  }
  translations.az = az;

  const categoryLabel = categoryLabelFor(table, context.category);
  const projectFields: StringField[] =
    table === "projects"
      ? ["title", "categoryLabel", "location", "year", "status", "client", "area", "body", "seoTitle", "description"]
      : ["title", "categoryLabel", "short", "body", "seoTitle", "description", "imageAlt"];

  const azValues = {} as Record<StringField, string>;
  for (const key of projectFields) {
    if (key === "categoryLabel") {
      azValues[key] = categoryLabel;
      continue;
    }
    if (key === "title") {
      azValues[key] = text(az.title || az.name);
      continue;
    }
    if (key === "short") {
      azValues[key] = text(az.short || az.excerpt);
      continue;
    }
    if (key === "body") {
      azValues[key] = text(az.body || az.full);
      continue;
    }
    if (key === "description") {
      azValues[key] = text(az.description);
      continue;
    }
    azValues[key] = text((az as Record<string, unknown>)[key]);
  }

  const hasAnySource = Object.values(azValues).some(Boolean);
  if (!hasAnySource) return;

  const translated = await translateFieldsForLocales(projectFields, azValues, TARGET_LOCALES);
  for (const locale of TARGET_LOCALES) {
    applyTranslatedFields(translations, locale, translated[locale]);
  }
}
