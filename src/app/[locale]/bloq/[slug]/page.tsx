import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { BlogLocaleSwitch } from "@/components/locale-switch-context";
import { routing, type Locale, asLocale } from "@/i18n/routing";
import { localizePublicPath, toIntlHref } from "@/lib/public-paths";
import { formatBlogDate, getBlogCopy, getBlogImageAlt } from "@/data/blog";
import { getPublicBlogPosts, resolvePublicBlog } from "@/lib/cms/public";
import { blogLanguageAlternates, blogPostPath, getBlogLocaleSlug } from "@/lib/blog-urls";
import { BlogBody } from "@/lib/blog-body";
import {
  SITE_NAME,
  SITE_URL,
  absoluteMediaUrl,
  ogAlternateLocales,
  ogLocale,
  productionAbsoluteUrl,
} from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts();
  return routing.locales.flatMap((locale) => {
    const slugs = new Set<string>();
    for (const post of posts) {
      slugs.add(post.slug);
      const localized = getBlogLocaleSlug(post, locale);
      if (localized) slugs.add(localized);
    }
    return [...slugs].map((slug) => ({ locale, slug }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = asLocale(localeParam);
  const resolved = await resolvePublicBlog(locale, slug);
  if (resolved.redirectTo) {
    permanentRedirect(localizePublicPath(locale, resolved.redirectTo));
  }
  if (!resolved.post) return {};

  const t = await getTranslations({ locale, namespace: "blog" });
  if (!resolved.live) {
    return {
      title: t("unavailableTitle"),
      robots: { index: false, follow: true },
    };
  }

  const copy = getBlogCopy(resolved.post, locale);
  if (!copy) return { robots: { index: false, follow: true } };

  const path = blogPostPath(resolved.post, locale);
  const canonical = productionAbsoluteUrl(locale, path);
  const imageUrl = absoluteMediaUrl(resolved.post.image);
  const title = copy.seoTitle || copy.title;
  const description = copy.description || copy.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: blogLanguageAlternates(resolved.post),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      publishedTime: resolved.post.publishedAt,
      modifiedTime: resolved.post.publishedAt,
      images: [
        {
          url: imageUrl,
          alt: getBlogImageAlt(resolved.post, locale),
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
  const { locale: localeParam, slug } = await params;
  const locale = asLocale(localeParam);
  setRequestLocale(locale);

  const resolved = await resolvePublicBlog(locale, slug);
  if (resolved.redirectTo) {
    permanentRedirect(localizePublicPath(locale, resolved.redirectTo));
  }
  if (!resolved.post) notFound();

  const post = resolved.post;
  const t = await getTranslations("blog");
  const switchPaths = Object.fromEntries(
    routing.locales.map((code) => {
      const localeSlug = getBlogLocaleSlug(post, code) || post.slug;
      return [code, localeSlug ? { pathname: "/bloq/[slug]", params: { slug: localeSlug } } : "/bloq"];
    }),
  ) as Record<Locale, "/bloq" | { pathname: "/bloq/[slug]"; params: { slug: string } }>;

  if (!resolved.live) {
    return (
      <>
        <BlogLocaleSwitch paths={switchPaths} />
        <section className="bg-cream py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Link
                href="/bloq"
                className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50 transition-colors duration-300 hover:text-bronze-dark"
              >
                ← {t("back")}
              </Link>
              <h1 className="mt-10 text-3xl font-semibold text-charcoal sm:text-5xl">{t("unavailableTitle")}</h1>
              <p className="mt-6 text-base font-light leading-relaxed text-charcoal/70">{t("unavailableBody")}</p>
            </div>
          </Container>
        </section>
        <SiteFooter />
      </>
    );
  }

  const nav = await getTranslations("nav");
  const services = await getTranslations("servicesPage");
  const copy = getBlogCopy(post, locale);
  if (!copy) notFound();

  const canonical = productionAbsoluteUrl(locale, blogPostPath(post, locale));

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
      <BlogLocaleSwitch paths={switchPaths} />
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
                href={toIntlHref(`/xidmetler/${post.serviceSlug}`)}
                className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-bronze-dark transition-colors duration-300 hover:text-[#6b4a32]"
              >
                {copy.ctaLabel} →
              </Link>
            </div>

            <nav aria-label={t("related")} className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-charcoal/10 pt-8">
              {post.relatedHrefs.map((href) => (
                <Link
                  key={href}
                  href={toIntlHref(href)}
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
