import { AdminListPage } from "@/components/admin/list-page";
import { requireStaff } from "@/lib/cms/auth";

export default async function AdminProjectsPage() {
  await requireStaff();

  return (
    <AdminListPage
      title="Layihələr"
      table="projects"
      newHref="/admin/projects/new"
      editBase="/admin/projects"
    />
  );
}
