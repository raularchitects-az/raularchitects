import { recentAudit } from "@/lib/cms/queries";

export default async function AdminAuditPage() {
  const rows = await recentAudit(80);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Jurnal</h1>
      <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-white">
        {rows.map((item) => (
          <li key={item.id} className="px-4 py-3 text-sm">
            <span className="font-medium">{item.action}</span> · {item.entity_type} · {item.summary}
            <div className="text-xs text-charcoal/40">{new Date(item.created_at).toLocaleString("az-AZ")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
