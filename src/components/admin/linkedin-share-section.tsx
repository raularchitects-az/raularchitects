"use client";

import { useMemo, useState } from "react";
import {
  LINKEDIN_SHARE_BUTTON_LABELS,
  LINKEDIN_SHARE_LOCALE_LABELS,
  LINKEDIN_SHARE_LOCALES,
  type LinkedInShareLocale,
  canShareLinkedInPost,
  linkedInShareOffsiteUrl,
} from "@/lib/cms/linkedin-post";
import { Field, Select } from "./fields";

export function LinkedInShareSection({
  editorLocale,
  published,
  localeTitles,
  localeSlugs,
}: {
  editorLocale: LinkedInShareLocale;
  published: boolean;
  localeTitles: Record<LinkedInShareLocale, string>;
  localeSlugs: Record<LinkedInShareLocale, string>;
}) {
  const [shareLocale, setShareLocale] = useState<LinkedInShareLocale>(editorLocale);

  const availableLocales = useMemo(
    () =>
      LINKEDIN_SHARE_LOCALES.filter((locale) =>
        canShareLinkedInPost(published ? "published" : "draft", localeSlugs[locale], localeTitles[locale]),
      ),
    [localeSlugs, localeTitles, published],
  );

  const options = published && availableLocales.length > 0 ? availableLocales : [...LINKEDIN_SHARE_LOCALES];
  const selected = options.includes(shareLocale) ? shareLocale : (options[0] ?? editorLocale);
  const selectedSlug = localeSlugs[selected] ?? "";
  const canShare = canShareLinkedInPost(published ? "published" : "draft", selectedSlug, localeTitles[selected]);
  const shareHref = canShare ? linkedInShareOffsiteUrl(selected, selectedSlug) : "";
  const selectorDisabled = !canShare;
  const buttonClass =
    "inline-flex w-fit items-center justify-center bg-charcoal px-5 py-2.5 text-xs font-medium tracking-[0.12em] text-cream disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section className="flex flex-col gap-4 border border-charcoal/15 p-5">
      <h2 className="text-sm font-semibold">LinkedIn paylaşımı</h2>
      <Field label="Paylaşım dili">
        <Select
          value={selected}
          disabled={selectorDisabled}
          onChange={(event) => setShareLocale(event.target.value as LinkedInShareLocale)}
        >
          {options.map((locale) => (
            <option key={locale} value={locale}>
              {LINKEDIN_SHARE_LOCALE_LABELS[locale]}
            </option>
          ))}
        </Select>
      </Field>
      {selectedSlug ? (
        <p className="break-all text-xs text-charcoal/45">{linkedInShareOffsiteUrl(selected, selectedSlug)}</p>
      ) : null}
      {canShare ? (
        <a href={shareHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {LINKEDIN_SHARE_BUTTON_LABELS[selected]}
        </a>
      ) : (
        <button type="button" className={buttonClass} disabled>
          {LINKEDIN_SHARE_BUTTON_LABELS[selected]}
        </button>
      )}
      {!canShare ? <p className="text-sm text-charcoal/55">Bu dil versiyası əvvəlcə dərc edilməlidir.</p> : null}
      <p className="text-sm text-charcoal/55">
        LinkedIn pəncərəsində Raul Architects səhifəsinin seçili olduğunu yoxlayın və Post düyməsinə vurun.
      </p>
    </section>
  );
}
