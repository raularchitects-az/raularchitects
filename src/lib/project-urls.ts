import { routing, type Locale } from "@/i18n/routing";
import type { LocaleSwitchPaths } from "@/components/locale-switch-context";
import { getPublicProject } from "@/lib/cms/public";

export type ProjectLocaleSwitchHref =
  | "/layihelar"
  | { pathname: "/layihelar/[slug]"; params: { slug: string } };

/** Build per-locale switch targets for a project detail page. */
export async function buildProjectLocaleSwitchPaths(slug: string): Promise<LocaleSwitchPaths> {
  const entries = await Promise.all(
    routing.locales.map(async (locale) => {
      const project = await getPublicProject(slug, locale);
      const href: ProjectLocaleSwitchHref | null = project
        ? { pathname: "/layihelar/[slug]", params: { slug } }
        : "/layihelar";
      return [locale, href] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, ProjectLocaleSwitchHref>;
}

export const PROJECT_DETAIL_PATHNAME = "/layihelar/[slug]" as const;
