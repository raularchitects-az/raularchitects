import Image from "next/image";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { Reveal } from "@/components/ui/reveal";
import { SiteFooter } from "@/components/site-footer";
import { HomeHero } from "@/components/home-hero";
import { services } from "@/data/services";
import { projectCategories, categoryCoverImage as projectCoverImage } from "@/data/projects";
import { categoryCoverImage as portfolioCoverImage } from "@/data/portfolio";
import { getHomeBlogPosts, getPublicServices, getSiteSettings } from "@/lib/cms/public";
import { BlogCard } from "@/components/blog-card";
import { toDisplayUpperCase } from "@/lib/locale-text";

type HomeMessages = {
  raulName: string;
  role1: string;
  role2: string;
  roleLine2?: string;
  roleLine3?: string;
  allServicesCta: string;
  svcTikinti: string;
  svcBim: string;
  svcInteryer: string;
  svcSehersalma: string;
};

const mobileRoleFallback: Record<string, { roleLine2: string; roleLine3: string }> = {
  az: { roleLine2: "İnşaat Mühəndisi", roleLine3: "BIM Eksperti" },
  en: { roleLine2: "Civil Engineer", roleLine3: "BIM Expert" },
  ru: { roleLine2: "Инженер-строитель", roleLine3: "BIM-Эксперт" },
  de: { roleLine2: "Bauingenieur", roleLine3: "BIM-Experte" },
};

const serviceTitleFields = {
  "tikinti-ve-temir": "svcTikinti",
  "bim-ile-layihelendirme": "svcBim",
  "interyer-dizayn": "svcInteryer",
  "seherselme-layiheleri": "svcSehersalma",
} as const;

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale;
  setRequestLocale(locale);
  const upper = (text: string) => toDisplayUpperCase(text, locale);

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

  const settings = await getSiteSettings();
  const cmsServices = await getPublicServices(locale);
  const homeFlags = settings.home ?? {};
  const hero = settings.hero ?? {};
  const homePosts = homeFlags.showBlog === true ? await getHomeBlogPosts() : [];
  const blogT = homePosts.length ? await getTranslations("blog") : null;
  const visibleServices =
    cmsServices.some((item) => item.title && item.title !== item.slug)
      ? cmsServices
          .filter((item) => item.home !== false)
          .map((item) => ({
            slug: item.slug,
            title: item.title,
            icon: item.icon,
          }))
      : heroServices.filter((item) => {
          const match = cmsServices.find((s) => s.slug === item.slug);
          return !match || match.home !== false;
        });

  return (
    <main>
      <HomeHero
        raulName={homeMsg.raulName}
        role1={homeMsg.role1}
        role2={homeMsg.role2}
        roleLine2={homeMsg.roleLine2 || mobileRoleFallback[locale]?.roleLine2 || mobileRoleFallback.en.roleLine2}
        roleLine3={homeMsg.roleLine3 || mobileRoleFallback[locale]?.roleLine3 || mobileRoleFallback.en.roleLine3}
        allServicesCta={homeMsg.allServicesCta}
        services={homeFlags.showServices === false ? [] : visibleServices}
        photoDesktop={typeof hero.photoDesktop === "string" && hero.photoDesktop ? hero.photoDesktop : undefined}
        photoMobile={typeof hero.photoMobile === "string" && hero.photoMobile ? hero.photoMobile : undefined}
        identityHref={typeof hero.identityHref === "string" && hero.identityHref ? hero.identityHref : undefined}
      />

      {homeFlags.showProjects !== false ? (
      <section className="relative bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-charcoal sm:text-4xl">
              {upper(nav("projects"))}
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
                  <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                    {upper(c(category))}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      ) : null}

      {homeFlags.showPortfolio !== false ? (
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-animated" />
        <Container className="relative">
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-cream sm:text-4xl">
              {upper(nav("portfolio"))}
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
                  <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-medium tracking-[0.14em] text-cream sm:p-4 sm:text-sm">
                    {upper(c(category))}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      ) : null}

      {homeFlags.showBlog === true && homePosts.length > 0 && blogT ? (
      <section className="relative bg-cream py-20 sm:py-28">
        <Container>
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-charcoal sm:text-4xl">
              {upper(nav("blog"))}
              <TriangleMark size={18} />
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {homePosts.slice(0, 3).map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                locale={locale}
                categoryLabel={blogT(`categories.${post.category}`)}
                readLabel={blogT("read")}
              />
            ))}
          </div>
        </Container>
      </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
