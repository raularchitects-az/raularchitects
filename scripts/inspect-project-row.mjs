/**
 * Read-only diagnostic: dump one CMS project row (slug via argv) so we can
 * compare it against the static/imported fallback data.
 *
 * Usage: node scripts/inspect-project-row.mjs space-port-helgoland
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
const slug = process.argv[2] || "space-port-helgoland";

if (!url || !key) {
  console.log("NO_CMS", Boolean(url), Boolean(key));
  process.exit(0);
}

const res = await fetch(`${url}/rest/v1/projects?select=*&slug=eq.${encodeURIComponent(slug)}`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const text = await res.text();
if (!res.ok) {
  console.log("ERROR", res.status, text.slice(0, 400));
  process.exit(1);
}

const rows = JSON.parse(text);
console.log("rows:", rows.length);
for (const row of rows) {
  console.log(
    JSON.stringify(
      {
        id: row.id,
        slug: row.slug,
        status: row.status,
        is_active: row.is_active,
        sort_order: row.sort_order,
        cover_path: row.cover_path,
        gallery: row.gallery,
        location: row.location,
        area_m2: row.area_m2,
        sections: row.sections
          ? Object.fromEntries(
              Object.entries(row.sections).map(([k, v]) => [k, { media: (v?.media ?? []).length }]),
            )
          : null,
        legacySourceIds: Object.fromEntries(
          ["az", "en", "de", "ru"].map((l) => [l, row.translations?.[l]?.legacySourceId ?? null]),
        ),
        bodyPreview: Object.fromEntries(
          ["az", "en", "de", "ru"].map((l) => [
            l,
            String(row.translations?.[l]?.body ?? row.translations?.[l]?.full ?? "").slice(0, 60),
          ]),
        ),
        updated_at: row.updated_at,
      },
      null,
      2,
    ),
  );
}
