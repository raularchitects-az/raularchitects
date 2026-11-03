/**
 * Transcribe the first ~25s of generated blog MP3s via Cloud Speech-to-Text (spot check).
 * Usage: node --env-file=.env.local scripts/verify-blog-audio-stt.mjs --slug heyet-teras-landsaft-baki --locales de,ru,en
 */
import { createRequire } from "node:module";
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const require = createRequire(import.meta.url);
const ffmpegStatic = (() => {
  try {
    return require("ffmpeg-static");
  } catch {
    return "ffmpeg";
  }
})();

const { values: args } = parseArgs({
  options: {
    slug: { type: "string", default: "heyet-teras-landsaft-baki" },
    locales: { type: "string", default: "de,ru,en" },
  },
});

const env = (name, fallback) => {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env ${name}`);
};

const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const FFMPEG = env("FFMPEG_PATH", ffmpegStatic || "ffmpeg");
const GCLOUD_RAW = env("GCLOUD_PATH", "gcloud");
const GCLOUD = /\s/.test(GCLOUD_RAW) ? `"${GCLOUD_RAW}"` : GCLOUD_RAW;
const project = env("GOOGLE_CLOUD_PROJECT", "ringed-sentinel-513605-i9");
const token = execSync(`${GCLOUD} auth application-default print-access-token`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  timeout: 30000,
}).trim();

const langMap = { de: "de-DE", ru: "ru-RU", en: "en-US", az: "az-AZ" };

async function main() {
  const locales = args.locales.split(",").map((item) => item.trim()).filter(Boolean);
  const manifest = await (
    await fetch(`${SUPABASE_URL}/storage/v1/object/public/blog-audio/manifest.json?v=${Date.now()}`, {
      cache: "no-store",
    })
  ).json();
  const work = mkdtempSync(path.join(tmpdir(), "raul-blog-audio-"));

  for (const lang of locales) {
    const entry = (manifest.entries || []).find((item) => item.slug === args.slug && item.lang === lang);
    if (!entry) {
      console.log(`=== ${lang} === MISSING`);
      continue;
    }
    const mp3 = Buffer.from(await (await fetch(entry.url)).arrayBuffer());
    const mp3Path = path.join(work, `${lang}.mp3`);
    const pcmPath = path.join(work, `${lang}.pcm`);
    writeFileSync(mp3Path, mp3);
    execFileSync(
      FFMPEG,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        mp3Path,
        "-t",
        "25",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "s16le",
        pcmPath,
      ],
      { maxBuffer: 50 * 1024 * 1024 },
    );
    const wav = readFileSync(pcmPath);
    const response = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-goog-user-project": project,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: langMap[lang] || lang,
          enableAutomaticPunctuation: true,
          model: "latest_long",
        },
        audio: { content: wav.toString("base64") },
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      console.log(`=== ${lang} === STT_ERR ${response.status} ${JSON.stringify(json.error || json).slice(0, 400)}`);
      continue;
    }
    const transcript = (json.results || [])
      .map((row) => row.alternatives?.[0]?.transcript || "")
      .join(" ")
      .trim();
    console.log(`=== ${lang} (${entry.duration_seconds}s) ===`);
    console.log(transcript || "(empty transcript)");
    console.log("");
  }

  rmSync(work, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
