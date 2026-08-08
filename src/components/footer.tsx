import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  const links = [
    { href: "#about", label: nav("about") },
    { href: "#services", label: nav("services") },
    { href: "#bim", label: nav("bim") },
    { href: "#contact", label: nav("contact") },
  ];

  return (
    <footer className="border-t border-cream/10 bg-charcoal-dark py-14">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4">
            <Logo tone="light" />
            <p className="max-w-xs text-sm leading-relaxed text-cream/50">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-bronze-light/70">
              {t("navTitle")}
            </span>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-cream/55 transition-colors duration-300 hover:text-bronze-light"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-bronze-light/70">
              {t("contactTitle")}
            </span>
            <div className="flex flex-col gap-2 text-sm text-cream/55">
              <span>{t("email")}</span>
              <span>{t("phoneSwitzerlandLabel")} · {t("phoneSwitzerland")}</span>
              <span>{t("phoneGermanyLabel")} · {t("phoneGermany")}</span>
              <span>{t("website")}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {t("brand")}. {t("rights")}</span>
          <span className="uppercase tracking-[0.16em]">Germany · Switzerland · Azerbaijan</span>
        </div>
      </Container>
    </footer>
  );
}
