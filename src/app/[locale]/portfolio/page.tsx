import type { Metadata } from "next";
import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { SiteFooter } from "@/components/site-footer";
import { getPublicPortfolio } from "@/lib/cms/public";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";
import { localizePublicPath } from "@/lib/public-paths";

export const revalidate = 60;

function queryStringFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (await isInsightsRestructureActive()) {
    return { robots: { index: false, follow: true } };
  }
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "portfolioPage" });
  return entryMetadata({
    locale,
    path: "/portfolio",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = asLocale((await params).locale);
  setRequestLocale(locale);

  if (await isInsightsRestructureActive()) {
    const query = queryStringFromSearchParams(await searchParams);
    permanentRedirect(`${localizePublicPath(locale, "/layihelar")}${query}`);
  }

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
