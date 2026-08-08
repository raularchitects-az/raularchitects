import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/footer";

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
  const countries = t.raw("countries") as string[];
  const blockKeys = ["raul", "team", "international", "bim"] as const;

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">{t("eyebrow")}</span>
            <h1 className="max-w-2xl font-serif text-4xl leading-[1.1] text-charcoal sm:text-6xl">{t("title")}</h1>
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
            <p className="max-w-xl text-base leading-relaxed text-charcoal/70 sm:text-lg">{t("intro")}</p>
          </div>

          <div className="mt-20 grid gap-x-10 gap-y-12 border-t border-charcoal/10 pt-16 sm:grid-cols-2">
            {blockKeys.map((key) => (
              <div key={key} className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl text-charcoal">{t(`blocks.${key}.title`)}</h3>
                <p className="text-base leading-relaxed text-charcoal/65">{t(`blocks.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}
