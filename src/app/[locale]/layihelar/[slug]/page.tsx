import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect as nextRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ProjectLeadForm } from "@/components/project-lead-form";
import { SiteFooter } from "@/components/site-footer";
import { BlogLocaleSwitch } from "@/components/locale-switch-context";
import { routing, asLocale } from "@/i18n/routing";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectInfoSection } from "@/components/project-info-section";
import { getProject, getProjectGalleryGroups } from "@/data/projects";
import { getImportedEntry } from "@/data/folder-imports";
import { getPublicContact, getPublicProject, getPublicProjects, resolveSlugRedirect } from "@/lib/cms/public";
import { entryMetadata, whatsappHref } from "@/lib/cms/metadata";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import { SITE_NAME, SITE_URL, publicCanonicalUrl } from "@/lib/site";
import { localizePublicPath } from "@/lib/public-paths";
import { buildProjectLocaleSwitchPaths } from "@/lib/project-urls";

function formatProjectYear(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 4);
  return trimmed;
}

function factValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function factOrSample(value: string | null | undefined, sample: string) {
  return factValue(value) ?? sample;
}

export async function generateStaticParams() {
  const cms = await getPublicProjects("en");
  const slugs = [...new Set(cms.map((project) => project.slug))];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = asLocale(localeParam);
  const cms = await getPublicProject(slug, locale);
  if (!cms) return {};
  const project = getProject(slug);
  const imported = getImportedEntry(slug);
  const t = await getTranslations({ locale, namespace: "projectDetail" });
  const title = cms?.seoTitle || cms?.title || imported?.title || (project ? t(`items.${slug}.title`) : slug);
  return entryMetadata({
    locale,
    path: `/layihelar/${slug}`,
    title,
    description: cms?.metaDescription || cms?.description,
    image: cms?.ogImage || cms?.image || project?.image,
    canonicalUrl: cms?.canonicalUrl,
  });
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/[locale]/layihelar/[slug]">) {
  const { locale: localeParam, slug } = await params;
  const locale = asLocale(localeParam);
  setRequestLocale(locale);

  const redirected = await resolveSlugRedirect("layihelar", slug);
  if (redirected) {
    nextRedirect(localizePublicPath(locale, redirected.to_path));
  }

  const cmsProject = await getPublicProject(slug, locale);
  if (!cmsProject) notFound();
  const project = getProject(slug) ?? {
    slug,
    category: cmsProject.category,
    image: cmsProject.image,
    title: cmsProject.title,
  };

  const t = await getTranslations("projectDetail");
  const infoT = await getTranslations("projectDetail.info");
  const co = await getTranslations("countries");
  const contact = await getPublicContact();
  const imported = getImportedEntry(slug);
  const description = (cmsProject && "description" in cmsProject && cmsProject.description)
    ? String(cmsProject.description)
    : imported
      ? ""
      : getProject(slug)
        ? t(`items.${slug}.description`)
        : "";
  const overviewText = description.trim() || t("overviewFallback");
  const title = cmsProject?.title || imported?.title || (getProject(slug) ? t(`items.${slug}.title`) : slug);
  const is13Import = imported?.source === "raul-13-project-import";
  const location = (is13Import && imported.country ? co(imported.country) : null)
    || (cmsProject && "location" in cmsProject ? cmsProject.location : null);
  const competitionNoteByLocale: Record<string, string> = {
    az: "Müsabiqə konsepti",
    en: "Competition concept",
    ru: "Концепция конкурса",
    de: "Wettbewerbskonzept",
  };
  const competitionNote = is13Import && imported.note === "competition-concept"
    ? (competitionNoteByLocale[locale] ?? competitionNoteByLocale.en)
    : null;
  const importedVideo = is13Import ? imported.video : null;
  const cmsVideo = cmsProject?.videoUrl ?? null;
  const sectionUrls = (key: "exterior" | "interior" | "plan" | "bim") =>
    (cmsProject?.sections?.[key]?.media ?? []).map((item) => mediaPublicUrl(item.path)).filter(Boolean);
  const cmsGallery = cmsProject?.gallery ?? [];
  const hasCmsMedia = Boolean(
    sectionUrls("exterior").length ||
      sectionUrls("interior").length ||
      sectionUrls("plan").length ||
      sectionUrls("bim").length ||
      cmsGallery.length,
  );
  const groups = hasCmsMedia
    ? {
        exteriorImages: sectionUrls("exterior").length ? sectionUrls("exterior") : cmsGallery,
        interiorImages: sectionUrls("interior"),
        planningImages: sectionUrls("plan").length ? sectionUrls("plan") : sectionUrls("bim"),
      }
    : getProjectGalleryGroups(slug);
  const toCards = (sources: string[], label: string) =>
    sources.map((src, index) => ({ src, alt: `${title} ${label} ${index + 1}` }));
  const galleryRows = [
    toCards(groups.exteriorImages, "exterior"),
    toCards(groups.interiorImages, "interior"),
    toCards(groups.planningImages, "planning"),
  ];
  const gallery = galleryRows.flat();
  const importedGallery = imported?.gallery.map((image, index) => ({
    src: image.src,
    alt: `${title}${image.caption ? ` — ${image.caption}` : ""} ${image.kind} ${index + 1}`,
    objectPosition: image.objectPosition,
    caption: image.caption ?? null,
  })) ?? [];
  const infoFacts = [
    {
      label: infoT("year"),
      value: formatProjectYear(cmsProject.year) ?? infoT("samples.year"),
    },
    {
      label: infoT("status"),
      value: factOrSample(cmsProject.status, infoT("samples.status")),
    },
    {
      label: infoT("client"),
      value: factOrSample(cmsProject.client, infoT("samples.client")),
    },
    {
      label: infoT("area"),
      value: factOrSample(cmsProject.area, infoT("samples.area")),
    },
  ];
  const canonical = publicCanonicalUrl(locale, `/layihelar/${slug}`, cmsProject?.canonicalUrl);
  const switchPaths = await buildProjectLocaleSwitchPaths(slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url: canonical,
    image: cmsProject?.image || project.image,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <BlogLocaleSwitch paths={switchPaths} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="relative h-[70vh] w-full overflow-hidden sm:h-[92vh]">
        <Image
          src={imported?.hero.src ?? cmsProject?.image ?? project.image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={imported ? { objectPosition: imported.hero.objectPosition } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 p-6 sm:p-10">
          <Link
            href="/layihelar"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>
        </div>

        {imported ? (
          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 lg:p-14">
            {location || competitionNote ? (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-bronze-light/80">
                {[location, competitionNote].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <h1 className="text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </div>
        ) : (
          <div className="absolute inset-0 z-10 flex">
            <div className="flex w-[40%] items-end p-6 sm:p-10 lg:w-[38%] lg:p-14">
              <h1 className="text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl">
                {title}
              </h1>
            </div>
            <div className="hidden w-[60%] items-center justify-center px-5 py-24 md:flex lg:px-8 lg:py-20 xl:px-12">
              <div className="w-4/5">
                <ProjectGallery images={gallery} rows={galleryRows} variant="hero" />
              </div>
            </div>
          </div>
        )}
      </section>

      <ProjectInfoSection
        facts={infoFacts}
        description={overviewText}
        descriptionLabel={infoT("description")}
      />

      {imported && (importedGallery.length > 0 || importedVideo) ? (
        <section className="bg-cream py-10 sm:py-16">
          <Container wide>
            <ProjectGallery images={importedGallery} />
            {importedVideo ? (
              <div className="mt-8 sm:mt-10">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={importedVideo.poster}
                  width={importedVideo.width}
                  height={importedVideo.height}
                  className="h-auto w-full bg-charcoal"
                >
                  <source src={importedVideo.src} type="video/mp4" />
                </video>
              </div>
            ) : null}
          </Container>
        </section>
      ) : imported ? null : (
        <section className="bg-cream py-10 md:hidden">
          <Container wide>
            <ProjectGallery images={gallery} rows={galleryRows} />
            {cmsVideo ? (
              <div className="mt-8 sm:mt-10">
                <video controls playsInline preload="metadata" className="h-auto w-full bg-charcoal">
                  <source src={cmsVideo} />
                </video>
              </div>
            ) : null}
          </Container>
        </section>
      )}

      {!imported && cmsVideo ? (
        <section className="hidden bg-cream pb-16 md:block">
          <Container wide>
            <video controls playsInline preload="metadata" className="h-auto w-full bg-charcoal">
              <source src={cmsVideo} />
            </video>
          </Container>
        </section>
      ) : null}

      <section className="bg-charcoal py-24 sm:py-32">
        <Container wide>
          <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-8 text-center">
            <h2 className="text-3xl font-semibold text-cream sm:text-4xl">{t("adaptTitle")}</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#apply"
                className="group inline-flex items-center justify-center gap-2 border border-bronze-light bg-bronze-dark px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:bg-bronze-light hover:text-charcoal"
              >
                {t("applyCta")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </a>
              <a
                href={whatsappHref(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 border border-cream/25 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-light hover:text-bronze-light"
              >
                {t("whatsappCta")}
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div id="apply" className="mt-16 scroll-mt-28">
            <ProjectLeadForm />
          </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </>
  );
}
