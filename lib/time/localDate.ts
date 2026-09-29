/**
 * Central date utility — always uses the browser/device local calendar.
 * Never uses UTC (.toISOString()), which would shift the date for
 * users in UTC+8 (Malaysia) before 08:00 UTC.
 */

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
