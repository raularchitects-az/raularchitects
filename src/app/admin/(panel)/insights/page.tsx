import { AdminListPage } from "@/components/admin/list-page";

export default function AdminInsightsPage() {
  return (
    <AdminListPage
      title="Insights"
      table="insights"
      newHref="/admin/insights/new"
      editBase="/admin/insights"
    />
  );
}
