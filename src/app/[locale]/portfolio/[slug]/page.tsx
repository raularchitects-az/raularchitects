import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/footer";
import { routing } from "@/i18n/routing";
import { portfolioItems, getPortfolioItem } from "@/data/portfolio";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    portfolioItems.map((item) => ({ locale, slug: item.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) return {};
  const c = await getTranslations({ locale, namespace: "categories" });
  return { title: `${c(item.category)} — Raul Architects` };
}

export default async function PortfolioDetailPage({
  params,
}: PageProps<"/[locale]/portfolio/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = getPortfolioItem(slug);
  if (!item) notFound();

  const t = await getTranslations("portfolioPage");
  const c = await getTranslations("categories");
  const co = await getTranslations("countries");
  const location = co(item.country);

  return (
    <>
      <section className="relative h-[70vh] w-full overflow-hidden sm:h-[92vh]">
        <Image src={item.image} alt={c(item.category)} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 p-6 sm:p-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-bronze-light/80">{location}</span>
          <h1 className="mt-2 text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl">
            {c(item.category)}
          </h1>
          <span className="mt-3 block text-xs uppercase tracking-[0.16em] text-cream/60">
            {t("realProject")}
          </span>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <Container className="flex max-w-3xl flex-col items-start gap-10">
          <p className="text-lg font-light leading-relaxed text-charcoal/70">
            {t("detailIntro", { location })}
          </p>
          <Link
            href="/elaqe"
            className="group inline-flex items-center gap-2 border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
          >
            {t("ctaLabel")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </Container>
      </section>

      <Footer />
    </>
  );
}
