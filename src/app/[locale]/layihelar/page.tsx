import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectsCatalog } from "@/components/projects-catalog";
import { Footer } from "@/components/footer";

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

  return (
    <>
      <ProjectsCatalog />
      <Footer />
    </>
  );
}
