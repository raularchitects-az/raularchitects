import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { SiteFooter } from "@/components/site-footer";
import { getPublicPortfolio } from "@/lib/cms/public";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolioPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function PortfolioPage({ params }: PageProps<"/[locale]/portfolio">) {
  const { locale } = await params;
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
