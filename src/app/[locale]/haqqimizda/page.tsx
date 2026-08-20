import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/cms/public";
import { safeRawArray } from "@/lib/i18n/safe-raw";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/haqqimizda">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const countries = safeRawArray(t, "countries");
  const blockKeys = ["raul", "team", "international", "bim"] as const;
  const settings = await getSiteSettings();
  const intro = typeof settings.about?.intro === "string" && settings.about.intro.trim()
    ? String(settings.about.intro)
    : t("intro");
  const certificates = typeof settings.about?.certificates === "string"
    ? settings.about.certificates.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">{t("eyebrow")}</span>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] text-charcoal sm:text-6xl">{t("title")}</h1>
            <div className="flex flex-wrap gap-3">
              {countries.map((country) => (
                <span
                  key={country}
                  className="border border-bronze-dark/30 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-bronze-dark"
                >
                  {country}
                </span>
              ))}
            </div>
            <p className="max-w-xl text-base font-light leading-relaxed text-charcoal/70 sm:text-lg">
              {intro}
            </p>
            {certificates.length > 0 ? (
              <ul className="mt-4 flex max-w-xl flex-col gap-2 text-sm text-charcoal/65">
                {certificates.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-20 grid gap-x-10 gap-y-12 border-t border-charcoal/10 pt-16 sm:grid-cols-2">
            {blockKeys.map((key) => (
              <div key={key} className="flex flex-col gap-3">
                <h3 className="text-2xl font-semibold text-charcoal">{t(`blocks.${key}.title`)}</h3>
                <p className="text-base font-light leading-relaxed text-charcoal/65">{t(`blocks.${key}.description`)}</p>
              </div>
            ))}
          </div>

          <Link
            href="/haqqimizda/raul-nagiyev"
            className="group mt-16 flex items-center justify-between gap-6 border-t border-charcoal/10 py-8"
          >
            <span className="text-2xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-3xl">
              {t("raulCta")}
            </span>
            <ArrowUpRight
              className="h-6 w-6 shrink-0 text-charcoal/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-dark"
              strokeWidth={1.25}
            />
          </Link>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
