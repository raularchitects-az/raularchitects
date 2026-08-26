import type { DeadlineStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Whole days from now until the deadline. Negative once it has passed. */
export function daysUntilDeadline(value: string | null | undefined, now: Date = new Date()): number | null {
  const deadline = parseDeadline(value);
  if (!deadline) return null;
  return Math.floor((deadline.getTime() - now.getTime()) / DAY_MS);
}

export function deadlineStatus(value: string | null | undefined, now: Date = new Date()): DeadlineStatus {
  const days = daysUntilDeadline(value, now);
  if (days === null) return "unknown";
  if (days < 0) return "urgent";
  if (days <= 3) return "urgent";
  if (days <= 14) return "high";
  return "normal";
}

export function isExpired(value: string | null | undefined, now: Date = new Date()) {
  const days = daysUntilDeadline(value, now);
  return days !== null && days < 0;
}

export function formatDeadline(value: string | null | undefined) {
  const deadline = parseDeadline(value);
  if (!deadline) return "Son tarix bilinmir";
  return deadline.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function deadlineSummary(value: string | null | undefined, now: Date = new Date()) {
  const days = daysUntilDeadline(value, now);
  if (days === null) return "Mənbədə etibarlı son tarix göstərilməyib.";
  if (days < 0) return "Son tarix keçib.";
  if (days === 0) return "Son tarix bu gündür.";
  return `${days} gün qalıb.`;
}
