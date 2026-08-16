import { notFound } from "next/navigation";
import { ContentForm, RestoreButton } from "@/components/admin/content-form";
import { getEntity, listMedia, listRevisions } from "@/lib/cms/queries";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, media, revisions] = await Promise.all([getEntity("blog_posts", id), listMedia(), listRevisions("blog_posts", id)]);
  if (!row) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yazını redaktə et</h1>
      <ContentForm table="blog_posts" row={row} media={media} afterSaveHref="/admin/blog" />
      {revisions.length > 0 ? (
        <section className="border-t border-charcoal/10 pt-6">
          <h2 className="mb-3 text-sm uppercase tracking-[0.16em]">Versiyalar</h2>
          <ul className="space-y-2 text-sm">
            {revisions.map((rev) => (
              <li key={rev.id} className="flex items-center justify-between">
                <span>{new Date(rev.created_at).toLocaleString("az-AZ")}</span>
                <RestoreButton revisionId={rev.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
