#!/usr/bin/env node
/**
 * Pre-generates ~1-minute "essentials" MP3s for Insights and uploads them
 * to the public Supabase Storage bucket `insight-audio`.
 *
 *   node --env-file=.env.local scripts/generate-insight-audio.mjs [--latest 10] [--all] [--slug a,b] [--locales az,ru,en,de] [--force] [--dry-run]
 *
 * All locales: Gemini Flash TTS (Vertex). Chirp 3 HD is fallback.
 * Auth: Application Default Credentials (Raul GCP only).
 */
import { createRequire } from "node:module";
import { execFileSync, execSync } from "node:child_process";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import {
  INSIGHT_AUDIO_LOCALES,
  buildInsightBriefText,
  chunkSpeechText,
  getInsightSpeechFields,
  hasInsightSpeechLocale,
  insightBriefHash,
  splitLongSentences,
} from "./insight-audio-text.mjs";

const require = createRequire(import.meta.url);
const ffmpegStatic = (() => {
  try {
    return require("ffmpeg-static");
  } catch {
    return null;
  }
})();

const BUCKET = "insight-audio";
const MANIFEST_PATH = "manifest.json";
const SAMPLE_RATE = 24000;
const PAUSE_SECONDS = 0.55;
const VOICES = {
  az: {
    id: "gemini-3.8-flash-tts:Kore",
    engine: "gemini",
    model: "gemini-3.8-flash-tts",
    voice: "Kore",
    maxBytes: 2800,
    fallback: { id: "az-chirp-unavailable", engine: "chirp", languageCode: "az-AZ", voice: "az-AZ-Chirp3-HD-Kore", maxBytes: 2800 },
  },
  ru: {
    id: "gemini-3.8-flash-tts:Kore",
    engine: "gemini",
    model: "gemini-3.8-flash-tts",
    voice: "Kore",
    maxBytes: 2800,
    fallback: { id: "ru-RU-Chirp3-HD-Kore", engine: "chirp", languageCode: "ru-RU", voice: "ru-RU-Chirp3-HD-Kore", maxBytes: 2800 },
  },
  en: {
    id: "gemini-3.8-flash-tts:Kore",
    engine: "gemini",
    model: "gemini-3.8-flash-tts",
    voice: "Kore",
    maxBytes: 2800,
    fallback: { id: "en-US-Chirp3-HD-Kore", engine: "chirp", languageCode: "en-US", voice: "en-US-Chirp3-HD-Kore", maxBytes: 2800 },
  },
  de: {
    id: "gemini-3.8-flash-tts:Kore",
    engine: "gemini",
    model: "gemini-3.8-flash-tts",
    voice: "Kore",
    maxBytes: 2800,
    fallback: { id: "de-DE-Chirp3-HD-Kore", engine: "chirp", languageCode: "de-DE", voice: "de-DE-Chirp3-HD-Kore", maxBytes: 2800 },
  },
};
/** Short briefing style — essentials only, ~1 minute. */
const NARRATION_STYLE = {
  az: `Sən peşəkar xəbər / məlumat diktorusan. Bu, təxminən bir dəqiqəlik qısa brifinqdir — yalnız əsas fikirləri oxu. Aydın, sakit, inamlı; televiziya məlumat tonu. Podkast və reklam tonu yox. Abzaslar arasında qısa peşəkar fasilə. «Raul Architects» brendini belə tələffüz et.`,
  ru: `Ты профессиональный диктор новостей. Это краткий брифинг примерно на одну минуту — только суть. Читай ясно, спокойно, уверенно, как информационный выпуск. Без подкаста и рекламы. Короткие паузы между абзацами. Бренд: «Раул Аркитектс».`,
  en: `You are a professional news presenter. This is a roughly one-minute briefing — essentials only. Deliver clearly, calmly, confidently like a factual bulletin. No podcast chumminess, no ad voice. Short pauses between paragraphs. Pronounce «Raul Architects».`,
  de: `Du bist eine professionelle Nachrichtensprecherin. Dies ist ein kurzes Briefing von etwa einer Minute — nur das Wesentliche. Klar, ruhig, sachlich. Kein Podcast-Ton, keine Werbung. Kurze Pausen zwischen Absätzen. Marke: «Raul Architects».`,
};
const PRICE = { geminiInputPerM: 0.5, geminiOutputPerM: 9, chirpPerM: 30 };

