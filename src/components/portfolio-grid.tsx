"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toIntlHref } from "@/lib/public-paths";
import { Container } from "@/components/ui/container";
import { PUBLIC_EDITORIAL_GRID } from "@/lib/public-widescreen-layout";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, type Category } from "@/data/categories";
import { type PortfolioMeta } from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function PortfolioGrid({ items = [] }: { items?: PortfolioMeta[] }) {
  const t = useTranslations("portfolioPage");
  const c = useTranslations("categories");
  const co = useTranslations("countries");
  const searchParams = useSearchParams();

  const initial = useMemo<Category>(() => {
    const param = searchParams.get("category");
    return (categories as readonly string[]).includes(param ?? "") ? (param as Category) : "all";
  }, [searchParams]);

  const [active, setActive] = useState<Category>(initial);

  const portfolioItems = items;
  const filtered = active === "all" ? portfolioItems : portfolioItems.filter((item) => item.category === active);

  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container wide>
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

        <div className={`mt-12 ${PUBLIC_EDITORIAL_GRID}`}>
          {filtered.map((item) => (
            <Link key={item.slug} href={toIntlHref(`/portfolio/${item.slug}`)} className="group flex flex-col gap-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal/5">
                <Image
                  src={item.image}
                  alt={item.title ?? c(item.category)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-bronze-dark">
                  {c(item.category)}
                </span>
                <h3 className="text-xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-bronze-dark">
                  {item.title ?? t("realProject")}
                </h3>
                {item.country ? <span className="text-sm text-charcoal/55">{co(item.country)}</span> : null}
                <span className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/60 transition-colors duration-300 group-hover:text-bronze-dark">
                  {t("viewProject")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
