"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "./auth";
import { createUserServerClient, createServiceClient } from "./supabase";
import { mediaPublicUrl } from "./env";
import type { ContentStatus, EntityType } from "./queries";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ə]/g, "e")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[ş]/g, "s")
    .replace(/[ğ]/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function audit(
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
  before?: unknown,
  after?: unknown,
) {
  const { user } = await requireStaff();
  const supabase = await createUserServerClient();
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
  const supabase = await createUserServerClient();
  if (!supabase) return;
  await supabase.from("content_revisions").insert({
    entity_type: entityType,
    entity_id: entityId,
    payload,
    created_by: user.id,
  });
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
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
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");

  const row = pickColumns(table, payload);
  if (typeof row.slug === "string" && row.slug) {
    row.slug = slugify(String(row.slug));
  }
  if (row.status === "published" && !row.published_at) {
    row.published_at = new Date().toISOString();
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
    }
    const { error } = await supabase.from(table).update(row).eq("id", id);
    if (error) throw error;
    await audit("update", table, id, `${table} yeniləndi`, existing, row);
    revalidatePublic();
    return id;
  }

  const { data, error } = await supabase.from(table).insert(row).select("id").single();
  if (error) throw error;
  await audit("create", table, data.id, `${table} yaradıldı`, null, row);
  revalidatePublic();
  return data.id as string;
}

export async function setStatus(table: EntityType, id: string, status: ContentStatus) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "published") patch.published_at = new Date().toISOString();
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw error;
  await audit("status", table, id, `status → ${status}`);
  revalidatePublic();
}

export async function setActive(table: EntityType, id: string, isActive: boolean) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase.from(table).update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await audit("active", table, id, `active → ${isActive}`);
  revalidatePublic();
}

export async function archiveRecord(table: EntityType, id: string) {
  await setStatus(table, id, "archived");
}

export async function deleteRecord(table: EntityType, id: string) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: existing } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (existing && existing.status !== "archived") {
    await archiveRecord(table, id);
    return "archived";
  }
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  await audit("delete", table, id, `${table} silindi`, existing, null);
  revalidatePublic();
  return "deleted";
}

export async function duplicateRecord(table: EntityType, id: string) {
  await requireStaff();
  const supabase = await createUserServerClient();
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
  await audit("duplicate", table, data.id, `${existing.slug} dublikat`);
  revalidatePublic();
  return data.id as string;
}

export async function restoreRevision(revisionId: string) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { data: rev } = await supabase.from("content_revisions").select("*").eq("id", revisionId).maybeSingle();
  if (!rev) throw new Error("Versiya tapılmadı");
  const payload = { ...(rev.payload as Record<string, unknown>) };
  const id = rev.entity_id as string;
  delete payload.id;
  const { error } = await supabase.from(rev.entity_type).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await audit("restore", rev.entity_type, id, "əvvəlki versiyaya qayıdıldı");
  revalidatePublic();
}

export async function saveSettings(key: string, value: Record<string, unknown>) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
  await audit("settings", "site_settings", key, `${key} yeniləndi`, null, value);
  revalidatePublic();
}

export async function reorder(table: EntityType, orderedIds: string[]) {
  await requireStaff();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index, updated_at: new Date().toISOString() }).eq("id", id),
    ),
  );
  await audit("reorder", table, null, "sıra yeniləndi");
  revalidatePublic();
}

export async function uploadMedia(formData: FormData) {
  const { user } = await requireStaff();
  const supabase = await createUserServerClient();
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
  const supabase = await createUserServerClient();
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
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  await supabase.from("media").update({ alt_text: alt }).eq("id", id);
}

export async function updateUserRole(userId: string, role: "admin" | "editor") {
  await requireAdmin();
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("CMS configured deyil");
  const { error } = await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
  await audit("role", "profiles", userId, `role → ${role}`);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createUserServerClient();
  if (!supabase) throw new Error("Supabase environment variables yoxdur");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error("Email və ya şifrə yalnışdır");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "editor") {
    await supabase.auth.signOut();
    throw new Error("Bu hesabın admin paneli üçün icazəsi yoxdur");
  }
  redirect("/admin");
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
  const supabase = await createUserServerClient();
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
