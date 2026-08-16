import { AdminListPage } from "@/components/admin/list-page";

export default function AdminPortfolioPage() {
  return <AdminListPage title="Portfolio" table="portfolio" newHref="/admin/portfolio/new" editBase="/admin/portfolio" />;
}
