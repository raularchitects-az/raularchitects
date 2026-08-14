"use client";

import Image from "next/image";
import {
  Armchair,
  ArrowRight,
  Building2,
  LandPlot,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const serviceIcons: Record<string, LucideIcon> = {
  "tikinti-ve-temir": Building2,
  "bim-ile-layihelendirme": LayoutGrid,
  "interyer-dizayn": Armchair,
  "seherselme-layiheleri": LandPlot,
};

export type HomeHeroService = {
  slug: string;
  title: string;
  icon: string;
};

export function HomeHero({
  raulName,
  role1,
  role2,
  allServicesCta,
  services,
}: {
  raulName: string;
  role1: string;
  role2: string;
  allServicesCta: string;
  services: HomeHeroService[];
}) {
  return (
    <section className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden bg-cream lg:isolate">
      {/* LAYER 1 — photo (mask only on the image, not the name block) */}
      <div className="relative h-[58svh] w-full lg:absolute lg:inset-0 lg:h-full">
        <div className="hero-photo absolute inset-0">
          <Image
            src="/images/raul-hero.jpg"
            alt={raulName}
            fill
            priority
            quality={95}
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover object-[20%_center] lg:object-left"
          />
          <div aria-hidden="true" className="hero-photo-fade-mobile lg:hidden" />
          <div aria-hidden="true" className="hero-photo-fade-desktop hidden lg:block" />
        </div>

        {/* LAYER 3 — identity over photo */}
        <div className="hero-layer-identity absolute inset-x-0 bottom-0 z-10 px-6 pb-14 sm:px-8 lg:px-10 lg:pb-16 xl:px-14">
          <Link
            href="/haqqimizda/raul-nagiyev"
            className="group inline-flex max-w-xl flex-col gap-2.5 sm:gap-3"
          >
            <span className="hero-name-plate inline-flex w-fit px-4 py-2.5 text-base font-bold uppercase tracking-[0.08em] text-white sm:px-5 sm:py-3 sm:text-xl lg:text-2xl">
              {raulName}
            </span>
            <span className="hero-identity-roles flex flex-col gap-0.5 text-[13px] font-medium leading-snug text-[#f7f2ec] lg:text-[0.95rem] lg:text-white lg:drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
              <span>{role1}</span>
              <span>{role2}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* LAYER 4 — services */}
      <div className="relative z-10 flex min-h-[42svh] items-center bg-cream px-6 py-10 sm:px-8 lg:ml-auto lg:min-h-[calc(100dvh-5rem)] lg:w-[48%] lg:bg-transparent lg:px-10 lg:py-16 xl:w-[46%] xl:pr-14">
        {/* LAYER 2 — logo-mark triangle */}
        <div aria-hidden="true" className="hero-triangle-wrap pointer-events-none absolute inset-0">
          <div className="hero-triangle-mark" />
        </div>

        <div className="relative z-10 w-full max-w-xl lg:max-w-none">
          <nav aria-label="Services" className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
            {services.map((service, index) => {
              const Icon = serviceIcons[service.slug] ?? Building2;
              return (
                <Link
                  key={service.slug}
                  href={`/xidmetler/${service.slug}`}
                  className="hero-service-row group flex items-center gap-4 sm:gap-5"
                  style={{ animationDelay: `${0.78 + index * 0.12}s` }}
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-[#8f6b4f] transition-transform duration-500 ease-out group-hover:translate-x-0.5 sm:h-6 sm:w-6"
                    strokeWidth={1.35}
                  />
                  <span className="text-coffee-gradient text-[1.7rem] font-bold uppercase leading-[1.12] tracking-[-0.02em] transition-[filter] duration-500 group-hover:brightness-110 sm:text-4xl lg:text-[2.65rem] xl:text-[2.9rem]">
                    {service.title}
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 shrink-0 text-[#8f6b4f]/55 transition-transform duration-500 ease-out group-hover:translate-x-1 sm:h-5 sm:w-5"
                    strokeWidth={1.5}
                  />
                </Link>
              );
            })}
          </nav>

          <Link
            href="/xidmetler"
            className="hero-all-services mt-10 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8f6b4f] transition-colors duration-300 hover:text-[#6b4a32] sm:mt-14"
          >
            {allServicesCta}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
