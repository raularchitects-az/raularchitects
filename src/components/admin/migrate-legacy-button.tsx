"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { migrateLegacyCatalog } from "@/lib/cms/actions";

export function MigrateLegacyButton() {
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
              "Mövcud CMS qeydləri dəyişməyəcək, overwrite olmayacaq və heç bir qeyd published edilməyəcək. Yalnız əskik slug-lar siyahılanacaq. Davam?",
            )
          ) {
            return;
          }
          setBusy(true);
          setMessage(null);
          setFailed(false);
          try {
            const result = await migrateLegacyCatalog();
            const pendingCount = result.projects.pending.length + result.portfolio.pending.length;
            setMessage(
              `Mövcud CMS dəyişmədi. Ötürüldü: ${result.projects.skipped + result.portfolio.skipped}. ` +
                `Əskik (avtomatik əlavə olunmadı): ${pendingCount}.` +
                (pendingCount ? " Əskik item-ləri tək-tək Yeni ilə əlavə edib Publish edin." : ""),
            );
            if (pendingCount) setFailed(false);
            router.refresh();
          } catch (error) {
            setFailed(true);
            setMessage(error instanceof Error ? error.message : "Migration alınmadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Köçürülür…" : "Legacy kataloqu CMS-ə köçür"}
      </button>
      {message ? (
        <p className={`max-w-xl text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>{message}</p>
      ) : null}
    </div>
  );
}
