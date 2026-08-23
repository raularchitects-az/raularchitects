import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toIntlHref } from "@/lib/public-paths";
import { toDisplayUpperCase } from "@/lib/locale-text";
import type { ProjectMeta } from "@/data/projects";

export function HomeProjectCard({
  project,
  index,
  locale,
  categoryLabel,
  viewProjectLabel,
  title,
}: {
  project: ProjectMeta & { title?: string };
  index: number;
  locale: string;
  categoryLabel: string;
  viewProjectLabel: string;
  title: string;
}) {
  const upper = (text: string) => toDisplayUpperCase(text, locale);

  return (
    <Link
      href={toIntlHref(`/layihelar/${project.slug}`)}
      className="group flex flex-col gap-5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
        <Image
          src={project.image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={project.objectPosition ? { objectPosition: project.objectPosition } : undefined}
          priority={index < 3}
        />
        <span className="absolute left-4 top-4 border border-cream/30 bg-charcoal/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-bronze-dark">
          {upper(categoryLabel)}
        </span>
        <h3 className="text-2xl font-semibold text-charcoal transition-colors duration-300 group-hover:text-bronze-dark">
          {title}
        </h3>
        <span className="mt-1 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/60 transition-colors duration-300 group-hover:text-bronze-dark">
          {upper(viewProjectLabel)}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
