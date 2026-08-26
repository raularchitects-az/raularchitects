"use client";

import { useState, useTransition } from "react";
import { runRadarNow, runRadarSelfCheckAction, toggleRadarSource } from "@/lib/radar/actions";
import type { SelfCheckResult } from "@/lib/radar/self-check";

const primaryClass =
  "bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-cream disabled:opacity-60";
const secondaryClass =
  "border border-charcoal/20 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/70 disabled:opacity-60";

export function RunPanel() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [checks, setChecks] = useState<SelfCheckResult[] | null>(null);

  const manualRun = () => {
    setMessage(null);
    setChecks(null);
    startTransition(async () => {
      try {
        const result = await runRadarNow("ted");
        if (result.error) {
          setMessage(`Uğursuz: ${result.error}`);
          return;
        }
        setMessage(
          `Status: ${result.status} · oxundu ${result.fetched} · yeni ${result.created} · yeniləndi ${result.updated} · arxivləndi ${result.archived} · bildiriş ${result.alerts}` +
            (result.warnings.length ? ` · ${result.warnings.join(" ")}` : ""),
        );
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Axtarış alınmadı");
      }
    });
  };

  const selfCheck = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        setChecks(await runRadarSelfCheckAction());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Yoxlama alınmadı");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={primaryClass} disabled={pending} onClick={manualRun}>
          {pending ? "İşləyir…" : "İndi axtar"}
        </button>
        <button type="button" className={secondaryClass} disabled={pending} onClick={selfCheck}>
          Mənbə testini işlət
        </button>
      </div>
      <p className="text-[11px] text-charcoal/40">
        Manual axtarış yalnız ehtiyat üsuludur — planlaşdırılmış iş gündəlik olaraq avtomatik işləyir. Mənbə testi
        şəbəkəyə çıxmadan, sabit nümunə cavabla bütün boru xəttini yoxlayır.
      </p>

      {message ? <p className="border border-charcoal/15 bg-white px-4 py-3 text-xs text-charcoal/70">{message}</p> : null}

      {checks ? (
        <ul className="flex flex-col divide-y divide-charcoal/5 border border-charcoal/15 bg-white">
          {checks.map((check) => (
            <li key={check.name} className="flex items-start justify-between gap-4 px-4 py-2.5">
              <span className="text-xs text-charcoal/70">
                {check.name}
                <span className="block text-[11px] text-charcoal/40">{check.detail}</span>
              </span>
              <span className={`shrink-0 text-[11px] uppercase tracking-[0.14em] ${check.passed ? "text-green-700" : "text-red-700"}`}>
                {check.passed ? "OK" : "XƏTA"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function SourceToggle({ id, enabled, disabled }: { id: string; enabled: boolean; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || disabled}
      className="border border-charcoal/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-charcoal/70 disabled:opacity-40"
      onClick={() =>
        startTransition(async () => {
          try {
            await toggleRadarSource(id, !enabled);
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Dəyişiklik alınmadı");
          }
        })
      }
    >
      {enabled ? "Söndür" : "Aktivləşdir"}
    </button>
  );
}
