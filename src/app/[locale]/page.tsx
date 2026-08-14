import Image from "next/image";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { Reveal } from "@/components/ui/reveal";
import { Footer } from "@/components/footer";
import { HomeHero } from "@/components/home-hero";
import { services } from "@/data/services";
import { projectCategories, categoryCoverImage as projectCoverImage } from "@/data/projects";
import { categoryCoverImage as portfolioCoverImage } from "@/data/portfolio";

type HomeMessages = {
  raulName: string;
  role1: string;
  role2: string;
  allServicesCta: string;
  svcTikinti: string;
  svcBim: string;
  svcInteryer: string;
  svcSehersalma: string;
};

const serviceTitleFields = {
  "tikinti-ve-temir": "svcTikinti",
  "bim-ile-layihelendirme": "svcBim",
  "interyer-dizayn": "svcInteryer",
  "seherselme-layiheleri": "svcSehersalma",
} as const;

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const homeMsg = messages.home as HomeMessages;
  const nav = await getTranslations("nav");
  const c = await getTranslations("categories");

  const heroServices = services.map((service) => {
    const field = serviceTitleFields[service.slug as keyof typeof serviceTitleFields];
    return {
      slug: service.slug,
      title: homeMsg[field],
      icon: service.icon,
    };
  });

  return (
    <main>
      <HomeHero
        raulName={homeMsg.raulName}
        role1={homeMsg.role1}
        role2={homeMsg.role2}
        allServicesCta={homeMsg.allServicesCta}
        services={heroServices}
      />

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
