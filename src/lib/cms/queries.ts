import { unstable_cache } from "next/cache";
import { cache } from "react";
import { isMissingRelationError } from "./missing-table";
import { sortRowsBySortOrder } from "./legacy";
import { createAdminClient, createPublicReadClient, createServiceClient } from "./supabase";
import type { AuditRow, CmsRow, ContentStatus, MediaRow } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(id: string) {
  return UUID_RE.test(id);
}

function normalizeMediaRow(row: Record<string, unknown>): MediaRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  const path = typeof row.path === "string" ? row.path : "";
  if (!id || !path) return null;
  return {
    id,
    path,
    bucket: typeof row.bucket === "string" && row.bucket ? row.bucket : "media",
    mime: typeof row.mime === "string" ? row.mime : "",
    size_bytes: typeof row.size_bytes === "number" ? row.size_bytes : 0,
    alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
    width: typeof row.width === "number" ? row.width : null,
    height: typeof row.height === "number" ? row.height : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export type { CmsRow, ContentStatus };
export type EntityType =
  | "projects"
  | "portfolio"
  | "blog_posts"
  | "insights"
  | "services"
  | "site_settings"
  | "media";

export async function listEntity(table: EntityType) {
  const supabase = await createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) {
    if (table === "insights" && isMissingRelationError(error)) return [];
    throw error;
  }
  const rows = (data ?? []) as CmsRow[];
  return table === "projects" ? sortRowsBySortOrder(rows) : rows;
}

export async function getEntity(table: EntityType, id: string) {
  if (!isUuid(id)) return null;
  const supabase = await createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) {
    if (table === "insights" && isMissingRelationError(error)) return null;
    console.error("[cms] getEntity", table, error.code, error.message);
    return null;
  }
  return (data ?? null) as CmsRow | null;
}

export type CatalogTable = "projects" | "portfolio" | "blog_posts" | "insights" | "services";

async function fetchPublished(table: CatalogTable) {
  const client = createPublicReadClient();
  if (!client) return [] as CmsRow[];
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    if (isMissingRelationError(error)) return [] as CmsRow[];
    console.error(`[cms] public ${table}`, error.code, error.message);
    return [] as CmsRow[];
  }
  return (data ?? []) as CmsRow[];
}

export const getPublished = cache(async (table: CatalogTable) =>
  unstable_cache(() => fetchPublished(table), ["cms-published", table], {
    revalidate: 60,
    tags: ["cms", `cms-${table}`],
  })(),
);

async function fetchCatalogRows(table: CatalogTable) {
  const client = createServiceClient() ?? createPublicReadClient();
  if (!client) return [] as CmsRow[];
  const { data, error } = await client.from(table).select("*").order("sort_order", { ascending: true });
  if (error) {
    if (isMissingRelationError(error)) return [] as CmsRow[];
    console.error(`[cms] catalog ${table}`, error.code, error.message);
    return [] as CmsRow[];
  }
  return (data ?? []) as CmsRow[];
}

export const getCatalogRows = cache(async (table: CatalogTable) =>
  unstable_cache(() => fetchCatalogRows(table), ["cms-catalog", table], {
    revalidate: 60,
    tags: ["cms", `cms-${table}`],
  })(),
);

export async function getPublishedBySlug(table: CatalogTable, slug: string) {
  const rows = await getPublished(table);
  return rows.find((row) => row.slug === slug) ?? null;
}

export const findRedirect = cache(async (fromPath: string) =>
  unstable_cache(
    async () => {
      const client = createPublicReadClient();
      if (!client) return null;
      const { data } = await client.from("redirects").select("*").eq("from_path", fromPath).maybeSingle();
      return (data as { to_path: string; status_code: number } | null) ?? null;
    },
    ["cms-redirect", fromPath],
    { revalidate: 60, tags: ["cms", "cms-redirects"] },
  )(),
);

export async function getSettingsAdmin(key: string) {
  const supabase = await createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as Record<string, unknown> | undefined) ?? null;
}

export const getSettings = cache(async (key: string) =>
  unstable_cache(
    async () => {
      const client = createPublicReadClient();
      if (!client) return null;
      const { data } = await client.from("site_settings").select("value").eq("key", key).maybeSingle();
      return (data?.value as Record<string, unknown> | undefined) ?? null;
    },
    ["cms-settings", key],
    { revalidate: 60, tags: ["cms", "cms-settings"] },
  )(),
);

export async function loadMedia(): Promise<{ items: MediaRow[]; error: string | null }> {
  try {
    const supabase = await createAdminClient();
    if (!supabase) return { items: [], error: "CMS configured deyil" };
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[cms] listMedia", error.code, error.message);
      return { items: [], error: "Media siyahısı yüklənmədi" };
    }
    const items = ((data ?? []) as Record<string, unknown>[])
      .map(normalizeMediaRow)
      .filter((row): row is MediaRow => row !== null);
    return { items, error: null };
  } catch (error) {
    console.error("[cms] listMedia", error);
    return { items: [], error: "Media siyahısı yüklənmədi" };
  }
}

export async function listMedia() {
  return (await loadMedia()).items;
}

export async function dashboardStats() {
  const empty = { total: 0, published: 0, draft: 0 };
  const supabase = await createAdminClient();
  if (!supabase) {
    return {
      projects: empty,
      portfolio: empty,
      blog: empty,
      insights: empty,
    };
  }
  const count = async (table: string, status?: ContentStatus) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count: n, error } = await q;
    if (error) {
      if (isMissingRelationError(error)) return 0;
      console.error("[cms] dashboardStats", table, error.code, error.message);
      return 0;
    }
    return n ?? 0;
  };
  const [pt, pp, pd, ot, op, od, bt, bp, bd, it, ip, id] = await Promise.all([
    count("projects"),
    count("projects", "published"),
    count("projects", "draft"),
    count("portfolio"),
    count("portfolio", "published"),
    count("portfolio", "draft"),
    count("blog_posts"),
    count("blog_posts", "published"),
    count("blog_posts", "draft"),
    count("insights"),
    count("insights", "published"),
    count("insights", "draft"),
  ]);
  return {
    projects: { total: pt, published: pp, draft: pd },
    portfolio: { total: ot, published: op, draft: od },
    blog: { total: bt, published: bp, draft: bd },
    insights: { total: it, published: ip, draft: id },
  };
}

export async function recentAudit(limit = 12) {
  const supabase = await createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("audit_logs")
    .select("id, user_id, action, entity_type, entity_id, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AuditRow[];
}

export async function listRevisions(entityType: string, entityId: string) {
  if (!isUuid(entityId)) return [];
  const supabase = await createAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("content_revisions")
    .select("id, created_at, created_by")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
