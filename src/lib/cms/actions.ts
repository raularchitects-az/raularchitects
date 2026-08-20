"use server";

import { revalidatePath, refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "./auth";
import { createAdminClient, createUserServerClient, createServiceClient } from "./supabase";
import { mediaPublicUrl } from "./media-url";
import { slugify } from "@/lib/slugify";
import { routing } from "@/i18n/routing";
import { localizePublicPath } from "@/lib/public-paths";
import { fallbackBlogSlugs } from "@/lib/blog-urls";
import {
  LEGACY_HIDDEN_SETTINGS_KEY,
  LEGACY_MIGRATION_SETTINGS_KEY,
  legacyHiddenKeysForRow,
  legacyKindForTable,
  legacySourceId,
  parseHiddenLegacyIds,
  pickPublicCatalogRow,
  readLegacySourceId,
  relatedCatalogRows,
  type LegacyKind,
} from "./legacy";
import { collectStoragePaths, findMediaUsages, formatMediaUsageError } from "./media-usage";
import { mediaExtension, validateMediaFile } from "./media-file";
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
  updateTag("cms-settings");
  if (table) updateTag(`cms-${table}`);
  refresh();
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/sitemap.xml");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/layihelar`, "layout");
    revalidatePath(`/${locale}/portfolio`, "layout");
    revalidatePath(`/${locale}/bloq`, "layout");
    revalidatePath(`/${locale}/xidmetler`, "layout");
    revalidatePath(localizePublicPath(locale, "/layihelar"), "layout");
    revalidatePath(localizePublicPath(locale, "/portfolio"), "layout");
    revalidatePath(localizePublicPath(locale, "/bloq"), "layout");
    revalidatePath(localizePublicPath(locale, "/xidmetler"), "layout");
    revalidatePath(localizePublicPath(locale, "/haqqimizda"), "layout");
    revalidatePath(localizePublicPath(locale, "/elaqe"), "layout");
    if (table === "projects" && slug) {
      revalidatePath(`/${locale}/layihelar/${slug}`);
      revalidatePath(localizePublicPath(locale, `/layihelar/${slug}`));
    }
    if (table === "portfolio" && slug) {
      revalidatePath(`/${locale}/portfolio/${slug}`);
      revalidatePath(localizePublicPath(locale, `/portfolio/${slug}`));
    }
    if (table === "blog_posts" && slug) {
      revalidatePath(`/${locale}/bloq/${slug}`);
      revalidatePath(localizePublicPath(locale, `/bloq/${slug}`));
    }
    if (table === "services" && slug) {
      revalidatePath(`/${locale}/xidmetler/${slug}`);
      revalidatePath(localizePublicPath(locale, `/xidmetler/${slug}`));
    }
  }
}

function revalidateMedia() {
  updateTag("cms");
  revalidatePath("/admin/media");
}

