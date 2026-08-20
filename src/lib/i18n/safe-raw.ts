type RawTranslator = {
  raw: (key: string) => unknown;
};

export function safeRawArray(t: RawTranslator, key: string): string[] {
  try {
    const raw = t.raw(key);
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function safeMessage(t: (key: string) => string, key: string, fallback: string) {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}
