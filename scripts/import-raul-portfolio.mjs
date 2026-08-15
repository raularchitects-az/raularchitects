/**
 * One-off importer: copies optimized WebP versions of selected portfolio
 * images into public/images/import/. Does not modify the original folder.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_ROOT = String.raw`D:\Projects\SAYTLAR SENEDLER\1 Raul\portfolio`;
const OUT_ROOT = path.resolve("public/images/import");
const REPORT_PATH = path.resolve("scripts/raul-portfolio-import-report.json");

const CREAM = { r: 247, g: 242, b: 236 };

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory());
}

function findChild(dir, matcher) {
  const hit = listDirs(dir).find((e) => matcher(e.name));
  if (!hit) throw new Error(`Folder not found in ${dir}: ${matcher}`);
  return path.join(dir, hit.name);
}

function resolveFolder(segments) {
  let current = SOURCE_ROOT;
  for (const segment of segments) {
    const needle = segment.toLowerCase();
    current = findChild(current, (name) => name.toLowerCase().includes(needle));
  }
  return current;
}

function resolveFile(dir, fileName) {
  const files = fs.readdirSync(dir);
  const exact = files.find((f) => f === fileName);
  if (exact) return path.join(dir, exact);
  const lower = fileName.toLowerCase();
  const fuzzy = files.find((f) => f.toLowerCase() === lower);
  if (fuzzy) return path.join(dir, fuzzy);
  throw new Error(`File not found in ${dir}: ${fileName}`);
}

async function encodeWebp(pipeline, dest, { minKb, maxKb, startQuality }) {
  let quality = startQuality;
  let buffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  for (let i = 0; i < 6; i += 1) {
    const kb = buffer.length / 1024;
    if (kb > maxKb && quality > 52) {
      quality -= 8;
    } else if (kb < minKb && quality < 88) {
      quality += 6;
    } else {
      break;
    }
    buffer = await sharp(buffer).webp({ quality, effort: 4 }).toBuffer();
  }
  fs.writeFileSync(dest, buffer);
  const meta = await sharp(buffer).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0, bytes: buffer.length };
}

function lightAdjust(img) {
  return img
    .rotate()
    .flatten({ background: CREAM })
    .modulate({ brightness: 1.03, saturation: 1.01 })
    .linear(1.05, -3);
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

async function writeCover(src, dest, focusX, focusY) {
  const base = lightAdjust(sharp(src));
  const meta = await sharp(src).rotate().metadata();
  const crop = crop43(meta.width ?? 1200, meta.height ?? 900, focusX, focusY);
  return encodeWebp(
    base.extract(crop).resize(1200, 900, { fit: "fill" }),
    dest,
    { minKb: 150, maxKb: 300, startQuality: 78 },
  );
}

async function writeWide(src, dest, maxWidth, sizeRange) {
  const meta = await sharp(src).rotate().metadata();
  const width = Math.min(maxWidth, meta.width ?? maxWidth);
  return encodeWebp(lightAdjust(sharp(src)).resize({ width, withoutEnlargement: true }), dest, sizeRange);
}

const jobs = [
  {
    slug: "merdekan-villa",
    section: "portfolio",
    category: "villa",
    country: "azerbaijan",
    title: "Merdekan Villa",
    coverFile: "001.jpeg",
    coverFocus: [0.5, 0.62],
    coverObjectPosition: "center 62%",
    images: [
      { file: "001.jpeg", kind: "exterior", objectPosition: "center 62%" },
      { file: "pool.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Terace.png", kind: "interior", objectPosition: "center" },
      { file: "20150508_142521.jpg", kind: "construction", folder: ["4 ptojekt", "merdekan villa", "tikinti foto"] },
      { file: "20150508_143039.jpg", kind: "construction", folder: ["4 ptojekt", "merdekan villa", "tikinti foto"] },
      { file: "20150508_143231.jpg", kind: "construction", folder: ["4 ptojekt", "merdekan villa", "tikinti foto"] },
    ],
    folder: ["4 ptojekt", "merdekan villa"],
    skipped: [
      "20150508_142603.jpg / 20150508_142606.jpg — same staircase angle as 142521",
      "20150508_143234.jpg / 20150508_143236.jpg — same construction view as 143231",
    ],
  },
  {
    slug: "sharur-yasayis-kompleksi",
    section: "portfolio",
    category: "yasayis-kompleksi",
    country: "azerbaijan",
    title: "Sharur Yaşayış Kompleksi",
    coverFile: "11.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "11.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "5.jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "1..jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "PHOTO-2024-02-22-16-13-17.jpg", kind: "construction" },
      { file: "PHOTO-2024-02-22-16-13-25.jpg", kind: "construction" },
      { file: "PHOTO-2024-09-08-21-02-37.jpg", kind: "construction" },
      { file: "PHOTO-2024-09-08-21-02-55.jpg", kind: "construction" },
    ],
    folder: ["sharur yasayis kompleks", "sharur kompleks"],
    skipped: [
      "PHOTO-2024-02-22-16-13-17 (1).jpg — duplicate of 16-13-17",
      "PHOTO-2024-02-22-16-13-25 (1).jpg / (2).jpg — duplicates",
      "PHOTO-2024-09-08-21-02-37 (1).jpg — duplicate",
      "PHOTO-2024-09-08-21-02-55 (1).jpg — duplicate",
      "Konsept.pdf — PDF, not used as a site image",
    ],
  },
  {
    slug: "exhibition-stands",
    section: "portfolio",
    category: "kommersiya",
    country: null,
    title: "Exhibition Stands",
    coverFile: "Stand-render-01.jpg",
    coverFocus: [0.5, 0.5],
    coverObjectPosition: "center",
    images: [
      { file: "Stand-render-01.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Estand-render-02.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Stand-render-03.jpg", kind: "exterior", objectPosition: "center" },
    ],
    folder: ["REV Zagatala+STANDS", "Exibition Stands"],
    skipped: [],
    note: "Filenames are renders, not documented as built-stand photos.",
  },
  {
    slug: "coworking-coliving-berlin",
    section: "projects",
    category: "yasayis-kompleksi",
    country: "germany",
    title: "Co-Working Co-Living Berlin",
    coverFile: "CO-Art-new-rn-1.jpg",
    coverFocus: [0.48, 0.42],
    coverObjectPosition: "center 42%",
    images: [
      { file: "CO-Art-new-rn-1.jpg", kind: "exterior", objectPosition: "center 42%" },
      { file: "Render-new.jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "1.jpg", kind: "exterior", objectPosition: "center" },
      { file: "render-innenhof_edited.jpg", kind: "exterior", objectPosition: "center" },
      { file: "interior-2.jpg", kind: "interior", objectPosition: "center" },
      { file: "EG.jpg", kind: "plan", objectPosition: "center" },
      { file: "Elevation-CoArt.jpg", kind: "section", objectPosition: "center" },
      { file: "Axsonometrie.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["3 Projects", "Co-Working Co-Living Berlin"],
    skipped: [],
  },
  {
    slug: "kopenick-berlin-living",
    section: "projects",
    category: "yasayis-kompleksi",
    country: "germany",
    title: "Köpenick Berlin Living",
    coverFile: "perspektiv-2.jpg",
    coverFocus: [0.5, 0.4],
    coverObjectPosition: "center 40%",
    images: [
      { file: "perspektiv-2.jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "004cc.jpg", kind: "exterior", objectPosition: "center" },
      { file: "new-002.jpg", kind: "exterior", objectPosition: "center" },
      { file: "entrance.jpg", kind: "exterior", objectPosition: "center" },
      { file: "interior.jpg", kind: "interior", objectPosition: "center" },
      { file: "Lageplan.jpg", kind: "plan", objectPosition: "center" },
      { file: "Ansicht-Sud.jpg", kind: "section", objectPosition: "center" },
      { file: "SchnittA-A.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["3 Projects", "Berlin Living"],
    skipped: [
      "new-002_edited.jpg — edited duplicate of new-002",
      "04ccc.jpg — similar to 004cc",
      "Boardinghaus.jpg / Familienwohnung.jpg / 3-OG.jpg / Blatt-04.jpg — extra plan/unit sheets",
      "Pikto-3.jpg / Pikto-4.jpg / Seite-2-Pikto.jpg — redundant diagrams",
    ],
  },
  {
    slug: "space-port-helgoland",
    section: "projects",
    category: "ictimai",
    country: "germany",
    title: "Space Port Helgoland",
    coverFile: "Render-07.jpg",
    coverFocus: [0.42, 0.55],
    coverObjectPosition: "42% 55%",
    images: [
      { file: "Render-07.jpg", kind: "exterior", objectPosition: "42% 55%" },
      { file: "Render-08.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Render-13.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Space Port-c.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Weltraumbahnhof.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Final_Interior-01.jpg", kind: "interior", objectPosition: "center" },
      { file: "EG-UG.jpg", kind: "plan", objectPosition: "center" },
      { file: "Ansicht-ost.jpg", kind: "section", objectPosition: "center" },
      { file: "Schnitt-A-A.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["3 Projects", "Space Port Helgoland"],
    skipped: [
      "Space Port-c_edited.jpg — edited duplicate",
      "Weltraumbahnhf.jpg — near-duplicate filename/view of Weltraumbahnhof",
      "Render-09.jpg / Render-12.jpg — similar exterior frames",
      "1-2OG.jpg / B-02.jpg / B-03.jpg / B-04.jpg / Space-s-S.jpg / Schnitt-C-C.jpg — extra sheets",
    ],
  },
  {
    slug: "gecler-kultur",
    section: "projects",
    category: "ictimai",
    country: null,
    title: "Gecler Kultur",
    coverFile: "ren1.jpg",
    coverFocus: [0.55, 0.42],
    coverObjectPosition: "55% 42%",
    images: [
      { file: "ren1.jpg", kind: "exterior", objectPosition: "55% 42%" },
      { file: "hoff.png", kind: "exterior", objectPosition: "center" },
      { file: "B-2f.jpg", kind: "plan", objectPosition: "center" },
      { file: "B-2b.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["4 ptojekt", "Gecler kultur"],
    skipped: ["B-2bde.jpg / B-2bde1.jpg — variants of B-2b"],
  },
  {
    slug: "high-hill-restaurant",
    section: "projects",
    category: "kommersiya",
    country: null,
    title: "High Hill Restaurant",
    coverFile: "hich hill1.jpg",
    coverFocus: [0.5, 0.4],
    coverObjectPosition: "center 40%",
    images: [
      { file: "hich hill1.jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "3D-Section.jpg", kind: "section", objectPosition: "center" },
      { file: "Hill-01.jpg", kind: "section", objectPosition: "center" },
      { file: "hill-02.jpg", kind: "plan", objectPosition: "center" },
      { file: "Section-.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["4 ptojekt", "High hill"],
    skipped: [],
  },
  {
    slug: "mount-pearl",
    section: "projects",
    category: "villa",
    country: null,
    title: "Mount Pearl",
    coverFile: "Mount pearl.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "Mount pearl.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "GENDO_MY_FIRST_PROJECT_04AD.png", kind: "exterior", objectPosition: "center" },
      { file: "GENDO_MY_FIRST_PROJECT_DF6F.png", kind: "exterior", objectPosition: "center" },
    ],
    folder: ["4 ptojekt", "Mount Pearl"],
    skipped: [],
  },
  {
    slug: "nar",
    section: "projects",
    category: "ictimai",
    country: null,
    title: "NAR",
    coverFile: "museum.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "museum.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "n-1.jpg", kind: "exterior", objectPosition: "center" },
      { file: "n-2.jpg", kind: "exterior", objectPosition: "center" },
      { file: "n-3.jpg", kind: "exterior", objectPosition: "center" },
      { file: "top view.jpg", kind: "exterior", objectPosition: "center" },
      { file: "top night view.jpg", kind: "exterior", objectPosition: "center" },
      { file: "NAR-0923_002.jpg", kind: "plan", objectPosition: "center" },
      { file: "Page-Y.jpg", kind: "section", objectPosition: "center" },
    ],
    folder: ["NPO+NAR", "NAR"],
    skipped: [
      "museum-2.jpg — similar museum view",
      "NAR-0923_005.jpg — similar plan sheet",
      "A.04.*.pdf — original PDFs left untouched",
    ],
  },
  {
    slug: "npo",
    section: "projects",
    category: "ictimai",
    country: null,
    title: "NPO",
    coverFile: "npo-01.jpg",
    coverFocus: [0.38, 0.4],
    coverObjectPosition: "38% 40%",
    images: [
      { file: "npo-01.jpg", kind: "exterior", objectPosition: "38% 40%" },
      { file: "npo-02.jpg", kind: "exterior", objectPosition: "center" },
      { file: "npo-03.jpg", kind: "exterior", objectPosition: "center" },
    ],
    folder: ["NPO+NAR", "NPO"],
    skipped: [],
  },
  {
    slug: "rev-zagatala",
    section: "projects",
    category: "ferdi-yasayis-evi",
    country: "azerbaijan",
    title: "REV Zagatala",
    coverFile: "01.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "01.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "02.jpg", kind: "exterior", objectPosition: "center" },
      { file: "03.jpg", kind: "exterior", objectPosition: "center" },
      { file: "05.jpg", kind: "exterior", objectPosition: "center" },
      { file: "x1.jpeg", kind: "construction", objectPosition: "center" },
      { file: "x3.jpeg", kind: "construction", objectPosition: "center" },
    ],
    folder: ["REV Zagatala+STANDS", "REV Zagatala"],
    skipped: ["x2.jpeg / x4.jpeg — smaller near-duplicate frames"],
  },
  {
    slug: "tsm",
    section: "projects",
    category: "ictimai",
    country: null,
    title: "TSM",
    coverFile: "tsm-001.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "tsm-001.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "tsm-002.jpg", kind: "exterior", objectPosition: "center" },
      { file: "tsm-003.jpg", kind: "exterior", objectPosition: "center" },
      { file: "0002.jpg", kind: "exterior", objectPosition: "center 40%" },
      { file: "0004.jpg", kind: "exterior", objectPosition: "center" },
      { file: "A1.jpg", kind: "section", objectPosition: "center" },
      { file: "1-ci mertebe plan.jpg", kind: "plan", objectPosition: "center" },
      { file: "4-cu mertebe plan.jpg", kind: "plan", objectPosition: "center" },
    ],
    folder: ["TSM texnopark", "TSM"],
    skipped: [],
  },
  {
    slug: "texnopark",
    section: "projects",
    category: "kommersiya",
    country: null,
    title: "Texnopark",
    coverFile: "texnopark-001.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "texnopark-001.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "tecnokark-02.jpg", kind: "exterior", objectPosition: "center" },
      { file: "texnopark-03.jpg", kind: "exterior", objectPosition: "center" },
    ],
    folder: ["TSM texnopark", "Texnopark"],
    skipped: [],
  },
  {
    slug: "tym",
    section: "projects",
    category: "ictimai",
    country: null,
    title: "TYM",
    coverFile: "TYM-1023_Viz-001-01.jpg",
    coverFocus: [0.5, 0.45],
    coverObjectPosition: "center 45%",
    images: [
      { file: "TYM-1023_Viz-001-01.jpg", kind: "exterior", objectPosition: "center 45%" },
      { file: "TYM-1023_Viz-004-01.jpg", kind: "exterior", objectPosition: "center" },
      { file: "TYM-1023_Viz-006.jpg", kind: "exterior", objectPosition: "center" },
    ],
    folder: ["TYM WKN", "TYM"],
    skipped: ["1-ci mertebe.pdf / 2-ci mertebe.pdf — original PDFs left untouched"],
  },
  {
    slug: "wnk-naxcivan",
    section: "projects",
    category: "yasayis-kompleksi",
    country: "azerbaijan",
    title: "WNK Naxçıvan",
    coverFile: "Vogelperspektiv1.jpg",
    coverFocus: [0.5, 0.42],
    coverObjectPosition: "center 42%",
    images: [
      { file: "Vogelperspektiv1.jpg", kind: "exterior", objectPosition: "center 42%" },
      { file: "Render-003-12.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Render-004-12.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Render-006.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Render-002.jpg", kind: "exterior", objectPosition: "center" },
      { file: "Render-map-001.jpg", kind: "plan", objectPosition: "center" },
    ],
    folder: ["TYM WKN", "WNK Naxcivan"],
    skipped: ["Render-002aa.jpg — aa variant of Render-002", "22030928-R03-05 (3).pdf — original PDF left untouched"],
  },
];

const certificates = [
  { id: "bachelor-diplom", file: "Bachelor Diplom.jpg", alt: "Bachelor diploma" },
  { id: "allplan-architecture", file: "Certificate-Allplan Architecture.jpg", alt: "Allplan Architecture certificate" },
  { id: "archicad-bim", file: "certificate-Archicad BIM.jpg", alt: "Archicad BIM certificate" },
  { id: "vorkurs", file: "Certificate-Vorkurs.jpg", alt: "Vorkurs certificate" },
  { id: "competition", file: "Competition-Certificate.jpg", alt: "Competition certificate" },
  { id: "interior-designer", file: "Interior Designer-Diplom.jpg", alt: "Interior Designer diploma" },
];

async function processProject(job) {
  const folder = resolveFolder(job.folder);
  const outDir = path.join(OUT_ROOT, job.slug);
  fs.mkdirSync(outDir, { recursive: true });

  const coverSrc = resolveFile(folder, job.coverFile);
  const coverDest = path.join(outDir, "cover.webp");
  const heroDest = path.join(outDir, "hero.webp");
  const [focusX, focusY] = job.coverFocus;
  const cover = await writeCover(coverSrc, coverDest, focusX, focusY);
  const hero = await writeWide(coverSrc, heroDest, 2400, { minKb: 300, maxKb: 700, startQuality: 76 });

  const gallery = [];
  for (const [index, image] of job.images.entries()) {
    const imageDir = image.folder ? resolveFolder(image.folder) : folder;
    const src = resolveFile(imageDir, image.file);
    const filename = `g${String(index + 1).padStart(2, "0")}.webp`;
    const dest = path.join(outDir, filename);
    const info = await writeWide(src, dest, 2000, { minKb: 280, maxKb: 700, startQuality: 76 });
    gallery.push({
      src: `/images/import/${job.slug}/${filename}`,
      kind: image.kind,
      objectPosition: image.objectPosition ?? "center",
      width: info.width,
      height: info.height,
      bytes: info.bytes,
      original: image.file,
    });
  }

  return {
    source: "raul-portfolio-folder-2026",
    slug: job.slug,
    section: job.section,
    category: job.category,
    country: job.country,
    title: job.title,
    note: job.note ?? null,
    skipped: job.skipped,
    cover: {
      src: `/images/import/${job.slug}/cover.webp`,
      objectPosition: job.coverObjectPosition,
      width: cover.width,
      height: cover.height,
      bytes: cover.bytes,
      original: job.coverFile,
    },
    hero: {
      src: `/images/import/${job.slug}/hero.webp`,
      objectPosition: job.coverObjectPosition,
      width: hero.width,
      height: hero.height,
      bytes: hero.bytes,
      original: job.coverFile,
    },
    gallery,
  };
}

async function processCertificates() {
  const folder = resolveFolder(["Ceritificates", "Ceritificates"]);
  const outDir = path.join(OUT_ROOT, "certificates");
  fs.mkdirSync(outDir, { recursive: true });
  const items = [];
  for (const cert of certificates) {
    const src = resolveFile(folder, cert.file);
    const dest = path.join(outDir, `${cert.id}.webp`);
    const info = await writeWide(src, dest, 1600, { minKb: 180, maxKb: 420, startQuality: 78 });
    items.push({
      source: "raul-portfolio-folder-2026",
      id: cert.id,
      src: `/images/import/certificates/${cert.id}.webp`,
      alt: cert.alt,
      width: info.width,
      height: info.height,
      original: cert.file,
    });
  }
  return {
    items,
    skipped: [
      "1687792387340.jpg — unclear document, not labeled",
      "Pre-foto.JPG — portrait photo, not a certificate",
      "Sertifikat.pdf / ZINCO sertifikat.pdf / Wallwachhaus PDF — originals left as PDF",
    ],
  };
}

const report = {
  source: "raul-portfolio-folder-2026",
  projects: [],
  certificates: null,
};

for (const job of jobs) {
  process.stdout.write(`Processing ${job.slug}...\n`);
  report.projects.push(await processProject(job));
}
report.certificates = await processCertificates();
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
process.stdout.write(`Wrote ${REPORT_PATH}\n`);
