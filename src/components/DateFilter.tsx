"use client";

import { addDays, toIsoDate } from "@/lib/dates";
import type { DateRange } from "@/lib/types";

type Preset = { id: string; label: string; range: (today: string, bounds: DateRange | null) => DateRange | null };

const PRESETS: Preset[] = [
  { id: "30d", label: "30 days", range: (today) => ({ from: addDays(today, -29), to: today }) },
  { id: "90d", label: "90 days", range: (today) => ({ from: addDays(today, -89), to: today }) },
  { id: "12m", label: "12 months", range: (today) => ({ from: addDays(today, -364), to: today }) },
  { id: "ytd", label: "Year to date", range: (today) => ({ from: `${today.slice(0, 4)}-01-01`, to: today }) },
  { id: "all", label: "All time", range: (_today, bounds) => bounds },
];

export function defaultRange(): DateRange {
  const today = toIsoDate(new Date());
  return { from: addDays(today, -364), to: today };
}

type Props = {
  range: DateRange;
  dataBounds: DateRange | null;
  onChange: (range: DateRange) => void;
};

export function DateFilter({ range, dataBounds, onChange }: Props) {
  const today = toIsoDate(new Date());

  return (
    <div className="filters">
      <div className="presets" role="group" aria-label="Date range presets">
        {PRESETS.map((preset) => {
          const presetRange = preset.range(today, dataBounds);
          const active = !!presetRange && presetRange.from === range.from && presetRange.to === range.to;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              disabled={!presetRange}
              onClick={() => presetRange && onChange(presetRange)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="date-inputs">
        <input
          type="date"
          aria-label="Start date"
          value={range.from}
          max={range.to}
          onChange={(e) => e.target.value && onChange({ from: e.target.value, to: range.to })}
        />
        <span>to</span>
        <input
          type="date"
          aria-label="End date"
          value={range.to}
          min={range.from}
          onChange={(e) => e.target.value && onChange({ from: range.from, to: e.target.value })}
        />
      </div>
    </div>
  );
}
