"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  portfolioItems,
  portfolioCountries,
  portfolioTypes,
  type PortfolioCountry,
  type PortfolioType,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function PortfolioGrid() {
  const t = useTranslations("portfolioPage");
  const [country, setCountry] = useState<PortfolioCountry>("all");
  const [type, setType] = useState<PortfolioType | "all">("all");

  const filtered = portfolioItems.filter((item) => {
    const countryMatch = country === "all" || item.country === country;
    const typeMatch = type === "all" || item.types.includes(type);
    return countryMatch && typeMatch;
  });

  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        <div className="mt-10 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {portfolioCountries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={cn(
                  "border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                  country === c
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-charcoal/15 text-charcoal/70 hover:border-bronze-dark hover:text-bronze-dark",
                )}
              >
                {t(`countryFilters.${c}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setType("all")}
              className={cn(
                "border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
                type === "all"
                  ? "border-bronze-dark text-bronze-dark"
                  : "border-charcoal/10 text-charcoal/50 hover:border-bronze-dark/50 hover:text-bronze-dark",
              )}
            >
              {t("countryFilters.all")}
            </button>
            {portfolioTypes.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setType(pt)}
                className={cn(
                  "border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
                  type === pt
                    ? "border-bronze-dark text-bronze-dark"
                    : "border-charcoal/10 text-charcoal/50 hover:border-bronze-dark/50 hover:text-bronze-dark",
                )}
              >
                {t(`typeLabels.${pt}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link key={item.slug} href={`/portfolio/${item.slug}`} className="group flex flex-col gap-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal/5">
                <Image
                  src={item.image}
                  alt={t(`items.${item.slug}.title`)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-xl text-charcoal transition-colors duration-300 group-hover:text-bronze-dark">
                  {t(`items.${item.slug}.title`)}
                </h3>
                <span className="text-sm text-charcoal/55">{t(`items.${item.slug}.location`)}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-bronze-dark">
                  {item.types.map((pt) => t(`typeLabels.${pt}`)).join(" · ")}
                </span>
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
