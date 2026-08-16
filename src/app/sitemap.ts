import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { portfolioItems } from "@/data/portfolio";
import { blogPosts } from "@/data/blog";
import { absoluteUrl } from "@/lib/site";

function localizedEntry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(routing.defaultLocale, path),
  };
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
  }

  return {
    url: absoluteUrl(routing.defaultLocale, path),
    lastModified,
    changeFrequency: path.startsWith("/bloq") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/bloq" ? 0.8 : 0.7,
    alternates: { languages },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/xidmetler",
    "/layihelar",
    "/portfolio",
    "/haqqimizda",
    "/haqqimizda/raul-nagiyev",
    "/elaqe",
    "/bloq",
  ];

  return [
    ...staticPaths.map((path) => localizedEntry(path)),
    ...services.map((service) => localizedEntry(`/xidmetler/${service.slug}`)),
    ...projects.map((project) => localizedEntry(`/layihelar/${project.slug}`)),
    ...portfolioItems.map((item) => localizedEntry(`/portfolio/${item.slug}`)),
    ...blogPosts.map((post) => localizedEntry(`/bloq/${post.slug}`, post.publishedAt)),
  ];
}
