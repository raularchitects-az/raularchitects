"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Send } from "lucide-react";
import { submitInquiryForm } from "@/lib/inquiry-actions";
import { trackEvent } from "@/lib/analytics";

export function InquiryForm() {
  const t = useTranslations("contactPage.form");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await submitInquiryForm(new FormData(event.currentTarget));
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    trackEvent("generate_lead", { method: "contact_form", form_location: "contact_page" });
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
      <h3 className="text-xl font-semibold text-charcoal">{t("title")}</h3>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("name")}</span>
        <input
          required
          type="text"
          name="name"
          disabled={pending}
          className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("email")}</span>
        <input
          required
          type="email"
          name="email"
          disabled={pending}
          className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{t("message")}</span>
        <textarea
          required
          name="message"
          rows={4}
          disabled={pending}
          className="resize-none border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="group mt-2 inline-flex items-center justify-center gap-2 border border-charcoal bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("sending") : t("submit")}
        <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
      </button>
    </form>
  );
}
