import { getSupabaseUrl } from "./env";

export function mediaPublicUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = getSupabaseUrl();
  if (!base) return path;
  return `${base}/storage/v1/object/public/media/${path}`;
}
