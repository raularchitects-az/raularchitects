import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { services } from "@/data/services";
import { blogPosts } from "@/data/blog";
import { absoluteUrl } from "@/lib/site";
import {
  getPublicBlogPosts,
  getPublicInsights,
  getPublicPortfolio,
  getPublicProjects,
  getPublicServices,
} from "@/lib/cms/public";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";
import { blogLanguageAlternates, blogPostPath, isBlogLocaleLive } from "@/lib/blog-urls";
import { insightLanguageAlternates, insightPostPath, isInsightLocaleLive } from "@/lib/insights-urls";

function localizedEntry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl("az", path),
  };
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
  }

  const editorial = path.startsWith("/bloq") || path.startsWith("/insights") || path.startsWith("/portfolio");

  return {
    url: absoluteUrl("az", path),
    lastModified,
    changeFrequency: editorial ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/bloq" || path === "/insights" || path === "/portfolio"
          ? 0.8
          : 0.7,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const insightsActive = await isInsightsRestructureActive();

  const [cmsProjects, cmsPortfolio, cmsInsights, cmsBlog, cmsServices] = await Promise.all([
    getPublicProjects("en"),
    insightsActive ? Promise.resolve([]) : getPublicPortfolio("en"),
    insightsActive ? getPublicInsights() : Promise.resolve([]),
    getPublicBlogPosts(),
    getPublicServices("en"),
  ]);

  const projectList = cmsProjects;
  const portfolioList = cmsPortfolio;
  const insightList = cmsInsights;
  const blogList = cmsBlog.length ? cmsBlog : blogPosts;
  const serviceList = cmsServices.length ? cmsServices : services;

  const staticPaths = [
    "/",
    "/xidmetler",
    "/layihelar",
    ...(insightsActive ? ["/insights"] : ["/portfolio"]),
    "/haqqimizda",
    "/haqqimizda/raul-nagiyev",
    "/elaqe",
    "/bloq",
  ];

  return [
    ...staticPaths.map((path) => localizedEntry(path)),
    ...serviceList.map((service) => localizedEntry(`/xidmetler/${service.slug}`)),
    ...projectList.map((project) => localizedEntry(`/layihelar/${project.slug}`)),
    ...(insightsActive
      ? insightList.flatMap((post) =>
          routing.locales
            .filter((locale) => isInsightLocaleLive(post, locale))
            .map((locale) => {
              const path = insightPostPath(post, locale);
              return {
                url: absoluteUrl(locale, path),
                lastModified: post.publishedAt,
                changeFrequency: "weekly" as const,
                priority: 0.7,
                alternates: { languages: insightLanguageAlternates(post) },
              };
            }),
        )
      : portfolioList.map((item) => localizedEntry(`/portfolio/${item.slug}`))),
    ...blogList.flatMap((post) =>
      routing.locales
        .filter((locale) => isBlogLocaleLive(post, locale))
        .map((locale) => {
          const path = blogPostPath(post, locale);
          return {
            url: absoluteUrl(locale, path),
            lastModified: "publishedAt" in post ? post.publishedAt : undefined,
            changeFrequency: "weekly" as const,
            priority: 0.7,
            alternates: { languages: blogLanguageAlternates(post) },
          };
        }),
    ),
  ];
}
