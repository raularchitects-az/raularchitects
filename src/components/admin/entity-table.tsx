"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveRecord, deleteRecord, duplicateRecord, reorder, setActive, setStatus } from "@/lib/cms/actions";
import { hasExplicitLegacySourceId } from "@/lib/cms/legacy";
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
  canHardDelete = false,
}: {
  rows: CmsRow[];
  table: EntityType;
  editBase: string;
  canHardDelete?: boolean;
}) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const rowSig = rows.map((row) => `${row.id}:${row.status}:${row.is_active}:${row.sort_order}:${row.updated_at}`).join("|");
  const [seenSig, setSeenSig] = useState(rowSig);
  if (rowSig !== seenSig) {
    setSeenSig(rowSig);
    setOrdered(rows);
  }

  const hardDelete = table === "projects" || table === "portfolio";

  async function run(id: string, fn: () => Promise<unknown>) {
    setError(null);
    setBusyId(id);
    try {
      await fn();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Əməliyyat alınmadı");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-x-auto border border-charcoal/10 bg-white">
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-charcoal/10 text-[11px] uppercase tracking-[0.14em] text-charcoal/50">
          <tr>
            <th className="w-10 px-2 py-3" />
            <th className="px-4 py-3">Ad / slug</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Aktiv</th>
            <th className="px-4 py-3">Mənbə</th>
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
            const busy = busyId === row.id;
            return (
              <tr
                key={row.id}
                draggable={!busy}
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
                  void run(row.id, () => reorder(table, next.map((item) => item.id)));
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
                <td className="px-4 py-3 text-xs text-charcoal/60">
                  {table === "projects" || table === "portfolio"
                    ? hasExplicitLegacySourceId(row)
                      ? "CMS managed"
                      : "CMS · slug match"
                    : "—"}
                </td>
                <td className="px-4 py-3">{row.sort_order}</td>
                <td className="px-4 py-3">
                  <div className={`flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em] ${busy ? "opacity-50" : ""}`}>
                    <a href={`${editBase}/${row.id}`}>Redaktə</a>
                    <button type="button" disabled={busy} onClick={() => run(row.id, () => duplicateRecord(table, row.id))}>
                      Duplikat
                    </button>
                    {row.status !== "published" ? (
                      <button type="button" disabled={busy} onClick={() => run(row.id, () => setStatus(table, row.id, "published"))}>
                        Publish
                      </button>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => run(row.id, () => setStatus(table, row.id, "draft"))}>
                        Unpublish
                      </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => run(row.id, () => setActive(table, row.id, !row.is_active))}>
                      {row.is_active ? "Deaktiv" : "Aktiv"}
                    </button>
                    <ConfirmButton
                      label="Arxiv"
                      confirm="Arxivlənsin? Public saytdan çıxacaq, admin-də qalacaq."
                      disabled={busy}
                      onConfirm={() => run(row.id, () => archiveRecord(table, row.id))}
                    />
                    {hardDelete && !canHardDelete ? (
                      <span className="text-charcoal/35">Sil (admin)</span>
                    ) : (
                      <ConfirmButton
                        label="Sil"
                        confirm={
                          hardDelete
                            ? `“${title}” həmişəlik silinsin? Bu əməliyyat geri qaytarılmır.`
                            : row.status === "archived"
                              ? "Həmişəlik silinsin?"
                              : "Əvvəlcə arxivlənəcək. Davam?"
                        }
                        className="text-red-700"
                        disabled={busy}
                        onConfirm={() => run(row.id, () => deleteRecord(table, row.id))}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {ordered.length === 0 ? (
        <p className="px-4 py-8 text-sm text-charcoal/50">
          Hələ qeyd yoxdur. Dashboard-da «Mövcud saytı import et» düyməsi ilə canlı sayt kontentini gətirin.
        </p>
      ) : null}
    </div>
  );
}
