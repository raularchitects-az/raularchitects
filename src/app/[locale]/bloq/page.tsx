import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog-card";
import { blogPosts } from "@/data/blog";
import { absoluteUrl, languageAlternates } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const path = "/bloq";
  const canonical = absoluteUrl(locale, path);

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical,
      siteName: "Raul Architects",
      locale,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogIndexPage({ params }: PageProps<"/[locale]/bloq">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
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

          <div className="mt-16 grid grid-cols-1 gap-10 border-t border-charcoal/10 pt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
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
      <Footer />
    </>
  );
}
