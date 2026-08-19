"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LINKEDIN_COMPANY_URL,
  canShareLinkedInPost,
  defaultLinkedInPost,
} from "@/lib/cms/linkedin-post";
import { Field, TextArea } from "./fields";

export function LinkedInShareSection({
  savedText,
  savedPublished,
  initialSlug,
  initialTitle,
  initialExcerpt,
  initialCategory,
  initialStatus,
}: {
  savedText: string;
  savedPublished: boolean;
  initialSlug: string;
  initialTitle: string;
  initialExcerpt: string;
  initialCategory: string;
  initialStatus: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dirty, setDirty] = useState(Boolean(savedText.trim()));
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState(initialSlug);
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [editedText, setEditedText] = useState(savedText);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!(form instanceof HTMLFormElement)) return;
    const blogForm = form;

    function readFields() {
      const data = new FormData(blogForm);
      const nextSlug = String(data.get("slug") ?? "").trim();
      const nextStatus = String(data.get("status") ?? "");
      const nextCategory = String(data.get("category") ?? "");
      const nextTitle = String(data.get("az_title") ?? "");
      const nextExcerpt = String(data.get("az_short") ?? "");
      setSlug(nextSlug);
      if (nextStatus) setStatus(nextStatus);
      if (nextCategory) setCategory(nextCategory);
      if (nextTitle) setTitle(nextTitle);
      if (data.has("az_short")) setExcerpt(nextExcerpt);
    }

    blogForm.addEventListener("input", readFields);
    blogForm.addEventListener("change", readFields);
    return () => {
      blogForm.removeEventListener("input", readFields);
      blogForm.removeEventListener("change", readFields);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const generatedText = useMemo(
    () => defaultLinkedInPost({ title, excerpt, slug, category }),
    [category, excerpt, slug, title],
  );
  const text = dirty ? editedText : generatedText;
  const canShare = savedPublished && canShareLinkedInPost(status, slug);
  const buttonClass = `border border-charcoal/20 px-5 py-2.5 text-xs font-medium tracking-[0.12em] ${
    canShare ? "text-charcoal hover:border-charcoal" : "cursor-not-allowed text-charcoal/35"
  }`;

  async function copyText() {
    if (!canShare) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.left = "-9999px";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section ref={rootRef} className="flex flex-col gap-4 border border-charcoal/15 p-5">
      <h2 className="text-sm font-semibold">LinkedIn paylaşımı</h2>
      <Field label="LinkedIn post mətni">
        <TextArea
          name="linkedin_text"
          value={text}
          onChange={(event) => {
            setDirty(true);
            setEditedText(event.target.value);
          }}
          className="min-h-40"
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonClass} disabled={!canShare} onClick={() => void copyText()}>
          {copied ? "Kopyalandı ✓" : "Mətni kopyala"}
        </button>
        {canShare ? (
          <a
            href={LINKEDIN_COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            Raul Architects LinkedIn səhifəsini aç
          </a>
        ) : (
          <span className={buttonClass} aria-disabled="true">
            Raul Architects LinkedIn səhifəsini aç
          </span>
        )}
      </div>
      {!canShare ? <p className="text-sm text-charcoal/55">Əvvəl blogu dərc edin.</p> : null}
      <p className="text-sm text-charcoal/55">
        Əvvəl mətni kopyalayın. Açılan Raul Architects LinkedIn səhifəsində ‘Start a post’ düyməsinə vurun, mətni
        yapışdırın və paylaşın.
      </p>
    </section>
  );
}
