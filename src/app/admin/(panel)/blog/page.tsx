import { AdminListPage } from "@/components/admin/list-page";

export default function AdminBlogPage() {
  return (
    <AdminListPage title="Bloq" table="blog_posts" newHref="/admin/blog/new" editBase="/admin/blog" />
  );
}
