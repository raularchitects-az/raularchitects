"use server";

import { revalidatePath, refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "./auth";
import { createAdminClient, createUserServerClient, createServiceClient } from "./supabase";
import { mediaPublicUrl } from "./media-url";
import { slugify } from "@/lib/slugify";
import { routing } from "@/i18n/routing";
import { fallbackBlogSlugs } from "@/lib/blog-urls";
import {
  LEGACY_HIDDEN_SETTINGS_KEY,
  LEGACY_MIGRATION_SETTINGS_KEY,
  hasExplicitLegacySourceId,
  legacySourceId,
  parseHiddenLegacyIds,
  readLegacySourceId,
  withLegacySourceId,
  type LegacyKind,
} from "./legacy";
import { buildLegacyPortfolioRows, buildLegacyProjectRows, listLegacyCatalogCounts } from "./legacy-import";
import type { ContentStatus, EntityType } from "./queries";
import type { Translations } from "./types";

async function audit(
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
  before?: unknown,
  after?: unknown,
) {
  const { user } = await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) return;
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    before: before ?? null,
    after: after ?? null,
  });
}

async function saveRevision(entityType: string, entityId: string, payload: unknown) {
  const { user } = await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) return;
  await supabase.from("content_revisions").insert({
    entity_type: entityType,
    entity_id: entityId,
    payload,
    created_by: user.id,
  });
}

