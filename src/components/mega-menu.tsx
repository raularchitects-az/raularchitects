"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/xidmetler",
    key: "services",
    children: [
      ...services.map((s) => ({ href: `/xidmetler/${s.slug}`, slug: s.slug }) as const),
      { href: "/xidmetler", key: "allServices" } as const,
    ],
  },
  { href: "/layihelar", key: "projects" },
  { href: "/portfolio", key: "portfolio" },
  {
    href: "/haqqimizda",
    key: "about",
    children: [
      { href: "/haqqimizda", key: "aboutStudio" },
      { href: "/haqqimizda/raul-nagiyev", key: "aboutRaul" },
    ],
  },
  { href: "/elaqe", key: "contact" },
] as const;

export function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const s = useTranslations("servicesPage");

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
        "fixed inset-0 z-[60] overflow-y-auto bg-charcoal-dark transition-all duration-500",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-cream">Raul Architects</span>
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

        <nav className="flex flex-1 flex-col justify-center gap-1 py-10">
          {menuItems.map((item, index) => (
            <div
              key={item.href}
              className={cn("border-b border-cream/10 py-4 sm:py-5", open && "animate-fade-up")}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link href={item.href} onClick={onClose} className="group flex items-baseline gap-4">
                <span className="text-xs text-bronze-light/50">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-serif text-4xl text-cream transition-colors duration-300 group-hover:text-bronze-light sm:text-6xl">
                  {t(item.key)}
                </span>
                <ArrowUpRight
                  className="ml-auto h-6 w-6 text-cream/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light"
                  strokeWidth={1.25}
                />
              </Link>

              {"children" in item && item.children ? (
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 pl-9">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className="text-xs uppercase tracking-[0.16em] text-cream/50 transition-colors duration-300 hover:text-bronze-light"
                    >
                      {"slug" in child ? s(`items.${child.slug}.title`) : t(child.key)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex justify-center border-t border-cream/10 pt-6">
          <LanguageSwitcher tone="light" />
        </div>
      </div>
    </div>
  );
}
