import type { DateRange } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  return !!value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Converts an inclusive date range into the half-open [start, end) timestamps used in SQL. */
export function toWindow(range: DateRange): { start: Date; end: Date } {
  return { start: new Date(`${range.from}T00:00:00Z`), end: new Date(`${addDays(range.to, 1)}T00:00:00Z`) };
}

/** The period of equal length immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const length = daysBetween(range.from, range.to) + 1;
  return { from: addDays(range.from, -length), to: addDays(range.from, -1) };
}

/** Every month (YYYY-MM) touched by the range, so months without sales still appear on the chart. */
export function monthsInRange(range: DateRange): string[] {
  const months: string[] = [];
  let [year, month] = range.from.split("-").map(Number);
  const [endYear, endMonth] = range.to.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}
