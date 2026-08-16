import { ContentForm } from "@/components/admin/content-form";
import { listMedia } from "@/lib/cms/queries";

export default async function NewBlogPage() {
  const media = await listMedia();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Yeni blog yazısı</h1>
      <ContentForm table="blog_posts" media={media} afterSaveHref="/admin/blog" />
    </div>
  );
}
