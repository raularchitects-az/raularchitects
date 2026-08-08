import { useTranslations } from "next-intl";
import { Scan, AlertTriangle, Calculator, Leaf, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const icons: Record<string, LucideIcon> = {
  Scan,
  AlertTriangle,
  Calculator,
  Leaf,
};

type Feature = {
  icon: string;
  title: string;
  titleNative?: string;
  description: string;
};

type Philosophy = {
  title: string;
  description: string;
};

export function Bim() {
  const t = useTranslations("bim");
  const features = t.raw("features") as Feature[];
  const philosophy = t.raw("philosophy") as Philosophy[];

  return (
    <section id="bim" className="relative overflow-hidden bg-charcoal py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-bronze/[0.08] blur-3xl"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          tone="light"
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = icons[feature.icon] ?? Scan;
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-5 border border-cream/10 p-7 transition-colors duration-300 hover:border-bronze-light/40"
              >
                <span className="flex h-11 w-11 items-center justify-center border border-bronze-light/30 text-bronze-light">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-lg text-cream">{feature.title}</h3>
                  {feature.titleNative ? (
                    <span className="text-[11px] uppercase tracking-[0.14em] text-bronze-light/70">
                      {feature.titleNative}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-cream/60">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-24 flex flex-col gap-10">
          <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-bronze-light/80">
            {t("philosophyTitle")}
          </h3>
          <div className="grid gap-8 border-t border-cream/10 pt-10 sm:grid-cols-2 lg:grid-cols-5">
            {philosophy.map((item, index) => (
              <div key={item.title} className="flex flex-col gap-3">
                <span className="font-serif text-sm text-bronze-light/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="font-serif text-lg text-cream">{item.title}</h4>
                <p className="text-sm leading-relaxed text-cream/55">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
