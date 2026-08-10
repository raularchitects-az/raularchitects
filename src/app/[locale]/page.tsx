import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, HardHat, Boxes, Sofa, Building2, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { Footer } from "@/components/footer";
import { services } from "@/data/services";
import { projectCategories, categoryCoverImage as projectCoverImage } from "@/data/projects";
import { categoryCoverImage as portfolioCoverImage } from "@/data/portfolio";

const serviceIcons: Record<string, LucideIcon> = { HardHat, Boxes, Sofa, Building2 };

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const home = await getTranslations("home");
  const nav = await getTranslations("nav");
  const s = await getTranslations("servicesPage");
  const c = await getTranslations("categories");

  return (
    <main>
      <section className="border-b border-charcoal/10">
        <Container>
          <div className="grid gap-14 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-28">
            <Link href="/haqqimizda/raul-nagiyev" className="group relative flex flex-col gap-6">
              <TriangleMark
                size={240}
                className="pointer-events-none absolute -left-10 -top-10 opacity-[0.06]"
              />
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden bg-cream-dark">
                <Image
                  src="/images/raul-placeholder.jpg"
                  alt="Raul Nağıyev"
                  fill
                  priority
                  sizes="(min-width: 1024px) 24rem, 90vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 font-serif text-2xl text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-3xl">
                  {home("raulName")}
                  <ArrowUpRight
                    className="h-5 w-5 text-charcoal/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-dark"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="text-sm text-charcoal/55">{home("role1")}</span>
                <span className="text-sm text-charcoal/55">{home("role2")}</span>
              </div>
            </Link>

            <div className="flex flex-col">
              {services.map((service) => {
                const Icon = serviceIcons[service.icon] ?? Building2;
                return (
                  <Link
                    key={service.slug}
                    href={`/xidmetler/${service.slug}`}
                    className="group flex items-center gap-5 border-t border-charcoal/10 py-5 last:border-b sm:py-6"
                  >
                    <Icon className="h-6 w-6 shrink-0 text-bronze-dark" strokeWidth={1.25} />
                    <span className="font-serif text-xl text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-2xl">
                      {s(`items.${service.slug}.title`)}
                    </span>
                    <ArrowUpRight
                      className="ml-auto h-4 w-4 shrink-0 text-charcoal/30 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </Link>
                );
              })}
              <Link
                href="/xidmetler"
                className="mt-5 inline-flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.2em] text-bronze-dark transition-colors duration-300 hover:text-charcoal"
              >
                {home("allServicesCta")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <Container>
          <h2 className="inline-flex items-center gap-3 font-serif text-3xl text-charcoal sm:text-4xl">
            <TriangleMark size={16} />
            {nav("projects")}
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden bg-charcoal/10 sm:grid-cols-3 lg:grid-cols-5">
            {projectCategories.map((category) => (
              <Link
                key={category}
                href={`/layihelar?category=${category}`}
                className="group relative aspect-square overflow-hidden bg-cream"
              >
                <Image
                  src={projectCoverImage[category]}
                  alt={c(category)}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/5 to-transparent transition-colors duration-300 group-hover:from-charcoal-dark/85" />
                <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium uppercase tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                  {c(category)}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative bg-bronze-fade bg-cream-dark py-20 sm:py-28">
        <Container>
          <h2 className="inline-flex items-center gap-3 font-serif text-3xl text-charcoal sm:text-4xl">
            <TriangleMark size={16} />
            {nav("portfolio")}
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden bg-charcoal/10 sm:grid-cols-3 lg:grid-cols-5">
            {projectCategories.map((category) => (
              <Link
                key={category}
                href={`/portfolio?category=${category}`}
                className="group relative aspect-square overflow-hidden bg-cream"
              >
                <Image
                  src={portfolioCoverImage[category]}
                  alt={c(category)}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/5 to-transparent transition-colors duration-300 group-hover:from-charcoal-dark/85" />
                <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium uppercase tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                  {c(category)}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
