# Sales Analytics Dashboard

A sales analytics dashboard for a fictional online store, with data on customers, products, orders and payments.

## Stack

- PostgreSQL
- Next.js 15 (App Router)
- TypeScript
- Prisma (schema, migrations, seed) + raw SQL aggregation queries
- Recharts

## Data model

- Customers
- Products
- Orders
- OrderItems
- Payments

Defined in [`prisma/schema.prisma`](prisma/schema.prisma). The seed script ([`prisma/seed.ts`](prisma/seed.ts)) generates a deterministic dataset: 250 customers, 29 products in 6 categories and about 25 months of orders, with growth over time and a November/December peak.

## Data flow

Database -> SQL -> API -> Data processing -> Dashboard

| Step | Where |
| --- | --- |
| SQL aggregation queries | [`src/lib/queries.ts`](src/lib/queries.ts) |
| Data processing (gap filling, shares, period-over-period change) | [`src/lib/analytics.ts`](src/lib/analytics.ts) |
| API | [`src/app/api/analytics/route.ts`](src/app/api/analytics/route.ts) |
| Dashboard | [`src/components/`](src/components/) |

Revenue is the sum of `quantity * unit_price` over order items, excluding cancelled orders.

## Dashboard features

- [x] Revenue
- [x] Orders
- [x] Average order value
- [x] Best-selling products
- [x] Sales by month
- [x] Sales by category
- [x] Customer statistics
- [x] Date filters

Every KPI also shows the change versus the previous period of the same length. The selected date range is kept in the URL (`?from=…&to=…`), so filtered views can be shared.

## API

`GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD`

Both dates are inclusive and default to the last 12 months. Returns the summary KPIs, period-over-period change, sales by month, top products, sales by category and customer statistics.

## What this project demonstrates

SQL + databases + data analysis + dashboards

## Development roadmap

1. Idea
2. Planning
3. Database / Architecture
4. Development
5. Git / Branches
6. Testing
7. Deployment
8. README
9. Screenshots
10. Demo

## Running locally

Requires Node.js 18.18+ and a PostgreSQL database (local, Docker, or a hosted one such as Neon or Supabase). Set `DATABASE_URL` in `.env`.

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed   # only needed if migrate dev did not seed automatically
npm run dev
```

Then open http://localhost:3000.
