import { getSupabaseUrl } from "./env";

export function mediaPublicUrl(path: string | null | undefined) {
  if (!path) return "";
  const value = path.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/images/") || value.startsWith("/videos/")) return value;
  const base = getSupabaseUrl();
  if (!base) return "";
  return `${base}/storage/v1/object/public/media/${value.replace(/^\/+/, "")}`;
}
