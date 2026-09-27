import { formatChange } from "@/lib/format";

type Props = { label: string; value: string; change: number | null };

export function KpiCard({ label, value, change }: Props) {
  const direction = change === null || change === 0 ? null : change > 0 ? "up" : "down";

  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-change">
        {direction ? (
          <span className={direction}>
            {direction === "up" ? "▲" : "▼"} {formatChange(change)}
          </span>
        ) : (
          formatChange(change)
        )}{" "}
        vs previous period
      </div>
    </div>
  );
}
