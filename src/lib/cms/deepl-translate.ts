type DeepLTarget = "EN" | "DE" | "RU";

const TARGET_BY_LOCALE: Record<string, DeepLTarget> = {
  en: "EN",
  de: "DE",
  ru: "RU",
};

function deeplBaseUrl(apiKey: string) {
  return apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
}

export function requireDeepLApiKey() {
  const key = process.env.DEEPL_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "DEEPL_API_KEY environment variable is required for automatic translation. Add it to .env.local (server-only).",
    );
  }
  return key;
}

/**
 * Translates parallel text fields from Azerbaijani to one target locale.
 * Empty source strings stay empty; order is preserved.
 */
export async function translateFromAzerbaijani(
  texts: string[],
  targetLocale: "en" | "de" | "ru",
): Promise<string[]> {
  const apiKey = requireDeepLApiKey();
  const targetLang = TARGET_BY_LOCALE[targetLocale];
  if (!targetLang) throw new Error(`Unsupported translation target: ${targetLocale}`);

  const normalized = texts.map((text) => text.trim());
  const indexes = normalized.map((text, index) => (text ? index : -1)).filter((index) => index >= 0);
  if (!indexes.length) return texts.map(() => "");

  const params = new URLSearchParams();
  for (const index of indexes) params.append("text", normalized[index]!);
  params.set("source_lang", "AZ");
  params.set("target_lang", targetLang);

  const response = await fetch(`${deeplBaseUrl(apiKey)}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`DeepL translation failed (${response.status}): ${detail || response.statusText}`);
  }

  const payload = (await response.json()) as { translations?: { text: string }[] };
  const translated = payload.translations?.map((item) => item.text.trim()) ?? [];
  if (translated.length !== indexes.length) {
    throw new Error("DeepL translation response count mismatch");
  }

  const result = texts.map(() => "");
  indexes.forEach((sourceIndex, resultIndex) => {
    result[sourceIndex] = translated[resultIndex] ?? "";
  });
  return result;
}

export async function translateFieldsForLocales<T extends string>(
  fieldKeys: readonly T[],
  azValues: Record<T, string>,
  targetLocales: readonly ("en" | "de" | "ru")[],
): Promise<Record<"en" | "de" | "ru", Record<T, string>>> {
  const sourceTexts = fieldKeys.map((key) => azValues[key] ?? "");
  const out = {} as Record<"en" | "de" | "ru", Record<T, string>>;

  for (const locale of targetLocales) {
    const translated = await translateFromAzerbaijani(sourceTexts, locale);
    const block = {} as Record<T, string>;
    fieldKeys.forEach((key, index) => {
      block[key] = translated[index] ?? "";
    });
    out[locale] = block;
  }

  return out;
}
