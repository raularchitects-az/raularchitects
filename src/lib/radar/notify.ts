import "server-only";

import { daysUntilDeadline } from "./deadline";
import { alertRecipient, type RadarAlertConfig } from "./settings";
import type { RadarOpportunityRow } from "./types";

/**
 * Radar email alerts.
 *
 * The logic is complete, but nothing is ever sent until a recipient is
 * configured server-side — either `radar.alerts.recipient` in Advanced
 * Settings or the `RADAR_ALERT_TO_EMAIL` environment variable. No address is
 * ever guessed, and the existing Resend configuration is reused rather than a
 * second provider being introduced.
 */

export type AlertKind = "new" | "urgent";

export type PlannedAlert = {
  kind: AlertKind;
  opportunity: RadarOpportunityRow;
  subject: string;
  body: string;
};

export type AlertDispatchResult = {
  sent: PlannedAlert[];
  skipped: string | null;
};

/** Bracket access so Vercel reads the value at runtime, not at build time. */
function env(name: string) {
  return process.env[name]?.trim();
}

function fromAddress() {
  return env("RADAR_FROM_EMAIL") || env("INQUIRY_FROM_EMAIL") || "Raul Radar <onboarding@resend.dev>";
}

function actionable(row: RadarOpportunityRow) {
  const recommendation = (row.analysis as { recommendation?: string })?.recommendation;
  return recommendation !== undefined && recommendation !== "monitor_only";
}

function alertBody(row: RadarOpportunityRow, kind: AlertKind, now: Date) {
  const days = daysUntilDeadline(row.deadline_at, now);
  const analysis = row.analysis as { whyItMatters?: string; recommendation?: string };
  return [
    kind === "urgent" ? "TƏCİLİ TENDER" : "YENİ YÜKSƏK UYĞUNLUQLU İMKAN",
    "",
    row.title,
    row.buyer_name ? `Sifarişçi: ${row.buyer_name}` : "",
    row.country ? `Ölkə: ${row.country}` : "",
    `Uyğunluq: ${row.score}/100`,
    days === null ? "Son tarix: mənbədə göstərilməyib" : `Son tarix: ${days} gün qalıb`,
    row.value_amount ? `Dəyər: ${row.value_amount} ${row.value_currency ?? ""}`.trim() : "",
    "",
    analysis.whyItMatters ? `Niyə vacibdir: ${analysis.whyItMatters}` : "",
    "",
    `Rəsmi elan: ${row.source_url}`,
    `Mənbə ID: ${row.source_ref}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Decides which alerts a run should produce. Pure, so the rules can be
 * inspected without sending anything.
 */
export function planAlerts(
  rows: RadarOpportunityRow[],
  config: RadarAlertConfig,
  now: Date = new Date(),
): PlannedAlert[] {
  const planned: PlannedAlert[] = [];

  for (const row of rows) {
    if (row.state !== "active") continue;
    if (row.score < config.minScore) continue;
    if (!actionable(row)) continue;

    const days = daysUntilDeadline(row.deadline_at, now);
    if (days !== null && days < 0) continue;

    if (!row.new_alert_sent_at) {
      planned.push({
        kind: "new",
        opportunity: row,
        subject: `[RAUL RADAR] New high-fit architecture opportunity — ${row.country ?? "Europe"}`,
        body: alertBody(row, "new", now),
      });
      continue;
    }

    if (!row.urgent_alert_sent_at && days !== null && days <= config.urgentWithinDays) {
      planned.push({
        kind: "urgent",
        opportunity: row,
        subject: `[URGENT TENDER] Architectural services — ${days} days remaining`,
        body: alertBody(row, "urgent", now),
      });
    }
  }

  return planned;
}

async function sendOne(recipient: string, alert: PlannedAlert) {
  const apiKey = env("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY konfiqurasiya olunmayıb");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromAddress(),
      to: [recipient],
      subject: alert.subject,
      text: alert.body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Radar bildirişi göndərilmədi (${response.status}): ${detail || response.statusText}`);
  }
}

export async function dispatchRadarAlerts(
  rows: RadarOpportunityRow[],
  config: RadarAlertConfig,
  now: Date = new Date(),
): Promise<AlertDispatchResult> {
  const planned = planAlerts(rows, config, now);
  if (!planned.length) return { sent: [], skipped: null };

  if (!config.enabled) return { sent: [], skipped: "Bildirişlər ayarlardan söndürülüb." };

  const recipient = alertRecipient(config);
  if (!recipient) {
    return {
      sent: [],
      skipped: `${planned.length} bildiriş hazırdır, lakin alıcı ünvanı konfiqurasiya olunmayıb.`,
    };
  }
  if (!env("RESEND_API_KEY")) {
    return { sent: [], skipped: `${planned.length} bildiriş hazırdır, lakin RESEND_API_KEY yoxdur.` };
  }

  const sent: PlannedAlert[] = [];
  for (const alert of planned) {
    try {
      await sendOne(recipient, alert);
      sent.push(alert);
    } catch (error) {
      console.error("[radar] alert", error instanceof Error ? error.message : error);
    }
  }

  return { sent, skipped: sent.length === planned.length ? null : "Bəzi bildirişlər göndərilmədi." };
}
