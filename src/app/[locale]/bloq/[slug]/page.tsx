import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { routing } from "@/i18n/routing";
import { blogPosts as staticBlog, formatBlogDate, getBlogCopy, getBlogImageAlt, getBlogPost as getStaticBlogPost } from "@/data/blog";
import { getPublicBlogPost, getPublicBlogPosts, resolveSlugRedirect } from "@/lib/cms/public";
import { BlogBody } from "@/lib/blog-body";
import {
  SITE_NAME,
  SITE_URL,
  absoluteMediaUrl,
  languageAlternates,
  ogAlternateLocales,
  ogLocale,
  productionAbsoluteUrl,
} from "@/lib/site";

export async function generateStaticParams() {
  const cms = await getPublicBlogPosts();
  const slugs = cms.length ? cms : staticBlog;
  return routing.locales.flatMap((locale) =>
    slugs.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = (await getPublicBlogPost(slug)) ?? getStaticBlogPost(slug);
  if (!post) return {};

  const copy = getBlogCopy(post, locale);
  const path = `/bloq/${slug}`;
  const canonical = productionAbsoluteUrl(locale, path);
  const imageUrl = absoluteMediaUrl(post.image);
  const title = copy.seoTitle || copy.title;
  const description = copy.description || copy.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      images: [
        {
          url: imageUrl,
          alt: getBlogImageAlt(post, locale),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/[locale]/bloq/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const redirected = await resolveSlugRedirect("bloq", slug);
  if (redirected) {
    const path = redirected.to_path;
    redirect(locale === routing.defaultLocale ? path : `/${locale}${path}`);
  }

  const post = (await getPublicBlogPost(slug)) ?? getStaticBlogPost(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const nav = await getTranslations("nav");
  const services = await getTranslations("servicesPage");
  const copy = getBlogCopy(post, locale);
  const canonical = productionAbsoluteUrl(locale, `/bloq/${slug}`);

  const relatedLabels: Record<string, string> = {
    "/elaqe": nav("contact"),
    "/layihelar": nav("projects"),
    "/portfolio": nav("portfolio"),
    "/xidmetler": nav("services"),
    "/haqqimizda": nav("about"),
    "/xidmetler/bim-ile-layihelendirme": services("items.bim-ile-layihelendirme.title"),
    "/xidmetler/tikinti-ve-temir": services("items.tikinti-ve-temir.title"),
    "/xidmetler/interyer-dizayn": services("items.interyer-dizayn.title"),
    "/xidmetler/seherselme-layiheleri": services("items.seherselme-layiheleri.title"),
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: copy.title,
    description: copy.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: locale,
    url: canonical,
    image: {
      "@type": "ImageObject",
      url: absoluteMediaUrl(post.image),
      caption: getBlogImageAlt(post, locale),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    author: {
      "@type": "Person",
      name: t("author"),
      url: productionAbsoluteUrl(locale, "/haqqimizda/raul-nagiyev"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="bg-cream py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/bloq"
              className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50 transition-colors duration-300 hover:text-bronze-dark"
            >
              ← {t("back")}
            </Link>

            <header className="mt-10 flex flex-col gap-4">
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-bronze-dark">
                {t(`categories.${post.category}`)}
              </span>
              <h1 className="text-3xl font-semibold leading-[1.15] text-charcoal sm:text-5xl">
                {copy.title}
              </h1>
              <time dateTime={post.publishedAt} className="text-sm text-charcoal/45">
                {formatBlogDate(post.publishedAt, locale)}
              </time>
            </header>

            <figure className="relative mt-10 aspect-[16/10] overflow-hidden bg-cream-dark">
              <Image
                src={post.image}
                alt={getBlogImageAlt(post, locale)}
                fill
                priority
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover"
              />
            </figure>

            <div className="mt-12">
              <BlogBody blocks={copy.blocks} />
            </div>

            <div className="mt-16 border-t border-charcoal/10 pt-10">
              <p className="text-base leading-relaxed text-charcoal/75">{copy.ctaText}</p>
              <Link
                href={`/xidmetler/${post.serviceSlug}`}
                className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-bronze-dark transition-colors duration-300 hover:text-[#6b4a32]"
              >
                {copy.ctaLabel} →
              </Link>
            </div>

            <nav aria-label={t("related")} className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-charcoal/10 pt-8">
              {post.relatedHrefs.map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal/55 transition-colors duration-300 hover:text-bronze-dark"
                >
                  {relatedLabels[href] ?? href}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </article>

      <SiteFooter />
    </>
  );
}
