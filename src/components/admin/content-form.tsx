"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreRevision, upsertRecord } from "@/lib/cms/actions";
import type { EntityType } from "@/lib/cms/queries";
import type { CmsRow, MediaRow, Translations } from "@/lib/cms/types";
import {
  ADMIN_LOCALES,
  BLOG_CATEGORIES,
  COUNTRIES,
  INSIGHT_CATEGORIES,
  PROJECT_CATEGORIES,
  SERVICE_FILTERS,
} from "@/lib/cms/types";
import { fallbackBlogSlugs } from "@/lib/blog-urls";
import { productionAbsoluteUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { Field, Select, SubmitButton, TextArea, TextInput } from "./fields";
import { GalleryPicker } from "./gallery-picker";
import { LinkedInShareSection } from "./linkedin-share-section";
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

function isLocaleSlugEntity(table: EntityType) {
  return table === "blog_posts" || table === "insights";
}

export function ContentForm({
  table,
  row,
  media,
  mediaError,
  afterSaveHref,
}: {
  table: EntityType;
  row?: CmsRow | null;
  media: MediaRow[];
  mediaError?: string | null;
  afterSaveHref: string;
}) {
  const router = useRouter();
  const translations = row?.translations ?? emptyT();
  const [error, setError] = useState("");
  const [editorLocale, setEditorLocale] = useState<(typeof ADMIN_LOCALES)[number]>("az");
  const localeSlugEntity = isLocaleSlugEntity(table);
  const publicBase = table === "insights" ? "/insights" : "/bloq";
  const projectBodyLabel = (locale: (typeof ADMIN_LOCALES)[number]) =>
    locale === "az" && table === "projects" ? "Təsvir" : `Tam mətn / rich text (${locale})`;

  async function onSubmit(formData: FormData) {
    setError("");
    const next: Translations = emptyT();
    for (const locale of ADMIN_LOCALES) {
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
        year: String(formData.get(`${locale}_year`) ?? ""),
        status: String(formData.get(`${locale}_status`) ?? ""),
        client: String(formData.get(`${locale}_client`) ?? ""),
        location:
          table === "projects" && locale === "az"
            ? String(formData.get("location") ?? "")
            : String(formData.get(`${locale}_location`) ?? ""),
        area:
          table === "projects" && locale === "az"
            ? String(formData.get("area_m2") ?? "")
            : table === "projects"
              ? String(formData.get(`${locale}_area`) ?? "")
              : undefined,
        ctaLabel: String(formData.get(`${locale}_ctaLabel`) ?? ""),
        ctaText: String(formData.get(`${locale}_ctaText`) ?? ""),
        slug: String(formData.get(`${locale}_slug`) ?? ""),
        published: localeSlugEntity ? formData.get(`${locale}_published`) === "on" : undefined,
        legacySourceId: translations[locale]?.legacySourceId,
        migratedFromPortfolioId: translations[locale]?.migratedFromPortfolioId,
        migratedToProjectSlug: translations[locale]?.migratedToProjectSlug,
      };
    }
    if (table === "blog_posts") {
      next.az = {
        ...next.az,
        linkedinText: translations.az?.linkedinText ?? "",
      };
    }
    const payload: Record<string, unknown> = {
      slug: localeSlugEntity ? String(formData.get("az_slug") ?? "") : String(formData.get("slug") ?? ""),
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
      payload.published_at = String(formData.get("published_at") ?? "") || null;
      payload.sections = row?.sections ?? {
        exterior: { content: "", media: [] },
        interior: { content: "", media: [] },
        plan: { content: "", media: [] },
        bim: { content: "", media: [] },
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
    if (table === "insights") {
      payload.category = String(formData.get("category") ?? "architecture");
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

  return (
    <form action={onSubmit} className="flex max-w-4xl flex-col gap-6">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {localeSlugEntity ? null : (
          <Field label="URL slug">
            <TextInput name="slug" required defaultValue={row?.slug} placeholder="bim-memarliq-nedir" />
          </Field>
        )}
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

      {table === "insights" ? (
        <MediaPicker
          label="Cover şəkli (məcburi görünüş — dəyişmək üçün seçin)"
          name="cover_path"
          defaultPath={row?.cover_path}
          items={media}
          loadError={mediaError}
        />
      ) : null}

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
        <>
          <div className="rounded-md border border-charcoal/10 bg-cream-dark/30 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal/55">
              Layihə detall səhifəsi
            </p>
            <p className="mt-2 text-xs leading-relaxed text-charcoal/50">
              Lokasiya AZ mənbə kimi saxlanır və saxlanarkən EN/DE/RU-a avtomatik tərcümə olunur. Tarix, status,
              müştəri, sahə və Təsvir hər dil tabında da əl ilə redaktə oluna bilər.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lokasiya (AZ mənbə)">
              <TextInput name="location" defaultValue={row?.location ?? ""} placeholder="Berlin, Germany" />
            </Field>
            <Field label="Sahə / ölçü">
              <TextInput name="area_m2" defaultValue={row?.area_m2 ?? ""} placeholder="450 m²" />
            </Field>
            <Field label="Publish tarixi">
              <TextInput name="published_at" type="date" defaultValue={row?.published_at?.slice(0, 10) ?? ""} />
            </Field>
          </div>
        </>
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

      {table === "insights" ? (
        <>
          <Field label="Kateqoriya">
            <Select name="category" defaultValue={row?.category ?? "architecture"}>
              {INSIGHT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Publish tarixi">
            <TextInput name="published_at" type="date" defaultValue={row?.published_at?.slice(0, 10) ?? ""} />
          </Field>
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

      {table === "insights" ? null : (
        <MediaPicker label="Cover şəkli" name="cover_path" defaultPath={row?.cover_path} items={media} loadError={mediaError} />
      )}
      <MediaPicker label="Open Graph şəkli" name="og_image_path" defaultPath={row?.og_image_path} items={media} loadError={mediaError} />
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
          defaultPaths={(row?.gallery ?? []).map((item) => item?.path).filter((path): path is string => Boolean(path))}
          items={media}
          loadError={mediaError}
        />
      ) : null}

      <LocaleTabs
        locale={editorLocale}
        onLocaleChange={setEditorLocale}
        render={(locale) => {
          const t = translations[locale] ?? {};
          const fallbackSlug =
            table === "blog_posts"
              ? fallbackBlogSlugs(row?.slug ?? "")[locale as Locale] || (locale === "az" ? row?.slug : "") || ""
              : locale === "az"
                ? row?.slug || ""
                : "";
          return (
            <div className="grid gap-4">
              <Field label={`Başlıq (${locale})`}>
                <TextInput name={`${locale}_title`} defaultValue={t.title || t.name || ""} />
              </Field>
              <Field label={`Qısa mətn (${locale})`}>
                <TextArea name={`${locale}_short`} defaultValue={t.short || t.excerpt || t.intro || ""} />
              </Field>
              <Field label={projectBodyLabel(locale)}>
                <TextArea
                  name={`${locale}_body`}
                  className="min-h-56"
                  defaultValue={t.body || t.full || ""}
                  placeholder={
                    table === "projects"
                      ? "Layihənin qısa təsviri — public səhifədə TƏSVİR altında göstərilir"
                      : "Markdown: ## başlıq, - siyahı, [link](/xidmetler)"
                  }
                />
              </Field>
              {table === "projects" ? (
                <div className="rounded-md border border-charcoal/10 p-4">
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal/55">
                    Sol sütun məlumatları ({locale})
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={`Tarix / il (${locale})`}>
                      <TextInput name={`${locale}_year`} defaultValue={t.year || ""} placeholder="2024" />
                    </Field>
                    <Field label={`Status (${locale})`}>
                      <TextInput
                        name={`${locale}_status`}
                        defaultValue={t.status || ""}
                        placeholder={locale === "az" ? "Tamamlanıb" : "Completed"}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label={`Müştəri (${locale})`}>
                        <TextInput
                          name={`${locale}_client`}
                          defaultValue={t.client || ""}
                          placeholder={locale === "az" ? "Müştəri adı" : "Client name"}
                        />
                      </Field>
                    </div>
                    {locale === "az" ? null : (
                      <>
                        <div className="sm:col-span-2">
                          <Field label={`Lokasiya (${locale})`}>
                            <TextInput
                              name={`${locale}_location`}
                              defaultValue={t.location || ""}
                              placeholder="Berlin, Germany"
                            />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field label={`Sahə / ölçü (${locale})`}>
                            <TextInput name={`${locale}_area`} defaultValue={t.area || ""} placeholder="450 m²" />
                          </Field>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
              <Field label={`SEO title (${locale})`}>
                <TextInput name={`${locale}_seoTitle`} defaultValue={t.seoTitle || ""} />
              </Field>
              <Field label={`Meta description (${locale})`}>
                <TextArea name={`${locale}_seoDesc`} defaultValue={t.description || ""} />
              </Field>
              {localeSlugEntity ? (
                <>
                  <Field label={`Public slug (${locale})`}>
                    <TextInput
                      name={`${locale}_slug`}
                      required={locale === "az"}
                      defaultValue={t.slug || fallbackSlug}
                      placeholder={`${locale}-slug`}
                    />
                  </Field>
                  <p className="text-xs text-charcoal/45">
                    Public URL:{" "}
                    {productionAbsoluteUrl(
                      locale,
                      `${publicBase}/${t.slug || fallbackSlug || row?.slug || "slug"}`,
                    )}
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`${locale}_published`}
                      defaultChecked={t.published !== false && Boolean(t.title || t.name)}
                    />
                    Bu dil versiyasını dərc et
                  </label>
                  <p className="text-xs text-charcoal/45">
                    {!(t.title || t.name)
                      ? "Status: tərcümə yoxdur"
                      : row?.status !== "published" || t.published === false
                        ? "Status: dərc olunmayıb"
                        : "Status: dərc olunub"}
                  </p>
                  <Field label={`Şəkil alt (${locale})`}>
                    <TextInput name={`${locale}_imageAlt`} defaultValue={t.imageAlt || ""} />
                  </Field>
                  {table === "blog_posts" ? (
                    <>
                      <Field label={`CTA (${locale})`}>
                        <TextInput name={`${locale}_ctaLabel`} defaultValue={t.ctaLabel || ""} />
                      </Field>
                      <Field label={`CTA mətn (${locale})`}>
                        <TextArea name={`${locale}_ctaText`} defaultValue={t.ctaText || ""} />
                      </Field>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        }}
      />

      {table === "blog_posts" ? (
        <LinkedInShareSection
          key={editorLocale}
          editorLocale={editorLocale}
          published={row?.status === "published"}
          localeTitles={{
            az: translations.az?.title || translations.az?.name || "",
            en: translations.en?.title || translations.en?.name || "",
            de: translations.de?.title || translations.de?.name || "",
            ru: translations.ru?.title || translations.ru?.name || "",
          }}
          localeSlugs={{
            az: translations.az?.slug || fallbackBlogSlugs(row?.slug ?? "").az || row?.slug || "",
            en: translations.en?.slug || fallbackBlogSlugs(row?.slug ?? "").en,
            de: translations.de?.slug || fallbackBlogSlugs(row?.slug ?? "").de,
            ru: translations.ru?.slug || fallbackBlogSlugs(row?.slug ?? "").ru,
          }}
        />
      ) : null}

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
        {table === "insights" && row?.id ? (
          <a
            href={`/admin/preview/insights/${row.id}`}
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
