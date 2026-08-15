import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { ProjectLeadForm } from "@/components/project-lead-form";
import { Footer } from "@/components/footer";
import { routing } from "@/i18n/routing";
import { ProjectGallery } from "@/components/project-gallery";
import { projects, getProject, getProjectGalleryGroups } from "@/data/projects";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!getProject(slug)) return {};
  const t = await getTranslations({ locale, namespace: "projectDetail" });
  return { title: `${t(`items.${slug}.title`)} — Raul Architects` };
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/[locale]/layihelar/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("projectDetail");
  const specs = t.raw(`items.${slug}.specs`) as string[];
  const description = t(`items.${slug}.description`);

  const title = t(`items.${slug}.title`);
  const groups = getProjectGalleryGroups(slug);
  const toCards = (sources: string[], label: string) =>
    sources.map((src, index) => ({ src, alt: `${title} ${label} ${index + 1}` }));
  const galleryRows = [
    toCards(groups.exteriorImages, "exterior"),
    toCards(groups.interiorImages, "interior"),
    toCards(groups.planningImages, "planning"),
  ];
  const gallery = galleryRows.flat();

  return (
    <>
      <section className="relative h-[70vh] w-full overflow-hidden sm:h-[92vh]">
        <Image
          src={project.image}
          alt={t(`items.${slug}.title`)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/75 via-charcoal-dark/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 p-6 sm:p-10">
          <Link
            href="/layihelar"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>
        </div>

        <div className="absolute inset-0 z-10 flex">
          <div className="flex w-[40%] items-end p-6 sm:p-10 lg:w-[38%] lg:p-14">
            <h1 className="text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl">
              {t(`items.${slug}.title`)}
            </h1>
          </div>
          <div className="hidden w-[60%] items-center justify-center px-5 py-24 md:flex lg:px-8 lg:py-20 xl:px-12">
            <div className="w-4/5">
              <ProjectGallery images={gallery} rows={galleryRows} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-charcoal/10 bg-cream py-8">
        <Container>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {specs.map((spec) => (
              <li key={spec} className="text-sm font-medium uppercase tracking-[0.12em] text-charcoal/70">
                {spec}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-lg font-light leading-relaxed text-charcoal/70">{description}</p>
        </Container>
      </section>

      <section className="bg-cream py-10 md:hidden">
        <Container>
          <ProjectGallery images={gallery} rows={galleryRows} />
        </Container>
      </section>

      <section className="bg-charcoal py-24 sm:py-32">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center gap-8 text-center">
            <h2 className="text-3xl font-semibold text-cream sm:text-4xl">{t("adaptTitle")}</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#apply"
                className="group inline-flex items-center justify-center gap-2 border border-bronze-light bg-bronze-dark px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:bg-bronze-light hover:text-charcoal"
              >
                {t("applyCta")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/491578970708"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 border border-cream/25 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-bronze-light hover:text-bronze-light"
              >
                {t("whatsappCta")}
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div id="apply" className="mt-16 scroll-mt-28">
            <ProjectLeadForm />
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}
