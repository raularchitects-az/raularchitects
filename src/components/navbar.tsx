"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";

const primaryLinks = [
  { href: "/layihelar", key: "projects" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/xidmetler", key: "services" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-charcoal/10 bg-cream">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden items-center gap-10 lg:flex">
            {primaryLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal/70 transition-colors duration-300 hover:text-bronze-dark"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 border border-charcoal/15 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:border-bronze-dark hover:text-bronze-dark"
            >
              {t("menuOpen")}
              <Menu className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      <MegaMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
