import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createAdminClient, createPublicReadClient } from "./supabase";
import type { AuditRow, CmsRow, ContentStatus, MediaRow } from "./types";

export type { CmsRow, ContentStatus };
export type EntityType = "projects" | "portfolio" | "blog_posts" | "services" | "site_settings" | "media";

export async function listEntity(table: EntityType) {
  const supabase = await createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsRow[];
}

export async function getEntity(table: EntityType, id: string) {
  const supabase = await createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as CmsRow | null;
}

async function fetchPublished(table: "projects" | "portfolio" | "blog_posts" | "services") {
  const client = createPublicReadClient();
  if (!client) return [] as CmsRow[];
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("status", "published")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error(`[cms] public ${table}`, error.code, error.message);
    return [] as CmsRow[];
  }
  return (data ?? []) as CmsRow[];
}

export const getPublished = cache(async (table: "projects" | "portfolio" | "blog_posts" | "services") =>
  unstable_cache(() => fetchPublished(table), ["cms-published", table], {
    revalidate: 60,
    tags: ["cms", `cms-${table}`],
  })(),
);

export async function getPublishedBySlug(
  table: "projects" | "portfolio" | "blog_posts" | "services",
  slug: string,
) {
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

export async function listMedia() {
  const supabase = await createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MediaRow[];
}

export async function dashboardStats() {
  const supabase = await createAdminClient();
  if (!supabase) {
    return {
      projects: { total: 0, published: 0, draft: 0 },
      portfolio: { total: 0, published: 0, draft: 0 },
      blog: { total: 0, published: 0, draft: 0 },
    };
  }
  const count = async (table: string, status?: ContentStatus) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count: n } = await q;
    return n ?? 0;
  };
  const [pt, pp, pd, ot, op, od, bt, bp, bd] = await Promise.all([
    count("projects"),
    count("projects", "published"),
    count("projects", "draft"),
    count("portfolio"),
    count("portfolio", "published"),
    count("portfolio", "draft"),
    count("blog_posts"),
    count("blog_posts", "published"),
    count("blog_posts", "draft"),
  ]);
  return {
    projects: { total: pt, published: pp, draft: pd },
    portfolio: { total: ot, published: op, draft: od },
    blog: { total: bt, published: bp, draft: bd },
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
