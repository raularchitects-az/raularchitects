import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/contact-form";

export function Contact() {
  const t = useTranslations("footer");
  const locations = t.raw("locations") as string[];

  return (
    <section id="contact" className="relative bg-cream-dark py-24 sm:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHeading eyebrow={t("contactTitle")} title={t("tagline")} description={t("description")} />

            <div className="flex flex-col gap-6">
              <ContactRow icon={Mail} label={t("email")} href={`mailto:${t("email")}`} />
              <ContactRow
                icon={Phone}
                label={`${t("phoneSwitzerlandLabel")} · ${t("phoneSwitzerland")}`}
                href={`tel:${t("phoneSwitzerland").replace(/\s/g, "")}`}
              />
              <ContactRow
                icon={Phone}
                label={`${t("phoneGermanyLabel")} · ${t("phoneGermany")}`}
                href={`tel:${t("phoneGermany").replace(/\s/g, "")}`}
              />
              <ContactRow icon={MapPin} label={locations.join(" · ")} />
            </div>
          </div>

          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Mail;
  label: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-bronze-dark/30 text-bronze-dark">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="text-sm text-charcoal/75">{label}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} className="group inline-flex items-center transition-colors duration-300 hover:text-bronze-dark">
        {content}
      </a>
    );
  }

  return content;
}
