"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importDraftBlogPosts } from "@/lib/cms/actions";

export function ImportDraftBlogButton() {
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
              "10 yeni bloq yazısı qaralama kimi əlavə olunacaq. Mövcud yazılar dəyişməz, saytda görünməyəcək. Davam?",
            )
          ) {
            return;
          }
          setBusy(true);
          setMessage(null);
          setFailed(false);
          try {
            const result = await importDraftBlogPosts();
            setMessage(
              `${result.blog} yazı qaralama kimi hazırdır. Publish etmək üçün siyahıdan Publish basın.`,
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
        {busy ? "Əlavə edilir…" : "10 yeni qaralama idxal et"}
      </button>
      {message ? (
        <p className={`max-w-xl text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>{message}</p>
      ) : null}
    </div>
  );
}
