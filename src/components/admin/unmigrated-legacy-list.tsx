import { listEntity } from "@/lib/cms/queries";
import type { LegacyKind } from "@/lib/cms/legacy";
import { hasExplicitLegacySourceId } from "@/lib/cms/legacy";
import { listUnmigratedSlugs } from "@/lib/cms/legacy-import";

export async function UnmigratedLegacyList({ table }: { table: "projects" | "portfolio" }) {
  const kind: LegacyKind = table === "projects" ? "project" : "portfolio";
  const rows = await listEntity(table);
  const unmigrated = listUnmigratedSlugs(kind, rows);
  const migrated = rows.filter((row) => hasExplicitLegacySourceId(row)).length;

  return (
    <div className="border border-charcoal/10 bg-white p-5">
      <h2 className="text-sm font-medium uppercase tracking-[0.16em]">Legacy / hələ köçürülməyib</h2>
      <p className="mt-2 text-sm text-charcoal/60">
        CMS-ə bağlı: {migrated}. Public sayt CMS-də olmayan item-ləri statik kataloqdan göstərir.
        Mövcud CMS qeydləri «Legacy kataloqu CMS-ə köçür» ilə overwrite olunmur.
      </p>
      {unmigrated.length === 0 ? (
        <p className="mt-3 text-sm text-charcoal/50">Bütün statik qeydlər CMS-ə bağlıdır.</p>
      ) : (
        <ul className="mt-3 columns-1 gap-x-8 text-sm text-charcoal/80 sm:columns-2">
          {unmigrated.map((item) => (
            <li key={item.slug} className="break-inside-avoid py-0.5">
              {item.title} <span className="text-charcoal/40">({item.slug})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
