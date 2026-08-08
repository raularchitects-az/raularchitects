import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

const primaryLinks = [
  { href: "/layihelar", key: "projects" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/xidmetler", key: "services" },
] as const;

const secondaryLinks = [
  { href: "/ustunluklar", key: "advantages" },
  { href: "/haqqimizda", key: "about" },
  { href: "/elaqe", key: "contact" },
] as const;

export function Footer() {
  const t = useTranslations("nav");
  const c = useTranslations("contactPage");
  const f = useTranslations("footerMini");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cream/10 bg-charcoal-dark py-14">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4">
            <Logo tone="light" />
          </div>

          <div className="flex flex-col gap-3">
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-cream/55 transition-colors duration-300 hover:text-bronze-light"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 text-sm text-cream/55">
            <span>{c("azerbaijan.email")}</span>
            <span>{c("germany.label")} · {c("germany.phone")}</span>
            <span>{c("switzerland.label")} · {c("switzerland.phone")}</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Media7.az. {f("rights")}</span>
          <span className="uppercase tracking-[0.16em]">Germany · Switzerland · Azerbaijan</span>
        </div>
      </Container>
    </footer>
  );
}
