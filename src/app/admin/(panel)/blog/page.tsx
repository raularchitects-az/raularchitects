import { AdminListPage } from "@/components/admin/list-page";
import { ImportDraftBlogButton } from "@/components/admin/import-draft-blog-button";

export default function AdminBlogPage() {
  return (
    <AdminListPage
      title="Bloq"
      table="blog_posts"
      newHref="/admin/blog/new"
      editBase="/admin/blog"
      actions={<ImportDraftBlogButton />}
    />
  );
}
