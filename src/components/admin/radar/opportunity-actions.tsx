"use client";

import { useTransition } from "react";
import { markNotRelevant, markReviewLater, restoreOpportunity } from "@/lib/radar/actions";

const buttonClass =
  "border border-charcoal/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-charcoal/70 transition hover:border-charcoal hover:text-charcoal disabled:opacity-50";

export function OpportunityActions({
  id,
  sourceUrl,
  state,
}: {
  id: string;
  sourceUrl: string;
  state: string;
}) {
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => () => {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Əməliyyat alınmadı");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-charcoal px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-cream"
      >
        Rəsmi tenderə bax
      </a>
      {state !== "review_later" ? (
        <button type="button" className={buttonClass} disabled={pending} onClick={run(() => markReviewLater(id))}>
          Sonra baxılacaq
        </button>
      ) : null}
      {state !== "not_relevant" ? (
        <button type="button" className={buttonClass} disabled={pending} onClick={run(() => markNotRelevant(id))}>
          Uyğun deyil
        </button>
      ) : (
        <button type="button" className={buttonClass} disabled={pending} onClick={run(() => restoreOpportunity(id))}>
          Aktiv siyahıya qaytar
        </button>
      )}
    </div>
  );
}
