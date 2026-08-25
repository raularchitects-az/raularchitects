import { CmsImage as Image } from "@/components/ui/cms-image";
import { Link } from "@/i18n/navigation";
import { formatBlogDate, type BlogPost, getBlogCopy, getBlogImageAlt } from "@/data/blog";
import { getBlogLocaleSlug } from "@/lib/blog-urls";
import { toIntlHref } from "@/lib/public-paths";
import { toDisplayUpperCase } from "@/lib/locale-text";

export function BlogCard({
  post,
  locale,
  categoryLabel,
  readLabel,
}: {
  post: BlogPost;
  locale: string;
  categoryLabel: string;
  readLabel: string;
}) {
  const copy = getBlogCopy(post, locale);
  if (!copy) return null;
  return (
    <Link
      href={toIntlHref(`/bloq/${getBlogLocaleSlug(post, locale) || post.slug}`)}
      className="group flex flex-col border-t border-charcoal/10 pt-6 transition-colors duration-300"
    >
      <span className="relative mb-5 block aspect-[16/10] overflow-hidden bg-cream-dark">
        <Image
          src={post.image}
          alt={getBlogImageAlt(post, locale)}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </span>
      <span className="text-xs font-medium tracking-[0.22em] text-bronze-dark">
        {toDisplayUpperCase(categoryLabel, locale)}
      </span>
      <h3 className="mt-3 text-xl font-semibold leading-snug text-charcoal transition-colors duration-300 group-hover:text-bronze-dark sm:text-[1.35rem]">
        {copy.title}
      </h3>
      <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-charcoal/70">
        {copy.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <time dateTime={post.publishedAt} className="text-xs text-charcoal/45">
          {formatBlogDate(post.publishedAt, locale)}
        </time>
        <span className="text-xs font-medium tracking-[0.18em] text-bronze-dark transition-transform duration-300 group-hover:translate-x-0.5">
          {toDisplayUpperCase(readLabel, locale)} →
        </span>
      </div>
    </Link>
  );
}
