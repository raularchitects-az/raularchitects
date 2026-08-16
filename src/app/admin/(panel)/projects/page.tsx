import { AdminListPage } from "@/components/admin/list-page";

export default function AdminProjectsPage() {
  return <AdminListPage title="Layihələr" table="projects" newHref="/admin/projects/new" editBase="/admin/projects" />;
}
