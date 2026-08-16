"use client";

import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaAlt, uploadMedia } from "@/lib/cms/actions";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import type { MediaRow } from "@/lib/cms/types";
import { ConfirmButton, Field, inputClass } from "@/components/admin/fields";

export function MediaLibrary({ items }: { items: MediaRow[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <form
        action={async (formData) => {
          await uploadMedia(formData);
          router.refresh();
        }}
        className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5 sm:flex-row sm:items-end"
      >
        <Field label="Fayl">
          <input type="file" name="file" required accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" />
        </Field>
        <Field label="Alt text">
          <input name="alt" className={inputClass} />
        </Field>
        <button type="submit" className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream">
          Yüklə
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="border border-charcoal/10 bg-white p-3">
            <div className="relative mb-2 aspect-square overflow-hidden bg-cream-dark">
              {item.mime.startsWith("video/") ? (
                <span className="flex h-full items-center justify-center text-xs">video</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaPublicUrl(item.path)} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="truncate text-[11px] text-charcoal/50">{item.path}</p>
            <form
              action={async (formData) => {
                await updateMediaAlt(item.id, String(formData.get("alt") ?? ""));
                router.refresh();
              }}
              className="mt-2 flex gap-2"
            >
              <input name="alt" defaultValue={item.alt_text ?? ""} className={`${inputClass} flex-1`} />
              <button type="submit" className="text-[11px] uppercase">
                Alt
              </button>
            </form>
            <ConfirmButton
              label="Sil"
              confirm="Media silinsin?"
              className="mt-2 text-[11px] uppercase text-red-700"
              onConfirm={async () => {
                await deleteMedia(item.id);
                router.refresh();
              }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
