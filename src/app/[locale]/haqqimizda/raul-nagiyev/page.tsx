import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { SiteFooter } from "@/components/site-footer";
import { importedCertificates } from "@/data/raul-portfolio-import";

const sectionKeys = ["bio", "education", "experience", "certificates", "achievements"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "raulPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function RaulNagiyevPage({ params }: PageProps<"/[locale]/haqqimizda/raul-nagiyev">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("raulPage");

  return (
    <>
      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <Link
            href="/haqqimizda"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-charcoal/60 transition-colors duration-300 hover:text-bronze-dark"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-16">
            <div className="flex flex-col gap-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-dark">
                <Image
                  src="/images/raul-hero.jpg"
                  alt={t("title")}
                  fill
                  priority
                  quality={95}
                  sizes="(min-width: 1024px) 22rem, 90vw"
                  className="object-cover object-[20%_center]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold text-charcoal">{t("title")}</h1>
                <p className="text-sm font-light leading-relaxed text-charcoal/60">{t("role")}</p>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-charcoal/10 border-t border-charcoal/10">
              {sectionKeys.map((key) => {
                const isBio = key === "bio";
                const items = isBio ? null : (t.raw(`sections.${key}.items`) as string[]);
                return (
                  <div key={key} className="grid gap-4 py-10 sm:grid-cols-[10rem_1fr] sm:gap-8">
                    <h2 className="inline-flex items-start gap-2 text-xl font-semibold text-charcoal sm:text-2xl">
                      <TriangleMark size={12} className="mt-1.5" />
                      {t(`sections.${key}.title`)}
                    </h2>
                    {isBio ? (
                      <p className="max-w-2xl text-base font-light leading-relaxed text-charcoal/70">
                        {t("sections.bio.body")}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <ul className="flex flex-col gap-2.5">
                          {items?.map((item) => (
                            <li key={item} className="text-base font-light leading-relaxed text-charcoal/70">
                              {item}
                            </li>
                          ))}
                        </ul>
                        {key === "certificates" && importedCertificates.length > 0 ? (
                          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {importedCertificates.map((certificate) => (
                              <li key={certificate.id} className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
                                <Image
                                  src={certificate.src}
                                  alt={certificate.alt}
                                  fill
                                  sizes="(min-width: 1024px) 18rem, 45vw"
                                  className="object-contain p-2"
                                />
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>
      <SiteFooter />
    </>
  );
}
