import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { InquiryForm } from "@/components/inquiry-form";
import { Footer } from "@/components/footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function ContactPage({ params }: PageProps<"/[locale]/elaqe">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-4">
                <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">{t("eyebrow")}</span>
                <h1 className="max-w-lg text-4xl font-semibold leading-[1.1] text-charcoal sm:text-5xl">
                  {t("title")}
                </h1>
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <a
                    href="mailto:office@raularchitects.com"
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    office@raularchitects.com
                  </a>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("azerbaijan.label")}
                  </h3>
                  <a
                    href={`tel:${t("azerbaijan.phone").replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {t("azerbaijan.phone")}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{t("azerbaijan.address")}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("germany.label")}
                  </h3>
                  <a
                    href={`tel:${t("germany.phone").replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {t("germany.phone")}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{t("germany.address")}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("switzerland.label")}
                  </h3>
                  <a
                    href={`tel:${t("switzerland.phone").replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {t("switzerland.phone")}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{t("switzerland.address")}</span>
                  </p>
                </div>
              </div>
            </div>

            <InquiryForm />
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}
