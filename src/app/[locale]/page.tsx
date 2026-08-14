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
      {/* HERO — full-screen Raul background + services */}
      <section className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden bg-[#f7f2ec]">
        <Image
          src="/images/raul-hero.jpg"
          alt="Raul Nağıyev"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[18%_center] sm:object-left"
        />

        {/* Fade into #f7f2ec */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7f2ec] sm:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent via-[#f7f2ec]/25 to-[#f7f2ec] sm:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] bg-gradient-to-r from-transparent to-[#f7f2ec] lg:block"
        />

        <Container className="relative z-10 flex min-h-[calc(100dvh-5rem)] flex-col justify-end gap-10 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-16">
          <Reveal className="max-w-md">
            <Link href="/haqqimizda/raul-nagiyev" className="group flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-3xl font-semibold tracking-tight text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-4xl sm:text-white sm:drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:group-hover:text-[#f7f2ec] lg:text-5xl">
                {home("raulName")}
                <ArrowUpRight
                  className="h-5 w-5 text-charcoal/40 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-6 sm:w-6 sm:text-white/80"
                  strokeWidth={2}
                />
              </span>
              <span className="text-sm font-medium text-charcoal/75 sm:text-base sm:text-white/95 sm:drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
                {home("role1")}
              </span>
              <span className="text-sm font-medium text-charcoal/75 sm:text-base sm:text-white/95 sm:drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
                {home("role2")}
              </span>
            </Link>
          </Reveal>

          <Reveal delay={120} className="w-full max-w-lg lg:w-[min(100%,28rem)]">
            <div className="flex flex-col">
              {services.map((service) => {
                const Icon = serviceIcons[service.icon] ?? Building2;
                return (
                  <Link
                    key={service.slug}
                    href={`/xidmetler/${service.slug}`}
                    className="group flex items-center gap-4 border-t border-charcoal/10 py-4 last:border-b sm:gap-5 sm:py-5"
                  >
                    <Icon
                      className="h-5 w-5 shrink-0 text-bronze-dark transition-colors duration-300 group-hover:text-charcoal sm:h-6 sm:w-6"
                      strokeWidth={1.5}
                    />
                    <span className="text-lg font-semibold uppercase tracking-wide text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-xl lg:text-2xl">
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
                className="mt-5 inline-flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.2em] text-bronze-dark transition-colors duration-300 hover:text-charcoal"
              >
                <TriangleMark size={10} />
                {home("allServicesCta")}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </Reveal>
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