const { values: args } = parseArgs({
  options: {
    latest: { type: "string", default: "10" },
    all: { type: "boolean", default: false },
    slug: { type: "string" },
    locales: { type: "string", default: INSIGHT_AUDIO_LOCALES.join(",") },
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

const env = (name, fallback) => {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env ${name} (run with node --env-file=.env.local)`);
};
const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const supabase = createClient(SUPABASE_URL, env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const FFMPEG = env("FFMPEG_PATH", ffmpegStatic || "ffmpeg");
const GCLOUD = ((value) => (/\s/.test(value) ? `"${value}"` : value))(env("GCLOUD_PATH", "gcloud"));

let googleToken;
let googleTokenAt = 0;
let googleProject;

function google() {
  const stale = !googleToken || Date.now() - googleTokenAt > 45 * 60 * 1000;
  if (stale) {
    googleToken =
      process.env.GOOGLE_ACCESS_TOKEN?.trim() ||
      execSync(`${GCLOUD} auth application-default print-access-token`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 30000,
      }).trim();
    googleTokenAt = Date.now();
    googleProject =
      process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
      googleProject ||
      execSync(`${GCLOUD} config get-value project`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 30000,
      }).trim();
    if (!googleProject) throw new Error("Set GOOGLE_CLOUD_PROJECT or a gcloud default project (Raul GCP only)");
  }
  return { token: googleToken, project: googleProject };
}

function googleHeaders() {
  const { token, project } = google();
  return { Authorization: `Bearer ${token}`, "x-goog-user-project": project, "Content-Type": "application/json" };
}

async function postJson(url, body) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { method: "POST", headers: googleHeaders(), body: JSON.stringify(body) });
    const json = await response.json().catch(() => ({}));
    if (response.ok) return json;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 3) throw new Error(`${response.status} ${JSON.stringify(json.error ?? json).slice(0, 500)}`);
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
}

function pcmFromWav(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return buffer;
  const rate = buffer.readUInt32LE(24);
  if (rate !== SAMPLE_RATE) throw new Error(`Unexpected sample rate ${rate}`);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "data") return buffer.subarray(offset + 8, Math.min(buffer.length, offset + 8 + size));
    offset += 8 + size + (size % 2);
  }
  throw new Error("WAV without data chunk");
}

async function synthesizeGemini(voice, text, usage, locale) {
  const { project } = google();
  const url = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${voice.model}:generateContent`;
  const style = NARRATION_STYLE[locale] || NARRATION_STYLE.en;
  const json = await postJson(url, {
    contents: [{ role: "user", parts: [{ text, speechMetadata: { style } }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { voice: voice.voice } },
    },
  });
  const part = json.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data);
  if (!part) throw new Error(`No audio in Gemini response: ${JSON.stringify(json).slice(0, 300)}`);
  usage.geminiInputTokens += json.usageMetadata?.promptTokenCount ?? 0;
  usage.geminiOutputTokens += json.usageMetadata?.candidatesTokenCount ?? 0;
  return pcmFromWav(Buffer.from(part.inlineData.data, "base64"));
}

async function synthesizeChirp(voice, text, usage) {
  const request = (input) =>
    postJson("https://texttospeech.googleapis.com/v1/text:synthesize", {
      input: { text: input },
      voice: { languageCode: voice.languageCode, name: voice.voice },
      audioConfig: {
        audioEncoding: "LINEAR16",
        sampleRateHertz: SAMPLE_RATE,
        speakingRate: 0.95,
      },
    });
  const tooLong = (error) => /sentences that are too long/i.test(String(error?.message));
  const synth = async (input) => {
    const json = await request(input);
    usage.chirpChars += input.length;
    return pcmFromWav(Buffer.from(json.audioContent, "base64"));
  };
  try {
    return await synth(text);
  } catch (error) {
    if (!tooLong(error)) throw error;
  }
  const shorter = splitLongSentences(text);
  try {
    return await synth(shorter);
  } catch (error) {
    if (!tooLong(error)) throw error;
  }
  const lineGap = Buffer.alloc(Math.round(SAMPLE_RATE * 0.25) * 2);
  const lines = [];
  for (const line of shorter
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)) {
    if (lines.length) lines.push(lineGap);
    lines.push(await synth(line));
  }
  return Buffer.concat(lines);
}

async function synthesizeChunk(voice, text, usage, locale) {
  if (voice.engine === "gemini") {
    try {
      return await synthesizeGemini(voice, text, usage, locale);
    } catch (error) {
      if (!voice.fallback || voice.fallback.engine !== "chirp" || voice.fallback.voice?.includes("unavailable")) {
        throw error;
      }
      console.warn(`gemini fallback→chirp ${locale}: ${error instanceof Error ? error.message : error}`);
      return synthesizeChirp(voice.fallback, text, usage);
    }
  }
  return synthesizeChirp(voice, text, usage);
}

async function synthesize(voice, text, usage, locale) {
  const chunks = chunkSpeechText(text, voice.maxBytes);
  const silence = Buffer.alloc(Math.round(SAMPLE_RATE * PAUSE_SECONDS) * 2);
  const parts = [];
  for (const [index, chunk] of chunks.entries()) {
    let pcm = await synthesizeChunk(voice, chunk, usage, locale);
    const charsPerSecond = chunk.length / (pcm.length / 2 / SAMPLE_RATE);
    if (charsPerSecond > 30 || charsPerSecond < 5) pcm = await synthesizeChunk(voice, chunk, usage, locale);
    if (index > 0) parts.push(silence);
    parts.push(pcm);
  }
  return { pcm: Buffer.concat(parts), chunks: chunks.length };
}

function encodeMp3(pcm) {
  return execFileSync(
    FFMPEG,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "s16le",
      "-ar",
      String(SAMPLE_RATE),
      "-ac",
      "1",
      "-i",
      "pipe:0",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "64k",
      "-ac",
      "1",
      "-f",
      "mp3",
      "pipe:1",
    ],
    { input: pcm, maxBuffer: 256 * 1024 * 1024 },
  );
}

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "20MB",
    allowedMimeTypes: ["audio/mpeg", "application/json"],
  });
  if (error) throw error;
  console.log(`Created public bucket ${BUCKET}`);
}

