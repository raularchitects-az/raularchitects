"use client";

import { useEffect, useState, type ComponentProps } from "react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export type LocaleSwitchHref = ComponentProps<typeof Link>["href"];
export type LocaleSwitchPaths = Partial<Record<Locale, LocaleSwitchHref | null>>;

let currentPaths: LocaleSwitchPaths | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setLocaleSwitchPaths(paths: LocaleSwitchPaths | null) {
  currentPaths = paths;
  emit();
}

export function useLocaleSwitchPaths() {
  const [paths, setPaths] = useState<LocaleSwitchPaths | null>(currentPaths);

  useEffect(() => {
    const listener = () => setPaths(currentPaths);
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return paths;
}

export function BlogLocaleSwitch({ paths }: { paths: LocaleSwitchPaths }) {
  useEffect(() => {
    setLocaleSwitchPaths(paths);
    return () => setLocaleSwitchPaths(null);
  }, [paths]);
  return null;
}
