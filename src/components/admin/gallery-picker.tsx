"use client";

import { useState } from "react";
import type { MediaRow } from "@/lib/cms/types";
import { Field } from "./fields";
import { MediaBrowser } from "./media-browser";
import { mediaPublicUrl } from "@/lib/cms/media-url";

export function GalleryPicker({
  label,
  name,
  defaultPaths,
  items,
  loadError,
}: {
  label: string;
  name: string;
  defaultPaths?: string[];
  items: MediaRow[];
  loadError?: string | null;
}) {
  const [paths, setPaths] = useState<string[]>(defaultPaths ?? []);
  const [open, setOpen] = useState(false);
  const pathSig = (defaultPaths ?? []).join("\n");
  const [seenSig, setSeenSig] = useState(pathSig);
  if (pathSig !== seenSig) {
    setSeenSig(pathSig);
    setPaths(defaultPaths ?? []);
  }

  return (
    <>
      <Field label={label}>
        <input type="hidden" name={name} value={paths.join("\n")} />
        <div className="flex flex-wrap gap-2">
          {paths.map((path) => {
            const src = mediaPublicUrl(path);
            return (
              <div key={path} className="relative h-16 w-20 overflow-hidden border border-charcoal/10">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-charcoal/40">yoxdur</span>
                )}
                <button
                  type="button"
                  className="absolute right-0 top-0 bg-white/80 px-1 text-[10px]"
                  onClick={() => setPaths((current) => current.filter((item) => item !== path))}
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-16 border border-charcoal/20 px-3 text-xs uppercase tracking-[0.14em]"
          >
            Əlavə et
          </button>
        </div>
      </Field>
      {open ? (
        <MediaBrowser
          title="Qalereya"
          items={items}
          loadError={loadError}
          closeOnSelect={false}
          onClose={() => setOpen(false)}
          onSelect={(item) => {
            setPaths((current) => (current.includes(item.path) ? current : [...current, item.path]));
          }}
        />
      ) : null}
    </>
  );
}
