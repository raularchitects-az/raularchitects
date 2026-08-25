"use client";

import { useTranslations } from "next-intl";
import { storeConsent } from "@/lib/analytics-consent";

export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal/10 bg-cream/95 px-4 py-4 backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("title")}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-charcoal/70">{t("description")}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => storeConsent("denied")}
            className="inline-flex items-center justify-center border border-charcoal/20 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/70 transition-colors duration-300 hover:border-charcoal/40 hover:text-charcoal"
          >
            {t("reject")}
          </button>
          <button
            type="button"
            onClick={() => storeConsent("granted")}
            className="inline-flex items-center justify-center border border-charcoal bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
