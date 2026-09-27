"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isIsoDate } from "@/lib/dates";
import { formatCurrency, formatCurrencyPrecise, formatDate, formatNumber } from "@/lib/format";
import type { AnalyticsResponse, DateRange } from "@/lib/types";
import { CategoryChart } from "./CategoryChart";
import { CustomerStats } from "./CustomerStats";
import { DateFilter, defaultRange } from "./DateFilter";
import { KpiCard } from "./KpiCard";
import { MonthlyCharts } from "./MonthlyCharts";
import { TopProducts } from "./TopProducts";

function rangeFromParams(params: URLSearchParams): DateRange {
  const from = params.get("from");
  const to = params.get("to");
  return isIsoDate(from) && isIsoDate(to) && from <= to ? { from, to } : defaultRange();
}

export function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = rangeFromParams(new URLSearchParams(searchParams.toString()));

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/analytics?from=${range.from}&to=${range.to}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Request failed");
        setData(body as AnalyticsResponse);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range.from, range.to]);

  // The range lives in the URL so a filtered view can be bookmarked or shared.
  function setRange(next: DateRange) {
    router.replace(`${pathname}?from=${next.from}&to=${next.to}`, { scroll: false });
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Sales Analytics</h1>
          <p>
            {formatDate(range.from)} – {formatDate(range.to)}
          </p>
        </div>
        <DateFilter range={range} dataBounds={data?.dataBounds ?? null} onChange={setRange} />
      </header>

      {error && (
        <div className="banner error" role="alert">
          {error}
        </div>
      )}

      {!data && loading && <div className="banner">Loading…</div>}

      {data && (
        <div className={loading ? "loading" : undefined} aria-busy={loading}>
          <section className="grid kpis" aria-label="Key metrics">
            <KpiCard label="Revenue" value={formatCurrency(data.summary.revenue)} change={data.change.revenue} />
            <KpiCard label="Orders" value={formatNumber(data.summary.orders)} change={data.change.orders} />
            <KpiCard
              label="Average order value"
              value={formatCurrencyPrecise(data.summary.averageOrderValue)}
              change={data.change.averageOrderValue}
            />
            <KpiCard label="Paying customers" value={formatNumber(data.summary.customers)} change={data.change.customers} />
            <KpiCard label="Units sold" value={formatNumber(data.summary.unitsSold)} change={data.change.unitsSold} />
          </section>

          <MonthlyCharts data={data.salesByMonth} />

          <section className="grid wide-left">
            <TopProducts products={data.topProducts} />
            <CategoryChart categories={data.salesByCategory} />
          </section>

          <CustomerStats stats={data.customers} />
        </div>
      )}
    </main>
  );
}
