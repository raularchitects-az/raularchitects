import type { EntityType } from "./queries";

export type MediaUsage = {
  table: EntityType | "site_settings";
  slug: string;
  field: string;
  label: string;
};

const CONTENT_TABLES: EntityType[] = ["projects", "portfolio", "blog_posts", "services"];

const TABLE_LABEL: Record<string, string> = {
  projects: "Layihə",
  portfolio: "Portfolio",
  blog_posts: "Bloq",
  services: "Xidmət",
  site_settings: "Səhifə",
};

function storageObjectPath(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return "";
  return path;
}

function pathMatches(value: string, mediaPath: string) {
  if (!value || !mediaPath) return false;
  if (value === mediaPath) return true;
  if (value.endsWith(`/${mediaPath}`)) return true;
  try {
    const url = new URL(value);
    return url.pathname.endsWith(`/${mediaPath}`) || url.pathname.endsWith(mediaPath);
  } catch {
    return value.includes(mediaPath);
  }
}

function walkStrings(value: unknown, visit: (text: string, field: string) => void, field = "value") {
  if (typeof value === "string") {
    visit(value, field);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, `${field}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walkStrings(child, visit, field === "value" ? key : `${field}.${key}`);
    }
  }
}

export function collectStoragePaths(row: Record<string, unknown>) {
  const paths = new Set<string>();
  walkStrings(row, (text) => {
    const path = storageObjectPath(text);
    if (path) paths.add(path);
  });
  return [...paths];
}

export function rowUsesStoragePath(row: Record<string, unknown>, path: string) {
  let used = false;
  walkStrings(row, (text) => {
    if (pathMatches(text, path)) used = true;
  });
  return used;
}

function titleOf(row: Record<string, unknown>) {
  const translations = (row.translations ?? {}) as Record<string, { title?: string; name?: string }>;
  return translations.az?.title || translations.az?.name || translations.en?.title || String(row.slug ?? row.id ?? "");
}

export async function findMediaUsages(
  // PostgREST builder is thenable after .select(); keep this loosely typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  mediaPath: string,
): Promise<MediaUsage[]> {
  const usages: MediaUsage[] = [];
  const seen = new Set<string>();

  const add = (usage: MediaUsage) => {
    const key = `${usage.table}:${usage.slug}:${usage.field}`;
    if (seen.has(key)) return;
    seen.add(key);
    usages.push(usage);
  };

  for (const table of CONTENT_TABLES) {
    const { data } = await supabase.from(table).select("*");
    for (const raw of data ?? []) {
      const row = raw as Record<string, unknown>;
      walkStrings(row, (text, field) => {
        if (!pathMatches(text, mediaPath)) return;
        add({
          table,
          slug: String(row.slug ?? row.id ?? ""),
          field,
          label: `${TABLE_LABEL[table]} “${titleOf(row)}”`,
        });
      });
    }
  }

  const { data: settings } = await supabase.from("site_settings").select("key, value");
  for (const raw of settings ?? []) {
    const row = raw as { key?: string; value?: unknown };
    walkStrings(row.value, (text, field) => {
      if (!pathMatches(text, mediaPath)) return;
      add({
        table: "site_settings",
        slug: String(row.key ?? "settings"),
        field,
        label: `${TABLE_LABEL.site_settings} (${row.key ?? "settings"})`,
      });
    });
  }

  return usages;
}

export function formatMediaUsageError(usages: MediaUsage[]) {
  const lines = usages.map((usage) => `${usage.label} — ${usage.field}`);
  return `Bu fayl hələ istifadə olunur, silinmədi:\n${lines.join("\n")}`;
}
