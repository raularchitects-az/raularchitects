import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Compass, Layers3, PencilRuler } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ArchitectSeal } from "@/components/ui/architect-seal";
import { CornerFrame } from "@/components/ui/corner-frame";

const items = [
  { href: "/layihelar", key: "projects", icon: Compass, image: "/images/projects/premium-villa.jpg" },
  { href: "/portfolio", key: "portfolio", icon: Layers3, image: "/images/portfolio/switzerland-01.jpg" },
  { href: "/xidmetler", key: "services", icon: PencilRuler, image: "/images/projects/gallery-bim.jpg" },
] as const;

export async function HomeHeroNav() {
  const t = await getTranslations("nav");

  return (
    <section className="relative w-full">
      <div className="grid h-[92vh] min-h-[560px] w-full grid-cols-1 gap-[2px] bg-cream-dark sm:grid-cols-3">
        {items.map(({ href, key, icon: Icon, image }, index) => (
          <Link
            key={href}
            href={href}
            className="group relative block overflow-hidden bg-charcoal-dark"
          >
            <Image
              src={image}
              alt=""
              fill
              priority={index === 0}
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/90 via-charcoal-dark/25 to-charcoal-dark/10 transition-colors duration-500 group-hover:from-charcoal-dark/95" />
            <div className="absolute inset-0 bg-blueprint opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]" />
            <CornerFrame />

            {index === 1 && (
              <ArchitectSeal className="pointer-events-none absolute right-5 top-5 hidden sm:block" />
            )}

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.28em] text-bronze-light/70 transition-colors duration-300 group-hover:text-bronze-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon
                  className="h-5 w-5 text-cream/40 transition-colors duration-300 group-hover:text-bronze-light"
                  strokeWidth={1.25}
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <h2 className="font-serif text-4xl leading-none text-cream sm:text-5xl lg:text-6xl">
                  {t(key)}
                </h2>
                <ArrowUpRight
                  className="mb-1 h-6 w-6 shrink-0 text-cream/40 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
