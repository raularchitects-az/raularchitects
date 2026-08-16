function readPublicEnv(name: string) {
  return (process.env[name] ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

/** Project origin only. Paths like /auth/v1 make GoTrue request /auth/v1/auth/v1/token. */
export function normalizeSupabaseUrl(raw: string) {
  const value = raw.trim().replace(/^["']+|["']+$/g, "").trim();
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

export function isSupabaseProjectUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return hostname.endsWith(".supabase.co") || hostname.endsWith(".supabase.net");
  } catch {
    return false;
  }
}

export function isCmsConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseUrl() {
  return normalizeSupabaseUrl(readPublicEnv("NEXT_PUBLIC_SUPABASE_URL"));
}

/** Legacy JWT `eyJ...` or current `sb_publishable_...`. Never a secret key. */
export function getSupabaseAnonKey() {
  return readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function isSecretSupabaseKey(key: string) {
  return key.startsWith("sb_secret_");
}

export function isPublicSupabaseKey(key: string) {
  if (!key || isSecretSupabaseKey(key)) return false;
  return key.startsWith("sb_publishable_") || key.startsWith("eyJ");
}
