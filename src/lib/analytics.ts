import { monthsInRange, previousRange, toIsoDate, toWindow } from "./dates";
import {
  queryCustomerCounts,
  queryCustomersByCountry,
  queryDataBounds,
  querySalesByCategory,
  querySalesByMonth,
  querySummary,
  queryTopCustomers,
  queryTopProducts,
} from "./queries";
import type { AnalyticsResponse, Change, DateRange, Summary } from "./types";

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const NO_CHANGE: Change = { revenue: null, orders: null, averageOrderValue: null, customers: null, unitsSold: null };

function compare(current: Summary, previous: Summary): Change {
  return {
    revenue: percentChange(current.revenue, previous.revenue),
    orders: percentChange(current.orders, previous.orders),
    averageOrderValue: percentChange(current.averageOrderValue, previous.averageOrderValue),
    customers: percentChange(current.customers, previous.customers),
    unitsSold: percentChange(current.unitsSold, previous.unitsSold),
  };
}

export async function getAnalytics(range: DateRange): Promise<AnalyticsResponse> {
  const window = toWindow(range);
  const previous = previousRange(range);

  const [bounds, summary, previousSummary, monthly, topProducts, categories, counts, topCustomers, byCountry] =
    await Promise.all([
      queryDataBounds(),
      querySummary(window),
      querySummary(toWindow(previous)),
      querySalesByMonth(window),
      queryTopProducts(window),
      querySalesByCategory(window),
      queryCustomerCounts(window),
      queryTopCustomers(window),
      queryCustomersByCountry(window),
    ]);

  // Fill months with no sales so the time axis has no gaps.
  const monthlyByKey = new Map(monthly.map((row) => [row.month, row]));
  const salesByMonth = monthsInRange(range).map(
    (month) => monthlyByKey.get(month) ?? { month, revenue: 0, orders: 0 },
  );

  const categoryTotal = categories.reduce((sum, row) => sum + row.revenue, 0);
  const dataBounds = bounds.first && bounds.last ? { from: toIsoDate(bounds.first), to: toIsoDate(bounds.last) } : null;

  // Only compare when the data covers the whole previous period; a partial one
  // (e.g. before the store's first order) would produce misleading growth figures.
  const canCompare = !!dataBounds && previous.from >= dataBounds.from;

  return {
    range,
    dataBounds,
    summary,
    change: canCompare ? compare(summary, previousSummary) : NO_CHANGE,
    salesByMonth,
    topProducts,
    salesByCategory: categories.map((row) => ({
      ...row,
      share: categoryTotal > 0 ? row.revenue / categoryTotal : 0,
    })),
    customers: {
      ...counts,
      repeatRate: counts.activeCustomers > 0 ? counts.repeatCustomers / counts.activeCustomers : 0,
      revenuePerCustomer: counts.activeCustomers > 0 ? summary.revenue / counts.activeCustomers : 0,
      topCustomers,
      byCountry,
    },
  };
}
