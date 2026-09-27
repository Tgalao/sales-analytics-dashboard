const LOCALE = "en-IE";

const currency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const currencyPrecise = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compactCurrency = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 1 });

export const formatCurrency = (value: number) => currency.format(value);
export const formatCurrencyPrecise = (value: number) => currencyPrecise.format(value);
export const formatCompactCurrency = (value: number) => compactCurrency.format(value);
export const formatNumber = (value: number) => integer.format(value);
/** `value` is a ratio, e.g. 0.25 -> "25%". */
export const formatPercent = (value: number) => percent.format(value);

export function formatChange(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

/** "2026-03" -> "Mar 2026" (or "Mar" when `short`). */
export function formatMonth(month: string, short = false): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1, 1));
  return date.toLocaleDateString(LOCALE, { month: "short", year: short ? undefined : "numeric", timeZone: "UTC" });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
