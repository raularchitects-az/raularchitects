/**
 * Numeric dates must stay digits in every locale. DeepL otherwise turns
 * `2026` into “two thousand twenty-six” (and the same in DE/RU).
 */

function datePatterns() {
  return [
    /\d{4}[./-]\d{1,2}[./-]\d{1,2}/g,
    /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/g,
    /(?:19|20)\d{2}\s*[\u2013\u2014\u2212\-\/]\s*(?:19|20)\d{2}/g,
    /\d{1,2}[./]\d{4}/g,
    /(?:19|20)\d{2}/g,
  ];
}

const PLACEHOLDER = (index: number) => `⟦D${index}⟧`;
const PLACEHOLDER_RE = /⟦\s*D\s*(\d+)\s*⟧/g;

export function protectNumericDates(source: string): { masked: string; tokens: string[] } {
  const tokens: string[] = [];
  let masked = source;
  for (const pattern of datePatterns()) {
    masked = masked.replace(pattern, (match) => {
      const index = tokens.length;
      tokens.push(match);
      return PLACEHOLDER(index);
    });
  }
  return { masked, tokens };
}

export function restoreNumericDates(translated: string, tokens: string[]): string {
  if (!tokens.length) return translated;
  return translated.replace(PLACEHOLDER_RE, (all, id) => tokens[Number(id)] ?? all);
}

/** True when the whole value is one or more numeric dates, e.g. `2026`, `15.08.2026`, `2026–2027`. */
export function isNumericDateField(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const { masked, tokens } = protectNumericDates(trimmed);
  if (!tokens.length) return false;
  return masked.replace(PLACEHOLDER_RE, "").replace(/[\s,;|/]+/g, "") === "";
}
