import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, HardHat, Boxes, Sofa, Building2, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { Reveal } from "@/components/ui/reveal";
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
      {/* HERO — Raul + Services */}
      <section className="relative overflow-hidden border-b border-charcoal/10 bg-cream">
        <div className="pointer-events-none absolute inset-0 bg-gradient-animated-soft opacity-70" />
        <Container className="relative">
          <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
            <Reveal>
              <Link href="/haqqimizda/raul-nagiyev" className="group relative flex flex-col gap-5">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] overflow-hidden bg-cream-dark sm:mx-0">
                  <Image
                    src="/images/raul-photo.jpg"
                    alt="Raul Nağıyev"
                    fill
                    priority
                    sizes="(min-width: 1024px) 22rem, 90vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2 text-2xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-3xl">
                    {home("raulName")}
                    <ArrowUpRight
                      className="h-5 w-5 text-charcoal/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-dark"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="text-sm font-semibold text-charcoal/75">{home("role1")}</span>
                  <span className="text-sm font-semibold text-charcoal/75">{home("role2")}</span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={120} className="flex flex-col">
              {services.map((service) => {
                const Icon = serviceIcons[service.icon] ?? Building2;
                return (
                  <Link
                    key={service.slug}
                    href={`/xidmetler/${service.slug}`}
                    className="group flex items-center gap-5 border-t border-charcoal/10 py-5 last:border-b sm:py-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-bronze-dark/30 bg-cream/60 text-bronze-dark transition-all duration-300 group-hover:border-bronze-dark group-hover:bg-bronze-dark group-hover:text-cream">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-xl font-semibold uppercase tracking-wide text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-2xl">
                      {s(`items.${service.slug}.title`)}
                    </span>
                    <ArrowUpRight
                      className="ml-auto h-4 w-4 shrink-0 text-charcoal/30 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      strokeWidth={2}
                    />
                  </Link>
                );
              })}
              <Link
                href="/xidmetler"
                className="mt-6 inline-flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.2em] text-bronze-dark transition-colors duration-300 hover:text-charcoal"
              >
                <TriangleMark size={10} />
                {home("allServicesCta")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* LAYİHƏLƏR */}
      <section className="relative bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold uppercase tracking-wide text-charcoal sm:text-4xl">
              {nav("projects")}
              <TriangleMark size={18} />
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {projectCategories.map((category, index) => (
              <Reveal key={category} delay={index * 40}>
                <Link
                  href={`/layihelar?category=${category}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md border border-charcoal/15 bg-cream shadow-sm transition-shadow duration-300 hover:shadow-lg"
                >
                  <Image
                    src={projectCoverImage[category]}
                    alt={c(category)}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-charcoal-dark/10 to-transparent transition-colors duration-300 group-hover:from-bronze-dark/90" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium uppercase tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                    {c(category)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* PORTFOLIO — bronze animated block */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-animated" />
        <Container className="relative">
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold uppercase tracking-wide text-cream sm:text-4xl">
              {nav("portfolio")}
              <TriangleMark size={18} className="brightness-0 invert" />
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {projectCategories.map((category, index) => (
              <Reveal key={category} delay={index * 40}>
                <Link
                  href={`/portfolio?category=${category}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md border border-cream/25 bg-bronze shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <Image
                    src={portfolioCoverImage[category]}
                    alt={c(category)}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-charcoal-dark/10 to-transparent transition-colors duration-300 group-hover:from-charcoal-dark/90" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium uppercase tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                    {c(category)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
