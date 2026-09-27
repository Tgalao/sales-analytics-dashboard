import { formatCurrency, formatNumber } from "@/lib/format";
import type { ProductSales } from "@/lib/types";

export function TopProducts({ products }: { products: ProductSales[] }) {
  const max = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <div className="card">
      <h2>Best-selling products</h2>
      <p className="subtitle">Top 10 by revenue</p>
      {products.length === 0 ? (
        <div className="empty">No sales in this period</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th className="num">Units</th>
                <th className="num">Revenue</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td className="muted">{index + 1}</td>
                  <td>{product.name}</td>
                  <td className="muted">{product.category}</td>
                  <td className="num">{formatNumber(product.units)}</td>
                  <td className="num">{formatCurrency(product.revenue)}</td>
                  <td style={{ width: "22%" }} aria-hidden="true">
                    <div className="inline-bar">
                      <span style={{ width: `${(product.revenue / max) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
