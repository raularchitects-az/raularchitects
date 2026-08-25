import NextImage, { type ImageProps } from "next/image";
import { isCmsMediaUrl } from "@/lib/cms/media-url";

/**
 * Drop-in replacement for `next/image`.
 *
 * CMS uploads are served straight from Supabase storage instead of going
 * through `/_next/image`: the optimizer would re-encode an already-compressed
 * upload (WebP -> AVIF), which visibly degrades quality. Everything else —
 * repo assets, remote sources — keeps the normal optimization path, and every
 * layout prop is passed through untouched.
 */
export function CmsImage({ src, unoptimized, ...props }: ImageProps) {
  const servedFromCms = typeof src === "string" && isCmsMediaUrl(src);
  return <NextImage {...props} src={src} unoptimized={unoptimized ?? servedFromCms} />;
}
