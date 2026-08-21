"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activateInsightsRestructure, getInsightsRolloutStatus } from "@/lib/cms/actions";

type RolloutStatus = Awaited<ReturnType<typeof getInsightsRolloutStatus>>;

export function ActivateInsightsButton({ initialStatus }: { initialStatus?: RolloutStatus | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RolloutStatus | null>(initialStatus ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setFailed(false);
    try {
      const next = await getInsightsRolloutStatus();
      setStatus(next);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Status alınmadı.");
    } finally {
      setLoading(false);
    }
  }

  const readiness = status?.readiness;
  const alreadyActive = status?.active === true;
  const canActivate = Boolean(status && !alreadyActive && readiness?.ok);

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        disabled={busy || loading}
        className="border border-charcoal/20 px-4 py-2.5 text-xs uppercase tracking-[0.16em] disabled:opacity-60"
        onClick={() => void loadStatus()}
      >
        {loading ? "Yoxlanır…" : "Hazırlıq statusunu yenilə"}
      </button>

      {status ? (
        <ul className="max-w-xl space-y-1 text-sm text-charcoal/70">
          <li>
            Insights cədvəli:{" "}
            <span className={status.tableOk ? "text-green-700" : "text-red-700"}>
              {status.tableOk ? "mövcuddur" : "yoxdur"}
            </span>
          </li>
          <li>
            Public restructure:{" "}
            <span className={alreadyActive ? "text-green-700" : "text-charcoal/55"}>
              {alreadyActive ? "aktiv" : "qeyri-aktiv (Portfolio hələ public)"}
            </span>
          </li>
          <li>
            Portfolio → Projects: {readiness?.checks.migratedCount ?? 0}/
            {readiness?.checks.expectedMigrate ?? 3}
            {(readiness?.checks.migrationConflicts ?? 0) > 0
              ? ` · conflict ${readiness?.checks.migrationConflicts}`
              : ""}
          </li>
          <li>
            Published Insights: {readiness?.checks.insightsPublishedActive ?? 0}/
            {readiness?.checks.expectedInsights ?? 10}
          </li>
          {readiness?.checks.missingInsightSlugs?.length ? (
            <li className="text-red-700">
              Çatışmayan sluglar: {readiness.checks.missingInsightSlugs.join(", ")}
            </li>
          ) : null}
        </ul>
      ) : null}

      {readiness && !readiness.ok ? (
        <ul className="max-w-xl space-y-1 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {readiness.blockers.map((blocker) => (
            <li key={blocker.code + blocker.message}>• {blocker.message}</li>
          ))}
        </ul>
      ) : null}

      {alreadyActive ? (
        <p className="max-w-xl text-sm text-green-800">
          Insights artıq aktivdir. Public nav /portfolio əvəzinə /insights göstərir.
        </p>
      ) : (
        <button
          type="button"
          disabled={busy || loading || !canActivate}
          className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream disabled:opacity-60"
          onClick={async () => {
            if (
              !window.confirm(
                "Insights bölməsi aktiv ediləcək: public Portfolio → Insights keçidi, 3 real iş üçün /portfolio/{slug} → /layihelar/{slug} 308 redirect. Davam?",
              )
            ) {
              return;
            }
            setBusy(true);
            setFailed(false);
            setMessage(null);
            try {
              await activateInsightsRestructure({ confirm: true });
              setMessage("Insights bölməsi aktiv edildi.");
              await loadStatus();
              router.refresh();
            } catch (error) {
              setFailed(true);
              setMessage(error instanceof Error ? error.message : "Aktivasiya alınmadı.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Aktiv edilir…" : "Insights bölməsini aktiv et"}
        </button>
      )}

      {message ? (
        <p className={`max-w-xl whitespace-pre-wrap text-sm ${failed ? "text-red-700" : "text-charcoal/70"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
