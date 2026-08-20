"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaAlt, uploadMedia } from "@/lib/cms/actions";
import { MEDIA_ACCEPT, validateMediaFile } from "@/lib/cms/media-file";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import type { MediaRow } from "@/lib/cms/types";
import { ConfirmButton, Field, inputClass } from "@/components/admin/fields";

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Əməliyyat alınmadı";
}

export function MediaLibrary({ items, loadError }: { items: MediaRow[]; loadError?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(loadError ?? null);

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <form
        action={async (formData) => {
          setError(null);
          try {
            const file = formData.get("file");
            if (file instanceof File) {
              const invalid = validateMediaFile(file);
              if (invalid) {
                setError(invalid);
                return;
              }
            }
            await uploadMedia(formData);
            router.refresh();
          } catch (caught) {
            setError(errorMessage(caught));
          }
        }}
        className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5 sm:flex-row sm:items-end"
      >
        <Field label="Fayl">
          <input type="file" name="file" required accept={MEDIA_ACCEPT} />
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
              {(item.mime ?? "").startsWith("video/") ? (
                <span className="flex h-full items-center justify-center text-xs">video</span>
              ) : mediaPublicUrl(item.path) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaPublicUrl(item.path)} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-charcoal/40">yoxdur</span>
              )}
            </div>
            <p className="truncate text-[11px] text-charcoal/50">{item.path}</p>
            <form
              action={async (formData) => {
                setError(null);
                try {
                  await updateMediaAlt(item.id, String(formData.get("alt") ?? ""));
                  router.refresh();
                } catch (caught) {
                  setError(errorMessage(caught));
                }
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
                setError(null);
                try {
                  await deleteMedia(item.id);
                  router.refresh();
                } catch (caught) {
                  setError(errorMessage(caught));
                }
              }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
