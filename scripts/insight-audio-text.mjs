/**
 * Short (~50–75s) spoken briefings for Insights.
 * Reuses blog speech cleaning/hash helpers; builds a compact script from title + essentials.
 */
import {
  BLOG_AUDIO_LOCALES,
  normalizeSpeechPronunciation,
  speechHash,
  chunkSpeechText,
  splitLongSentences,
} from "./blog-audio-text.mjs";

export { BLOG_AUDIO_LOCALES as INSIGHT_AUDIO_LOCALES, speechHash, chunkSpeechText, splitLongSentences };

/** ~14 chars/s from full-article Gemini TTS → ~50–75s window. */
export const INSIGHT_BRIEF_TARGET_CHARS = {
  az: 900,
  en: 920,
  ru: 860,
  de: 980,
};

function localeCopy(post, locale) {
  const t = post?.translations?.[locale] ?? {};
  return {
    title: String(t.title ?? "").trim(),
    excerpt: String(t.excerpt ?? t.short ?? t.description ?? "").trim(),
    body: String(t.body ?? t.full ?? "").trim(),
  };
}

export function hasInsightSpeechLocale(post, locale) {
  if (locale === "az") {
    const az = localeCopy(post, "az");
    return Boolean(az.title && az.body);
  }
  const az = localeCopy(post, "az");
  const copy = localeCopy(post, locale);
  if (!copy.title || !copy.body) return false;
  return copy.title !== az.title && copy.body !== az.body;
}

export function getInsightSpeechFields(post, locale) {
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

/** Strip markdown into ordered “beats”: headings, list items, then body sentences. */
function extractBeats(body) {
  const beats = [];
  for (const raw of String(body || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      beats.push({ kind: "heading", text: asSentence(cleanInline(heading[1])) });
      continue;
    }
    const list = line.match(/^[-•*]\s+(.+)$/) || line.match(/^\d+[.)]\s+(.+)$/);
    if (list) {
      beats.push({ kind: "item", text: asSentence(cleanInline(list[1])) });
      continue;
    }
    const cleaned = cleanInline(line);
    if (!cleaned) continue;
    for (const sentence of cleaned.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [cleaned]) {
      const text = asSentence(sentence.trim());
      if (text.length > 1) beats.push({ kind: "sentence", text });
    }
  }
  return beats;
}

/**
 * Compact briefing: title → excerpt → key headings/items/lead sentences,
 * capped to locale target so Gemini TTS lands near 50s–1:15.
 */
export function buildInsightBriefText(title, excerpt, body, locale = "az") {
  const target = INSIGHT_BRIEF_TARGET_CHARS[locale] ?? INSIGHT_BRIEF_TARGET_CHARS.en;
  const parts = [];
  const titleLine = asSentence(cleanInline(title || ""));
  if (titleLine.length > 1) parts.push(titleLine);

  const excerptLine = asSentence(cleanInline(excerpt || ""));
  if (excerptLine.length > 1 && excerptLine !== titleLine) parts.push(excerptLine);

  const beats = extractBeats(body);
  const headings = beats.filter((b) => b.kind === "heading");
  const items = beats.filter((b) => b.kind === "item");
  const sentences = beats.filter((b) => b.kind === "sentence");

  // Prefer structure: numbered/list essentials, else heading + first following idea, else lead prose.
  const priority = items.length >= 3 ? items : headings.length ? [...headings, ...sentences] : sentences;

  for (const beat of priority) {
    const next = [...parts, beat.text];
    const size = next.join(" ").length;
    if (size > target && parts.length >= 2) break;
    if (!parts.includes(beat.text)) parts.push(beat.text);
  }

  // Soft trim: if still short, add more sentences until near target.
  if (parts.join(" ").length < target * 0.75) {
    for (const beat of sentences) {
      if (parts.includes(beat.text)) continue;
      const next = [...parts, beat.text];
      if (next.join(" ").length > target && parts.length >= 3) break;
      parts.push(beat.text);
    }
  }

  let plain = parts.join("\n\n");
  if (plain.length > target + 120) {
    // Cut on last sentence boundary under target+40.
    const hard = target + 40;
    const slice = plain.slice(0, hard);
    const cut = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    if (cut > target * 0.55) plain = plain.slice(0, cut + 1).trim();
  }

  return normalizeSpeechPronunciation(plain, locale);
}

export function insightBriefHash(text) {
  return speechHash(`insight-short-v1\n${text}`);
}
