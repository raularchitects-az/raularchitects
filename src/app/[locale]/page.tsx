import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toIntlHref } from "@/lib/public-paths";
import { Container } from "@/components/ui/container";
import { TriangleMark } from "@/components/ui/triangle-mark";
import { Reveal } from "@/components/ui/reveal";
import { SiteFooter } from "@/components/site-footer";
import { HomeHero } from "@/components/home-hero";
import { services } from "@/data/services";
import {
  getHomeBlogPosts,
  getPublicInsights,
  getPublicPortfolio,
  getPublicProjects,
  getPublicServices,
  getSiteSettings,
  takeLatestPublic,
} from "@/lib/cms/public";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";
import { isBlogLocaleLive } from "@/lib/blog-urls";
import { isInsightLocaleLive } from "@/lib/insights-urls";
import { BlogCard } from "@/components/blog-card";
import { HomeProjectCard } from "@/components/home-project-card";
import { InsightsCard } from "@/components/insights-card";
import { HOME_EDITORIAL_CONTAINER, HOME_EDITORIAL_GRID, HOME_INSIGHTS_GRID } from "@/lib/home-editorial-layout";
import { toDisplayUpperCase } from "@/lib/locale-text";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";

export const revalidate = 60;

type HomeMessages = {
  raulName: string;
  role1: string;
  role2: string;
  roleLine2?: string;
  roleLine3?: string;
  allServicesCta: string;
  allProjectsCta: string;
  allPortfolioCta: string;
  allInsightsCta: string;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return entryMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    image: "/images/raul-hero.jpg",
  });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = asLocale((await params).locale);
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

  const [settings, insightsActive] = await Promise.all([
    getSiteSettings(),
    isInsightsRestructureActive(),
  ]);
  const [cmsServices, publicProjects, publicPortfolio, publicInsights] = await Promise.all([
    getPublicServices(locale),
    getPublicProjects(locale),
    insightsActive ? Promise.resolve([]) : getPublicPortfolio(locale),
    insightsActive ? getPublicInsights() : Promise.resolve([]),
  ]);
  const latestProjects = takeLatestPublic(publicProjects, 9);
  const latestPortfolio = takeLatestPublic(publicPortfolio, 10);
  const latestInsights = takeLatestPublic(
    publicInsights.filter((post) => isInsightLocaleLive(post, locale)),
    9,
  );
  const homeFlags = settings.home ?? {};
  const hero = settings.hero ?? {};
  const projectsPageT =
    homeFlags.showProjects !== false ? await getTranslations("projectsPage") : null;
  const showPortfolio = homeFlags.showPortfolio !== false;
  const showInsights = (homeFlags.showInsights ?? homeFlags.showPortfolio) !== false;
  const homePosts = (homeFlags.showBlog === true ? await getHomeBlogPosts() : []).filter((post) =>
    isBlogLocaleLive(post, locale),
  );
  const blogT = homePosts.length ? await getTranslations("blog") : null;
  const insightsT =
    insightsActive && showInsights && latestInsights.length ? await getTranslations("insights") : null;
  const visibleServices = cmsServices
    .filter((item) => item.home !== false)
    .map((item) => {
      const hero = heroServices.find((service) => service.slug === item.slug);
      const cmsTitle = item.title && item.title !== item.slug ? item.title : "";
      return {
        slug: item.slug,
        title: cmsTitle || hero?.title || item.title,
        icon: item.icon || hero?.icon || "Boxes",
      };
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
        <Container className={HOME_EDITORIAL_CONTAINER}>
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-charcoal sm:text-4xl">
              {upper(nav("projects"))}
              <TriangleMark size={18} />
            </h2>
          </Reveal>

          {latestProjects.length > 0 ? (
          <div className={HOME_EDITORIAL_GRID}>
            {latestProjects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 40}>
                <HomeProjectCard
                  project={project}
                  index={index}
                  locale={locale}
                  categoryLabel={c(project.category)}
                  viewProjectLabel={projectsPageT?.("viewProject") ?? "View project"}
                  title={project.title || project.slug}
                />
              </Reveal>
            ))}
          </div>
          ) : null}
          <Link
            href="/layihelar"
            className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.32em] text-bronze-dark transition-colors duration-300 hover:text-[#6b4a32] ${latestProjects.length > 0 ? "mt-10" : "mt-12"}`}
          >
            {upper(homeMsg.allProjectsCta)}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </Container>
      </section>
      ) : null}

      {!insightsActive && showPortfolio ? (
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-animated" />
        <Container className="relative">
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-cream sm:text-4xl">
              {upper(nav("portfolio"))}
              <TriangleMark size={18} className="brightness-0 invert" />
            </h2>
          </Reveal>
          <Link
            href="/portfolio"
            className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.32em] text-cream/80 transition-colors duration-300 hover:text-cream"
          >
            {upper(homeMsg.allPortfolioCta)}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>

          {latestPortfolio.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {latestPortfolio.map((item, index) => (
              <Reveal key={item.slug} delay={index * 40}>
                <Link
                  href={toIntlHref(`/portfolio/${item.slug}`)}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md border border-cream/25 bg-bronze shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <Image
                    src={item.image}
                    alt={item.title || item.slug}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-charcoal-dark/10 to-transparent transition-colors duration-300 group-hover:from-charcoal-dark/90" />
                  <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <span className="block text-[10px] font-medium tracking-[0.18em] text-cream/70">
                      {upper(c(item.category))}
                    </span>
                    <span className="mt-1 block text-xs font-medium tracking-[0.14em] text-cream sm:text-sm">
                      {item.title || item.slug}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          ) : null}
        </Container>
      </section>
      ) : null}

      {insightsActive && showInsights ? (
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-animated" />
        <Container className={`relative ${HOME_EDITORIAL_CONTAINER}`}>
          <Reveal>
            <h2 className="inline-flex items-center gap-3 text-3xl font-semibold tracking-wide text-cream sm:text-4xl">
              {upper(nav("insights"))}
              <TriangleMark size={18} className="brightness-0 invert" />
            </h2>
          </Reveal>

          {latestInsights.length > 0 && insightsT ? (
          <div className={HOME_INSIGHTS_GRID}>
            {latestInsights.map((item, index) => (
              <Reveal key={item.slug} delay={index * 40}>
                <InsightsCard
                  post={item}
                  locale={locale}
                  categoryLabel={insightsT(`categories.${item.category}`)}
                  readLabel={insightsT("read")}
                  showExcerpt={false}
                />
              </Reveal>
            ))}
          </div>
          ) : null}
          <Link
            href="/insights"
            className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.32em] text-cream/80 transition-colors duration-300 hover:text-cream ${latestInsights.length > 0 ? "mt-10" : "mt-12"}`}
          >
            {upper(homeMsg.allInsightsCta)}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
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
