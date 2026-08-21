"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { planPortfolioToProjectsMigration, runPortfolioToProjectsMigration } from "@/lib/cms/actions";
import type { PortfolioMigrationPlan } from "@/lib/cms/portfolio-to-projects";

export function MigratePortfolioButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<PortfolioMigrationPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={busy}
        className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-[0.16em] disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          setMessage(null);
          setFailed(false);
          setPlan(null);
          try {
            const next = await planPortfolioToProjectsMigration();
            setPlan(next);
            setMessage(
              `Dry-run: create ${next.create} (gözlənilən ≤ 3 real iş), artıq köçürülüb ${next.skipAlreadyMigrated}, slug conflict ${next.skipSlugConflict}. ` +
                `Heç nə yazılmadı — təsdiq lazımdır. Portfolio sətirləri toxunulmur.`,
            );
          } catch (error) {
            setFailed(true);
            setMessage(error instanceof Error ? error.message : "Plan alınmadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Planlaşdırılır…" : "Portfolio → Layihələr (dry-run)"}
      </button>

      {plan && plan.create > 0 ? (
        <button
          type="button"
          disabled={busy}
          className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream disabled:opacity-60"
          onClick={async () => {
            if (
              !window.confirm(
                `${plan.create} real portfolio işi Layihələrə köçürüləcək (gözlənilən ≤ 3). ` +
                  `Mövcud layihələr overwrite olunmayacaq. Portfolio sətirləri silinməz / deaktiv olunmaz. ` +
                  `Public sayt Portfolio qalır — Insights aktivasiyasına qədər. Redirect bu addımda yazılmır. Davam?`,
              )
            ) {
              return;
            }
            setBusy(true);
            setFailed(false);
            try {
              const result = await runPortfolioToProjectsMigration({ confirm: true });
              setMessage(
                `Köçürüldü: ${result.created}. Ötürüldü: ${result.skipped}. ` +
                  `Portfolio toxunulmayıb. Public hələ Portfolio göstərir; redirect və Insights keçidi yalnız aktivasiyada.`,
              );
              setPlan(null);
              router.refresh();
            } catch (error) {
              setFailed(true);
              setMessage(error instanceof Error ? error.message : "Migration alınmadı.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Köçürülür…" : `Təsdiq et və köçür (${plan.create})`}
        </button>
      ) : null}

      {message ? (
        <p className={`max-w-xl text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>{message}</p>
      ) : null}

      {plan?.items.length ? (
        <ul className="mt-1 max-h-48 max-w-xl overflow-y-auto border border-charcoal/10 bg-white text-xs text-charcoal/70">
          {plan.items.map((item) => (
            <li key={item.portfolioId} className="border-b border-charcoal/5 px-3 py-2 last:border-b-0">
              <span className="font-medium">{item.portfolioSlug}</span> → {item.projectSlug} · {item.action}
              {item.reason ? <span className="block text-charcoal/45">{item.reason}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
