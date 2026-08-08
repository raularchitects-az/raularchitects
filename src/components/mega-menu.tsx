"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, MessageCircle, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

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

export function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-charcoal transition-all duration-500",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <div className="flex items-center justify-between">
          <span className="font-serif text-base tracking-[0.18em] text-cream">RAUL ARCHITECTS</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("menuClose")}
            className="flex items-center gap-2 border border-cream/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:border-bronze-light hover:text-bronze-light"
          >
            {t("menuClose")}
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-14 py-10">
          <nav className="flex flex-col gap-2">
            {primaryLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "group flex items-baseline gap-4 border-b border-cream/10 py-4 transition-colors duration-300 hover:border-bronze-light/40 sm:py-5",
                  open && "animate-fade-up",
                )}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="text-xs text-bronze-light/50">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-serif text-4xl text-cream transition-colors duration-300 group-hover:text-bronze-light sm:text-6xl">
                  {t(link.key)}
                </span>
                <ArrowUpRight
                  className="ml-auto h-6 w-6 text-cream/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light"
                  strokeWidth={1.25}
                />
              </Link>
            ))}
          </nav>

          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-sm uppercase tracking-[0.18em] text-cream/60 transition-colors duration-300 hover:text-bronze-light"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-cream/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <LanguageSwitcher tone="light" />
          <a
            href="https://wa.me/491578970708"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/70 transition-colors duration-300 hover:text-bronze-light"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            {t("whatsapp")}
          </a>
        </div>
      </div>
    </div>
  );
}
