import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { InsightsCard } from "@/components/insights-card";
import { getPublicInsights } from "@/lib/cms/public";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";
import { isInsightLocaleLive } from "@/lib/insights-urls";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!(await isInsightsRestructureActive())) {
    return { robots: { index: false, follow: true } };
  }
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "insights" });
  return entryMetadata({
    locale,
    path: "/insights",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function InsightsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!(await isInsightsRestructureActive())) notFound();

  const locale = asLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const allPosts = await getPublicInsights();
  const insightPosts = allPosts.filter((post) => isInsightLocaleLive(post, locale));

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
            {insightPosts.map((post) => (
              <InsightsCard
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
