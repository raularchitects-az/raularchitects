import { AdminListPage } from "@/components/admin/list-page";
import { MigrateLegacyButton } from "@/components/admin/migrate-legacy-button";
import { UnmigratedLegacyList } from "@/components/admin/unmigrated-legacy-list";
import { requireStaff } from "@/lib/cms/auth";

export default async function AdminPortfolioPage() {
  const { profile } = await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <AdminListPage
        title="Portfolio"
        table="portfolio"
        newHref="/admin/portfolio/new"
        editBase="/admin/portfolio"
        actions={profile.role === "admin" ? <MigrateLegacyButton /> : null}
      />
      <UnmigratedLegacyList table="portfolio" />
    </div>
  );
}
