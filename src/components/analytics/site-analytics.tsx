"use client";

import { useSyncExternalStore } from "react";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeToConsent,
} from "@/lib/analytics-consent";
import { CookieConsentBanner } from "./cookie-consent-banner";
import { GoogleAnalytics } from "./google-analytics";

/**
 * Mounted from the `[locale]` layout, so it never runs on `/admin`. Nothing is
 * rendered when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is absent — there is no
 * analytics to ask consent for, and the site behaves exactly as before.
 */
export function SiteAnalytics() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {consent === "granted" ? <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} /> : null}
      {consent === null ? <CookieConsentBanner /> : null}
    </>
  );
}
