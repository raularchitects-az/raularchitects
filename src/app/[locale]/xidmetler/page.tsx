import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toIntlHref } from "@/lib/public-paths";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { getPublicServices } from "@/lib/cms/public";
import { safeMessage } from "@/lib/i18n/safe-raw";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return entryMetadata({
    locale,
    path: "/xidmetler",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/xidmetler">) {
  const locale = asLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  const cmsServices = await getPublicServices(locale);
  const list = cmsServices;

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container wide>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

          <div className="mt-16 flex flex-col border-t border-charcoal/10">
            {list.map((service) => (
              <Link
                key={service.slug}
                href={toIntlHref(`/xidmetler/${service.slug}`)}
                className="group flex items-center justify-between gap-6 border-b border-charcoal/10 py-8 transition-colors duration-300 hover:bg-charcoal sm:py-10"
              >
                <div className="flex items-baseline gap-4 sm:gap-8">
                  <span className="text-sm text-bronze-dark">{service.number}</span>
                  <span className="text-3xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-cream sm:text-5xl">
                    {service.title && service.title !== service.slug
                      ? service.title
                      : safeMessage((key) => t(key), `items.${service.slug}.title`, service.slug)}
                  </span>
                </div>
                <ArrowUpRight
                  className="h-7 w-7 shrink-0 text-charcoal/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light"
                  strokeWidth={1.25}
                />
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
