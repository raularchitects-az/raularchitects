import fs from "node:fs";
import path from "node:path";
import manifest from "../src/data/raul-portfolio-manifest.json" with { type: "json" };

const titles = Object.fromEntries(manifest.projects.map((item) => [item.slug, item.title]));
const projectSlugs = manifest.projects.filter((item) => item.section === "projects").map((item) => item.slug);
const portfolioSlugs = manifest.projects.filter((item) => item.section === "portfolio").map((item) => item.slug);

for (const locale of ["az", "en", "ru", "de"]) {
  const file = path.resolve("messages", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const slug of projectSlugs) {
    data.projectsPage.items[slug] = { title: titles[slug], specs: [] };
    data.projectDetail.items[slug] = { title: titles[slug], specs: [], description: "" };
  }

  data.portfolioPage.items = data.portfolioPage.items ?? {};
  for (const slug of portfolioSlugs) {
    data.portfolioPage.items[slug] = { title: titles[slug] };
  }

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`patched ${file}`);
}
