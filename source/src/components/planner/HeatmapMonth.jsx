import React from "react";
import { fromDateKey, toDateKey, monthKey } from "../../lib/dates";
import { categoriesCompletedCount } from "../../lib/streaks";

/** monthAnchorKey: any date key within the month to display, e.g. "2026-06-15" */
export default function HeatmapMonth({ monthAnchorKey, entriesByDate, onDayTap }) {
  const anchor = fromDateKey(monthAnchorKey);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <div style={weekdayRowStyle}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={weekdayLabelStyle}>{d}</span>
        ))}
      </div>
      <div style={gridStyle}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = toDateKey(date);
          const rec = entriesByDate[key];
          const count = categoriesCompletedCount(rec);
          return (
            <button
              key={i}
              onClick={() => onDayTap?.(key)}
              aria-label={`${key}, ${count} of 4 categories logged`}
              style={{
                ...cellStyle,
                background: heatColor(count),
                color: count >= 3 ? "#fff" : "var(--ink)",
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}

function heatColor(count) {
  switch (count) {
    case 0: return "var(--hairline)";
    case 1: return "var(--exercise-soft)";
    case 2: return "var(--mood-soft)";
    case 3: return "var(--work)";
    case 4: return "var(--ink)";
    default: return "var(--hairline)";
  }
}

function Legend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11, color: "var(--ink-faint)" }}>
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(c), display: "inline-block" }} />
      ))}
      <span>More</span>
    </div>
  );
}

const weekdayRowStyle = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 };
const weekdayLabelStyle = { fontSize: 11, color: "var(--ink-faint)", textAlign: "center", fontWeight: 600 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 };
const cellStyle = {
  aspectRatio: "1",
  border: "none",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
