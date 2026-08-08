import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function Hero() {
  const t = useTranslations("hero");
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <section id="top" className="relative overflow-hidden bg-cream pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div
        aria-hidden
        className="bg-noise absolute inset-0 opacity-70"
      />
      <div
        aria-hidden
        className="absolute -right-40 top-24 h-[32rem] w-[32rem] rounded-full bg-bronze/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-px w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-charcoal/10 to-transparent"
      />

      <Container className="relative">
        <div className="flex flex-col items-start gap-8">
          <span className="animate-fade-up inline-flex items-center gap-3 border border-bronze-dark/30 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-bronze-dark">
            {t("eyebrow")}
          </span>

          <h1 className="animate-fade-up max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-balance text-charcoal sm:text-6xl lg:text-[4.75rem]">
            {t("headline")}
          </h1>

          <p className="animate-fade-up max-w-xl text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="animate-fade-up flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <a
              href="#services"
              className="group inline-flex items-center justify-center gap-2 border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
            >
              {t("ctaPrimary")}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 border border-charcoal/20 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-charcoal transition-all duration-300 hover:border-bronze-dark hover:text-bronze-dark"
            >
              {t("ctaSecondary")}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </a>
          </div>

          <div className="mt-8 grid w-full grid-cols-3 gap-6 border-t border-charcoal/10 pt-8 sm:max-w-xl">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl text-charcoal sm:text-4xl">{stat.value}</span>
                <span className="text-[11px] uppercase leading-snug tracking-[0.14em] text-charcoal/55">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