function throwIfError(error: { message?: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function kindForTable(table: EntityType): LegacyKind | null {
  return legacyKindForTable(table);
}

function preserveLegacyStamps(next: Translations, prev?: Translations | null): Translations {
  const merged: Translations = { ...next };
  for (const locale of ["az", "en", "de", "ru"] as const) {
    merged[locale] = {
      ...(merged[locale] ?? {}),
      legacySourceId: merged[locale]?.legacySourceId?.trim() || prev?.[locale]?.legacySourceId?.trim(),
    };
  }
  return merged;
}

async function syncLegacyHidden(
  supabase: NonNullable<Awaited<ReturnType<typeof createAdminClient>>>,
  table: EntityType,
  row: { slug: string; translations?: Translations | null },
  options: { deleted?: boolean; forceHide?: boolean } = {},
) {
  const kind = kindForTable(table);
  if (!kind) return;
  const { data: remaining, error: readError } = await supabase
    .from(table)
    .select("id, slug, status, is_active, translations, sort_order")
    .order("sort_order", { ascending: true });
  throwIfError(readError, "CMS qeydləri oxunmadı");
  const related = relatedCatalogRows({
    kind,
    slug: row.slug,
    cmsRows: remaining ?? [],
  });
  const publicRow = pickPublicCatalogRow(related);
  const catalogKind = kind === "project" || kind === "portfolio";
  let hide: boolean | "unchanged";
  if (publicRow) hide = false;
  else if (options.deleted || options.forceHide) hide = true;
  else if (catalogKind) hide = true;
  else hide = "unchanged";
  if (hide === "unchanged") return;
  const { data, error: hiddenReadError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", LEGACY_HIDDEN_SETTINGS_KEY)
    .maybeSingle();
  throwIfError(hiddenReadError, "Legacy gizlətmə siyahısı oxunmadı");
  const ids = new Set(parseHiddenLegacyIds((data?.value ?? {}) as Record<string, unknown>));
  const keys = legacyHiddenKeysForRow(kind, row);
  if (hide) keys.forEach((id) => ids.add(id));
  else keys.forEach((id) => ids.delete(id));
  const { error } = await supabase.from("site_settings").upsert({
    key: LEGACY_HIDDEN_SETTINGS_KEY,
    value: { ids: [...ids] },
    updated_at: new Date().toISOString(),
  });
  throwIfError(error, "Legacy gizlətmə siyahısı yazılmadı");
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

  const existing = id
    ? ((await supabase.from(table).select("*").eq("id", id).maybeSingle()).data as Record<string, unknown> | null)
    : null;
  if (id && !existing) throw new Error("Qeyd tapılmadı");
  if (row.translations && typeof row.translations === "object") {
    row.translations = preserveLegacyStamps(
      row.translations as Translations,
      (existing?.translations as Translations | null) ?? null,
    );
  }

  if (id) {
    if (existing) {
      await saveRevision(table, id, existing);
      const oldSlug = existing.slug as string | undefined;
      const newSlug = row.slug as string | undefined;
      if (oldSlug && newSlug && oldSlug !== newSlug) {
        const from = publicPathFor(table, oldSlug);
        const to = publicPathFor(table, newSlug);
        const { error: redirectError } = await supabase.from("redirects").upsert(
          { from_path: from, to_path: to, status_code: 301 },
          { onConflict: "from_path" },
        );
        throwIfError(redirectError, "Yönləndirmə yazılmadı");
      }
      if (table === "blog_posts") {
        const prevT = (existing.translations ?? {}) as Translations;
        const nextT = (row.translations ?? {}) as Translations;
        const mapped = fallbackBlogSlugs(String(oldSlug || newSlug || ""));
        for (const locale of routing.locales) {
          const previous = prevT[locale]?.slug || mapped[locale] || oldSlug;
          const next = nextT[locale]?.slug || newSlug;
          if (previous && next && previous !== next) {
            const { error: blogRedirectError } = await supabase.from("redirects").upsert(
              { from_path: `/bloq/${previous}`, to_path: `/bloq/${next}`, status_code: 301 },
              { onConflict: "from_path" },
            );
            throwIfError(blogRedirectError, "Bloq yönləndirməsi yazılmadı");
          }
        }
      }
    }
    const { data: updated, error } = await supabase
      .from(table)
      .update(row)
      .eq("id", id)
      .select("id, slug, status, is_active, translations")
      .maybeSingle();
    throwIfError(error, "Yenilənmədi");
    if (!updated) throw new Error("Qeyd tapılmadı və ya icazə yoxdur");
    await syncLegacyHidden(supabase, table, updated);
    await audit("update", table, id, `${table} yeniləndi`, existing, row);
    revalidatePublic(table, String(updated.slug ?? row.slug ?? existing?.slug ?? ""));
    return id;
  }

  const { data, error } = await supabase.from(table).insert(row).select("id, slug, status, is_active, translations").single();
  throwIfError(error, "Yaradılmadı");
  if (!data) throw new Error("Yaradılmadı");
  await syncLegacyHidden(supabase, table, data);
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
  if (data.status !== status) throw new Error("Status bazada dəyişmədi");
  await syncLegacyHidden(supabase, table, data, { forceHide: status !== "published" });
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
  await syncLegacyHidden(supabase, table, data, { forceHide: !isActive });
  await audit("active", table, id, `active → ${isActive}`);
  revalidatePublic(table, data.slug);
}

export async function archiveRecord(table: EntityType, id: string) {
  await setStatus(table, id, "archived");
}

async function removeUnusedStorageFiles(
  supabase: NonNullable<Awaited<ReturnType<typeof createAdminClient>>>,
  _table: EntityType,
  _id: string,
  row: Record<string, unknown>,
) {
  const service = createServiceClient();
  const paths = collectStoragePaths(row);
  if (!paths.length) return;

  for (const path of paths) {
    const usages = (await findMediaUsages(supabase, path)).filter(
      (usage) => !(usage.slug === String(row.slug ?? "")),
    );
    if (usages.length) continue;
    if (service) {
      const { error } = await service.storage.from("media").remove([path]);
      if (error) console.error("[cms] storage remove", path, error.message);
    }
    const { error: mediaDeleteError } = await supabase.from("media").delete().eq("path", path);
    if (mediaDeleteError) console.error("[cms] media row remove", path, mediaDeleteError.message);
  }
}

export async function deleteRecord(table: EntityType, id: string) {
  const { profile } = await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: existing, error: readError } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  throwIfError(readError, "Qeyd oxunmadı");
  if (!existing) throw new Error("Qeyd tapılmadı");

  const hardDelete = table === "projects" || table === "portfolio";
  if (hardDelete && profile.role !== "admin") {
    throw new Error("Layihə və portfolio-nu həmişəlik yalnız admin silə bilər");
  }
  if (!hardDelete && existing.status !== "archived") {
    await archiveRecord(table, id);
    return "archived";
  }

  if (hardDelete) {
    await removeUnusedStorageFiles(supabase, table, id, existing as Record<string, unknown>);
  }

  const { data: deleted, error } = await supabase.from(table).delete().eq("id", id).select("id, slug").maybeSingle();
  throwIfError(error, "Silinmədi");
  if (!deleted) throw new Error("Qeyd silinmədi — icazə və ya RLS yoxlanışı alınmadı");
  await syncLegacyHidden(supabase, table, existing, { deleted: true });
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
  const { data, error } = await supabase.from(table).insert(copy).select("id, slug, status, is_active, translations").single();
  if (error) throw error;
  if (!data) throw new Error("Dublikat yaradılmadı");
  await syncLegacyHidden(supabase, table, data);
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
  const { data: updated, error } = await supabase.from(rev.entity_type).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select("id, slug, status, is_active, translations").maybeSingle();
  if (error) throw error;
  if (!updated) throw new Error("Versiya bərpa olunmadı");
  await syncLegacyHidden(supabase, rev.entity_type as EntityType, updated, {
    forceHide: updated.status === "archived" || updated.is_active === false,
  });
  await audit("restore", rev.entity_type, id, "əvvəlki versiyaya qayıdıldı");
  revalidatePublic(rev.entity_type as EntityType, String(payload.slug ?? updated.slug ?? ""));
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
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index, updated_at: new Date().toISOString() }).eq("id", id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
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

  const invalid = validateMediaFile(file);
  if (invalid) throw new Error(invalid);

  const ext = mediaExtension(file.name) || "bin";
  const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await service.storage.from("media").upload(path, buffer, {
    contentType: file.type || undefined,
    upsert: false,
  });
  throwIfError(upErr, "Yüklənmədi");

  const alt = String(formData.get("alt") ?? "");
  const { data, error } = await supabase
    .from("media")
    .insert({
      path,
      mime: file.type || "",
      size_bytes: file.size,
      alt_text: alt || null,
      created_by: user.id,
    })
    .select("id, path, mime")
    .single();
  throwIfError(error, "Media qeydi yazılmadı");
  if (!data?.id || !data.path) throw new Error("Media qeydi yazılmadı");
  await audit("upload", "media", data.id, file.name);
  return {
    id: String(data.id),
    path: String(data.path),
    mime: typeof data.mime === "string" ? data.mime : file.type,
    url: mediaPublicUrl(path),
  };
}

export async function deleteMedia(id: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  const service = createServiceClient();
  if (!supabase || !service) throw new Error("CMS configured deyil");
  const { data, error: readError } = await supabase.from("media").select("*").eq("id", id).maybeSingle();
  throwIfError(readError, "Media oxunmadı");
  if (!data) throw new Error("Media tapılmadı");
  const usages = await findMediaUsages(supabase, data.path);
  if (usages.length) throw new Error(formatMediaUsageError(usages));
  const { error: storageError } = await service.storage.from("media").remove([data.path]);
  throwIfError(storageError, "Fayl storage-dən silinmədi");
  const { data: deleted, error } = await supabase.from("media").delete().eq("id", id).select("id").maybeSingle();
  throwIfError(error, "Media qeydi silinmədi");
  if (!deleted) throw new Error("Media silinmədi");
  await audit("delete", "media", id, data.path);
  revalidateMedia();
}

export async function updateMediaAlt(id: string, alt: string) {
  await requireStaff();
  const supabase = await createAdminClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data, error } = await supabase.from("media").update({ alt_text: alt }).eq("id", id).select("id").maybeSingle();
  throwIfError(error, "Alt text yazılmadı");
  if (!data) throw new Error("Alt text yazılmadı");
  revalidateMedia();
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
    projects: {
      imported: 0,
      updated: 0,
      skipped: 0,
      pending: [] as { slug: string }[],
      failed: [] as { slug: string; error: string }[],
    },
    portfolio: {
      imported: 0,
      updated: 0,
      skipped: 0,
      pending: [] as { slug: string }[],
      failed: [] as { slug: string; error: string }[],
    },
  };

  function inspectKind(
    kind: LegacyKind,
    payloads: Record<string, unknown>[],
    existing: Array<{ id: string; slug: string; translations?: Translations | null }> | null,
    bucket: typeof result.projects,
  ) {
    for (const payload of payloads) {
      const slug = String(payload.slug);
      const id = legacySourceId(kind, slug);
      const match =
        existing?.find((row) => readLegacySourceId(row, kind) === id) ??
        existing?.find((row) => row.slug === slug);
      if (match) {
        bucket.skipped += 1;
        continue;
      }
      bucket.pending.push({ slug });
    }
  }

  inspectKind("project", projectPayloads, existingProjects, result.projects);
  inspectKind("portfolio", portfolioPayloads, existingPortfolio, result.portfolio);

  const { error: settingsError } = await supabase.from("site_settings").upsert({
    key: LEGACY_MIGRATION_SETTINGS_KEY,
    value: {
      ...found,
      mode: "skip-only",
      projectsSkipped: result.projects.skipped,
      portfolioSkipped: result.portfolio.skipped,
      pending: [...result.projects.pending, ...result.portfolio.pending],
      checkedAt: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  });
  throwIfError(settingsError, "Migration status yazılmadı");

  await audit(
    "import",
    "site_settings",
    null,
    `legacy catalog skip-only: skipped ${result.projects.skipped + result.portfolio.skipped}, pending ${result.projects.pending.length + result.portfolio.pending.length}`,
  );
  revalidatePublic("projects");
  revalidatePublic("portfolio");
  return result;
}
