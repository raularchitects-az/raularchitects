import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsCatalog } from "@/components/projects-catalog";
import { SiteFooter } from "@/components/site-footer";
import { getPublicProjects } from "@/lib/cms/public";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return { title: `${t("title")} — Raul Architects` };
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/layihelar">) {
  const { locale } = await params;
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
