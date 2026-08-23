import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { PUBLIC_INSIGHTS_GRID } from "@/lib/public-widescreen-layout";
import { SiteFooter } from "@/components/site-footer";
import { BlogCard } from "@/components/blog-card";
import { getPublicBlogPosts } from "@/lib/cms/public";
import { isBlogLocaleLive } from "@/lib/blog-urls";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  return entryMetadata({
    locale,
    path: "/bloq",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function BlogIndexPage({ params }: PageProps<"/[locale]/bloq">) {
  const locale = asLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const allPosts = await getPublicBlogPosts();
  const blogPosts = allPosts.filter((post) => isBlogLocaleLive(post, locale));

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container wide>
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">
              {t("eyebrow")}
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] text-charcoal sm:text-6xl">
              {t("title")}
            </h1>
            <p className="text-base font-light leading-relaxed text-charcoal/70 sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className={`mt-16 border-t border-charcoal/10 pt-12 ${PUBLIC_INSIGHTS_GRID}`}>
            {blogPosts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                locale={locale}
                categoryLabel={t(`categories.${post.category}`)}
                readLabel={t("read")}
              />
            ))}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
