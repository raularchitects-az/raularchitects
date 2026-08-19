"use client";

import { useState } from "react";
import { ADMIN_LOCALES } from "@/lib/cms/types";

type AdminLocale = (typeof ADMIN_LOCALES)[number];

export function LocaleTabs({
  locale: localeProp,
  onLocaleChange,
  render,
}: {
  locale?: AdminLocale;
  onLocaleChange?: (locale: AdminLocale) => void;
  render: (locale: AdminLocale) => React.ReactNode;
}) {
  const [internal, setInternal] = useState<AdminLocale>("az");
  const locale = localeProp ?? internal;

  function setLocale(next: AdminLocale) {
    onLocaleChange?.(next);
    if (localeProp === undefined) setInternal(next);
  }

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
      <div>
        {ADMIN_LOCALES.map((code) => (
          <div key={code} hidden={code !== locale}>
            {render(code)}
          </div>
        ))}
      </div>
    </div>
  );
}
