import { notFound } from "next/navigation";
import { cmsBlogToPost } from "@/lib/cms/public";
import { getEntity } from "@/lib/cms/queries";
import { getBlogCopy, getBlogImageAlt, formatBlogDate } from "@/data/blog";
import { BlogBody } from "@/lib/blog-body";

export default async function BlogPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  const { id } = await params;
  const { locale: localeParam } = await searchParams;
  const locale = localeParam === "en" || localeParam === "de" || localeParam === "ru" || localeParam === "az" ? localeParam : "az";
  const row = await getEntity("blog_posts", id);
  if (!row) notFound();
  const post = cmsBlogToPost(row);
  const copy = getBlogCopy(post, locale);

  return (
    <article className="mx-auto max-w-3xl bg-white p-6 sm:p-10">
      <p className="text-xs uppercase tracking-[0.18em] text-charcoal/40">
        Preview · {row.status} · {row.is_active ? "aktiv" : "deaktiv"}
      </p>
      <div className="mt-4 flex gap-3 text-xs uppercase tracking-[0.14em]">
        {["az", "en", "de", "ru"].map((code) => (
          <a key={code} href={`/admin/preview/blog/${id}?locale=${code}`} className={code === locale ? "font-semibold" : ""}>
            {code}
          </a>
        ))}
      </div>
      <h1 className="mt-6 text-3xl font-semibold">{copy?.title || "Tərcümə yoxdur"}</h1>
      <p className="mt-2 text-sm text-charcoal/50">{formatBlogDate(post.publishedAt, locale)}</p>
      {post.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt={getBlogImageAlt(post, locale)} className="mt-8 w-full object-cover" />
      ) : null}
      <div className="mt-10">
        <BlogBody blocks={copy?.blocks ?? []} />
      </div>
    </article>
  );
}
