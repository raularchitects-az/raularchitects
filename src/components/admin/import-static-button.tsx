"use client";

import { useRouter } from "next/navigation";
import { importStaticContent } from "@/lib/cms/actions";

export function ImportStaticButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-[0.16em]"
      onClick={async () => {
        if (
          !window.confirm(
            "Statik layihə, portfolio və bloq draft kimi əlavə olunacaq. Mövcud CMS qeydləri dəyişməz. Davam?",
          )
        ) {
          return;
        }
        await importStaticContent();
        router.refresh();
      }}
    >
      Mövcud saytı import et
    </button>
  );
}
