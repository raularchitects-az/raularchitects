"use client";

import { useState } from "react";
import type { MediaRow } from "@/lib/cms/types";
import { Field } from "./fields";
import { MediaBrowser } from "./media-browser";
import { mediaPublicUrl } from "@/lib/cms/media-url";

export function MediaPicker({
  label,
  name,
  defaultPath,
  items,
  loadError,
}: {
  label: string;
  name: string;
  defaultPath?: string | null;
  items: MediaRow[];
  loadError?: string | null;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [open, setOpen] = useState(false);
  const nextPath = defaultPath ?? "";
  const [seenPath, setSeenPath] = useState(nextPath);
  if (nextPath !== seenPath) {
    setSeenPath(nextPath);
    setPath(nextPath);
  }
  const preview = mediaPublicUrl(path);

  return (
    <>
      <Field label={label}>
        <input type="hidden" name={name} value={path} />
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden border border-charcoal/10 bg-cream-dark">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
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
      </Field>
      {open ? (
        <MediaBrowser
          title="Media"
          items={items}
          loadError={loadError}
          onClose={() => setOpen(false)}
          onSelect={(item) => setPath(item.path)}
        />
      ) : null}
    </>
  );
}
