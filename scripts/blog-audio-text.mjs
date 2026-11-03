import { createHash } from "node:crypto";

/** TTS: AZ (Gemini) + EN/RU/DE (Chirp 3 HD). */
export const BLOG_AUDIO_LOCALES = ["az", "ru", "en", "de"];

function localeCopy(post, locale) {
  const t = post?.translations?.[locale] ?? {};
  return {
    title: String(t.title ?? "").trim(),
    body: String(t.body ?? t.full ?? "").trim(),
  };
}

/** True when the locale has real copy (not an AZ duplicate). Matches public locale-live logic. */
export function hasSpeechLocale(post, locale) {
  if (locale === "az") {
    const az = localeCopy(post, "az");
    return Boolean(az.title && az.body);
  }
  const az = localeCopy(post, "az");
  const copy = localeCopy(post, locale);
  if (!copy.title || !copy.body) return false;
  return copy.title !== az.title && copy.body !== az.body;
}

export function getSpeechFields(post, locale) {
  return localeCopy(post, locale);
}

function cleanInline(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/(^|\s)www\.\S+/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`~]+/g, "")
    .replace(/^\s{0,3}(#{1,6}|>|[-•]|\d+[.)])\s+/, (match) => (/\d/.test(match) ? match : ""))
    .replace(/[ \t]+/g, " ")
    .trim();
}

function asSentence(line) {
  return /[.!?…:;]$/.test(line) ? line : `${line}.`;
}

const AZ_ONES = ["sıfır", "bir", "iki", "üç", "dörd", "beş", "altı", "yeddi", "səkkiz", "doqquz"];
const AZ_TENS = ["", "on", "iyirmi", "otuz", "qırx", "əlli", "altmış", "yetmiş", "səksən", "doxsan"];

function azUnderHundred(n) {
  if (n < 10) return AZ_ONES[n];
  if (n < 20) return n === 10 ? "on" : `on ${AZ_ONES[n % 10]}`;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${AZ_TENS[tens]} ${AZ_ONES[ones]}` : AZ_TENS[tens];
}

function azUnderThousand(n) {
  if (n < 100) return azUnderHundred(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const head = hundreds === 1 ? "yüz" : `${AZ_ONES[hundreds]} yüz`;
  return rest ? `${head} ${azUnderHundred(rest)}` : head;
}

/** Cardinal numbers in Azerbaijani for speech (0 … 999_999). */
export function numberToAzWords(n) {
  const value = Math.floor(Number(n));
  if (!Number.isFinite(value)) return String(n);
  if (value < 0) return `mənfi ${numberToAzWords(-value)}`;
  if (value < 1000) return azUnderThousand(value);
  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1000);
    const rest = value % 1000;
    const head = thousands === 1 ? "min" : `${azUnderThousand(thousands)} min`;
    return rest ? `${head} ${azUnderThousand(rest)}` : head;
  }
  return String(value);
}

/**
 * Expand brand and numerals so TTS does not misread years as digit pairs.
 * Locale-aware: AZ gets full Azerbaijani cardinals; EN/RU normalize the brand.
 */
export function normalizeSpeechPronunciation(text, locale = "az") {
  let out = String(text || "");
  if (locale === "az") {
    out = out.replace(/\bRaul\s+Architects\b/gi, "Raul Architects");
    out = out.replace(/\b(19|20)\d{2}\b/g, (year) => numberToAzWords(year));
    out = out.replace(/\b(\d{1,3}(?:[ \u00a0]\d{3})+|\d{1,6})\b/g, (match) => {
      const digits = match.replace(/[ \u00a0]/g, "");
      if (!/^\d+$/.test(digits)) return match;
      return numberToAzWords(digits);
    });
  } else if (locale === "en") {
    out = out.replace(/\bRaul\s+Architects\b/gi, "Raul Architects");
    out = out.replace(/décor/gi, "decor");
  } else if (locale === "ru") {
    out = out.replace(/\bRaul\s+Architects\b/gi, "Раул Аркитектс");
  } else if (locale === "de") {
    // Keep Latin brand; help Chirp with place names and dense German compounds.
    out = out.replace(/\bRaul\s+Architects\b/gi, "Raul Architects");
    out = out.replace(/\bBakı\b/g, "Baku");
    out = out.replace(/\bXəzər\b/gi, "Kaspisches Meer");
    out = out.replace(/\bVillengespräche\b/g, "Villa-Gespräche");
    out = out.replace(/\bNordsitz\b/g, "Nord-Sitz");
    out = out.replace(/\bWestdeck\b/g, "West-Deck");
    out = out.replace(/\bsondern das Haus danach\b/gi, "sondern die Fortsetzung des Hauses");
  }
  return out.replace(/[ \t]{2,}/g, " ");
}

/**
 * Plain narration text: title, then each content block. Headings and list items
 * become sentences so the voice pauses.
 */
export function buildSpeechText(title, content, locale = "az") {
  const blocks = String(content || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map(cleanInline).filter(Boolean).map(asSentence);
      // Keep short heading lines as their own beat; join list/body lines with space for flow.
      if (lines.length <= 1) return lines[0] || "";
      const [first, ...rest] = lines;
      if (first.length < 80 && rest.length) return `${first}\n\n${rest.join(" ")}`;
      return lines.join(" ");
    })
    .filter(Boolean);
  // Title alone, then a beat, then body — helps the narrator land the topic first.
  const plain = [asSentence(cleanInline(title || "")), ...blocks].join("\n\n");
  return normalizeSpeechPronunciation(plain, locale);
}

export function speechHash(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Chirp 3 HD rejects very long sentences (e.g. comma-separated lists).
 * Sentences longer than maxChars are broken at commas/semicolons.
 */
export function splitLongSentences(text, maxChars = 120) {
  return text.replace(/[^.!?…\n]+[.!?…]*/g, (sentence) => {
    if (sentence.trim().length <= maxChars) return sentence;
    return sentence.replace(/[,;]\s+(?=\S)/g, ". ");
  });
}

/** Splits on paragraph, then sentence boundaries so each chunk stays under maxBytes (UTF-8). */
export function chunkSpeechText(text, maxBytes) {
  const size = (value) => Buffer.byteLength(value, "utf8");
  const pieces = [];
  for (const paragraph of text.split(/\n{2,}/)) {
    if (size(paragraph) <= maxBytes) {
      pieces.push(paragraph);
      continue;
    }
    let current = "";
    for (const sentence of paragraph.match(/[^.!?…]+[.!?…]+["»”)]*\s*|[^.!?…]+$/g) || [paragraph]) {
      if (current && size(current + sentence) > maxBytes) {
        pieces.push(current.trim());
        current = "";
      }
      current += sentence;
    }
    if (current.trim()) pieces.push(current.trim());
  }
  const chunks = [];
  let current = "";
  for (const piece of pieces) {
    const next = current ? `${current}\n\n${piece}` : piece;
    if (current && size(next) > maxBytes) {
      chunks.push(current);
      current = piece;
    } else current = next;
  }
  if (current) chunks.push(current);
  return chunks;
}
