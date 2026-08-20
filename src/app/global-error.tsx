"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const recover = retry ?? reset ?? (() => window.location.reload());

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-cream font-sans text-charcoal">
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 sm:py-32">
          <div className="flex max-w-xl flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-bronze-dark">Raul Architects</span>
            <h1 className="text-4xl font-semibold leading-[1.1] text-charcoal sm:text-5xl">This page could not load</h1>
            <p className="text-base font-light leading-relaxed text-charcoal/70 sm:text-lg">
              We could not show this page right now. Return home and try again.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/en"
                className="inline-flex items-center justify-center border border-charcoal bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={recover}
                className="inline-flex items-center justify-center border border-charcoal/20 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-charcoal"
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
