import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { SiteFooter } from "@/components/site-footer";
import { getPublicPortfolio } from "@/lib/cms/public";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "portfolioPage" });
  return entryMetadata({
    locale,
    path: "/portfolio",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function PortfolioPage({ params }: PageProps<"/[locale]/portfolio">) {
  const locale = asLocale((await params).locale);
  setRequestLocale(locale);
  const items = await getPublicPortfolio(locale);

  return (
    <>
      <Suspense fallback={null}>
        <PortfolioGrid items={items} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
