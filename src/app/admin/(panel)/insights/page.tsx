import { AdminListPage } from "@/components/admin/list-page";
import { SeedInsightsButton } from "@/components/admin/seed-insights-button";

export default function AdminInsightsPage() {
  return (
    <AdminListPage
      title="Insights"
      table="insights"
      newHref="/admin/insights/new"
      editBase="/admin/insights"
      actions={
        <div className="flex flex-col items-end gap-1">
          <SeedInsightsButton />
          <p className="max-w-xs text-right text-[11px] text-charcoal/45">
            Portfolio → Layihələr köçürməsi Layihələr səhifəsindədir.
          </p>
        </div>
      }
    />
  );
}
