/**
 * Round-trip verification for CMS -> public sync of an existing (imported)
 * project. Snapshots the row, applies a safe text edit plus a gallery
 * add/remove, checks all four public locales, then restores the snapshot byte
 * for byte and re-checks.
 *
 * Usage: node scripts/verify-project-sync.mjs [slug] [origin]
 */
import { readFileSync, writeFileSync } from "node:fs";

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
const slug = process.argv[2] || "space-port-helgoland";
const origin = process.argv[3] || "http://localhost:3000";

if (!url || !key) {
  console.log("NO_CMS");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const LOCALE_PATHS = {
  az: `/az/layihelar/${slug}`,
  en: `/en/projects/${slug}`,
  de: `/de/layihelar/${slug}`,
  ru: `/ru/layihelar/${slug}`,
};

async function readRow() {
  const res = await fetch(`${url}/rest/v1/projects?select=*&slug=eq.${encodeURIComponent(slug)}`, { headers });
  const [row] = JSON.parse(await res.text());
  if (!row) throw new Error(`row not found: ${slug}`);
  return row;
}

async function patchRow(patch) {
  const res = await fetch(`${url}/rest/v1/projects?slug=eq.${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`patch failed ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text)[0];
}

/** Dev keeps a short data cache, so poll until the page reflects the write. */
async function probe(expect, { timeoutMs = 90000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const results = {};
    let ok = true;
    for (const [locale, path] of Object.entries(LOCALE_PATHS)) {
      const res = await fetch(`${origin}${path}`, { cache: "no-store" });
      const html = await res.text();
      const checks = expect(html, locale);
      results[locale] = { status: res.status, ...checks };
      if (res.status !== 200 || Object.values(checks).some((v) => v === false)) ok = false;
    }
    if (ok || Date.now() > deadline) return { ok, results };
    await new Promise((r) => setTimeout(r, 3000));
  }
}

const original = await readRow();
writeFileSync(`scripts/.snapshot-${slug}.json`, JSON.stringify(original, null, 2));
console.log(`snapshot saved: gallery=${(original.gallery ?? []).length}`);

const MARKER = `SYNC-TEST-${Date.now()}`;
const galleryPaths = (original.gallery ?? []).map((g) => g.path);
const removed = galleryPaths[galleryPaths.length - 1];
const added = "/images/import/space-port-helgoland/g01.webp";

try {
  const translations = JSON.parse(JSON.stringify(original.translations ?? {}));
  for (const locale of ["az", "en", "de", "ru"]) {
    translations[locale] = { ...(translations[locale] ?? {}), body: `${MARKER} ${locale}` };
  }
  const nextGallery = [
    ...galleryPaths.slice(0, -1).map((path) => ({ path })),
    { path: added },
  ];

  await patchRow({ translations, gallery: nextGallery });
  console.log(`applied: body marker + removed ${removed} + added ${added}`);

  const after = await probe((html, locale) => ({
    textUpdated: html.includes(`${MARKER} ${locale}`),
    removedGone: !html.includes(removed),
    addedVisible: html.includes(added),
  }));
  console.log("EDIT CHECK", after.ok ? "PASS" : "FAIL");
  console.log(JSON.stringify(after.results, null, 1));
} finally {
  await patchRow({ translations: original.translations, gallery: original.gallery });
  console.log("restored original translations + gallery");
}

const restored = await readRow();
const identical =
  JSON.stringify(restored.translations) === JSON.stringify(original.translations) &&
  JSON.stringify(restored.gallery) === JSON.stringify(original.gallery);
console.log("RESTORE EXACT", identical ? "PASS" : "FAIL");

const back = await probe((html) => ({
  markerGone: !html.includes("SYNC-TEST-"),
  removedBack: html.includes(removed),
  addedGone: !html.includes(added),
}));
console.log("RESTORE CHECK", back.ok ? "PASS" : "FAIL");
console.log(JSON.stringify(back.results, null, 1));
