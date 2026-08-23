import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  formatInsightDate,
  type InsightPost,
  getInsightCopy,
  getInsightImageAlt,
} from "@/data/insights/types";
import { getInsightLocaleSlug } from "@/lib/insights-urls";
import { toIntlHref } from "@/lib/public-paths";
import { toDisplayUpperCase } from "@/lib/locale-text";

export function InsightsCard({
  post,
  locale,
  categoryLabel,
  readLabel,
  showExcerpt = true,
  variant = "light",
}: {
  post: InsightPost;
  locale: string;
  categoryLabel: string;
  readLabel: string;
  showExcerpt?: boolean;
  variant?: "light" | "onDark";
}) {
  const copy = getInsightCopy(post, locale);
  if (!copy) return null;
  const onDark = variant === "onDark";
  return (
    <Link
      href={toIntlHref(`/insights/${getInsightLocaleSlug(post, locale) || post.slug}`)}
      className={`group flex flex-col border-t pt-6 transition-colors duration-300 ${
        onDark ? "border-cream/20" : "border-charcoal/10"
      }`}
    >
      <span className="relative mb-5 block aspect-[16/10] overflow-hidden bg-cream-dark">
        <Image
          src={post.image}
          alt={getInsightImageAlt(post, locale)}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </span>
      <span
        className={`text-xs font-medium tracking-[0.22em] transition-colors duration-300 ${
          onDark
            ? "text-cream/85 group-hover:text-charcoal/70"
            : "text-bronze-dark"
        }`}
      >
        {toDisplayUpperCase(categoryLabel, locale)}
      </span>
      <h3
        className={`mt-3 text-xl font-semibold leading-snug transition-colors duration-300 sm:text-[1.35rem] ${
          onDark
            ? "text-cream group-hover:text-charcoal"
            : "text-charcoal group-hover:text-bronze-dark"
        }`}
      >
        {copy.title}
      </h3>
      {showExcerpt ? (
        <p
          className={`mt-3 flex-1 text-sm font-light leading-relaxed transition-colors duration-300 ${
            onDark
              ? "text-cream/75 group-hover:text-charcoal/70"
              : "text-charcoal/70"
          }`}
        >
          {copy.excerpt}
        </p>
      ) : null}
      <div className={`flex items-center justify-between gap-4 ${showExcerpt ? "mt-6" : "mt-4"}`}>
        <time
          dateTime={post.publishedAt}
          className={`text-xs transition-colors duration-300 ${
            onDark ? "text-cream/70 group-hover:text-charcoal/60" : "text-charcoal/45"
          }`}
        >
          {formatInsightDate(post.publishedAt, locale)}
        </time>
        <span
          className={`text-xs font-medium tracking-[0.18em] transition-all duration-300 group-hover:translate-x-0.5 ${
            onDark ? "text-cream group-hover:text-charcoal" : "text-bronze-dark"
          }`}
        >
          {toDisplayUpperCase(readLabel, locale)} →
        </span>
      </div>
    </Link>
  );
}
