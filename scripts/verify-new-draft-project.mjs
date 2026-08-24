/**
 * Verifies new-project behaviour is untouched by the CMS-precedence change:
 * inserts a throwaway draft (no static/import counterpart), checks it is not
 * public, publishes it, checks it renders from CMS in all four locales, then
 * hard-deletes the throwaway row.
 *
 * Usage: node scripts/verify-new-draft-project.mjs [origin]
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
const origin = process.argv[2] || "http://localhost:3000";
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const slug = `zz-sync-test-draft-${Date.now()}`;
const paths = {
  az: `/az/layihelar/${slug}`,
  en: `/en/projects/${slug}`,
  de: `/de/layihelar/${slug}`,
  ru: `/ru/layihelar/${slug}`,
};
const image = "/images/projects/compact-villa.jpg";

async function statuses() {
  const out = {};
  for (const [locale, path] of Object.entries(paths)) {
    const res = await fetch(`${origin}${path}`, { cache: "no-store" });
    const html = await res.text();
    out[locale] = { status: res.status, gallery: html.includes(image) };
  }
  return out;
}

async function poll(check, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const result = await statuses();
    if (check(result) || Date.now() > deadline) return result;
    await new Promise((r) => setTimeout(r, 3000));
  }
}

const translations = Object.fromEntries(
  ["az", "en", "de", "ru"].map((l) => [l, { title: `Sync Test Draft ${l}`, name: `Sync Test Draft ${l}`, body: `draft body ${l}` }]),
);

const insert = await fetch(`${url}/rest/v1/projects`, {
  method: "POST",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({
    slug,
    category: "villa",
    status: "draft",
    is_active: true,
    translations,
    gallery: [{ path: image }],
  }),
});
const insertText = await insert.text();
if (!insert.ok) {
  console.log("INSERT FAILED", insert.status, insertText.slice(0, 300));
  process.exit(1);
}
const row = JSON.parse(insertText)[0];
console.log(`inserted draft ${slug} (${row.id})`);

try {
  const draft = await poll((r) => Object.values(r).every((v) => v.status === 404));
  console.log("DRAFT HIDDEN", Object.values(draft).every((v) => v.status === 404) ? "PASS" : "FAIL");
  console.log(JSON.stringify(draft));

  await fetch(`${url}/rest/v1/projects?id=eq.${row.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "published", published_at: new Date().toISOString() }),
  });
  const live = await poll((r) => Object.values(r).every((v) => v.status === 200 && v.gallery));
  console.log("PUBLISHED VISIBLE", Object.values(live).every((v) => v.status === 200 && v.gallery) ? "PASS" : "FAIL");
  console.log(JSON.stringify(live));
} finally {
  const del = await fetch(`${url}/rest/v1/projects?id=eq.${row.id}`, { method: "DELETE", headers });
  console.log("cleanup delete status", del.status);
  const check = await fetch(`${url}/rest/v1/projects?select=id&slug=eq.${slug}`, { headers });
  console.log("rows left:", JSON.parse(await check.text()).length);
}
