import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect as nextRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { routing } from "@/i18n/routing";
import { ProjectGallery } from "@/components/project-gallery";
import { portfolioItems, getPortfolioItem } from "@/data/portfolio";
import { getImportedEntry } from "@/data/folder-imports";
import { getPublicPortfolio, getPublicPortfolioItem, resolveSlugRedirect } from "@/lib/cms/public";
import { entryMetadata } from "@/lib/cms/metadata";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const cms = await getPublicPortfolio("en");
  const slugs = new Set([...portfolioItems.map((item) => item.slug), ...cms.map((item) => item.slug)]);
  return routing.locales.flatMap((locale) => [...slugs].map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cms = await getPublicPortfolioItem(slug, locale);
  const item = getPortfolioItem(slug);
  if (!item && !cms) return {};
  const imported = getImportedEntry(slug);
  const c = await getTranslations({ locale, namespace: "categories" });
  const title = cms?.seoTitle || cms?.title || imported?.title || (item ? c(item.category) : slug);
  return entryMetadata({
    locale,
    path: `/portfolio/${slug}`,
    title,
    description: cms?.metaDescription || cms?.description,
    image: cms?.ogImage || cms?.image || item?.image,
    canonicalUrl: cms?.canonicalUrl,
  });
}

export default async function PortfolioDetailPage({
  params,
}: PageProps<"/[locale]/portfolio/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const redirected = await resolveSlugRedirect("portfolio", slug);
  if (redirected) {
    nextRedirect(locale === routing.defaultLocale ? redirected.to_path : `/${locale}${redirected.to_path}`);
  }

  const cmsItem = await getPublicPortfolioItem(slug, locale);
  const item = getPortfolioItem(slug) ?? cmsItem;
  if (!item) notFound();

  const t = await getTranslations("portfolioPage");
  const c = await getTranslations("categories");
  const co = await getTranslations("countries");
  const imported = getImportedEntry(slug);
  const location = item.country ? co(item.country) : null;
  const title = cmsItem?.title || imported?.title || c(item.category);
  const description = cmsItem?.description || "";
  const importedGallery = imported?.gallery.map((image, index) => ({
    src: image.src,
    alt: `${title} ${image.kind} ${index + 1}`,
    objectPosition: image.objectPosition,
  })) ?? [];
  const cmsGallery = (cmsItem?.gallery ?? []).map((src, index) => ({
    src,
    alt: `${title} ${index + 1}`,
  }));
  const gallery = importedGallery.length ? importedGallery : cmsGallery;
  const videoUrl = cmsItem?.videoUrl ?? null;
  const canonical = cmsItem?.canonicalUrl || absoluteUrl(locale, `/portfolio/${slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url: canonical,
    image: cmsItem?.image || item.image,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="relative h-[70vh] w-full overflow-hidden sm:h-[92vh]">
        <Image
          src={imported?.hero.src ?? cmsItem?.image ?? item.image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={imported ? { objectPosition: imported.hero.objectPosition } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 p-6 sm:p-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          {location ? (
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-bronze-light/80">{location}</span>
          ) : null}
          <h1 className={`${location ? "mt-2" : ""} text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl`}>
            {title}
          </h1>
          <span className="mt-3 block text-xs uppercase tracking-[0.16em] text-cream/60">
            {t("realProject")}
          </span>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <Container className="flex max-w-3xl flex-col items-start gap-10">
          {description ? (
            <p className="text-lg font-light leading-relaxed text-charcoal/70">{description}</p>
          ) : location ? (
            <p className="text-lg font-light leading-relaxed text-charcoal/70">
              {t("detailIntro", { location })}
            </p>
          ) : null}
          <Link
            href="/elaqe"
            className="group inline-flex items-center gap-2 border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
          >
            {t("ctaLabel")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </Container>
      </section>

      {gallery.length > 0 || videoUrl ? (
        <section className="bg-cream pb-16 sm:pb-24">
          <Container>
            {gallery.length > 0 ? <ProjectGallery images={gallery} /> : null}
            {videoUrl ? (
              <div className="mt-8 sm:mt-10">
                <video controls playsInline preload="metadata" className="h-auto w-full bg-charcoal">
                  <source src={mediaPublicUrl(videoUrl)} />
                </video>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      <SiteFooter />
    </>
  );
}
