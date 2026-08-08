"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

const sections = [
  { href: "#about", key: "about" },
  { href: "#services", key: "services" },
  { href: "#bim", key: "bim" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-charcoal/10 bg-cream/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <div className="hidden items-center gap-10 lg:flex">
          {sections.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal/70 transition-colors duration-300 hover:text-bronze-dark"
            >
              {t(item.key)}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 border border-charcoal bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
          >
            {t("cta")}
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center border border-charcoal/15 p-2 text-charcoal lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-charcoal/10 bg-cream px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {sections.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.18em] text-charcoal/80"
              >
                {t(item.key)}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="inline-flex w-fit items-center gap-2 border border-charcoal bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-cream"
            >
              {t("cta")}
            </a>
            <div className="pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
