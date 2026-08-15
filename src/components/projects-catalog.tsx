"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, type Category } from "@/data/categories";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

export function ProjectsCatalog() {
  const t = useTranslations("projectsPage");
  const c = useTranslations("categories");
  const searchParams = useSearchParams();

  const initial = useMemo<Category>(() => {
    const param = searchParams.get("category");
    return (categories as readonly string[]).includes(param ?? "") ? (param as Category) : "all";
  }, [searchParams]);

  const [active, setActive] = useState<Category>(initial);

  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                "border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                active === category
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/15 text-charcoal/70 hover:border-bronze-dark hover:text-bronze-dark",
              )}
            >
              {c(category)}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => {
            const title = project.title ?? t(`items.${project.slug}.title`);
            const specs = project.source
              ? []
              : ((t.raw(`items.${project.slug}.specs`) as string[] | undefined) ?? []);

            return (
            <Link
              key={project.slug}
              href={`/layihelar/${project.slug}`}
              className="group flex flex-col gap-5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
                <Image
                  src={project.image}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={project.objectPosition ? { objectPosition: project.objectPosition } : undefined}
                  priority={index < 3}
                />
                <span className="absolute left-4 top-4 border border-cream/30 bg-charcoal/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-bronze-dark">
                  {c(project.category)}
                </span>
                <h3 className="text-2xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-bronze-dark">
                  {title}
                </h3>
                {specs.length > 0 ? (
                  <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-charcoal/55">
                    {specs.map((spec) => (
                      <li key={spec} className="after:ml-3 after:text-charcoal/25 after:content-['·'] last:after:content-none">
                        {spec}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <span className="mt-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/60 transition-colors duration-300 group-hover:text-bronze-dark">
                  {t("viewProject")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
