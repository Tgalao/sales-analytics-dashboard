"use client";

type Props = {
  active?: boolean;
  label?: string | number;
  payload?: { value?: number | string }[];
  formatLabel?: (label: string) => string;
  formatValue: (value: number) => string;
  metric: string;
};

/** Shared hover tooltip for Recharts charts. */
export function ChartTooltip({ active, label, payload, formatLabel, formatValue, metric }: Props) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  const title = label === undefined ? "" : formatLabel ? formatLabel(String(label)) : String(label);

  return (
    <div className="tooltip">
      <div className="title">{title}</div>
      <div>
        {metric}: <span className="value">{formatValue(value)}</span>
      </div>
    </div>
  );
}
