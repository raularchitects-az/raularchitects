"use client";

import { useState } from "react";
import { ADMIN_LOCALES } from "@/lib/cms/types";

export function LocaleTabs({
  render,
}: {
  render: (locale: (typeof ADMIN_LOCALES)[number]) => React.ReactNode;
}) {
  const [locale, setLocale] = useState<(typeof ADMIN_LOCALES)[number]>("az");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {ADMIN_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${
              locale === code ? "bg-charcoal text-cream" : "border border-charcoal/15 text-charcoal/70"
            }`}
          >
            {code}
          </button>
        ))}
      </div>
      <div>{render(locale)}</div>
    </div>
  );
}
