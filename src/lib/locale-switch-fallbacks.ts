import type { LocaleSwitchPaths } from "@/components/locale-switch-context";

/** Safe listing fallbacks when a dynamic pathname has no resolved params. */
export const DYNAMIC_ROUTE_LISTING_FALLBACKS: Partial<Record<string, NonNullable<LocaleSwitchPaths[keyof LocaleSwitchPaths]>>> = {
  "/layihelar/[slug]": "/layihelar",
  "/portfolio/[slug]": "/portfolio",
  "/insights/[slug]": "/insights",
  "/bloq/[slug]": "/bloq",
  "/xidmetler/[slug]": "/xidmetler",
};
