import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Footer } from "@/components/footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "advantagesPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function AdvantagesPage({ params }: PageProps<"/[locale]/ustunluklar">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("advantagesPage");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <>
      <section className="bg-cream py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={item.title} className="flex flex-col gap-3 border-t border-charcoal/10 pt-6">
                <span className="font-serif text-sm text-bronze-dark">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-serif text-2xl text-charcoal">{item.title}</h3>
                <p className="text-base leading-relaxed text-charcoal/65">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}
