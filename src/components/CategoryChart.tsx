"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { CategorySales } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export function CategoryChart({ categories }: { categories: CategorySales[] }) {
  return (
    <div className="card">
      <h2>Sales by category</h2>
      <p className="subtitle">Revenue per product category</p>
      {categories.length === 0 ? (
        <div className="empty">No sales in this period</div>
      ) : (
        <>
          <div style={{ height: Math.max(180, categories.length * 44) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={8}>
                <CartesianGrid horizontal={false} stroke="var(--grid)" />
                <XAxis
                  type="number"
                  tickFormatter={formatCompactCurrency}
                  stroke="var(--text-muted)"
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={92}
                  tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip cursor={{ fill: "var(--grid)" }} content={<ChartTooltip metric="Revenue" formatValue={formatCurrency} />} />
                <Bar dataKey="revenue" isAnimationActive={false} fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  <LabelList
                    dataKey="share"
                    position="right"
                    formatter={(value: number) => formatPercent(value)}
                    style={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="data-table">
            <summary>Show data table</summary>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="num">Revenue</th>
                    <th className="num">Share</th>
                    <th className="num">Units</th>
                    <th className="num">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((row) => (
                    <tr key={row.category}>
                      <td>{row.category}</td>
                      <td className="num">{formatCurrency(row.revenue)}</td>
                      <td className="num">{formatPercent(row.share)}</td>
                      <td className="num">{formatNumber(row.units)}</td>
                      <td className="num">{formatNumber(row.orders)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
