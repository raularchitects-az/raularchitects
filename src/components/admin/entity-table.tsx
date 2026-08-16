"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { archiveRecord, deleteRecord, duplicateRecord, reorder, setActive, setStatus } from "@/lib/cms/actions";
import type { CmsRow, ContentStatus, EntityType } from "@/lib/cms/queries";
import { ConfirmButton } from "./fields";

const statusLabel: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function EntityTable({
  rows,
  table,
  editBase,
}: {
  rows: CmsRow[];
  table: EntityType;
  editBase: string;
}) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(rows);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    setOrdered(rows);
  }, [rows]);

  async function run(fn: () => Promise<unknown>) {
    await fn();
    router.refresh();
  }

  return (
    <div className="overflow-x-auto border border-charcoal/10 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-charcoal/10 text-[11px] uppercase tracking-[0.14em] text-charcoal/50">
          <tr>
            <th className="w-10 px-2 py-3" />
            <th className="px-4 py-3">Ad / slug</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Aktiv</th>
            <th className="px-4 py-3">Sıra</th>
            <th className="px-4 py-3">Əməliyyat</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => {
            const title =
              row.translations?.az?.title ||
              row.translations?.az?.name ||
              row.translations?.en?.title ||
              row.slug;
            return (
              <tr
                key={row.id}
                draggable
                onDragStart={() => setDragId(row.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!dragId || dragId === row.id) return;
                  const next = [...ordered];
                  const from = next.findIndex((item) => item.id === dragId);
                  const to = next.findIndex((item) => item.id === row.id);
                  if (from < 0 || to < 0) return;
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  setOrdered(next);
                  setDragId(null);
                  void run(() => reorder(table, next.map((item) => item.id)));
                }}
                className="border-b border-charcoal/5 cursor-grab"
              >
                <td className="px-2 py-3 text-charcoal/30">⋮⋮</td>
                <td className="px-4 py-3">
                  <a href={`${editBase}/${row.id}`} className="font-medium text-charcoal hover:text-bronze-dark">
                    {title}
                  </a>
                  <div className="text-xs text-charcoal/40">{row.slug}</div>
                </td>
                <td className="px-4 py-3">{statusLabel[row.status] ?? row.status ?? "—"}</td>
                <td className="px-4 py-3">{row.is_active ? "Bəli" : "Xeyr"}</td>
                <td className="px-4 py-3">{row.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em]">
                    <a href={`${editBase}/${row.id}`}>Redaktə</a>
                    <button type="button" onClick={() => run(() => duplicateRecord(table, row.id))}>
                      Duplikat
                    </button>
                    {row.status !== "published" ? (
                      <button type="button" onClick={() => run(() => setStatus(table, row.id, "published"))}>
                        Publish
                      </button>
                    ) : (
                      <button type="button" onClick={() => run(() => setStatus(table, row.id, "draft"))}>
                        Unpublish
                      </button>
                    )}
                    <button type="button" onClick={() => run(() => setActive(table, row.id, !row.is_active))}>
                      {row.is_active ? "Deaktiv" : "Aktiv"}
                    </button>
                    <ConfirmButton
                      label="Arxiv"
                      confirm="Arxivlənsin?"
                      onConfirm={() => run(() => archiveRecord(table, row.id))}
                    />
                    <ConfirmButton
                      label="Sil"
                      confirm={
                        row.status === "archived"
                          ? "Həmişəlik silinsin?"
                          : "Əvvəlcə arxivlənəcək. Davam?"
                      }
                      className="text-red-700"
                      onConfirm={() => run(() => deleteRecord(table, row.id))}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {ordered.length === 0 ? <p className="px-4 py-8 text-sm text-charcoal/50">Hələ qeyd yoxdur.</p> : null}
    </div>
  );
}
