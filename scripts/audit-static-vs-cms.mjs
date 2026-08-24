/**
 * Read-only diagnostic: compare each static import entry (portfolio-folder 2026
 * and 13-project) against its CMS project row, so we can see exactly what a
 * "CMS is source of truth" switch would change per slug.
 *
 * Usage: node scripts/audit-static-vs-cms.mjs
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = (env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.log("NO_CMS", Boolean(url), Boolean(key));
  process.exit(0);
}

const portfolio = JSON.parse(readFileSync("src/data/raul-portfolio-manifest.json", "utf8")).projects;
const thirteen = JSON.parse(readFileSync("src/data/raul-13-project-manifest.json", "utf8")).projects;
const statics = [...portfolio, ...thirteen];

const res = await fetch(`${url}/rest/v1/projects?select=*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const rows = JSON.parse(await res.text());
const bySlug = new Map(rows.map((row) => [row.slug, row]));

const problems = [];
for (const entry of statics) {
  const row = bySlug.get(entry.slug);
  const staticGallery = entry.gallery?.length ?? 0;
  const hasVideo = Boolean(entry.video);
  if (!row) {
    console.log(`NO_CMS_ROW      ${entry.slug} (static gallery=${staticGallery}, video=${hasVideo})`);
    continue;
  }
  const cmsGallery = (row.gallery ?? []).length;
  const cmsVideo = Boolean(row.video_url);
  const flags = [];
  if (cmsGallery === 0 && staticGallery > 0) flags.push(`GALLERY_WOULD_EMPTY(static=${staticGallery})`);
  if (hasVideo && !cmsVideo) flags.push("VIDEO_WOULD_DISAPPEAR");
  if (flags.length) problems.push(`${entry.slug}: ${flags.join(", ")}`);
  console.log(
    `${entry.slug.padEnd(34)} cmsGallery=${String(cmsGallery).padEnd(3)} staticGallery=${String(staticGallery).padEnd(3)} cmsVideo=${String(cmsVideo).padEnd(5)} staticVideo=${hasVideo}`,
  );
}

console.log("\n--- would-regress ---");
console.log(problems.length ? problems.join("\n") : "none");
