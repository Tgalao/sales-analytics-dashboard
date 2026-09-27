import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { CustomerStats as Stats } from "@/lib/types";

export function CustomerStats({ stats }: { stats: Stats }) {
  const maxCountryRevenue = Math.max(...stats.byCountry.map((c) => c.revenue), 1);

  const tiles = [
    { label: "Total customers", value: formatNumber(stats.totalCustomers) },
    { label: "New customers", value: formatNumber(stats.newCustomers) },
    { label: "Active customers", value: formatNumber(stats.activeCustomers) },
    { label: "Repeat purchase rate", value: formatPercent(stats.repeatRate) },
    { label: "Revenue per customer", value: formatCurrency(stats.revenuePerCustomer) },
  ];

  return (
    <section className="card">
      <h2>Customer statistics</h2>
      <p className="subtitle">Active = placed at least one order in the period · Repeat = placed two or more</p>

      <div className="stat-row">
        {tiles.map((tile) => (
          <div key={tile.label}>
            <div className="value">{tile.value}</div>
            <div className="label">{tile.label}</div>
          </div>
        ))}
      </div>

      <div className="grid two-col" style={{ marginBottom: 0 }}>
        <div>
          <h3 className="section-label">Top customers</h3>
          {stats.topCustomers.length === 0 ? (
            <div className="empty">No customers in this period</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Country</th>
                    <th className="num">Orders</th>
                    <th className="num">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td className="muted">{customer.country}</td>
                      <td className="num">{formatNumber(customer.orders)}</td>
                      <td className="num">{formatCurrency(customer.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="section-label">Revenue by country</h3>
          {stats.byCountry.length === 0 ? (
            <div className="empty">No customers in this period</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th className="num">Customers</th>
                    <th className="num">Revenue</th>
                    <th aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {stats.byCountry.map((row) => (
                    <tr key={row.country}>
                      <td>{row.country}</td>
                      <td className="num">{formatNumber(row.customers)}</td>
                      <td className="num">{formatCurrency(row.revenue)}</td>
                      <td style={{ width: "30%" }} aria-hidden="true">
                        <div className="inline-bar">
                          <span style={{ width: `${(row.revenue / maxCountryRevenue) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
