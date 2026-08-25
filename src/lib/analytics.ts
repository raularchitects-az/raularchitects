declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Read as a literal member expression so Next can inline the value into the
 * client bundle. An empty string means analytics stays switched off.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export function isAnalyticsConfigured() {
  return GA_MEASUREMENT_ID.length > 0;
}

/** No-op until the visitor has consented and gtag.js has loaded. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

export function trackPageView(pagePath: string) {
  trackEvent("page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}
