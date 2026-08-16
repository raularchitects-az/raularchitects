function readPublicEnv(name: string) {
  return (process.env[name] ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

export function isCmsConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseUrl() {
  return readPublicEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
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

export { mediaPublicUrl } from "./media-url";
