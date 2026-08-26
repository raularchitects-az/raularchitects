import { useLocale, useTranslations } from "next-intl";
import { toDisplayUpperCase } from "@/lib/locale-text";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { LogoHomeLink } from "@/components/ui/logo-home-link";
import { Container } from "@/components/ui/container";
import { SocialLinks } from "@/components/social-links";

export function Footer({
  credit,
  insightsActive = false,
}: {
  credit?: string;
  insightsActive?: boolean;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const upper = (text: string) => toDisplayUpperCase(text, locale);

  const portfolioOrInsights = insightsActive
    ? ({ href: "/insights" as const, key: "insights" as const })
    : ({ href: "/portfolio" as const, key: "portfolio" as const });

  const links = [
    { href: "/xidmetler" as const, key: "services" as const },
    { href: "/layihelar" as const, key: "projects" as const },
    portfolioOrInsights,
    { href: "/haqqimizda" as const, key: "about" as const },
    { href: "/bloq" as const, key: "blog" as const },
    { href: "/elaqe" as const, key: "contact" as const },
  ];

  return (
    <footer className="border-t border-charcoal/10 bg-cream py-12">
      <Container wide>
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <LogoHomeLink>
            <Logo />
          </LogoHomeLink>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-[0.18em] text-charcoal/60 transition-colors duration-300 hover:text-bronze-dark"
              >
                {upper(t(link.key))}
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
