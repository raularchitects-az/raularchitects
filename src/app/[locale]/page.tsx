import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { projects } from "@/data/projects";
import { HomeHeroNav } from "@/components/home-hero-nav";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projectsPage");

  const featured = projects.filter((p) => p.featuredOnHome);

  return (
    <main>
      <HomeHeroNav />

      {featured.map((project, index) => (
        <Link
          key={project.slug}
          href={`/layihelar/${project.slug}`}
          className="group relative block h-[70vh] w-full overflow-hidden border-t border-cream/10 sm:h-[85vh]"
        >
          <Image
            src={project.image}
            alt={t(`items.${project.slug}.title`)}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/70 via-charcoal-dark/0 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-bronze-light/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif text-4xl text-cream sm:text-6xl lg:text-7xl">
                {t(`items.${project.slug}.title`)}
              </h2>
            </div>
            <span className="mb-1 hidden shrink-0 items-center gap-2 border border-cream/30 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors duration-300 group-hover:border-bronze-light group-hover:text-bronze-light sm:flex">
              {t("viewProject")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
            </span>
          </div>
        </Link>
      ))}
    </main>
  );
}
