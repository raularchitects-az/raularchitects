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
import { projects, galleryImages, getProject } from "@/data/projects";

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

  const sequence = [
    { key: "exterior", src: project.image },
    { key: "interior", src: galleryImages.interior },
    { key: "plan", src: galleryImages.plan },
    { key: "bim", src: galleryImages.bim },
  ] as const;

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

        <div className="absolute inset-x-0 top-0 p-6 sm:p-10">
          <Link
            href="/layihelar"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 transition-colors duration-300 hover:text-bronze-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("backLabel")}
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <h1 className="text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl">
            {t(`items.${slug}.title`)}
          </h1>
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

      <section className="flex flex-col">
        {sequence.map((item) => (
          <div key={item.key} className="relative h-[60vh] w-full overflow-hidden sm:h-[80vh]">
            <Image
              src={item.src}
              alt={t(`sequenceLabels.${item.key}`)}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <span className="absolute left-6 top-6 border border-cream/25 bg-charcoal/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cream backdrop-blur-sm sm:left-10 sm:top-10">
              {t(`sequenceLabels.${item.key}`)}
            </span>
          </div>
        ))}
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
