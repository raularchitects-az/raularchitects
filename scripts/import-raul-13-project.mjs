/**
 * One-off importer for `13 project`.
 * Writes optimized WebP/MP4 copies into public/; does not modify the source folder.
 *
 * source: "raul-13-project-import"
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");

const SOURCE = "raul-13-project-import";
const SOURCE_ROOT = String.raw`D:\Projects\SAYTLAR SENEDLER\1 Raul\portfolio\13 project`;
const OUT_ROOT = path.resolve("public/images/import-13");
const VIDEO_ROOT = path.resolve("public/videos/import-13");
const MANIFEST_PATH = path.resolve("src/data/raul-13-project-manifest.json");
const REPORT_PATH = path.resolve("scripts/raul-13-project-import-report.json");

const CREAM = { r: 247, g: 242, b: 236 };
const WHITE = { r: 255, g: 255, b: 255 };

sharp.cache(false);
sharp.concurrency(1);

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const canvasFactory = new NodeCanvasFactory();

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
}

function findChild(dir, matcher) {
  const hit = listDirs(dir).find((entry) => matcher(entry.name));
  if (!hit) throw new Error(`Folder not found in ${dir}`);
  return path.join(dir, hit.name);
}

function resolveFolder(needle) {
  return findChild(SOURCE_ROOT, (name) => name.toLowerCase().includes(needle.toLowerCase()));
}

function resolveFile(dir, fileName) {
  const files = fs.readdirSync(dir);
  const exact = files.find((file) => file === fileName);
  if (exact) return path.join(dir, exact);
  const lower = fileName.toLowerCase();
  const fuzzy = files.find((file) => file.toLowerCase() === lower);
  if (fuzzy) return path.join(dir, fuzzy);
  throw new Error(`File not found in ${dir}: ${fileName}`);
}

function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

async function encodeWebp(pipeline, dest, { minKb, maxKb, startQuality }) {
  let quality = startQuality;
  let buffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  for (let i = 0; i < 6; i += 1) {
    const kb = buffer.length / 1024;
    if (kb > maxKb && quality > 52) quality -= 8;
    else if (kb < minKb && quality < 88) quality += 6;
    else break;
    buffer = await sharp(buffer).webp({ quality, effort: 4 }).toBuffer();
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  const meta = await sharp(buffer).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0, bytes: buffer.length };
}

function openSource(src) {
  return sharp(src, { limitInputPixels: false, sequentialRead: true, failOn: "none" }).rotate();
}

function lightAdjust(img) {
  return img.flatten({ background: CREAM }).modulate({ brightness: 1.03, saturation: 1.01 }).linear(1.05, -3);
}

function crop43(width, height, focusX = 0.5, focusY = 0.5) {
  const target = 4 / 3;
  const ratio = width / height;
  let cropW;
  let cropH;
  if (ratio > target) {
    cropH = height;
    cropW = Math.round(height * target);
  } else {
    cropW = width;
    cropH = Math.round(width / target);
  }
  const left = Math.max(0, Math.min(width - cropW, Math.round((width - cropW) * focusX)));
  const top = Math.max(0, Math.min(height - cropH, Math.round((height - cropH) * focusY)));
  return { left, top, width: cropW, height: cropH };
}

async function downscaleBuffer(src, maxEdge = 2400) {
  return openSource(src)
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .toBuffer();
}

async function writeCover(src, dest, { focusX = 0.5, focusY = 0.5, plan = false, entropy = false } = {}) {
  const working = await downscaleBuffer(src, plan ? 2400 : 2000);
  const meta = await sharp(working).metadata();
  let pipeline = sharp(working);
  if (!plan) pipeline = lightAdjust(pipeline);
  else pipeline = pipeline.flatten({ background: WHITE });

  if (entropy) {
    pipeline = pipeline.resize(1200, 900, { fit: "cover", position: sharp.strategy.entropy });
  } else {
    const crop = crop43(meta.width ?? 1200, meta.height ?? 900, focusX, focusY);
    pipeline = pipeline.extract(crop).resize(1200, 900, { fit: "fill" });
  }

  return encodeWebp(pipeline, dest, { minKb: 140, maxKb: 320, startQuality: plan ? 84 : 78 });
}

async function writeWide(src, dest, { maxWidth = 2000, plan = false } = {}) {
  let pipeline = openSource(src).resize({ width: maxWidth, withoutEnlargement: true });
  pipeline = plan
    ? pipeline.flatten({ background: WHITE })
    : lightAdjust(pipeline);
  return encodeWebp(pipeline, dest, {
    minKb: plan ? 180 : 260,
    maxKb: plan ? 620 : 700,
    startQuality: plan ? 84 : 76,
  });
}

async function rasterizePdfPage(pdfPath, pageNumber) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    disableFontFace: true,
    canvasFactory,
    verbosity: 0,
    isOffscreenCanvasSupported: false,
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2.6, 2000 / base.width);
  const viewport = page.getViewport({ scale });
  const canvasAndContext = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page.render({
    canvasContext: canvasAndContext.context,
    viewport,
    canvas: canvasAndContext.canvas,
  }).promise;
  const png = canvasAndContext.canvas.toBuffer("image/png");
  canvasFactory.destroy(canvasAndContext);
  await loadingTask.destroy?.();
  return png;
}

async function pdfPageCount(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    disableFontFace: true,
    canvasFactory,
    verbosity: 0,
    isOffscreenCanvasSupported: false,
  });
  const pdf = await loadingTask.promise;
  const count = pdf.numPages;
  await loadingTask.destroy?.();
  return count;
}

function writeVideo(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      src,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "26",
      "-preset",
      "fast",
      "-vf",
      "scale='min(960,iw)':-2",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      "-movflags",
      "+faststart",
      dest,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || "ffmpeg failed");
  }
}

function extractPoster(src, dest, time = "00:00:08") {
  const tmpJpg = dest.replace(/\.webp$/i, ".jpg");
  const result = spawnSync(
    ffmpegPath,
    ["-y", "-ss", time, "-i", src, "-frames:v", "1", tmpJpg],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || "ffmpeg poster failed");
  }
  return tmpJpg;
}

const jobs = [
  {
    slug: "casa-del-rio",
    title: "Casa del Rio",
    category: "kottec",
    country: null,
    folder: "casa del rio",
    coverFile: "Casa del Rio.jpg",
    coverFocus: [0.42, 0.52],
    coverObjectPosition: "center 52%",
    images: [
      { file: "3D-construction.jpg", kind: "exterior", objectPosition: "center" },
      { pdf: "Casa Del Rio-A3-Grundriss.pdf", kind: "plan" },
      { pdf: "Casa Del Rio-A3-Ansichten(1).pdf", kind: "plan" },
      { pdf: "Casa Del Rio-A3 Schnitte B.pdf", kind: "section" },
    ],
    video: { file: "videoplayback (2).mp4", posterTime: "00:00:08" },
  },
  {
    slug: "evolo-new-york",
    title: "New York eVolo Competition",
    category: "ictimai",
    country: null,
    note: "competition-concept",
    folder: "e volo",
    coverFile: "0165-1.jpg",
    coverFocus: [0.5, 0.28],
    coverObjectPosition: "center 28%",
    images: [
      { file: "0165-1.jpg", kind: "exterior", objectPosition: "center 28%" },
      { file: "DG.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "re.jpg", kind: "plan", plan: true, objectPosition: "center" },
    ],
  },
  {
    slug: "dag-evleri",
    title: "Dağ Evləri — Üç Konsept",
    category: "kottec",
    country: null,
    folder: "dag evi",
    coverFile: "Cliff.png",
    coverFocus: [0.5, 0.4],
    coverObjectPosition: "center 40%",
    images: [
      { file: "Cliff.png", kind: "exterior", caption: "Cliff", objectPosition: "center 40%" },
      { file: "Blanc.png", kind: "exterior", caption: "Blanc", objectPosition: "center" },
      { file: "Tiny.jpg", kind: "exterior", caption: "Tiny", objectPosition: "center 55%" },
    ],
  },
  {
    slug: "brizz-villa",
    title: "BRIZZ Villa",
    category: "villa",
    country: null,
    folder: "brizz",
    coverFile: "MW-03.jpg",
    coverFocus: [0.5, 0.46],
    coverObjectPosition: "center 46%",
    images: [
      { file: "MW-01-B.jpg", kind: "exterior", objectPosition: "center 55%" },
      { file: "MW-04.jpg", kind: "exterior", objectPosition: "center" },
      { file: "MW-05.jpg", kind: "exterior", objectPosition: "center 55%" },
      { file: "MW-06.jpg", kind: "exterior", objectPosition: "center" },
    ],
  },
  {
    slug: "3x1-house",
    title: "3x1 House",
    category: "ferdi-yasayis-evi",
    country: null,
    folder: "3x1",
    coverFile: "Image.jpg",
    coverFocus: [0.5, 0.48],
    coverObjectPosition: "center 48%",
    images: [
      { file: "Image.jpg", kind: "exterior", objectPosition: "center 48%" },
      { pdf: "Groundfloor.pdf", kind: "plan" },
      { pdf: "Masterplan.pdf", kind: "plan" },
    ],
  },
  {
    slug: "erkner-shehersalma",
    title: "Erkner Şəhərsalma Layihəsi",
    category: "ictimai",
    country: "germany",
    folder: "erkner",
    coverFile: "KunstStoff.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "KunstStoff.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "Masterplan.jpg", kind: "plan", plan: true, huge: true, objectPosition: "center" },
      { file: "picto-2.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "picto-3.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "picto-4c.jpg", kind: "plan", plan: true, objectPosition: "center" },
    ],
  },
  {
    slug: "helgoland-shehersalma",
    title: "Helgoland Şəhərsalma Layihəsi",
    category: "ictimai",
    country: "germany",
    folder: "helgolan",
    coverFile: "lageplan-new-1-1000.jpg",
    coverEntropy: true,
    coverPlan: true,
    coverObjectPosition: "center",
    images: [
      { file: "lageplan-new-1-1000.jpg", kind: "plan", plan: true, huge: true, objectPosition: "center" },
      { file: "Schwarzplan-1-5000.jpg", kind: "plan", plan: true, huge: true, objectPosition: "center" },
    ],
  },
  {
    slug: "berlin-shehersalma",
    title: "Berlin Şəhərsalma Layihəsi",
    category: "ictimai",
    country: "germany",
    folder: "shersalma berlin",
    coverFile: "Masterplan.jpg",
    coverFocus: [0.5, 0.45],
    coverPlan: true,
    coverObjectPosition: "center",
    images: [
      { file: "Netzplan.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "Nutzung.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "Schwarzplan.jpg", kind: "plan", plan: true, objectPosition: "center" },
    ],
  },
  {
    slug: "amerika-gedenkbibliothek",
    title: "Amerika-Gedenkbibliothek",
    category: "ictimai",
    country: "germany",
    folder: "gedenk",
    coverFile: "image.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "image.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "interior.jpg", kind: "interior", objectPosition: "center" },
      { file: "B1.jpg", kind: "plan", plan: true, huge: true, objectPosition: "center" },
      { file: "pikto1.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "schnitt-1(1-200).jpg", kind: "section", plan: true, objectPosition: "center" },
      { pdf: "eg.pdf", kind: "plan" },
    ],
  },
  {
    slug: "senftenberg-shehersalma",
    title: "Senftenberg Şəhərsalma Layihəsi",
    category: "ictimai",
    country: "germany",
    folder: "senftenberg",
    coverFile: "master.jpg",
    coverEntropy: true,
    coverPlan: true,
    coverObjectPosition: "center",
    images: [],
  },
  {
    slug: "kita",
    title: "KITA Uşaq Bağçası",
    category: "ictimai",
    country: null,
    folder: "kita",
    coverFile: "KITA.jpg",
    coverFocus: [0.5, 0.48],
    coverObjectPosition: "center 48%",
    images: [
      { file: "KITA.jpg", kind: "exterior", objectPosition: "center 48%" },
      { file: "konzept-A1.jpg", kind: "plan", plan: true, objectPosition: "center" },
      { file: "schnitt.jpg", kind: "section", plan: true, objectPosition: "center" },
      { file: "schwarzplan.jpg", kind: "plan", plan: true, objectPosition: "center" },
    ],
  },
  {
    slug: "klassik-villa",
    title: "Klassik Villa",
    category: "villa",
    country: null,
    folder: "13 villa",
    coverFile: "01_Interactive LightMix_cam01.jpg",
    coverFocus: [0.5, 0.48],
    coverObjectPosition: "center 48%",
    images: [
      { file: "01_Interactive LightMix_cam01.jpg", kind: "exterior", objectPosition: "center 48%" },
      { file: "01_Interactive LightMix_cam04.jpg", kind: "exterior", objectPosition: "center" },
      { file: "2option hall2.jpg", kind: "interior", objectPosition: "center" },
      { file: "bed0333.png", kind: "interior", objectPosition: "center" },
      { file: "rest.jpg", kind: "interior", objectPosition: "center" },
    ],
  },
];

async function processProject(job) {
  const folder = resolveFolder(job.folder);
  const outDir = path.join(OUT_ROOT, job.slug);
  fs.mkdirSync(outDir, { recursive: true });

  const used = [];
  const coverSrc = resolveFile(folder, job.coverFile);
  used.push(coverSrc);

  const cover = await writeCover(coverSrc, path.join(outDir, "cover.webp"), {
    focusX: job.coverFocus?.[0] ?? 0.5,
    focusY: job.coverFocus?.[1] ?? 0.5,
    plan: Boolean(job.coverPlan),
    entropy: Boolean(job.coverEntropy),
  });

  const hero = await writeWide(coverSrc, path.join(outDir, "hero.webp"), {
    maxWidth: job.coverPlan ? 2200 : 2400,
    plan: Boolean(job.coverPlan),
  });

  const gallery = [];
  let galleryIndex = 0;

  for (const image of job.images ?? []) {
    if (image.pdf) {
      const pdfSrc = resolveFile(folder, image.pdf);
      used.push(pdfSrc);
      const pages = Math.min(await pdfPageCount(pdfSrc), 4);
      for (let page = 1; page <= pages; page += 1) {
        galleryIndex += 1;
        const filename = `g${String(galleryIndex).padStart(2, "0")}.webp`;
        const dest = path.join(outDir, filename);
        const png = await rasterizePdfPage(pdfSrc, page);
        const tmp = path.join(outDir, `tmp-pdf-${galleryIndex}.png`);
        fs.writeFileSync(tmp, png);
        const info = await writeWide(tmp, dest, { maxWidth: 2000, plan: true });
        fs.unlinkSync(tmp);
        gallery.push({
          src: `/images/import-13/${job.slug}/${filename}`,
          kind: image.kind,
          objectPosition: "center",
          caption: image.caption ?? null,
          width: info.width,
          height: info.height,
          bytes: info.bytes,
          original: `${image.pdf}#page=${page}`,
        });
      }
      continue;
    }

    const src = resolveFile(folder, image.file);
    used.push(src);
    galleryIndex += 1;
    const filename = `g${String(galleryIndex).padStart(2, "0")}.webp`;
    const dest = path.join(outDir, filename);
    const info = await writeWide(src, dest, {
      maxWidth: image.huge ? 2000 : 2000,
      plan: Boolean(image.plan),
    });
    gallery.push({
      src: `/images/import-13/${job.slug}/${filename}`,
      kind: image.kind,
      objectPosition: image.objectPosition ?? "center",
      caption: image.caption ?? null,
      width: info.width,
      height: info.height,
      bytes: info.bytes,
      original: image.file,
    });
  }

  let video = null;
  if (job.video) {
    const videoSrc = resolveFile(folder, job.video.file);
    used.push(videoSrc);
    const videoDest = path.join(VIDEO_ROOT, `${job.slug}.mp4`);
    writeVideo(videoSrc, videoDest);
    const posterJpg = extractPoster(videoSrc, path.join(outDir, "video-poster.webp"), job.video.posterTime);
    const poster = await writeWide(posterJpg, path.join(outDir, "video-poster.webp"), { maxWidth: 1280, plan: false });
    fs.unlinkSync(posterJpg);
    const stat = fs.statSync(videoDest);
    video = {
      src: `/videos/import-13/${job.slug}.mp4`,
      poster: `/images/import-13/${job.slug}/video-poster.webp`,
      width: 960,
      height: 540,
      bytes: stat.size,
      original: job.video.file,
      posterWidth: poster.width,
      posterHeight: poster.height,
    };
  }

  return {
    source: SOURCE,
    slug: job.slug,
    section: "projects",
    category: job.category,
    country: job.country,
    title: job.title,
    note: job.note ?? null,
    used: used.map((file) => path.relative(SOURCE_ROOT, file)),
    cover: {
      src: `/images/import-13/${job.slug}/cover.webp`,
      objectPosition: job.coverObjectPosition,
      width: cover.width,
      height: cover.height,
      bytes: cover.bytes,
      original: job.coverFile,
    },
    hero: {
      src: `/images/import-13/${job.slug}/hero.webp`,
      objectPosition: job.coverObjectPosition,
      width: hero.width,
      height: hero.height,
      bytes: hero.bytes,
      original: job.coverFile,
    },
    gallery,
    video,
  };
}

const report = {
  source: SOURCE,
  projects: [],
  unidentifiedVideos: [
    {
      file: "02 Videos/21 Housing.mp4",
      reason: "Tropical multi-block housing flythrough; no matching stills in this folder’s 12 projects.",
    },
    {
      file: "02 Videos/video 3.mp4",
      reason: "Showreel mixing interiors and a cantilevered hillside house; cannot assign to a single project with certainty.",
    },
  ],
};

for (const job of jobs) {
  process.stdout.write(`Processing ${job.slug}...\n`);
  report.projects.push(await processProject(job));
}

const usedSet = new Set(report.projects.flatMap((item) => item.used).map((rel) => rel.replaceAll("/", "\\").toLowerCase()));
usedSet.add("02 videos\\21 housing.mp4");
usedSet.add("02 videos\\video 3.mp4");

const unused = walkFiles(SOURCE_ROOT)
  .map((file) => path.relative(SOURCE_ROOT, file))
  .filter((rel) => !usedSet.has(rel.replaceAll("/", "\\").toLowerCase()));

report.unusedSourceFiles = unused;
report.removeLater = {
  dataFile: "src/data/raul-13-project-import.ts",
  manifest: "src/data/raul-13-project-manifest.json",
  images: "public/images/import-13/",
  videos: "public/videos/import-13/",
  source: SOURCE,
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ source: SOURCE, projects: report.projects }, null, 2));
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
process.stdout.write(`Wrote ${MANIFEST_PATH}\n`);
