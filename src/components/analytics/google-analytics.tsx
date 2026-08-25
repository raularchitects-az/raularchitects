"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

function pageKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * `gtag('config', ...)` already sends the page_view for the page that was open
 * when the script loaded, so this only reports later client-side navigations.
 * Comparing against the last reported key also keeps Strict Mode's double
 * effect invocation from producing a second hit.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentKey = pageKey(pathname, searchParams.toString());
  const reportedKey = useRef<string | null>(null);

  if (reportedKey.current === null) {
    reportedKey.current = currentKey;
  }

  useEffect(() => {
    if (reportedKey.current === currentKey) return;
    reportedKey.current = currentKey;
    trackPageView(currentKey);
  }, [currentKey]);

  return null;
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
