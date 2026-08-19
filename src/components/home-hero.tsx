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
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toDisplayUpperCase } from "@/lib/locale-text";

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
  roleLine2,
  roleLine3,
  allServicesCta,
  services,
  photoDesktop = "/images/raul-hero.jpg",
  photoMobile = "/images/raul-hero-mobile.jpg",
  identityHref = "/haqqimizda/raul-nagiyev",
}: {
  raulName: string;
  role1: string;
  role2: string;
  roleLine2: string;
  roleLine3: string;
  allServicesCta: string;
  services: HomeHeroService[];
  photoDesktop?: string;
  photoMobile?: string;
  identityHref?: string;
}) {
  const locale = useLocale();
  const [firstName, ...lastNameParts] = raulName.split(" ");
  const lastName = lastNameParts.join(" ");
  const mobileRoles = [role1, roleLine2, roleLine3];
  const upper = (text: string) => toDisplayUpperCase(text, locale);

  return (
    <section className="relative min-h-[calc(100dvh-5rem)] w-full overflow-hidden bg-cream lg:isolate">
      {/* LAYER 1 — photo (mask only on the image, not the name block) */}
      <div className="relative h-[58svh] w-full lg:absolute lg:inset-0 lg:h-full">
        <div className="hero-photo absolute inset-0">
          <Image
            src={photoMobile}
            alt={raulName}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-[center_18%] lg:hidden"
          />
          <Image
            src={photoDesktop}
            alt={raulName}
            fill
            priority
            quality={95}
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="hidden object-cover object-left lg:block"
          />
          <div aria-hidden="true" className="hero-photo-fade-mobile lg:hidden" />
          <div aria-hidden="true" className="hero-photo-fade-desktop hidden lg:block" />
        </div>

        {/* Mobile identity — top/right fixed; grows left toward Raul and down */}
        <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-[46%_54%] lg:hidden">
          <span aria-hidden="true" />
          <Link
            href={identityHref}
            className="hero-layer-identity pointer-events-auto group mr-[clamp(0.75rem,3.8vw,1rem)] mt-[clamp(4.5rem,15svh,7rem)] flex min-w-0 flex-col self-start"
          >
            <span className="flex min-w-0 flex-col gap-[3.5px]">
              <span className="hero-name-plate flex w-full min-w-0 items-center px-[clamp(0.62rem,2.46vw,1.01rem)] py-[clamp(0.36rem,1.29vw,0.56rem)] text-[clamp(1.06rem,4.93vw,1.46rem)] font-bold leading-none tracking-[clamp(0.067em,0.36vw,0.13em)] text-white">
                {upper(firstName)}
              </span>
              <span className="hero-name-plate flex w-full min-w-0 items-center px-[clamp(0.62rem,2.46vw,1.01rem)] py-[clamp(0.36rem,1.29vw,0.56rem)] text-[clamp(1.06rem,4.93vw,1.46rem)] font-bold leading-none tracking-[clamp(0.067em,0.36vw,0.13em)] text-white">
                {upper(lastName)}
              </span>
            </span>
            <span className="mt-[clamp(0.45rem,1.68vw,0.78rem)] flex min-w-0 flex-col">
              {mobileRoles.map((line, index) => (
                <span
                  key={line}
                  className={`break-words py-[clamp(0.31rem,1.12vw,0.47rem)] text-[clamp(0.67rem,3.02vw,0.81rem)] font-bold leading-snug text-white ${
                    index > 0 ? "border-t border-white/40" : "pt-0"
                  }`}
                >
                  {line}
                </span>
              ))}
            </span>
            <span
              aria-hidden="true"
              className="mt-1.5 self-end text-[0.7rem] font-light leading-none text-white/70 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-active:translate-x-[2px]"
            >
              →
            </span>
          </Link>
        </div>

        {/* Desktop identity — unchanged from original desktop treatment */}
        <div className="hero-layer-identity absolute bottom-0 left-[22%] z-10 hidden max-w-[min(36rem,30%)] pb-16 lg:block xl:left-[20%]">
          <Link
            href={identityHref}
            className="group inline-flex flex-col gap-3"
          >
            <span className="hero-name-plate inline-flex w-fit px-5 py-3 text-2xl font-bold tracking-[0.08em] text-white">
              {upper(raulName)}
            </span>
            <span className="hero-identity-roles flex flex-col gap-0.5 text-[0.95rem] font-medium leading-snug text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
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
          <Image
            src="/brand/land-page-triangle.png"
            alt=""
            width={1022}
            height={1024}
            className="hero-triangle-mark"
          />
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
                  <span
                    lang={locale}
                    className="text-coffee-gradient text-[1.7rem] font-bold leading-[1.22] tracking-[-0.02em] transition-[filter] duration-500 group-hover:brightness-110 sm:text-4xl lg:text-[2.65rem] xl:text-[2.9rem]"
                  >
                    {upper(service.title)}
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
            className="hero-all-services mt-10 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.32em] text-[#8f6b4f] transition-colors duration-300 hover:text-[#6b4a32] sm:mt-14"
          >
            {upper(allServicesCta)}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
