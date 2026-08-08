import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MessageCircle } from "lucide-react";
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
                <h1 className="max-w-lg font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl">
                  {t("title")}
                </h1>
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("azerbaijan.label")}
                  </h3>
                  <a href={`mailto:${t("azerbaijan.email")}`} className="group inline-flex items-center gap-3 text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark">
                    <Mail className="h-4 w-4 text-bronze-dark" strokeWidth={1.5} />
                    {t("azerbaijan.email")}
                  </a>
                  <a
                    href={`https://wa.me/${t("azerbaijan.whatsapp").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <MessageCircle className="h-4 w-4 text-bronze-dark" strokeWidth={1.5} />
                    WhatsApp · {t("azerbaijan.whatsapp")}
                  </a>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("germany.label")}
                  </h3>
                  <a href={`tel:${t("germany.phone").replace(/\s/g, "")}`} className="group inline-flex items-center gap-3 text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark">
                    <Phone className="h-4 w-4 text-bronze-dark" strokeWidth={1.5} />
                    {t("germany.phone")}
                  </a>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("switzerland.label")}
                  </h3>
                  <a href={`tel:${t("switzerland.phone").replace(/\s/g, "")}`} className="group inline-flex items-center gap-3 text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark">
                    <Phone className="h-4 w-4 text-bronze-dark" strokeWidth={1.5} />
                    {t("switzerland.phone")}
                  </a>
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
