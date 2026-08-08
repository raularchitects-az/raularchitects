"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";

export function InquiryForm() {
  const t = useTranslations("contactPage.form");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 border border-charcoal/10 bg-cream-dark/40 p-10 text-center">
        <CheckCircle2 className="h-9 w-9 text-bronze-dark" strokeWidth={1.5} />
        <p className="max-w-xs text-sm leading-relaxed text-charcoal/70">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-charcoal/10 bg-cream-dark/40 p-8 sm:p-10">
      <h3 className="font-serif text-xl text-charcoal">{t("title")}</h3>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("name")}</span>
        <input
          required
          type="text"
          name="name"
          className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("email")}</span>
        <input
          required
          type="email"
          name="email"
          className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("message")}</span>
        <textarea
          required
          name="message"
          rows={4}
          className="resize-none border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark"
        />
      </label>

      <button
        type="submit"
        className="group mt-2 inline-flex items-center justify-center gap-2 border border-charcoal bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark"
      >
        {t("submit")}
        <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
      </button>
    </form>
  );
}
