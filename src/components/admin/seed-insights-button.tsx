"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { seedInitialInsights } from "@/lib/cms/actions";

export function SeedInsightsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={busy}
        className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-[0.16em] disabled:opacity-60"
        onClick={async () => {
          if (
            !window.confirm(
              "10 Insights seed upsert olunacaq (slug üzrə). Status: published. Mövcud eyni slug-lar yenilənəcək. Davam?",
            )
          ) {
            return;
          }
          setBusy(true);
          setMessage(null);
          setFailed(false);
          try {
            const result = await seedInitialInsights({ confirm: true });
            setMessage(`${result.insights} Insights seed hazırdır (published upsert).`);
            router.refresh();
          } catch (error) {
            setFailed(true);
            setMessage(error instanceof Error ? error.message : "Seed alınmadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Seed edilir…" : "10 Insights seed et"}
      </button>
      {message ? (
        <p className={`max-w-xl text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>{message}</p>
      ) : null}
    </div>
  );
}
