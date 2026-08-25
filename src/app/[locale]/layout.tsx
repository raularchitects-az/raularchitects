import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, asLocale } from "@/i18n/routing";
import { Navbar } from "@/components/navbar";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";
import { PRODUCTION_SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(PRODUCTION_SITE_URL),
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = asLocale((await params).locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, insightsActive] = await Promise.all([getMessages(), isInsightsRestructureActive()]);

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar insightsActive={insightsActive} />
      <div className="pt-20">{children}</div>
      <WhatsAppFloat />
      <SiteAnalytics />
    </NextIntlClientProvider>
  );
}
