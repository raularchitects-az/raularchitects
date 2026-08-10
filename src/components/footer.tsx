import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

const links = [
  { href: "/xidmetler", key: "services" },
  { href: "/layihelar", key: "projects" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/haqqimizda", key: "about" },
  { href: "/elaqe", key: "contact" },
] as const;

export function Footer() {
  const t = useTranslations("nav");
  const f = useTranslations("footerMini");
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

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-charcoal/10 pt-6 text-xs text-charcoal/40 sm:flex-row sm:justify-between">
          <span>© {year} Raul Architects</span>
          <span>{f("rights")}</span>
        </div>
      </Container>
    </footer>
  );
}
