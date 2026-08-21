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

if (!url || !key) {
  console.log("NO_CMS", Boolean(url), Boolean(key));
  process.exit(0);
}

async function rows(table) {
  const endpoint = url + "/rest/v1/" + table + "?select=*&order=sort_order.asc";
  const res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: "Bearer " + key },
  });
  const text = await res.text();
  if (!res.ok) return { error: res.status + " " + text.slice(0, 400) };
  return JSON.parse(text);
}

function brief(list) {
  if (list.error) return list;
  return {
    count: list.length,
    items: list.map((r) => ({
      id: r.id,
      slug: r.slug,
      status: r.status,
      active: r.is_active,
      category: r.category,
      country: r.country || null,
      cover: r.cover_path,
      og: r.og_image_path,
      gallery: Array.isArray(r.gallery) ? r.gallery.map((g) => g?.path || g) : [],
      location: r.location || null,
      area: r.area_m2 || null,
      sort: r.sort_order,
      seo_title: r.seo_title,
      canonical_url: r.canonical_url,
      published_at: r.published_at,
      created_at: r.created_at,
      titles: {
        az: r.translations?.az?.title || r.translations?.az?.name || "",
        en: r.translations?.en?.title || r.translations?.en?.name || "",
        de: r.translations?.de?.title || r.translations?.de?.name || "",
        ru: r.translations?.ru?.title || r.translations?.ru?.name || "",
      },
      legacy: r.translations?.az?.legacySourceId || r.translations?.en?.legacySourceId || "",
    })),
  };
}

const [projects, portfolio] = await Promise.all([rows("projects"), rows("portfolio")]);
const inventory = { projects: brief(projects), portfolio: brief(portfolio) };
writeFileSync("scripts/cms-inventory.json", JSON.stringify(inventory, null, 2));
console.log(
  JSON.stringify(
    {
      projectCount: inventory.projects.count ?? inventory.projects.error,
      portfolioCount: inventory.portfolio.count ?? inventory.portfolio.error,
      projectSlugs: inventory.projects.items?.map((i) => i.slug),
      portfolioSlugs: inventory.portfolio.items?.map((i) => i.slug),
    },
    null,
    2,
  ),
);
