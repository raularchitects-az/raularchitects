"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";

export function ProjectLeadForm() {
  const t = useTranslations("projectDetail");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 border border-cream/15 bg-charcoal-dark p-10 text-center">
        <CheckCircle2 className="h-9 w-9 text-bronze-light" strokeWidth={1.5} />
        <p className="max-w-xs text-sm leading-relaxed text-cream/70">{t("form.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-cream/15 bg-charcoal-dark p-8 sm:grid-cols-2 sm:p-10">
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">{t("form.land")}</span>
        <input
          required
          type="text"
          name="land"
          className="border border-cream/15 bg-transparent px-4 py-3 text-sm text-cream outline-none transition-colors duration-300 placeholder:text-cream/25 focus:border-bronze-light"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">{t("form.location")}</span>
        <input
          required
          type="text"
          name="location"
          className="border border-cream/15 bg-transparent px-4 py-3 text-sm text-cream outline-none transition-colors duration-300 placeholder:text-cream/25 focus:border-bronze-light"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">{t("form.size")}</span>
        <input
          required
          type="text"
          name="size"
          className="border border-cream/15 bg-transparent px-4 py-3 text-sm text-cream outline-none transition-colors duration-300 placeholder:text-cream/25 focus:border-bronze-light"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/50">{t("form.phone")}</span>
        <input
          required
          type="tel"
          name="phone"
          className="border border-cream/15 bg-transparent px-4 py-3 text-sm text-cream outline-none transition-colors duration-300 placeholder:text-cream/25 focus:border-bronze-light"
        />
      </label>

      <button
        type="submit"
        className="group col-span-full mt-2 inline-flex items-center justify-center gap-2 border border-bronze-light bg-bronze-dark px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:bg-bronze-light hover:text-charcoal"
      >
        {t("form.submit")}
        <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
      </button>
    </form>
  );
}
