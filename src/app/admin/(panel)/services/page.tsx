import { AdminListPage } from "@/components/admin/list-page";

export default function AdminServicesPage() {
  return <AdminListPage title="Xidmətlər" table="services" newHref="/admin/services/new" editBase="/admin/services" />;
}