function revalidatePublic(table?: EntityType, slug?: string) {
  updateTag("cms");
  if (table) updateTag(`cms-${table}`);
  refresh();
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/layihelar`);
    revalidatePath(`/${locale}/portfolio`);
    revalidatePath(`/${locale}/bloq`);
    if (table === "projects" && slug) {
      revalidatePath(`/${locale}/layihelar/${slug}`);
    }
    if (table === "portfolio" && slug) {
      revalidatePath(`/${locale}/portfolio/${slug}`);
    }
    if (table === "blog_posts" && slug) {
      revalidatePath(`/${locale}/bloq/${slug}`);
    }
  }
}

function throwIfError(error: { message?: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function kindForTable(table: EntityType): LegacyKind | null {
  if (table === "projects") return "project";
  if (table === "portfolio") return "portfolio";
  return null;
}

async function syncLegacyHidden(
  supabase: NonNullable<Awaited<ReturnType<typeof createAdminClient>>>,
  table: EntityType,
  row: { slug: string; translations?: Translations | null },
  hide: boolean,
) {
  const kind = kindForTable(table);
  if (!kind) return;
  const id = readLegacySourceId(row, kind);
  const { data } = await supabase.from("site_settings").select("value").eq("key", LEGACY_HIDDEN_SETTINGS_KEY).maybeSingle();
  const ids = new Set(parseHiddenLegacyIds((data?.value ?? {}) as Record<string, unknown>));
  if (hide) ids.add(id);
  else ids.delete(id);
  const { error } = await supabase.from("site_settings").upsert({
    key: LEGACY_HIDDEN_SETTINGS_KEY,
    value: { ids: [...ids] },
    updated_at: new Date().toISOString(),
  });
  throwIfError(error, "Legacy gizlətmə siyahısı yazılmadı");
}

function storageObjectPath(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return "";
  return path;
}

function collectStoragePaths(row: Record<string, unknown>) {
  const paths = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value !== "string") return;
    const path = storageObjectPath(value);
    if (path) paths.add(path);
  };
  add(row.cover_path);
  add(row.og_image_path);
  add(row.image_path);
  add(row.video_url);
  const gallery = row.gallery;
  if (Array.isArray(gallery)) {
    for (const item of gallery) {
      if (item && typeof item === "object" && "path" in item) add((item as { path?: string }).path);
      else add(item);
    }
  }
  const sections = row.sections;
  if (sections && typeof sections === "object") {
    for (const block of Object.values(sections as Record<string, { media?: { path?: string }[] }>)) {
      for (const item of block?.media ?? []) add(item?.path);
    }
  }
  return [...paths];
}

function rowUsesStoragePath(row: Record<string, unknown>, path: string) {
  return collectStoragePaths(row).includes(path);
}

function publicPathFor(table: EntityType, slug?: string) {
  if (table === "projects") return slug ? `/layihelar/${slug}` : "/layihelar";
  if (table === "portfolio") return slug ? `/portfolio/${slug}` : "/portfolio";
  if (table === "blog_posts") return slug ? `/bloq/${slug}` : "/bloq";
  if (table === "services") return slug ? `/xidmetler/${slug}` : "/xidmetler";
  return "/";
}

const ALLOWED_COLUMNS: Record<EntityType, readonly string[]> = {
  projects: [
    "slug",
    "category",
    "location",
    "area_m2",
    "status",
    "is_active",
    "sort_order",
    "cover_path",
    "og_image_path",
    "video_url",
    "canonical_url",
    "seo_title",
    "meta_description",
    "translations",
    "sections",
    "gallery",
    "published_at",
  ],
  portfolio: [
    "slug",
    "category",
    "country",
    "service_filter",
    "status",
    "is_active",
    "sort_order",
    "cover_path",
    "og_image_path",
    "video_url",
    "canonical_url",
    "seo_title",
    "meta_description",
    "translations",
    "gallery",
    "published_at",
  ],
  blog_posts: [
    "slug",
    "category",
    "status",
    "is_active",
    "show_on_home",
    "featured",
    "sort_order",
    "cover_path",
    "og_image_path",
    "video_url",
    "canonical_url",
    "seo_title",
    "meta_description",
    "translations",
    "published_at",
  ],
  services: [
    "slug",
    "icon",
    "number",
    "sort_order",
    "is_active",
    "show_on_home",
    "status",
    "image_path",
    "cover_path",
    "og_image_path",
    "video_url",
    "canonical_url",
    "seo_title",
    "meta_description",
    "translations",
  ],
  site_settings: ["key", "value"],
  media: ["path", "bucket", "mime", "size_bytes", "alt_text", "width", "height"],
};

function pickColumns(table: EntityType, payload: Record<string, unknown>) {
  const allowed = new Set(ALLOWED_COLUMNS[table]);
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (allowed.has(key)) row[key] = value;
  }
  row.updated_at = new Date().toISOString();
  return row;
}

export async function upsertRecord(table: EntityType, id: string | null, payload: Record<string, unknown>) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");

  const row = pickColumns(table, payload);
  if (typeof row.slug === "string" && row.slug) {
    row.slug = slugify(String(row.slug));
  }
  if (row.status === "published" && !row.published_at) {
    row.published_at = new Date().toISOString();
  }

  if (table === "blog_posts") {
    const translations = (row.translations ?? {}) as Translations;
    for (const locale of routing.locales) {
      const block = translations[locale] ?? {};
      if (block.slug) block.slug = slugify(String(block.slug));
      translations[locale] = block;
    }
    const azSlug = translations.az?.slug || String(row.slug ?? "");
    row.slug = slugify(azSlug);
    row.translations = translations;
    if (!row.slug) throw new Error("AZ slug tələb olunur");

    const { data: others } = await supabase.from("blog_posts").select("id, slug, translations");
    for (const locale of routing.locales) {
      const candidate = translations[locale]?.slug?.trim();
      if (!candidate) continue;
      const clash = (others ?? []).some((other) => {
        if (id && other.id === id) return false;
        if (other.slug === candidate) return true;
        const otherT = (other.translations ?? {}) as Translations;
        return routing.locales.some((code) => otherT[code]?.slug === candidate);
      });
      if (clash) throw new Error(`“${candidate}” slug-u (${locale}) artıq mövcuddur`);
    }
  }

  if (id) {
    const { data: existing } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    if (existing) {
      await saveRevision(table, id, existing);
      const oldSlug = existing.slug as string | undefined;
      const newSlug = row.slug as string | undefined;
      if (oldSlug && newSlug && oldSlug !== newSlug) {
        const from = publicPathFor(table, oldSlug);
        const to = publicPathFor(table, newSlug);
        await supabase.from("redirects").upsert(
          { from_path: from, to_path: to, status_code: 301 },
          { onConflict: "from_path" },
        );
      }
      if (table === "blog_posts") {
        const prevT = (existing.translations ?? {}) as Translations;
        const nextT = (row.translations ?? {}) as Translations;
        const mapped = fallbackBlogSlugs(String(oldSlug || newSlug || ""));
        for (const locale of routing.locales) {
          const previous = prevT[locale]?.slug || mapped[locale] || oldSlug;
          const next = nextT[locale]?.slug || newSlug;
          if (previous && next && previous !== next) {
            await supabase.from("redirects").upsert(
              { from_path: `/bloq/${previous}`, to_path: `/bloq/${next}`, status_code: 301 },
              { onConflict: "from_path" },
            );
          }
        }
      }
    }
    const { data: updated, error } = await supabase.from(table).update(row).eq("id", id).select("id, slug").maybeSingle();
    throwIfError(error, "Yenilənmədi");
    if (!updated) throw new Error("Qeyd tapılmadı və ya icazə yoxdur");
    await audit("update", table, id, `${table} yeniləndi`, existing, row);
    revalidatePublic(table, String(updated.slug ?? row.slug ?? existing?.slug ?? ""));
    return id;
  }

  const { data, error } = await supabase.from(table).insert(row).select("id, slug").single();
  throwIfError(error, "Yaradılmadı");
  if (!data) throw new Error("Yaradılmadı");
  await audit("create", table, data.id, `${table} yaradıldı`, null, row);
  revalidatePublic(table, String(data.slug ?? row.slug ?? ""));
  return data.id as string;
}

export async function setStatus(table: EntityType, id: string, status: ContentStatus) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "published") patch.published_at = new Date().toISOString();
  const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("id, slug, status, is_active, translations").maybeSingle();
  throwIfError(error, "Status yenilənmədi");
  if (!data) throw new Error("Qeyd tapılmadı və ya status yazılmadı");
  if (table === "projects" || table === "portfolio") {
    const hide = data.status === "archived" || data.is_active === false || (hasExplicitLegacySourceId(data) && data.status !== "published");
    await syncLegacyHidden(supabase, table, data, hide);
  }
  await audit("status", table, id, `status → ${status}`);
  revalidatePublic(table, data.slug);
}

export async function setActive(table: EntityType, id: string, isActive: boolean) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, slug, is_active, status, translations")
    .maybeSingle();
  throwIfError(error, "Aktiv statusu yenilənmədi");
  if (!data) throw new Error("Qeyd tapılmadı və ya aktiv statusu yazılmadı");
  if (data.is_active !== isActive) throw new Error("Aktiv statusu bazada dəyişmədi");
  if (table === "projects" || table === "portfolio") {
    const hide = !isActive || data.status === "archived" || (hasExplicitLegacySourceId(data) && data.status !== "published");
    await syncLegacyHidden(supabase, table, data, hide);
  }
  await audit("active", table, id, `active → ${isActive}`);
  revalidatePublic(table, data.slug);
}

export async function archiveRecord(table: EntityType, id: string) {
  await setStatus(table, id, "archived");
}

async function removeUnusedStorageFiles(
  supabase: NonNullable<Awaited<ReturnType<typeof createAdminClient>>>,
  table: EntityType,
  id: string,
  row: Record<string, unknown>,
) {
  const service = createServiceClient();
  const paths = collectStoragePaths(row);
  if (!paths.length) return;

  const otherTables: EntityType[] = ["projects", "portfolio", "blog_posts", "services"];
  const others: Record<string, unknown>[] = [];
  for (const otherTable of otherTables) {
    const { data } = await supabase.from(otherTable).select("*");
    for (const item of data ?? []) {
      if (otherTable === table && item.id === id) continue;
      others.push(item as Record<string, unknown>);
    }
  }

  for (const path of paths) {
    if (others.some((item) => rowUsesStoragePath(item, path))) continue;
    if (service) {
      const { error } = await service.storage.from("media").remove([path]);
      if (error) console.error("[cms] storage remove", path, error.message);
    }
    await supabase.from("media").delete().eq("path", path);
  }
}

export async function deleteRecord(table: EntityType, id: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: existing } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (!existing) throw new Error("Qeyd tapılmadı");

  const hardDelete = table === "projects" || table === "portfolio";
  if (!hardDelete && existing.status !== "archived") {
    await archiveRecord(table, id);
    return "archived";
  }

  if (hardDelete) {
    await syncLegacyHidden(supabase, table, existing, true);
    await removeUnusedStorageFiles(supabase, table, id, existing as Record<string, unknown>);
  }

  const { data: deleted, error } = await supabase.from(table).delete().eq("id", id).select("id, slug").maybeSingle();
  throwIfError(error, "Silinmədi");
  if (!deleted) throw new Error("Qeyd silinmədi — icazə və ya RLS yoxlanışı alınmadı");
  await audit("delete", table, id, `${table} silindi`, existing, null);
  revalidatePublic(table, deleted.slug ?? existing.slug);
  return "deleted";
}

export async function duplicateRecord(table: EntityType, id: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: existing } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (!existing) throw new Error("Tapılmadı");
  const copy = { ...existing } as Record<string, unknown>;
  delete copy.id;
  copy.slug = `${existing.slug}-copy`;
  copy.status = "draft";
  copy.is_active = false;
  copy.created_at = new Date().toISOString();
  copy.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from(table).insert(copy).select("id").single();
  if (error) throw error;
  if (!data) throw new Error("Dublikat yaradılmadı");
  await audit("duplicate", table, data.id, `${existing.slug} dublikat`);
  revalidatePublic(table, String(copy.slug));
  return data.id as string;
}

export async function restoreRevision(revisionId: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: rev } = await supabase.from("content_revisions").select("*").eq("id", revisionId).maybeSingle();
  if (!rev) throw new Error("Versiya tapılmadı");
  const payload = { ...(rev.payload as Record<string, unknown>) };
  const id = rev.entity_id as string;
  delete payload.id;
  const { error } = await supabase.from(rev.entity_type).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await audit("restore", rev.entity_type, id, "əvvəlki versiyaya qayıdıldı");
  revalidatePublic(rev.entity_type as EntityType, String(payload.slug ?? ""));
}

export async function saveSettings(key: string, value: Record<string, unknown>) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
  await audit("settings", "site_settings", key, `${key} yeniləndi`, null, value);
  revalidatePublic();
}

export async function reorder(table: EntityType, orderedIds: string[]) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index, updated_at: new Date().toISOString() }).eq("id", id),
    ),
  );
  await audit("reorder", table, null, "sıra yeniləndi");
  revalidatePublic(table);
}

export async function uploadMedia(formData: FormData) {
  const { user } = await requireStaff();
  const supabase = await createAdminClient();
  const service = createServiceClient();
  if (!supabase || !service) throw new Error("CMS configured deyil");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Fayl yoxdur");

  const maxImage = 12 * 1024 * 1024;
  const maxVideo = 80 * 1024 * 1024;
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) throw new Error("Yalnız şəkil və ya video");
  if (isImage && file.size > maxImage) throw new Error("Şəkil 12MB-dan böyük ola bilməz");
  if (isVideo && file.size > maxVideo) throw new Error("Video 80MB-dan böyük ola bilməz");

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const allowed = ["jpg", "jpeg", "png", "webp", "avif", "gif", "mp4", "webm"];
  if (!allowed.includes(ext)) throw new Error("Dəstəklənməyən format");

  const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await service.storage.from("media").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) throw upErr;

  const alt = String(formData.get("alt") ?? "");
  const { data, error } = await supabase
    .from("media")
    .insert({
      path,
      mime: file.type,
      size_bytes: file.size,
      alt_text: alt || null,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error) throw error;
  await audit("upload", "media", data.id, file.name);
  revalidatePath("/admin/media");
  return { ...data, url: mediaPublicUrl(path) };
}

export async function deleteMedia(id: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  const service = createServiceClient();
  if (!supabase || !service) throw new Error("CMS configured deyil");
  const { data } = await supabase.from("media").select("*").eq("id", id).maybeSingle();
  if (!data) return;
  await service.storage.from("media").remove([data.path]);
  await supabase.from("media").delete().eq("id", id);
  await audit("delete", "media", id, data.path);
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, alt: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  await supabase.from("media").update({ alt_text: alt }).eq("id", id);
}

export async function updateUserRole(userId: string, role: "admin" | "editor") {
  await requireAdmin();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
  await audit("role", "profiles", userId, `role → ${role}`);
}

export async function logoutAction() {
  const supabase = await createUserServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

function blocksToMarkdown(
  blocks: { type: string; text?: string; items?: string[] }[],
) {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `## ${block.text ?? ""}`;
      if (block.type === "h3") return `### ${block.text ?? ""}`;
      if (block.type === "ul") return (block.items ?? []).map((item) => `- ${item}`).join("\n");
      return block.text ?? "";
    })
    .join("\n\n");
}

