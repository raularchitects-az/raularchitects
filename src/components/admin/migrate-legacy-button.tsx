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
              "Mövcud statik layihə və portfolio CMS-ə published/aktiv kimi köçürüləcək. Eyni slug təkrar yaradılmayacaq. Davam?",
            )
          ) {
            return;
          }
          setBusy(true);
          setMessage(null);
          setFailed(false);
          try {
            const result = await migrateLegacyCatalog();
            const failedCount = result.projects.failed.length + result.portfolio.failed.length;
            setMessage(
              `Tapıldı: ${result.found.projects} layihə, ${result.found.portfolio} portfolio. ` +
                `Yeni: ${result.projects.imported + result.portfolio.imported}. ` +
                `Yeniləndi: ${result.projects.updated + result.portfolio.updated}. ` +
                `Ötürüldü: ${result.projects.skipped + result.portfolio.skipped}.` +
                (failedCount ? ` Xəta: ${failedCount}.` : ""),
            );
            if (failedCount) setFailed(true);
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
