"use client";

import { useState } from "react";
import { uploadMedia } from "@/lib/cms/actions";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import type { MediaRow } from "@/lib/cms/types";
import { Field, inputClass } from "./fields";

export function MediaPicker({
  label,
  name,
  defaultPath,
  items,
}: {
  label: string;
  name: string;
  defaultPath?: string | null;
  items: MediaRow[];
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const nextPath = defaultPath ?? "";
  const [seenPath, setSeenPath] = useState(nextPath);
  if (nextPath !== seenPath) {
    setSeenPath(nextPath);
    setPath(nextPath);
  }

  async function onUpload(file: File) {
    setError("");
    const data = new FormData();
    data.set("file", file);
    data.set("alt", alt);
    try {
      const result = await uploadMedia(data);
      setPath(result.path);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmədi");
    }
  }

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={path} />
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-24 overflow-hidden border border-charcoal/10 bg-cream-dark">
          {path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPublicUrl(path)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-charcoal/40">yoxdur</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-charcoal/20 px-3 py-2 text-xs uppercase tracking-[0.14em]"
        >
          Seç / yüklə
        </button>
        {path ? (
          <button type="button" onClick={() => setPath("")} className="text-xs text-charcoal/50">
            Sil
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto bg-cream p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Media</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-sm">
                Bağla
              </button>
            </div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                className={inputClass}
                placeholder="Alt text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
              />
            </div>
            {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPath(item.path);
                    setOpen(false);
                  }}
                  className="border border-charcoal/10 p-1 text-left"
                >
                  {item.mime.startsWith("video/") ? (
                    <span className="block aspect-square bg-charcoal/10 text-[10px]">video</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaPublicUrl(item.path)} alt={item.alt_text ?? ""} className="aspect-square w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Field>
  );
}