export async function importStaticContent() {
  await requireAdmin();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");

  const { projects } = await import("@/data/projects");
  const { portfolioItems } = await import("@/data/portfolio");
  const { blogPosts } = await import("@/data/blog");

  const projectRows = projects.map((item, index) => ({
    slug: item.slug,
    category: item.category,
    cover_path: item.image,
    status: "draft",
    is_active: true,
    sort_order: index,
    translations: {
      az: { title: item.title || item.slug },
      en: { title: item.title || item.slug },
      de: { title: item.title || item.slug },
    },
  }));

  const portfolioRows = portfolioItems.map((item, index) => ({
    slug: item.slug,
    category: item.category,
    country: item.country,
    cover_path: item.image,
    status: "draft",
    is_active: true,
    sort_order: index,
    translations: {
      az: { title: item.title || item.slug },
      en: { title: item.title || item.slug },
      de: { title: item.title || item.slug },
    },
  }));

  const blogRows = blogPosts.map((post, index) => ({
    slug: post.slug,
    category: post.category,
    cover_path: post.image,
    status: "draft",
    is_active: true,
    show_on_home: false,
    featured: index < 3,
    sort_order: index,
    published_at: post.publishedAt,
    seo_title: post.copy.az.seoTitle,
    meta_description: post.copy.az.description,
    translations: Object.fromEntries(
      (["az", "en", "ru", "de"] as const).map((locale) => {
        const copy = post.copy[locale];
        return [
          locale,
          {
            title: copy.title,
            short: copy.excerpt,
            excerpt: copy.excerpt,
            body: blocksToMarkdown(copy.blocks),
            seoTitle: copy.seoTitle,
            description: copy.description,
            imageAlt: post.imageAlt[locale],
            ctaLabel: copy.ctaLabel,
            ctaText: copy.ctaText,
            slug: post.slugs?.[locale] || post.slug,
            published: true,
          },
        ];
      }),
    ),
  }));

  const { error: pErr } = await supabase.from("projects").upsert(projectRows, {
    onConflict: "slug",
    ignoreDuplicates: true,
  });
  if (pErr) throw pErr;
  const { error: oErr } = await supabase.from("portfolio").upsert(portfolioRows, {
    onConflict: "slug",
    ignoreDuplicates: true,
  });
  if (oErr) throw oErr;
  const { error: bErr } = await supabase.from("blog_posts").upsert(blogRows, {
    onConflict: "slug",
    ignoreDuplicates: true,
  });
  if (bErr) throw bErr;

  await audit("import", "site_settings", null, "mövcud sayt kontenti draft kimi import edildi");
  revalidatePublic();
  return {
    projects: projectRows.length,
    portfolio: portfolioRows.length,
    blog: blogRows.length,
  };
}

