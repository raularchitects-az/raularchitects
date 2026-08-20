"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { uploadMedia } from "@/lib/cms/actions";
import { MEDIA_ACCEPT, validateMediaFile } from "@/lib/cms/media-file";
import { mediaPublicUrl } from "@/lib/cms/media-url";
import type { MediaRow } from "@/lib/cms/types";
import { inputClass } from "./fields";

function isVideoMime(mime: string | null | undefined) {
  return (mime ?? "").startsWith("video/");
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Yüklənmədi";
}

export function MediaBrowser({
  title,
  items,
  loadError,
  closeOnSelect = true,
  onClose,
  onSelect,
}: {
  title: string;
  items: MediaRow[];
  loadError?: string | null;
  closeOnSelect?: boolean;
  onClose: () => void;
  onSelect: (item: MediaRow) => void;
}) {
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const itemsKey = items.map((item) => item.id).join("\n");
  const [seenKey, setSeenKey] = useState(itemsKey);
  if (itemsKey !== seenKey) {
    setSeenKey(itemsKey);
    setLocalItems(items);
  }
  const displayError = error || loadError || "";

  async function onUpload(file: File) {
    const invalid = validateMediaFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    setBusy(true);
    const data = new FormData();
    data.set("file", file);
    data.set("alt", alt);
    try {
      const result = await uploadMedia(data);
      const row: MediaRow = {
        id: result.id,
        path: result.path,
        bucket: "media",
        mime: result.mime,
        size_bytes: file.size,
        alt_text: alt || null,
        width: null,
        height: null,
        created_at: new Date().toISOString(),
      };
      setLocalItems((current) => [row, ...current.filter((item) => item.id !== row.id)]);
      onSelect(row);
      if (closeOnSelect) onClose();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-browser-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto bg-cream p-6" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 id="media-browser-title" className="text-lg font-semibold">
            {title}
          </h3>
          <button type="button" onClick={onClose} className="text-sm">
            Bağla
          </button>
        </div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input className={inputClass} placeholder="Alt text" value={alt} onChange={(event) => setAlt(event.target.value)} />
          <input
            type="file"
            form=""
            disabled={busy}
            accept={MEDIA_ACCEPT}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onUpload(file);
            }}
          />
        </div>
        {busy ? <p className="mb-3 text-sm text-charcoal/60">Yüklənir…</p> : null}
        {displayError ? (
          <p className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {displayError}
          </p>
        ) : null}
        {localItems.length === 0 && !displayError ? <p className="mb-3 text-sm text-charcoal/50">Media yoxdur.</p> : null}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {localItems.map((item) => {
            const src = mediaPublicUrl(item.path);
            return (
              <button
                key={item.id || item.path}
                type="button"
                disabled={!item.path}
                onClick={() => {
                  if (!item.path) return;
                  onSelect(item);
                  if (closeOnSelect) onClose();
                }}
                className="border border-charcoal/10 p-1 text-left"
              >
                {isVideoMime(item.mime) ? (
                  <span className="block aspect-square bg-charcoal/10 text-[10px]">video</span>
                ) : src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={item.alt_text ?? ""} className="aspect-square w-full object-cover" />
                ) : (
                  <span className="block aspect-square bg-charcoal/10 text-[10px]">yoxdur</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
