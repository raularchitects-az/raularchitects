export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm";
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
export const ALLOWED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif", "mp4", "webm"] as const;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);

export function mediaExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
}

export function validateMediaFile(file: { name: string; type: string; size: number }): string | null {
  const ext = mediaExtension(file.name);
  if (!ALLOWED_MEDIA_EXTENSIONS.includes(ext as (typeof ALLOWED_MEDIA_EXTENSIONS)[number])) {
    return "Dəstəklənməyən format";
  }
  if (file.size <= 0) return "Fayl boşdur";

  const type = file.type || (IMAGE_EXTENSIONS.has(ext) ? "image/" : "video/");
  const isImage = type.startsWith("image/");
  const isVideo = type.startsWith("video/");
  if (!isImage && !isVideo) return "Yalnız şəkil və ya video";
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return "Şəkil 3 MB-dan böyük ola bilməz. Zəhmət olmasa faylı kiçildin və yenidən yükləyin.";
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) return "Video 80MB-dan böyük ola bilməz";
  return null;
}