export async function importDraftBlogPosts() {
  await requireAdmin();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");

  const { allDraftBlogPosts } = await import("@/data/blog/draft-posts-index");
  const blogRows = allDraftBlogPosts.map((post, index) => ({
    slug: post.slug,
    category: post.category,
    cover_path: post.image,
    status: "draft" as const,
    is_active: true,
    show_on_home: false,
    featured: false,
    sort_order: 100 + index,
    published_at: post.publishedAt,
    seo_title: post.copy.az.seoTitle,
    meta_description: post.copy.az.description,
    translations: Object.fromEntries(
      (["az", "en", "ru", "de"] as const).map((locale) => {
        const copy = post.copy[locale];
        return [
          locale,
          {
            title: copy.title,
            short: copy.excerpt,
            excerpt: copy.excerpt,
            body: blocksToMarkdown(copy.blocks),
            seoTitle: copy.seoTitle,
            description: copy.description,
            imageAlt: post.imageAlt[locale],
            ctaLabel: copy.ctaLabel,
            ctaText: copy.ctaText,
            slug: post.slugs?.[locale] || post.slug,
            published: true,
          },
        ];
      }),
    ),
  }));

  const { error } = await supabase.from("blog_posts").upsert(blogRows, {
    onConflict: "slug",
    ignoreDuplicates: true,
  });
  if (error) throw error;

  await audit("import", "blog_posts", null, `${blogRows.length} yeni bloq qaralama kimi əlavə edildi`);
  revalidatePublic();
  return { blog: blogRows.length };
}

