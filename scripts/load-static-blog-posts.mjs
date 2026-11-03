/**
 * Loads static blog posts from src/data/blog/posts/*.ts into CMS-like rows
 * for TTS (title / excerpt / body markdown).
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const postsDir = path.join(root, "src/data/blog/posts");

function blocksToBody(blocks) {
  const lines = [];
  for (const block of blocks || []) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "p" || block.type === "h2" || block.type === "h3") {
      const prefix = block.type === "h2" ? "## " : block.type === "h3" ? "### " : "";
      lines.push(`${prefix}${block.text || ""}`);
      lines.push("");
    } else if (block.type === "ul" && Array.isArray(block.items)) {
      for (const item of block.items) lines.push(`- ${item}`);
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}

function loadPostModule(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (id) => {
    if (id.endsWith("/types") || id.includes("types")) return {};
    throw new Error(`Unexpected import in static blog post: ${id}`);
  };
  new vm.Script(`(function(module,exports,require){${code}})`).runInThisContext()(loaded, loaded.exports, localRequire);
  const values = Object.values(loaded.exports);
  const post = values.find((value) => value && typeof value === "object" && value.slug && value.copy);
  if (!post) throw new Error(`No BlogPost export in ${filePath}`);
  return post;
}

export function staticPostToAudioRow(post) {
  const translations = {};
  for (const [locale, copy] of Object.entries(post.copy || {})) {
    if (!copy?.title) continue;
    translations[locale] = {
      title: copy.title,
      excerpt: copy.excerpt || copy.description || "",
      description: copy.description || "",
      body: blocksToBody(copy.blocks),
      published: copy.published !== false,
    };
  }
  return {
    slug: post.slug,
    status: "published",
    published_at: post.publishedAt || null,
    created_at: post.publishedAt || null,
    translations,
    source: "static",
  };
}

/** All static posts under src/data/blog/posts. */
export function loadStaticBlogAudioRows() {
  return fs
    .readdirSync(postsDir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => staticPostToAudioRow(loadPostModule(path.join(postsDir, name))));
}
