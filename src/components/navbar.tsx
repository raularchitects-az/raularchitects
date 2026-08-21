"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toDisplayUpperCase } from "@/lib/locale-text";
import { Menu } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";

export function Navbar({ insightsActive = false }: { insightsActive?: boolean }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const upper = (text: string) => toDisplayUpperCase(text, locale);

  const portfolioOrInsights = insightsActive
    ? ({ href: "/insights" as const, key: "insights" as const })
    : ({ href: "/portfolio" as const, key: "portfolio" as const });

  const primaryLinks = [
    { href: "/xidmetler" as const, key: "services" as const },
    { href: "/layihelar" as const, key: "projects" as const },
    portfolioOrInsights,
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 shadow-[0_4px_18px_rgba(145,107,79,0.12)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-animated" />
        </div>
        <nav className="relative mx-auto grid h-20 max-w-7xl grid-cols-2 items-center px-6 lg:grid-cols-3 lg:px-10">
          <Link href="/" className="shrink-0 justify-self-start">
            <Logo tone="light" />
          </Link>

          <div className="hidden items-center justify-center gap-10 lg:flex">
            {primaryLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-xs font-medium tracking-[0.22em] text-cream/90 transition-colors duration-300 hover:text-cream"
              >
                {upper(t(item.key))}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-self-end gap-2 sm:gap-3">
            <LanguageSwitcher tone="light" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("menuOpen")}
              className="flex items-center gap-2 border border-cream/30 px-4 py-2.5 text-xs font-medium tracking-[0.2em] text-cream transition-colors duration-300 hover:border-cream hover:bg-cream/10"
            >
              <span className="hidden sm:inline">{upper(t("menuOpen"))}</span>
              <Menu className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      <MegaMenu open={open} onClose={() => setOpen(false)} insightsActive={insightsActive} />
    </>
  );
}