export async function migrateLegacyCatalog() {
  await requireAdmin();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const db = supabase;

  const found = listLegacyCatalogCounts();
  const projectPayloads = buildLegacyProjectRows();
  const portfolioPayloads = buildLegacyPortfolioRows();

  const [{ data: existingProjects, error: pRead }, { data: existingPortfolio, error: oRead }] = await Promise.all([
    supabase.from("projects").select("id, slug, status, is_active, translations"),
    supabase.from("portfolio").select("id, slug, status, is_active, translations"),
  ]);
  throwIfError(pRead, "Layihələr oxunmadı");
  throwIfError(oRead, "Portfolio oxunmadı");

  const result = {
    found,
    projects: { imported: 0, updated: 0, skipped: 0, failed: [] as { slug: string; error: string }[] },
    portfolio: { imported: 0, updated: 0, skipped: 0, failed: [] as { slug: string; error: string }[] },
  };

  async function upsertKind(
    table: "projects" | "portfolio",
    kind: LegacyKind,
    payloads: Record<string, unknown>[],
    existing: Array<{ id: string; slug: string; status: string; is_active: boolean; translations?: Translations | null }> | null,
    bucket: typeof result.projects,
  ) {
    for (const payload of payloads) {
      const slug = String(payload.slug);
      const id = legacySourceId(kind, slug);
      const match =
        existing?.find((row) => readLegacySourceId(row, kind) === id) ??
        existing?.find((row) => row.slug === slug);
      try {
        if (match?.status === "published" && match.is_active && hasExplicitLegacySourceId(match)) {
          bucket.skipped += 1;
          continue;
        }
        if (match?.status === "published" && match.is_active && !hasExplicitLegacySourceId(match)) {
          const { error } = await db
            .from(table)
            .update({
              translations: withLegacySourceId(match.translations ?? {}, id),
              updated_at: new Date().toISOString(),
            })
            .eq("id", match.id);
          throwIfError(error, "legacy id yazılmadı");
          bucket.skipped += 1;
          continue;
        }
        if (match) {
          const { error } = await db
            .from(table)
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq("id", match.id);
          throwIfError(error, "yenilənmədi");
          await syncLegacyHidden(db, table, { slug, translations: payload.translations as Translations }, false);
          bucket.updated += 1;
          continue;
        }
        const { error } = await db.from(table).insert(payload);
        throwIfError(error, "əlavə olunmadı");
        await syncLegacyHidden(db, table, { slug, translations: payload.translations as Translations }, false);
        bucket.imported += 1;
      } catch (caught) {
        bucket.failed.push({ slug, error: caught instanceof Error ? caught.message : "xəta" });
      }
    }
  }

  await upsertKind("projects", "project", projectPayloads, existingProjects, result.projects);
  await upsertKind("portfolio", "portfolio", portfolioPayloads, existingPortfolio, result.portfolio);

  const { error: settingsError } = await supabase.from("site_settings").upsert({
    key: LEGACY_MIGRATION_SETTINGS_KEY,
    value: {
      ...found,
      projectsImported: result.projects.imported + result.projects.updated,
      portfolioImported: result.portfolio.imported + result.portfolio.updated,
      completedAt: new Date().toISOString(),
      failed: [...result.projects.failed, ...result.portfolio.failed],
    },
    updated_at: new Date().toISOString(),
  });
  throwIfError(settingsError, "Migration status yazılmadı");

  await audit(
    "import",
    "site_settings",
    null,
    `legacy catalog: +${result.projects.imported + result.portfolio.imported} / upd ${result.projects.updated + result.portfolio.updated}`,
  );
  revalidatePublic("projects");
  revalidatePublic("portfolio");
  return result;
}
