"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreRevision, upsertRecord } from "@/lib/cms/actions";
import type { EntityType } from "@/lib/cms/queries";
import type { CmsRow, MediaRow, Translations } from "@/lib/cms/types";
import { ADMIN_LOCALES, BLOG_CATEGORIES, COUNTRIES, PROJECT_CATEGORIES, SERVICE_FILTERS } from "@/lib/cms/types";
import { Field, Select, SubmitButton, TextArea, TextInput } from "./fields";
import { GalleryPicker } from "./gallery-picker";
import { LocaleTabs } from "./locale-tabs";
import { MediaPicker } from "./media-picker";

function pathsFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((path) => ({ path }));
}

function emptyT(): Translations {
  return { az: {}, en: {}, de: {}, ru: {} };
}

export function ContentForm({
  table,
  row,
  media,
  afterSaveHref,
}: {
  table: EntityType;
  row?: CmsRow | null;
  media: MediaRow[];
  afterSaveHref: string;
}) {
  const router = useRouter();
  const translations = row?.translations ?? emptyT();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const next: Translations = emptyT();
    for (const locale of [...ADMIN_LOCALES, "ru"] as const) {
      next[locale] = {
        title: String(formData.get(`${locale}_title`) ?? ""),
        name: String(formData.get(`${locale}_title`) ?? ""),
        short: String(formData.get(`${locale}_short`) ?? ""),
        excerpt: String(formData.get(`${locale}_short`) ?? ""),
        full: String(formData.get(`${locale}_body`) ?? ""),
        body: String(formData.get(`${locale}_body`) ?? ""),
        intro: String(formData.get(`${locale}_intro`) ?? ""),
        seoTitle: String(formData.get(`${locale}_seoTitle`) ?? ""),
        description: String(formData.get(`${locale}_seoDesc`) ?? ""),
        imageAlt: String(formData.get(`${locale}_imageAlt`) ?? ""),
        ctaLabel: String(formData.get(`${locale}_ctaLabel`) ?? ""),
        ctaText: String(formData.get(`${locale}_ctaText`) ?? ""),
      };
    }
    const payload: Record<string, unknown> = {
      slug: String(formData.get("slug") ?? ""),
      status: String(formData.get("status") ?? "draft"),
      is_active: formData.get("is_active") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
      cover_path: String(formData.get("cover_path") ?? "") || null,
      og_image_path: String(formData.get("og_image_path") ?? "") || null,
      video_url: String(formData.get("video_url") ?? "") || null,
      canonical_url: String(formData.get("canonical_url") ?? "") || null,
      seo_title: String(formData.get("az_seoTitle") ?? "") || null,
      meta_description: String(formData.get("az_seoDesc") ?? "") || null,
      translations: next,
    };
    if (table === "projects" || table === "portfolio") {
      payload.category = String(formData.get("category") ?? "villa");
      payload.gallery = pathsFromForm(formData.get("gallery"));
    }
    if (table === "projects") {
      payload.location = String(formData.get("location") ?? "") || null;
      payload.area_m2 = String(formData.get("area_m2") ?? "") || null;
      payload.sections = {
        exterior: {
          content: String(formData.get("sec_exterior") ?? ""),
          media: pathsFromForm(formData.get("sec_exterior_media")),
        },
        interior: {
          content: String(formData.get("sec_interior") ?? ""),
          media: pathsFromForm(formData.get("sec_interior_media")),
        },
        plan: {
          content: String(formData.get("sec_plan") ?? ""),
          media: pathsFromForm(formData.get("sec_plan_media")),
        },
        bim: {
          content: String(formData.get("sec_bim") ?? ""),
          media: pathsFromForm(formData.get("sec_bim_media")),
        },
      };
    }
    if (table === "portfolio") {
      payload.country = String(formData.get("country") ?? "") || null;
      payload.service_filter = String(formData.get("service_filter") ?? "") || null;
    }
    if (table === "blog_posts") {
      payload.category = String(formData.get("category") ?? "architecture");
      payload.show_on_home = formData.get("show_on_home") === "on";
      payload.featured = formData.get("featured") === "on";
      payload.published_at = String(formData.get("published_at") ?? "") || null;
    }
    if (table === "services") {
      payload.icon = String(formData.get("icon") ?? "") || null;
      payload.number = String(formData.get("number") ?? "") || null;
      payload.show_on_home = formData.get("show_on_home") === "on";
      payload.image_path = String(formData.get("cover_path") ?? "") || null;
    }
    try {
      const id = await upsertRecord(table, row?.id ?? null, payload);
      router.push(`${afterSaveHref.replace("[id]", id)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saxlanılmadı");
    }
  }

  const sections = row?.sections;

  return (
    <form action={onSubmit} className="flex max-w-4xl flex-col gap-6">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL slug">
          <TextInput name="slug" required defaultValue={row?.slug} placeholder="bim-memarliq-nedir" />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={row?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="Sıra">
          <TextInput name="sort_order" type="number" defaultValue={row?.sort_order ?? 0} />
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={row?.is_active ?? true} />
          Aktiv
        </label>
      </div>

      {table === "projects" || table === "portfolio" ? (
        <Field label="Kateqoriya">
          <Select name="category" defaultValue={row?.category ?? "villa"}>
            {PROJECT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {table === "projects" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lokasiya">
            <TextInput name="location" defaultValue={row?.location ?? ""} />
          </Field>
          <Field label="Sahə / m²">
            <TextInput name="area_m2" defaultValue={row?.area_m2 ?? ""} />
          </Field>
        </div>
      ) : null}

      {table === "portfolio" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ölkə">
            <Select name="country" defaultValue={row?.country ?? ""}>
              <option value="">—</option>
              {COUNTRIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Xidmət filtri">
            <Select name="service_filter" defaultValue={row?.service_filter ?? ""}>
              <option value="">—</option>
              {SERVICE_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {table === "blog_posts" ? (
        <>
          <Field label="Kateqoriya">
            <Select name="category" defaultValue={row?.category ?? "architecture"}>
              {BLOG_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Publish tarixi">
            <TextInput name="published_at" type="date" defaultValue={row?.published_at?.slice(0, 10) ?? ""} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_on_home" defaultChecked={row?.show_on_home} />
            Ana səhifədə göstər
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={row?.featured} />
            Seçilmiş yazı
          </label>
        </>
      ) : null}

      {table === "services" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İkon">
            <TextInput name="icon" defaultValue={row?.icon ?? "Boxes"} />
          </Field>
          <Field label="Nömrə">
            <TextInput name="number" defaultValue={row?.number ?? ""} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_on_home" defaultChecked={row?.show_on_home ?? true} />
            Ana səhifədə göstər
          </label>
        </div>
      ) : null}

      <MediaPicker label="Cover şəkli" name="cover_path" defaultPath={row?.cover_path} items={media} />
      <MediaPicker label="Open Graph şəkli" name="og_image_path" defaultPath={row?.og_image_path} items={media} />
      <Field label="Video URL">
        <TextInput name="video_url" defaultValue={row?.video_url ?? ""} />
      </Field>
      <Field label="Canonical URL">
        <TextInput name="canonical_url" defaultValue={row?.canonical_url ?? ""} />
      </Field>

      {table === "projects" || table === "portfolio" ? (
        <GalleryPicker
          label="Qalereya"
          name="gallery"
          defaultPaths={(row?.gallery ?? []).map((item) => item.path)}
          items={media}
        />
      ) : null}

      {table === "projects" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Exterior mətn">
            <TextArea name="sec_exterior" defaultValue={sections?.exterior?.content ?? ""} />
          </Field>
          <GalleryPicker
            label="Exterior media"
            name="sec_exterior_media"
            defaultPaths={(sections?.exterior?.media ?? []).map((item) => item.path)}
            items={media}
          />
          <Field label="Interior mətn">
            <TextArea name="sec_interior" defaultValue={sections?.interior?.content ?? ""} />
          </Field>
          <GalleryPicker
            label="Interior media"
            name="sec_interior_media"
            defaultPaths={(sections?.interior?.media ?? []).map((item) => item.path)}
            items={media}
          />
          <Field label="Plan mətn">
            <TextArea name="sec_plan" defaultValue={sections?.plan?.content ?? ""} />
          </Field>
          <GalleryPicker
            label="Plan media"
            name="sec_plan_media"
            defaultPaths={(sections?.plan?.media ?? []).map((item) => item.path)}
            items={media}
          />
          <Field label="BIM mətn">
            <TextArea name="sec_bim" defaultValue={sections?.bim?.content ?? ""} />
          </Field>
          <GalleryPicker
            label="BIM media"
            name="sec_bim_media"
            defaultPaths={(sections?.bim?.media ?? []).map((item) => item.path)}
            items={media}
          />
        </div>
      ) : null}

      <LocaleTabs
        render={(locale) => {
          const t = translations[locale] ?? {};
          return (
            <div className="grid gap-4">
              <Field label={`Başlıq (${locale})`}>
                <TextInput name={`${locale}_title`} defaultValue={t.title || t.name || ""} />
              </Field>
              <Field label={`Qısa mətn (${locale})`}>
                <TextArea name={`${locale}_short`} defaultValue={t.short || t.excerpt || t.intro || ""} />
              </Field>
              <Field label={`Tam mətn / rich text (${locale})`}>
                <TextArea
                  name={`${locale}_body`}
                  className="min-h-56"
                  defaultValue={t.body || t.full || ""}
                  placeholder="Markdown: ## başlıq, - siyahı, [link](/xidmetler)"
                />
              </Field>
              <Field label={`SEO title (${locale})`}>
                <TextInput name={`${locale}_seoTitle`} defaultValue={t.seoTitle || ""} />
              </Field>
              <Field label={`Meta description (${locale})`}>
                <TextArea name={`${locale}_seoDesc`} defaultValue={t.description || ""} />
              </Field>
              {table === "blog_posts" ? (
                <>
                  <Field label={`Şəkil alt (${locale})`}>
                    <TextInput name={`${locale}_imageAlt`} defaultValue={t.imageAlt || ""} />
                  </Field>
                  <Field label={`CTA (${locale})`}>
                    <TextInput name={`${locale}_ctaLabel`} defaultValue={t.ctaLabel || ""} />
                  </Field>
                  <Field label={`CTA mətn (${locale})`}>
                    <TextArea name={`${locale}_ctaText`} defaultValue={t.ctaText || ""} />
                  </Field>
                </>
              ) : null}
            </div>
          );
        }}
      />

      <div className="flex gap-3">
        <SubmitButton>Saxla</SubmitButton>
        {table === "blog_posts" && row?.id ? (
          <a
            href={`/admin/preview/blog/${row.id}`}
            target="_blank"
            rel="noreferrer"
            className="border border-charcoal/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
          >
            Preview
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function RestoreButton({ revisionId }: { revisionId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs uppercase tracking-[0.14em]"
      onClick={async () => {
        if (!window.confirm("Bu versiyaya qayıdılacaq. Davam?")) return;
        await restoreRevision(revisionId);
        router.refresh();
      }}
    >
      Geri qayıt
    </button>
  );
}
