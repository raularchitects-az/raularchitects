export const CONSENT_STORAGE_KEY = "ra-analytics-consent";

/** Fired on the same tab; the native `storage` event only covers other tabs. */
const CONSENT_EVENT = "ra-analytics-consent-change";

export type ConsentValue = "granted" | "denied";

/** `null` means the visitor has not answered the banner yet. */
export type ConsentState = ConsentValue | null;

function readStoredConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private browsing modes can throw on storage access.
    return null;
  }
}

export function subscribeToConsent(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_EVENT, onChange);
  };
}

/** Returns a primitive so `useSyncExternalStore` can compare snapshots safely. */
export function getConsentSnapshot(): ConsentState {
  return readStoredConsent();
}

export function getServerConsentSnapshot(): ConsentState {
  return null;
}

export function storeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Consent simply won't persist; the banner reappears next visit.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
