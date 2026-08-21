import { getBlogLocaleSlug, isBlogLocaleLive } from "@/lib/blog-urls";
import { getInsightLocaleSlug, isInsightLocaleLive } from "@/lib/insights-urls";
import { isCmsConfigured } from "./env";
import { findRedirect, getPublished, getSettings } from "./queries";
import { getPublicBlogPost, getPublicInsight } from "./public-lists";
import type { BlogPost } from "@/data/blog";
import type { InsightPost } from "@/data/insights/types";

export { cmsBlogToPost, cmsInsightToPost, cmsPortfolioToMeta, cmsProjectToMeta } from "./public-mappers";
export {
  getHomeBlogPosts,
  getHomeInsights,
  getPublicBlogPost,
  getPublicBlogPosts,
  getPublicInsight,
  getPublicInsights,
  getPublicPortfolio,
  getPublicPortfolioItem,
  getPublicProject,
  getPublicProjects,
  getPublicService,
  getPublicServices,
  takeLatestPublic,
} from "./public-lists";

/** True when CMS env is configured. Public listings still merge with unmigrated legacy items. */
export function isPublicCmsLive() {
  return isCmsConfigured();
}

export async function getSiteSettings() {
  const [hero, contact, about, footer, home] = await Promise.all([
    getSettings("hero"),
    getSettings("contact"),
    getSettings("about"),
    getSettings("footer"),
    getSettings("home"),
  ]);
  return { hero, contact, about, footer, home };
}

export async function getPublicContact() {
  const contact = (await getSettings("contact")) ?? {};
  const region = (key: string) => (contact[key] as { phone?: string; address?: string } | undefined) ?? {};
  return {
    email: typeof contact.email === "string" ? contact.email : "",
    whatsapp: typeof contact.whatsapp === "string" ? contact.whatsapp : "",
    azerbaijan: region("azerbaijan"),
    germany: region("germany"),
    switzerland: region("switzerland"),
  };
}

export async function resolveSlugRedirect(
  kind: "layihelar" | "portfolio" | "bloq" | "xidmetler" | "insights",
  slug: string,
) {
  return findRedirect(`/${kind}/${slug}`);
}

export async function resolvePublicBlog(locale: string, slug: string) {
  const redirected = await resolveSlugRedirect("bloq", slug);
  const viaRedirect = redirected?.to_path.replace(/^\/bloq\//, "") ?? "";
  const post =
    (await getPublicBlogPost(slug)) ??
    (viaRedirect ? await getPublicBlogPost(viaRedirect) : null);
  if (!post) return { post: null as BlogPost | null, live: false, redirectTo: null as string | null };

  const live = isBlogLocaleLive(post, locale);
  const canonicalSlug = getBlogLocaleSlug(post, locale);
  if (live && canonicalSlug && canonicalSlug !== slug) {
    return { post, live, redirectTo: `/bloq/${canonicalSlug}` };
  }
  return { post, live, redirectTo: null as string | null };
}

export async function resolvePublicInsight(locale: string, slug: string) {
  const redirected = await resolveSlugRedirect("insights", slug);
  const viaRedirect = redirected?.to_path.replace(/^\/insights\//, "") ?? "";
  const post =
    (await getPublicInsight(slug)) ??
    (viaRedirect ? await getPublicInsight(viaRedirect) : null);
  if (!post) return { post: null as InsightPost | null, live: false, redirectTo: null as string | null };

  const live = isInsightLocaleLive(post, locale);
  const canonicalSlug = getInsightLocaleSlug(post, locale);
  if (live && canonicalSlug && canonicalSlug !== slug) {
    return { post, live, redirectTo: `/insights/${canonicalSlug}` };
  }
  return { post, live, redirectTo: null as string | null };
}

export { getPublished };
