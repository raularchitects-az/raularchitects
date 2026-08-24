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

function readField(block: TranslationBlock | undefined, key: StringField) {
  if (!block) return "";
  if (key === "body") return text(block.body || block.full);
  if (key === "short") return text(block.short || block.excerpt);
  if (key === "title") return text(block.title || block.name);
  return text((block as Record<string, unknown>)[key]);
}

export function isAutoTranslatable(table: EntityType) {
  return table === "projects" || table === "blog_posts" || table === "insights";
}

/**
 * Mirrors the project-level columns into the AZ translation block. Runs before
 * the database write and never touches the network, so a DeepL outage cannot
 * stop the Azerbaijani source from being saved.
 */
export function normalizeAzSource(
  table: EntityType,
  translations: Translations,
  context: { location?: string | null; area_m2?: string | null },
) {
  if (!isAutoTranslatable(table)) return;
  const az = { ...(translations.az ?? {}) };
  if (table === "projects") {
    if (context.location) az.location = text(context.location);
    if (context.area_m2) az.area = text(context.area_m2);
  }
  translations.az = az;
}

/**
 * Fills EN/DE/RU from the AZ source via DeepL. Throws when DeepL is unreachable
 * or rejects the request; callers run this after the record is already saved and
 * treat a failure as a warning. Returns true when `translations` was changed.
 */
export async function applyAutoTranslations(
  table: EntityType,
  translations: Translations,
  context: {
    category?: string | null;
    location?: string | null;
    area_m2?: string | null;
  },
  previous?: Translations | null,
): Promise<boolean> {
  if (!isAutoTranslatable(table)) return false;
  if (!process.env.DEEPL_API_KEY?.trim()) return false;

  normalizeAzSource(table, translations, context);
  const az = { ...(translations.az ?? {}) };
  const before = JSON.stringify(translations);

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
  if (!hasAnySource) return false;

  const translated = await translateFieldsForLocales(projectFields, azValues, TARGET_LOCALES);
  for (const locale of TARGET_LOCALES) {
    const patch: Partial<Record<StringField, string>> = {};
    for (const key of projectFields) {
      const incoming = readField(translations[locale], key);
      const prior = readField(previous?.[locale], key);
      // Keep manual edits in EN/DE/RU when that locale tab was saved.
      if (incoming && prior && incoming !== prior) continue;
      const value = translated[locale][key];
      if (value?.trim()) patch[key] = value;
    }
    applyTranslatedFields(translations, locale, patch);
  }

  return JSON.stringify(translations) !== before;
}
