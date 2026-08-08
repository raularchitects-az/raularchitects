import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Footer } from "@/components/footer";
import { services } from "@/data/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/xidmetler">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

          <div className="mt-16 flex flex-col border-t border-charcoal/10">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/xidmetler/${service.slug}`}
                className="group flex items-center justify-between gap-6 border-b border-charcoal/10 py-8 transition-colors duration-300 hover:bg-charcoal sm:py-10"
              >
                <div className="flex items-baseline gap-4 sm:gap-8">
                  <span className="text-sm text-bronze-dark">{service.number}</span>
                  <span className="font-serif text-3xl text-charcoal transition-colors duration-300 group-hover:text-cream sm:text-5xl">
                    {t(`items.${service.slug}.title`)}
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
      <Footer />
    </>
  );
}
