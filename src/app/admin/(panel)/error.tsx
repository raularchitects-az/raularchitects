"use client";

import { useEffect } from "react";

export default function AdminPanelError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const recover = retry ?? reset;

  useEffect(() => {
    console.error("[admin]", error.name, error.digest ?? "");
  }, [error]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Xəta baş verdi</h1>
      <p className="mt-2 max-w-xl text-sm text-charcoal/70">
        Səhifə yüklənmədi. Media siyahısı və ya yükləmə sorğusu uğursuz ola bilər. Mövcud məzmun dəyişməyib.
      </p>
      {recover ? (
        <button type="button" onClick={recover} className="mt-4 border border-charcoal/20 px-4 py-2 text-xs uppercase tracking-[0.16em]">
          Yenidən cəhd
        </button>
      ) : null}
    </div>
  );
}
