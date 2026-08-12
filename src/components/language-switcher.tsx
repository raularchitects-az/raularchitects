"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, localeNames, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(next: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex items-center gap-2 border px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300",
          tone === "dark"
            ? "border-charcoal/15 text-charcoal hover:border-bronze-dark hover:text-bronze-dark"
            : "border-cream/30 text-cream hover:border-cream hover:bg-cream/10",
        )}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
        {localeLabels[locale]}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-300", open && "rotate-180")}
          strokeWidth={1.5}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className={cn(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-40 border shadow-xl",
            tone === "dark"
              ? "border-charcoal/10 bg-cream"
              : "border-cream/10 bg-charcoal-dark",
          )}
        >
          {locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                onClick={() => handleSelect(code)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-xs uppercase tracking-[0.18em] transition-colors duration-200",
                  code === locale
                    ? "text-bronze-dark"
                    : tone === "dark"
                      ? "text-charcoal/70 hover:bg-charcoal/[0.04] hover:text-charcoal"
                      : "text-cream/70 hover:bg-cream/[0.06] hover:text-cream",
                )}
              >
                <span>{localeNames[code]}</span>
                <span className="text-[10px] opacity-60">{localeLabels[code]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
