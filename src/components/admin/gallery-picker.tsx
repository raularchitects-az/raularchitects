"use client";

import { useEffect, useState } from "react";
import { uploadMedia } from "@/lib/cms/actions";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import type { MediaRow } from "@/lib/cms/types";
import { Field, inputClass } from "./fields";

export function GalleryPicker({
  label,
  name,
  defaultPaths,
  items,
}: {
  label: string;
  name: string;
  defaultPaths?: string[];
  items: MediaRow[];
}) {
  const [paths, setPaths] = useState<string[]>(defaultPaths ?? []);
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPaths(defaultPaths ?? []);
  }, [defaultPaths]);

  async function onUpload(file: File) {
    setError("");
    const data = new FormData();
    data.set("file", file);
    data.set("alt", alt);
    try {
      const result = await uploadMedia(data);
      setPaths((current) => [...current, result.path]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmədi");
    }
  }

  return (
    <Field label={label}>
      <input type="hidden" name={name} value={paths.join("\n")} />
      <div className="flex flex-wrap gap-2">
        {paths.map((path) => (
          <div key={path} className="relative h-16 w-20 overflow-hidden border border-charcoal/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaPublicUrl(path)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-0 top-0 bg-white/80 px-1 text-[10px]"
              onClick={() => setPaths((current) => current.filter((item) => item !== path))}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-16 border border-charcoal/20 px-3 text-xs uppercase tracking-[0.14em]"
        >
          Əlavə et
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto bg-cream p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Qalereya</h3>
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
                    setPaths((current) => (current.includes(item.path) ? current : [...current, item.path]));
                  }}
                  className="border border-charcoal/10 p-1"
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
