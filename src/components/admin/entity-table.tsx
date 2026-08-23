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

function withSequentialOrder(rows: CmsRow[]) {
  return rows.map((row, index) => ({ ...row, sort_order: index + 1 }));
}

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
  const [ordered, setOrdered] = useState(() => withSequentialOrder(rows));
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const rowSig = rows.map((row) => `${row.id}:${row.status}:${row.is_active}:${row.sort_order}:${row.updated_at}`).join("|");
  const [seenSig, setSeenSig] = useState(rowSig);
  if (rowSig !== seenSig) {
    setSeenSig(rowSig);
    setOrdered(withSequentialOrder(rows));
  }

  const hardDelete = table === "projects" || table === "portfolio";
  const reorderDisabled = Boolean(busyId) || savingOrder;

  async function persistOrder(next: CmsRow[]) {
    const numbered = withSequentialOrder(next);
    setError(null);
    setSavingOrder(true);
    setOrdered(numbered);
    try {
      await reorder(table, numbered.map((item) => item.id));
      router.refresh();
    } catch (caught) {
      setOrdered(withSequentialOrder(rows));
      setError(caught instanceof Error ? caught.message : "Sıra yenilənmədi");
    } finally {
      setSavingOrder(false);
      setDragId(null);
    }
  }

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
      {savingOrder ? (
        <p className="border-b border-charcoal/10 bg-cream-dark/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-charcoal/55">
          Sıra yenilənir…
        </p>
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
          {ordered.map((row, index) => {
            const title =
              row.translations?.az?.title ||
              row.translations?.az?.name ||
              row.translations?.en?.title ||
              row.slug;
            const busy = busyId === row.id;
            const dragging = dragId === row.id;
            return (
              <tr
                key={row.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!dragId || dragId === row.id || reorderDisabled) return;
                  const next = [...ordered];
                  const from = next.findIndex((item) => item.id === dragId);
                  const to = next.findIndex((item) => item.id === row.id);
                  if (from < 0 || to < 0) return;
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  void persistOrder(next);
                }}
                className={`border-b border-charcoal/5 ${dragging ? "bg-cream-dark/50 opacity-60" : ""}`}
              >
                <td className="px-2 py-3 text-charcoal/30">
                  <button
                    type="button"
                    draggable={!reorderDisabled && !busy}
                    aria-label="Sıranı dəyiş"
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      setDragId(row.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    disabled={reorderDisabled || busy}
                    className="cursor-grab px-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ⋮⋮
                  </button>
                </td>
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
                <td className="px-4 py-3 tabular-nums">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className={`flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em] ${busy ? "opacity-50" : ""}`}>
                    <a href={`${editBase}/${row.id}`}>Redaktə</a>
                    <button type="button" disabled={busy || reorderDisabled} onClick={() => run(row.id, () => duplicateRecord(table, row.id))}>
                      Duplikat
                    </button>
                    {row.status !== "published" ? (
                      <button type="button" disabled={busy || reorderDisabled} onClick={() => run(row.id, () => setStatus(table, row.id, "published"))}>
                        Publish
                      </button>
                    ) : (
                      <button type="button" disabled={busy || reorderDisabled} onClick={() => run(row.id, () => setStatus(table, row.id, "draft"))}>
                        Unpublish
                      </button>
                    )}
                    <button type="button" disabled={busy || reorderDisabled} onClick={() => run(row.id, () => setActive(table, row.id, !row.is_active))}>
                      {row.is_active ? "Deaktiv" : "Aktiv"}
                    </button>
                    <ConfirmButton
                      label="Arxiv"
                      confirm="Arxivlənsin? Public saytdan çıxacaq, admin-də qalacaq."
                      disabled={busy || reorderDisabled}
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
                        disabled={busy || reorderDisabled}
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
