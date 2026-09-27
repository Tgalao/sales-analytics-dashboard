import { Prisma } from "@prisma/client";
import { prisma } from "./db";

// Raw SQL aggregation queries. Each one takes a half-open [start, end) window on
// orders.order_date and ignores cancelled orders. Numeric results are cast to
// float8 / int in SQL so they arrive as plain JS numbers instead of Decimal / BigInt.

export type Window = { start: Date; end: Date };

const inWindow = ({ start, end }: Window) =>
  Prisma.sql`o.order_date >= ${start} AND o.order_date < ${end} AND o.status <> 'CANCELLED'`;

export async function queryDataBounds() {
  const [row] = await prisma.$queryRaw<{ first: Date | null; last: Date | null }[]>`
    SELECT MIN(order_date) AS first, MAX(order_date) AS last
    FROM orders
    WHERE status <> 'CANCELLED'
  `;
  return row;
}

export async function querySummary(window: Window) {
  const [row] = await prisma.$queryRaw<
    { revenue: number; orders: number; average_order_value: number; customers: number; units_sold: number }[]
  >`
    WITH order_totals AS (
      SELECT o.id, o.customer_id,
             SUM(oi.quantity * oi.unit_price) AS total,
             SUM(oi.quantity)                 AS units
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE ${inWindow(window)}
      GROUP BY o.id, o.customer_id
    )
    SELECT COALESCE(SUM(total), 0)::float8  AS revenue,
           COUNT(*)::int                    AS orders,
           COALESCE(AVG(total), 0)::float8  AS average_order_value,
           COUNT(DISTINCT customer_id)::int AS customers,
           COALESCE(SUM(units), 0)::int     AS units_sold
    FROM order_totals
  `;
  return {
    revenue: row.revenue,
    orders: row.orders,
    averageOrderValue: row.average_order_value,
    customers: row.customers,
    unitsSold: row.units_sold,
  };
}

export function querySalesByMonth(window: Window) {
  return prisma.$queryRaw<{ month: string; revenue: number; orders: number }[]>`
    SELECT to_char(date_trunc('month', o.order_date), 'YYYY-MM') AS month,
           SUM(oi.quantity * oi.unit_price)::float8            AS revenue,
           COUNT(DISTINCT o.id)::int                           AS orders
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE ${inWindow(window)}
    GROUP BY 1
    ORDER BY 1
  `;
}

export function queryTopProducts(window: Window, limit = 10) {
  return prisma.$queryRaw<{ id: number; name: string; category: string; units: number; revenue: number }[]>`
    SELECT p.id, p.name, p.category,
           SUM(oi.quantity)::int                    AS units,
           SUM(oi.quantity * oi.unit_price)::float8 AS revenue
    FROM order_items oi
    JOIN orders o   ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE ${inWindow(window)}
    GROUP BY p.id, p.name, p.category
    ORDER BY revenue DESC, units DESC
    LIMIT ${limit}
  `;
}

export function querySalesByCategory(window: Window) {
  return prisma.$queryRaw<{ category: string; revenue: number; units: number; orders: number }[]>`
    SELECT p.category,
           SUM(oi.quantity * oi.unit_price)::float8 AS revenue,
           SUM(oi.quantity)::int                    AS units,
           COUNT(DISTINCT o.id)::int                AS orders
    FROM order_items oi
    JOIN orders o   ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE ${inWindow(window)}
    GROUP BY p.category
    ORDER BY revenue DESC
  `;
}

export async function queryCustomerCounts(window: Window) {
  const [row] = await prisma.$queryRaw<
    { total_customers: number; new_customers: number; active_customers: number; repeat_customers: number }[]
  >`
    WITH activity AS (
      SELECT o.customer_id, COUNT(*) AS orders
      FROM orders o
      WHERE ${inWindow(window)}
      GROUP BY o.customer_id
    )
    SELECT (SELECT COUNT(*) FROM customers WHERE created_at < ${window.end})::int AS total_customers,
           (SELECT COUNT(*) FROM customers
             WHERE created_at >= ${window.start} AND created_at < ${window.end})::int AS new_customers,
           (SELECT COUNT(*) FROM activity)::int                  AS active_customers,
           (SELECT COUNT(*) FROM activity WHERE orders > 1)::int AS repeat_customers
  `;
  return {
    totalCustomers: row.total_customers,
    newCustomers: row.new_customers,
    activeCustomers: row.active_customers,
    repeatCustomers: row.repeat_customers,
  };
}

export function queryTopCustomers(window: Window, limit = 5) {
  return prisma.$queryRaw<{ id: number; name: string; country: string; orders: number; revenue: number }[]>`
    SELECT c.id, c.name, c.country,
           COUNT(DISTINCT o.id)::int                AS orders,
           SUM(oi.quantity * oi.unit_price)::float8 AS revenue
    FROM customers c
    JOIN orders o       ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE ${inWindow(window)}
    GROUP BY c.id, c.name, c.country
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;
}

export function queryCustomersByCountry(window: Window) {
  return prisma.$queryRaw<{ country: string; customers: number; revenue: number }[]>`
    SELECT c.country,
           COUNT(DISTINCT c.id)::int                AS customers,
           SUM(oi.quantity * oi.unit_price)::float8 AS revenue
    FROM customers c
    JOIN orders o       ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE ${inWindow(window)}
    GROUP BY c.country
    ORDER BY revenue DESC
  `;
}
