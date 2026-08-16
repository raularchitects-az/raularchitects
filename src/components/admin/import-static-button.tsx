"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importStaticContent } from "@/lib/cms/actions";

export function ImportStaticButton({ prominent = false }: { prominent?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <div className={prominent ? "flex flex-col gap-3" : "flex flex-col items-start gap-2"}>
      <button
        type="button"
        disabled={busy}
        className={
          prominent
            ? "bg-charcoal px-5 py-3 text-xs uppercase tracking-[0.16em] text-cream disabled:opacity-60"
            : "border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-[0.16em] disabled:opacity-60"
        }
        onClick={async () => {
          if (
            !window.confirm(
              "Statik layihə, portfolio və bloq draft kimi əlavə olunacaq. Mövcud CMS qeydləri dəyişməz. Davam?",
            )
          ) {
            return;
          }
          setBusy(true);
          setMessage(null);
          setFailed(false);
          try {
            const result = await importStaticContent();
            setMessage(
              `Import olundu: ${result.projects} layihə, ${result.portfolio} portfolio, ${result.blog} bloq (draft). Publish etmək üçün siyahıdan Publish basın.`,
            );
            router.refresh();
          } catch (error) {
            setFailed(true);
            setMessage(error instanceof Error ? error.message : "Import alınmadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Import edilir…" : "Mövcud saytı import et"}
      </button>
      {message ? (
        <p className={`max-w-xl text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>{message}</p>
      ) : null}
    </div>
  );
}
