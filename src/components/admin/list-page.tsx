import Link from "next/link";
import type { ReactNode } from "react";
import { EntityTable } from "@/components/admin/entity-table";
import { requireStaff } from "@/lib/cms/auth";
import { listEntity, type EntityType } from "@/lib/cms/queries";

export async function AdminListPage({
  title,
  table,
  newHref,
  editBase,
  actions,
}: {
  title: string;
  table: EntityType;
  newHref: string;
  editBase: string;
  actions?: ReactNode;
}) {
  const rows = await listEntity(table);
  const { profile } = await requireStaff();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={newHref} className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream">
            Yeni
          </Link>
          {actions}
        </div>
      </div>
      <EntityTable rows={rows} table={table} editBase={editBase} canHardDelete={profile.role === "admin"} />
    </div>
  );
}