async function loadManifest() {
  const { data, error } = await supabase.storage.from(BUCKET).download(MANIFEST_PATH);
  if (error || !data) return { version: 1, updated_at: null, kind: "insight-short", entries: [] };
  const parsed = JSON.parse(await data.text());
  return {
    version: 1,
    updated_at: parsed.updated_at ?? null,
    kind: "insight-short",
    entries: Array.isArray(parsed.entries) ? parsed.entries : [],
  };
}

async function saveManifest(manifest) {
  manifest.updated_at = new Date().toISOString();
  manifest.kind = "insight-short";
  manifest.entries.sort((a, b) => a.slug.localeCompare(b.slug) || a.lang.localeCompare(b.lang));
  const { error } = await supabase.storage.from(BUCKET).upload(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    contentType: "application/json",
    cacheControl: "300",
    upsert: true,
  });
  if (error) throw error;
}

async function selectPosts() {
  let query = supabase.from("insights").select("slug,status,published_at,created_at,translations");
  if (args.slug) {
    query = query.in(
      "slug",
      args.slug
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  } else if (args.all) {
    query = query.order("created_at", { ascending: false }).range(0, 999);
  } else {
    query = query
      .eq("status", "published")
      .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(Number(args.latest));
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function main() {
  const locales = args.locales
    .split(",")
    .map((item) => item.trim())
    .filter((item) => INSIGHT_AUDIO_LOCALES.includes(item));
  const posts = await selectPosts();
  if (!posts.length) throw new Error("No matching insights");
  if (!args["dry-run"]) await ensureBucket();
  const manifest = await loadManifest();
  const usage = { geminiInputTokens: 0, geminiOutputTokens: 0, chirpChars: 0 };
  let changed = 0;

  for (const post of posts) {
    for (const lang of locales) {
      if (!hasInsightSpeechLocale(post, lang)) continue;
      const voice = VOICES[lang];
      const fields = getInsightSpeechFields(post, lang);
      const text = buildInsightBriefText(fields.title, fields.excerpt, fields.body, lang);
      const hash = insightBriefHash(text);
      const label = `${post.slug}/${lang}`;
      const existing = manifest.entries.find((entry) => entry.slug === post.slug && entry.lang === lang);
      if (!args.force && existing?.hash === hash && existing.voice === voice.id) {
        console.log(`skip  ${label} (unchanged, ${existing.duration_seconds}s)`);
        continue;
      }
      if (args["dry-run"]) {
        console.log(`plan  ${label} ${text.length} chars, ${chunkSpeechText(text, voice.maxBytes).length} chunk(s)`);
        continue;
      }
      const { pcm, chunks } = await synthesize(voice, text, usage, lang);
      const mp3 = encodeMp3(pcm);
      const durationSeconds = Math.round((pcm.length / 2 / SAMPLE_RATE) * 10) / 10;
      const path = `${post.slug}/${lang}.mp3`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, mp3, {
        contentType: "audio/mpeg",
        cacheControl: "31536000",
        upsert: true,
      });
      if (error) throw error;
      const entry = {
        slug: post.slug,
        lang,
        url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}?v=${hash.slice(0, 12)}`,
        duration_seconds: durationSeconds,
        bytes: mp3.length,
        hash,
        voice: voice.id,
        generated_at: new Date().toISOString(),
      };
      manifest.entries = manifest.entries.filter((item) => !(item.slug === post.slug && item.lang === lang)).concat(entry);
      await saveManifest(manifest);
      changed++;
      const warn = durationSeconds < 40 || durationSeconds > 90 ? " ⚠ outside 50s–1:15±" : "";
      console.log(
        `done  ${label} ${durationSeconds}s, ${(mp3.length / 1024).toFixed(0)} KB, ${chunks} chunk(s), ${text.length} chars${warn}`,
      );
    }
  }

  const cost =
    (usage.geminiInputTokens * PRICE.geminiInputPerM +
      usage.geminiOutputTokens * PRICE.geminiOutputPerM +
      usage.chirpChars * PRICE.chirpPerM) /
    1e6;
  console.log(
    `\n${changed} file(s) generated. Usage: Gemini ${usage.geminiInputTokens} input / ${usage.geminiOutputTokens} output tokens, Chirp 3 HD ${usage.chirpChars} chars.`,
  );
  console.log(`List-price estimate: $${cost.toFixed(4)} (Chirp 3 HD is free up to 1M chars/month).`);
  console.log(`Manifest: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
