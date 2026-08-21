import { AdminListPage } from "@/components/admin/list-page";
import { MigrateLegacyButton } from "@/components/admin/migrate-legacy-button";
import { MigratePortfolioButton } from "@/components/admin/migrate-portfolio-button";
import { UnmigratedLegacyList } from "@/components/admin/unmigrated-legacy-list";
import { requireStaff } from "@/lib/cms/auth";
import Link from "next/link";

export default async function AdminProjectsPage() {
  const { profile } = await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <AdminListPage
        title="Layihələr"
        table="projects"
        newHref="/admin/projects/new"
        editBase="/admin/projects"
        actions={
          profile.role === "admin" ? (
            <div className="flex flex-col items-start gap-3">
              <div className="flex flex-wrap items-start gap-3">
                <MigrateLegacyButton />
                <MigratePortfolioButton />
              </div>
              <p className="text-xs text-charcoal/50">
                Insights staged rollout üçün əsas panel:{" "}
                <Link href="/admin/rollout" className="underline underline-offset-2">
                  /admin/rollout
                </Link>
              </p>
            </div>
          ) : null
        }
      />
      <UnmigratedLegacyList table="projects" />
    </div>
  );
}
