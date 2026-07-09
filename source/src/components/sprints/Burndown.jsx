import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { diffDays, todayKey, addDays } from "../../lib/dates";

/** Ideal vs actual burndown of remaining (not-done) tasks across the sprint's date range. */
export default function Burndown({ sprint }) {
  const totalTasks = sprint.tasks.length;
  if (totalTasks === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Add tasks to see a burndown.</p>;
  }
  const spanDays = Math.max(1, diffDays(sprint.startDate, sprint.endDate));
  const today = todayKey();
  const elapsedDays = Math.min(spanDays, Math.max(0, diffDays(sprint.startDate, today)));

  const doneCount = sprint.tasks.filter((t) => t.done).length;
  const remainingActual = totalTasks - doneCount;

  const data = [];
  for (let i = 0; i <= spanDays; i++) {
    const idealRemaining = Math.max(0, totalTasks - (totalTasks / spanDays) * i);
    const point = { day: i, ideal: Math.round(idealRemaining * 10) / 10 };
    if (i <= elapsedDays) {
      // simple linear interpolation isn't accurate for actual history without timestamps,
      // so we just show the current actual remaining count up to "today" as a flat reference,
      // and let the ideal line communicate the target pace.
      point.actual = i === elapsedDays ? remainingActual : null;
    }
    data.push(point);
  }

  const pctComplete = Math.round((doneCount / totalTasks) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{doneCount}/{totalTasks} tasks done</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--work)" }}>{pctComplete}%</span>
      </div>
      <div style={{ width: "100%", height: 140 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--hairline)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--ink-faint)" }} tickLine={false} axisLine={{ stroke: "var(--hairline)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--ink-faint)" }} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--hairline)" }} />
            <Line type="monotone" dataKey="ideal" stroke="var(--hairline-strong)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" stroke="var(--work)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
