"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Send, X } from "lucide-react";
import { submitInquiryForm, type InquiryErrorCode } from "@/lib/inquiry-actions";
import { trackEvent } from "@/lib/analytics";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectEnquiryModal({
  projectName,
  projectUrl,
}: {
  projectName: string;
  /** Server-rendered fallback until the browser can report the real address. */
  projectUrl: string;
}) {
  const t = useTranslations("projectDetail");
  const e = useTranslations("projectDetail.enquiry");
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState(projectUrl);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<InquiryErrorCode | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  function openModal() {
    if (typeof window !== "undefined") setPageUrl(window.location.href);
    setSubmitted(false);
    setErrorCode(null);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (item) => item.offsetParent !== null,
      );
      if (!items.length) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      body.style.overflow = previousOverflow;
    };
  }, [open, close, submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorCode(null);

    const result = await submitInquiryForm(new FormData(event.currentTarget));
    setPending(false);

    if (!result.ok) {
      setErrorCode(result.code);
      return;
    }
    trackEvent("generate_lead", {
      method: "project_enquiry_modal",
      form_location: "project_detail",
      project_name: projectName,
    });
    setSubmitted(true);
  }

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-charcoal-dark/70 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative my-auto w-full max-w-lg border border-charcoal/10 bg-cream shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label={e("close")}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center text-charcoal/50 transition-colors duration-300 hover:text-bronze-dark"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {submitted ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 bg-cream-dark/40 p-10 text-center">
            <CheckCircle2 className="h-9 w-9 text-bronze-dark" strokeWidth={1.5} />
            <h2 id={titleId} className="sr-only">
              {e("title")}
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-charcoal/70">{e("success")}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto bg-cream-dark/40 p-6 sm:p-10"
          >
            <h2 id={titleId} className="pr-8 text-xl font-semibold text-charcoal">
              {e("title")}
            </h2>

            <input type="hidden" name="project" value={projectName} />
            <input type="hidden" name="pageUrl" value={pageUrl} />

            {errorCode ? <p className="text-sm text-red-700">{e(`errors.${errorCode}`)}</p> : null}

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{e("name")}</span>
              <input
                required
                type="text"
                name="name"
                disabled={pending}
                className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">{e("email")}</span>
              <input
                required
                type="email"
                name="email"
                disabled={pending}
                className="border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/50">
                {e("message")}
              </span>
              <textarea
                required
                name="message"
                rows={5}
                disabled={pending}
                className="resize-none border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-bronze-dark disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="group mt-2 inline-flex items-center justify-center gap-2 border border-charcoal bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:border-bronze-dark hover:bg-bronze-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? e("sending") : e("submit")}
              <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className="group inline-flex items-center justify-center gap-2 border border-bronze-light bg-bronze-dark px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:bg-bronze-light hover:text-charcoal"
      >
        {t("applyCta")}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
      </button>
      {/* `open` only flips from a click, so the portal never runs during SSR. */}
      {open ? createPortal(modal, document.body) : null}
    </>
  );
}
