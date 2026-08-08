import { useTranslations } from "next-intl";
import {
  Building2,
  Sofa,
  Boxes,
  FileCheck2,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const icons: Record<string, LucideIcon> = {
  Building2,
  Sofa,
  Boxes,
  FileCheck2,
  ClipboardCheck,
};

type ServiceItem = {
  icon: string;
  title: string;
  tag: string;
  description: string;
};

export function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section id="services" className="relative bg-cream-dark py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          align="center"
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = icons[item.icon] ?? Building2;
            return (
              <div
                key={item.title}
                className="group flex flex-col gap-5 bg-cream p-8 transition-colors duration-300 hover:bg-charcoal sm:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center border border-bronze-dark/30 text-bronze-dark transition-colors duration-300 group-hover:border-bronze-light/40 group-hover:text-bronze-light">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-charcoal/40 transition-colors duration-300 group-hover:text-cream/40">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-charcoal transition-colors duration-300 group-hover:text-cream sm:text-[1.35rem]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal/65 transition-colors duration-300 group-hover:text-cream/70">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
