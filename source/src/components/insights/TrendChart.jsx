import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { lastNDateKeys } from "../../lib/dates";

const SERIES_DEFS = {
  exercise: { label: "Exercise (min)", color: "var(--exercise)", extract: (r) => r?.exercise?.minutes ?? null },
  work: { label: "Focused work (hrs)", color: "var(--work)", extract: (r) => r?.work?.focusedHours ?? null },
  meditation: { label: "Meditation (min)", color: "var(--meditation)", extract: (r) => r?.meditation?.minutes ?? null },
  mood: { label: "Mood (1-5)", color: "var(--mood)", extract: (r) => r?.mood?.intensity ?? null },
};

export default function TrendChart({ entriesByDate, days, metric }) {
  const def = SERIES_DEFS[metric];
  const keys = lastNDateKeys(days);
  const data = keys.map((k) => ({
    date: k.slice(5),
    value: def.extract(entriesByDate[k]),
  }));

  return (
    <div style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="var(--hairline)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--ink-faint)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--hairline)" }}
            interval={days > 30 ? Math.floor(days / 8) : Math.floor(days / 7)}
          />
          <YAxis tick={{ fontSize: 10, fill: "var(--ink-faint)" }} tickLine={false} axisLine={false} width={26} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--hairline)" }} />
          <Line type="monotone" dataKey="value" stroke={def.color} strokeWidth={2.5} dot={{ r: 3, fill: def.color, strokeWidth: 0 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { SERIES_DEFS };
