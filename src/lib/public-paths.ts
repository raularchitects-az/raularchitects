import { locales, pathnames, type Locale } from "@/i18n/routing";

type Pathnames = typeof pathnames;
type PathnameKey = keyof Pathnames;

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function splitPath(path: string) {
  const [pathname, ...rest] = path.split("?");
  const query = rest.length ? rest.join("?") : "";
  const normalized = pathname.startsWith("/") ? pathname.replace(/\/+$/, "") || "/" : `/${pathname.replace(/\/+$/, "")}`;
  return { pathname: normalized, query };
}

function templateToRegex(template: string) {
  const names: string[] = [];
  const source = template.replace(/\[([^\]]+)\]/g, (_, name: string) => {
    names.push(name);
    return "([^/]+)";
  });
  return { regex: new RegExp(`^${source}$`), names };
}

function applyCaptures(template: string, names: string[], values: string[]) {
  let result = template;
  names.forEach((name, index) => {
    result = result.replace(`[${name}]`, values[index] ?? "");
  });
  return result;
}

function localizedTemplate(key: PathnameKey, locale: Locale) {
  const value = pathnames[key];
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? key;
}

const pathnameKeys = (Object.keys(pathnames) as PathnameKey[]).sort((a, b) => b.length - a.length);

export function mapInternalPathname(locale: string, pathname: string) {
  const code: Locale = isLocale(locale) ? locale : "en";
  const { pathname: normalized } = splitPath(pathname);
  for (const key of pathnameKeys) {
    const { regex, names } = templateToRegex(key);
    const match = normalized.match(regex);
    if (!match) continue;
    return applyCaptures(localizedTemplate(key, code), names, match.slice(1));
  }
  return normalized;
}

export function localizePublicPath(locale: string, path: string) {
  const { pathname, query } = splitPath(path);
  const mapped = mapInternalPathname(locale, pathname);
  const prefixed = mapped === "/" ? `/${locale}` : `/${locale}${mapped}`;
  return query ? `${prefixed}?${query}` : prefixed;
}

/** Convert an internal public path into a next-intl Link/router href. */
export function toIntlHref<T>(path: string): T {
  const { pathname, query } = splitPath(path);
  const search = query ? Object.fromEntries(new URLSearchParams(query)) : undefined;
  for (const key of pathnameKeys) {
    const { regex, names } = templateToRegex(key);
    const match = pathname.match(regex);
    if (!match) continue;
    const params = Object.fromEntries(names.map((name, index) => [name, match[index + 1] ?? ""]));
    if (names.length && search) return { pathname: key, params, query: search } as T;
    if (names.length) return { pathname: key, params } as T;
    if (search) return { pathname: key, query: search } as T;
    return key as T;
  }
  return (path.startsWith("/") ? path : `/${path}`) as T;
}

/** If `/en/<legacy>` should 308 to a clean English URL, return that pathname (no origin). */
export function englishLegacyPathname(pathname: string) {
  const { pathname: normalized } = splitPath(pathname);
  if (!normalized.startsWith("/en/") && normalized !== "/en") return null;
  const rest = normalized === "/en" ? "/" : normalized.slice(3);
  for (const key of pathnameKeys) {
    const { regex, names } = templateToRegex(key);
    const match = rest.match(regex);
    if (!match) continue;
    const english = localizedTemplate(key, "en");
    if (english === key) return null;
    const mapped = applyCaptures(english, names, match.slice(1));
    return mapped === "/" ? "/en" : `/en${mapped}`;
  }
  return null;
}
