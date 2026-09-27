"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency, formatMonth, formatNumber } from "@/lib/format";
import type { MonthlySales } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

const axisProps = {
  stroke: "var(--text-muted)",
  tick: { fill: "var(--text-muted)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

// Revenue and order count have different scales, so they get two charts
// sharing the same time axis rather than one chart with two y-axes.
export function MonthlyCharts({ data }: { data: MonthlySales[] }) {
  return (
    <section className="grid two-col">
      <div className="card">
        <h2>Revenue by month</h2>
        <p className="subtitle">Excludes cancelled orders</p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="month" tickFormatter={(m: string) => formatMonth(m, data.length > 6)} minTickGap={16} {...axisProps} />
              <YAxis tickFormatter={formatCompactCurrency} width={64} {...axisProps} />
              <Tooltip
                cursor={{ stroke: "var(--text-muted)", strokeDasharray: "3 3" }}
                content={<ChartTooltip metric="Revenue" formatValue={formatCurrency} formatLabel={(m) => formatMonth(m)} />}
              />
              <Area
                type="monotone"
                isAnimationActive={false}
                dataKey="revenue"
                stroke="var(--series-1)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                activeDot={{ r: 5, stroke: "var(--surface-1)", strokeWidth: 2, fill: "var(--series-1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <MonthlyTable data={data} />
      </div>

      <div className="card">
        <h2>Orders by month</h2>
        <p className="subtitle">Number of non-cancelled orders</p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="month" tickFormatter={(m: string) => formatMonth(m, data.length > 6)} minTickGap={16} {...axisProps} />
              <YAxis tickFormatter={formatNumber} width={48} allowDecimals={false} {...axisProps} />
              <Tooltip
                cursor={{ fill: "var(--grid)" }}
                content={<ChartTooltip metric="Orders" formatValue={formatNumber} formatLabel={(m) => formatMonth(m)} />}
              />
              <Bar dataKey="orders" isAnimationActive={false} fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function MonthlyTable({ data }: { data: MonthlySales[] }) {
  return (
    <details className="data-table">
      <summary>Show data table</summary>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th className="num">Revenue</th>
              <th className="num">Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month}>
                <td>{formatMonth(row.month)}</td>
                <td className="num">{formatCurrency(row.revenue)}</td>
                <td className="num">{formatNumber(row.orders)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
