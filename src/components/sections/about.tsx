import { useTranslations } from "next-intl";
import { GraduationCap, Handshake, Trophy, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

type Education = { title: string; place: string };
type Stat = { value: string; label: string };

export function About() {
  const t = useTranslations("about");

  const education = t.raw("education") as Education[];
  const stats = t.raw("stats") as Stat[];
  const collaborations = t.raw("collaborations") as string[];
  const awards = t.raw("awards") as string[];
  const standards = t.raw("standards") as string[];

  return (
    <section id="about" className="relative bg-cream py-24 sm:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="flex flex-col gap-10">
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-bronze-dark">
              {t("role")}
            </p>
            <p className="max-w-xl text-base leading-relaxed text-charcoal/70 sm:text-lg">
              {t("intro")}
            </p>

            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-charcoal/50">
                {t("educationTitle")}
              </h3>
              <ul className="flex flex-col gap-5">
                {education.map((item) => (
                  <li key={item.title} className="flex items-start gap-4 border-t border-charcoal/10 pt-5 first:border-t-0 first:pt-0">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-bronze-dark/30 text-bronze-dark">
                      <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-serif text-lg text-charcoal">{item.title}</span>
                      <span className="text-sm text-charcoal/55">{item.place}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-8 border border-charcoal bg-charcoal p-8 text-cream sm:p-10">
              <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-bronze-light">
                {t("statsTitle")}
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-2">
                    <span className="font-serif text-3xl sm:text-4xl">{stat.value}</span>
                    <span className="text-[11px] uppercase leading-snug tracking-[0.12em] text-cream/60">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <CredentialCard
                icon={Handshake}
                title={t("collabTitle")}
                items={collaborations}
              />
              <CredentialCard icon={Trophy} title={t("awardsTitle")} items={awards} />
            </div>

            <CredentialCard
              icon={ShieldCheck}
              title={t("standardsTitle")}
              items={standards}
              wide
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function CredentialCard({
  icon: Icon,
  title,
  items,
  wide,
}: {
  icon: typeof Handshake;
  title: string;
  items: string[];
  wide?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 border border-charcoal/10 bg-cream-dark/50 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center border border-bronze-dark/30 text-bronze-dark">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal/60">{title}</h4>
      </div>
      <ul className={wide ? "grid gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}>
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-charcoal/75">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
