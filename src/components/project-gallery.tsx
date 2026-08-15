"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ProjectGalleryImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

function GalleryGrid({
  rows,
  onOpen,
}: {
  rows: ProjectGalleryImage[][];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-4 lg:gap-5">
      {rows.map((row, rowIndex) => {
        const start = rows.slice(0, rowIndex).reduce((sum, item) => sum + item.length, 0);
        return (
          <ul key={row.map((item) => item.src).join("-")} className="grid grid-cols-3 gap-4 lg:gap-5">
            {row.map((image, index) => (
              <li key={image.src}>
                <button
                  type="button"
                  onClick={() => onOpen(start + index)}
                  className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[8px] bg-charcoal/30 shadow-[0_10px_28px_rgba(28,28,30,0.32)]"
                  aria-label={image.alt}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="16vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-charcoal-dark/15" />
                </button>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export function ProjectGallery({
  images,
  rows,
  variant = "page",
}: {
  images: ProjectGalleryImage[];
  rows?: ProjectGalleryImage[][];
  variant?: "hero" | "page";
}) {
  const items = images.filter((image, index, list) => list.findIndex((item) => item.src === image.src) === index).slice(0, 10);
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const showPrev = useCallback(() => {
    setActive((current) => {
      if (current === null || items.length === 0) return current;
      return (current - 1 + items.length) % items.length;
    });
  }, [items.length]);
  const showNext = useCallback(() => {
    setActive((current) => {
      if (current === null || items.length === 0) return current;
      return (current + 1) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (active === null) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, showPrev, showNext]);

  if (items.length === 0) return null;

  const current = active !== null ? items[active] : null;
  const heroRows = rows?.filter((row) => row.length > 0) ?? [items];

  return (
    <>
      {variant === "hero" ? (
        <div className="w-full">
          <GalleryGrid rows={heroRows} onOpen={setActive} />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {items.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[7px] bg-cream-dark"
                aria-label={image.alt}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal-dark/85 p-4 sm:p-8"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-cream/80 transition-colors duration-300 hover:text-cream sm:right-6 sm:top-6"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous"
                className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center text-cream/80 transition-colors duration-300 hover:text-cream sm:left-4"
              >
                <ChevronLeft className="h-7 w-7" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next"
                className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center text-cream/80 transition-colors duration-300 hover:text-cream sm:right-4"
              >
                <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
              </button>
            </>
          ) : null}

          <div
            className="relative h-[min(82vh,100%)] w-[min(92vw,72rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="92vw"
              quality={95}
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
