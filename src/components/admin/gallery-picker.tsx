"use client";

import { useRef, useState } from "react";
import type { MediaRow } from "@/lib/cms/types";
import { MediaBrowser } from "./media-browser";
import { mediaPublicUrl } from "@/lib/cms/media-url";

function uniquePaths(list: string[]) {
  return list.filter((path, index) => list.indexOf(path) === index);
}

function movePath(list: string[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= list.length || to >= list.length || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

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
  const [paths, setPaths] = useState<string[]>(() => uniquePaths(defaultPaths ?? []));
  const [open, setOpen] = useState(false);
  const [dragPath, setDragPath] = useState<string | null>(null);
  const [movedPath, setMovedPath] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pathSig = (defaultPaths ?? []).join("\n");
  const [seenSig, setSeenSig] = useState(pathSig);
  if (pathSig !== seenSig) {
    setSeenSig(pathSig);
    setPaths(uniquePaths(defaultPaths ?? []));
  }

  const movedIndex = movedPath ? paths.indexOf(movedPath) : -1;

  /** Which tile the pointer is currently over, so a drag can cross tiles on any row. */
  function tileIndexAt(clientX: number, clientY: number) {
    const tiles = listRef.current?.querySelectorAll<HTMLElement>("[data-gallery-tile]");
    if (!tiles) return -1;
    return Array.from(tiles).findIndex((tile) => {
      const box = tile.getBoundingClientRect();
      return clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom;
    });
  }

  function reorderTo(path: string, to: number) {
    // A drag emits many pointermove events, so the newest order has to come from
    // the updater argument rather than the render closure.
    setPaths((current) => movePath(current, current.indexOf(path), to));
    setMovedPath(path);
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>, path: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Pointer capture keeps the move/up events on this handle even after the
    // tile is reordered out from under the cursor.
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPath(path);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>, path: string) {
    if (dragPath !== path) return;
    const to = tileIndexAt(event.clientX, event.clientY);
    if (to >= 0) reorderTo(path, to);
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragPath(null);
  }

  function onHandleKey(event: React.KeyboardEvent<HTMLButtonElement>, path: string, index: number) {
    const step =
      event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : 0;
    if (!step) return;
    event.preventDefault();
    reorderTo(path, index + step);
  }

  return (
    <>
      {/*
        Deliberately not the shared `Field`: that renders a <label>, and a label
        forwards clicks to the first labelable descendant — here the first tile's
        button. Clicking the caption would act on image one.
      */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal/50">{label}</span>
        <input type="hidden" name={name} value={paths.join("\n")} />
        <div ref={listRef} className="flex flex-wrap gap-2">
          {paths.map((path, index) => {
            const src = mediaPublicUrl(path);
            const dragging = dragPath === path;
            return (
              <div
                key={path}
                data-gallery-tile
                className={`relative h-16 w-20 overflow-hidden border ${
                  dragging ? "border-bronze-dark opacity-60" : "border-charcoal/10"
                }`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-charcoal/40">yoxdur</span>
                )}
                <button
                  type="button"
                  aria-label={`${index + 1}. şəkli sürüşdürüb sıranı dəyiş (ox düymələri ilə də olur)`}
                  onPointerDown={(event) => startDrag(event, path)}
                  onPointerMove={(event) => moveDrag(event, path)}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(event) => onHandleKey(event, path, index)}
                  className="absolute inset-x-0 bottom-0 flex h-5 cursor-grab touch-none select-none items-center justify-between bg-white/85 px-1 text-[10px] leading-none text-charcoal/60 active:cursor-grabbing"
                >
                  <span aria-hidden>⋮⋮</span>
                  <span aria-hidden className="tabular-nums">
                    {index + 1}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`${index + 1}. şəkli sil`}
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
        {paths.length > 1 ? (
          <span className="text-[11px] text-charcoal/40">
            Sıranı dəyişmək üçün aşağıdakı ⋮⋮ zolağından sürüşdürün. Saxladıqda public qalereya bu sıra ilə görünür.
          </span>
        ) : null}
        <span aria-live="polite" className="sr-only">
          {movedIndex >= 0 ? `Şəkil ${movedIndex + 1} / ${paths.length} mövqeyindədir.` : ""}
        </span>
      </div>
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
