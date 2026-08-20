import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsCatalog } from "@/components/projects-catalog";
import { SiteFooter } from "@/components/site-footer";
import { asLocale } from "@/i18n/routing";
import { entryMetadata } from "@/lib/cms/metadata";
import { getPublicProjects } from "@/lib/cms/public";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = asLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return entryMetadata({
    locale,
    path: "/layihelar",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/layihelar">) {
  const locale = asLocale((await params).locale);
  setRequestLocale(locale);
  const items = await getPublicProjects(locale);

  return (
    <>
      <Suspense fallback={null}>
        <ProjectsCatalog items={items} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
