import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { InquiryForm } from "@/components/inquiry-form";
import { SiteFooter } from "@/components/site-footer";
import { SocialLinks } from "@/components/social-links";
import { getPublicContact } from "@/lib/cms/public";

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
  const contact = await getPublicContact();
  const email = contact.email || "office@raularchitects.com";
  const azPhone = contact.azerbaijan.phone || t("azerbaijan.phone");
  const azAddress = contact.azerbaijan.address || t("azerbaijan.address");
  const dePhone = contact.germany.phone || t("germany.phone");
  const deAddress = contact.germany.address || t("germany.address");
  const chPhone = contact.switzerland.phone || t("switzerland.phone");
  const chAddress = contact.switzerland.address || t("switzerland.address");

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
                    href={`mailto:${email}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {email}
                  </a>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("azerbaijan.label")}
                  </h3>
                  <a
                    href={`tel:${azPhone.replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {azPhone}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{azAddress}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("germany.label")}
                  </h3>
                  <a
                    href={`tel:${dePhone.replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {dePhone}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{deAddress}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("switzerland.label")}
                  </h3>
                  <a
                    href={`tel:${chPhone.replace(/\s/g, "")}`}
                    className="group inline-flex items-center gap-3 text-base tabular-nums text-charcoal/75 transition-colors duration-300 hover:text-bronze-dark"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    {chPhone}
                  </a>
                  <p className="inline-flex items-start gap-3 text-base tabular-nums text-charcoal/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze-dark" strokeWidth={1.5} />
                    <span>{chAddress}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50">
                    {t("socials")}
                  </h3>
                  <SocialLinks />
                </div>
              </div>
            </div>

            <InquiryForm />
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
