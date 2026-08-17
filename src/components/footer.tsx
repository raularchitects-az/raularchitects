import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { SocialLinks } from "@/components/social-links";

const links = [
  { href: "/xidmetler", key: "services" },
  { href: "/layihelar", key: "projects" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/haqqimizda", key: "about" },
  { href: "/bloq", key: "blog" },
  { href: "/elaqe", key: "contact" },
] as const;

export function Footer({ credit }: { credit?: string }) {
  const t = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal/10 bg-cream py-12">
      <Container>
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Logo />

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-[0.18em] text-charcoal/60 transition-colors duration-300 hover:text-bronze-dark"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-charcoal/10 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="text-xs text-charcoal/40">
            {credit ? <p className="mb-2">{credit}</p> : null}
            <span>
              © {year} Designed and developed by{" "}
              <a
                href="https://media7.az"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-charcoal/55 transition-colors duration-300 hover:text-bronze-dark"
              >
                media7.az
              </a>
            </span>
          </div>
          <SocialLinks className="md:mr-36 lg:mr-44" />
        </div>
      </Container>
    </footer>
  );
}
