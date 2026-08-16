import Link from "next/link";
import { EntityTable } from "@/components/admin/entity-table";
import { listEntity, type EntityType } from "@/lib/cms/queries";

export async function AdminListPage({
  title,
  table,
  newHref,
  editBase,
}: {
  title: string;
  table: EntityType;
  newHref: string;
  editBase: string;
}) {
  const rows = await listEntity(table);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <Link href={newHref} className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream">
          Yeni
        </Link>
      </div>
      <EntityTable rows={rows} table={table} editBase={editBase} />
    </div>
  );
}
