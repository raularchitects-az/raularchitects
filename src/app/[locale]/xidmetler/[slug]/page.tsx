import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, HardHat, Boxes, Sofa, Building2, Check, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/footer";
import { routing } from "@/i18n/routing";
import { services, getService } from "@/data/services";

const icons: Record<string, LucideIcon> = { HardHat, Boxes, Sofa, Building2 };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    services.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!getService(slug)) return {};
  const t = await getTranslations({ locale, namespace: "serviceDetail" });
  return { title: `${t(`items.${slug}.title`)} — Raul Architects` };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/[locale]/xidmetler/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const service = getService(slug);
  if (!service) notFound();

  const t = await getTranslations("serviceDetail");
  const Icon = icons[service.icon] ?? Building2;
  const points = t.raw(`items.${slug}.points`) as string[];

  return (
    <>
      <section className="bg-charcoal py-24 sm:py-32">
        <Container>
          <Link
            href="/xidmetler"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/60 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>

          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4">
              <span className="text-sm text-bronze-light">{service.number}</span>
              <h1 className="font-serif text-4xl text-cream sm:text-6xl">{t(`items.${slug}.title`)}</h1>
              <p className="max-w-xl text-base leading-relaxed text-cream/65 sm:text-lg">
                {t(`items.${slug}.intro`)}
              </p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-bronze-light/30 text-bronze-light">
              <Icon className="h-7 w-7" strokeWidth={1.25} />
            </span>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <div className="grid gap-6 border-t border-charcoal/10 pt-10 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-bronze-dark/30 text-bronze-dark">
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <p className="text-base leading-relaxed text-charcoal/75">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-charcoal/10 pt-10">
            <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">{t("ctaTitle")}</h2>
            <Link
              href="/elaqe"
              className="group inline-flex items-center gap-2 border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
            >
              {t("ctaButton")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}
