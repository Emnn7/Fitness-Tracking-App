import React, { useState, useMemo } from "react";
import TrendChart from "../components/insights/TrendChart";
import MoodCorrelation from "../components/insights/MoodCorrelation";
import { useAppState, useDerived } from "../context/AppContext";
import { lastNDateKeys } from "../lib/dates";
import { dayCountsForStreak, categoriesCompletedCount } from "../lib/streaks";

const RANGE_OPTIONS = [7, 30, 90];
const METRIC_OPTIONS = [
  { key: "exercise", label: "Exercise" },
  { key: "work", label: "Work" },
  { key: "meditation", label: "Meditation" },
  { key: "mood", label: "Mood" },
];

export default function Insights() {
  const state = useAppState();
  const { streak } = useDerived();
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState("exercise");

  const consistency = useMemo(() => computeConsistency(state.entriesByDate, range), [state.entriesByDate, range]);

  return (
    <div style={{ padding: "calc(20px + var(--safe-top)) 18px 100px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 className="font-display" style={{ fontSize: 26, margin: 0 }}>Insights</h1>
      </header>

      <Section title="Trends">
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {METRIC_OPTIONS.map((m) => (
            <Chip key={m.key} active={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</Chip>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {RANGE_OPTIONS.map((r) => (
            <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}d</Chip>
          ))}
        </div>
        <div style={cardStyle}>
          <TrendChart entriesByDate={state.entriesByDate} days={range} metric={metric} />
        </div>
      </Section>

      <Section title="Mood vs. activity">
        <div style={cardStyle}>
          <MoodCorrelation entriesByDate={state.entriesByDate} days={range} />
        </div>
      </Section>

      <Section title="Consistency">
        <div style={{ display: "flex", gap: 10 }}>
          <StatTile label={`Active days (last ${range})`} value={`${consistency.activeDays}/${range}`} />
          <StatTile label="Completion rate" value={`${consistency.completionRate}%`} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <StatTile label="Current streak" value={`${streak}d`} />
          <StatTile label="Best in range" value={`${consistency.bestStreakInRange}d`} />
        </div>
        <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 10 }}>
          Since this app runs entirely on your device, these numbers reflect your own
          activity over time rather than a multi-user DAU/MAU comparison.
        </p>
      </Section>
    </div>
  );
}

function computeConsistency(entriesByDate, range) {
  const keys = lastNDateKeys(range);
  let activeDays = 0;
  let totalCategoryCompletions = 0;
  let currentRun = 0;
  let bestRun = 0;

  for (const k of keys) {
    const rec = entriesByDate[k];
    const counted = dayCountsForStreak(rec);
    if (counted) {
      activeDays += 1;
      currentRun += 1;
      bestRun = Math.max(bestRun, currentRun);
    } else {
      currentRun = 0;
    }
    totalCategoryCompletions += categoriesCompletedCount(rec);
  }

  const maxPossible = range * 4;
  const completionRate = maxPossible > 0 ? Math.round((totalCategoryCompletions / maxPossible) * 100) : 0;

  return { activeDays, completionRate, bestStreakInRange: bestRun };
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ ...chipStyle, ...(active ? chipActiveStyle : {}) }}>
      {children}
    </button>
  );
}

function StatTile({ label, value }) {
  return (
    <div style={tileStyle}>
      <span className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)" }}>{value}</span>
      <span style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{label}</span>
    </div>
  );
}

const sectionTitleStyle = { fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 10px" };
const cardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, boxShadow: "var(--shadow-card)" };
const chipStyle = { padding: "6px 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--hairline-strong)", background: "var(--card)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", cursor: "pointer" };
const chipActiveStyle = { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" };
const tileStyle = { flex: 1, background: "var(--card)", borderRadius: "var(--radius-md)", padding: "14px 10px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", alignItems: "center" };
