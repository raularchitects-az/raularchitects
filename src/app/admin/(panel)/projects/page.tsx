import { AdminListPage } from "@/components/admin/list-page";
import { MigrateLegacyButton } from "@/components/admin/migrate-legacy-button";
import { UnmigratedLegacyList } from "@/components/admin/unmigrated-legacy-list";
import { requireStaff } from "@/lib/cms/auth";

export default async function AdminProjectsPage() {
  const { profile } = await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <AdminListPage
        title="Layihələr"
        table="projects"
        newHref="/admin/projects/new"
        editBase="/admin/projects"
        actions={profile.role === "admin" ? <MigrateLegacyButton /> : null}
      />
      <UnmigratedLegacyList table="projects" />
    </div>
  );
}
