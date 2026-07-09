import React from "react";

const CARD_DEFS = [
  { key: "mood", label: "Mood", color: "var(--mood)", soft: "var(--mood-soft)" },
  { key: "exercise", label: "Exercise", color: "var(--exercise)", soft: "var(--exercise-soft)" },
  { key: "work", label: "Work", color: "var(--work)", soft: "var(--work-soft)" },
  { key: "meditation", label: "Meditation", color: "var(--meditation)", soft: "var(--meditation-soft)" },
];

function summaryFor(category, entry) {
  if (!entry) return "Tap to log";
  switch (category) {
    case "mood": return `${entry.emoji ?? ""} ${["", "Very low", "Low", "Okay", "Good", "Great"][entry.intensity] || ""}`.trim();
    case "exercise": return `${entry.minutes}min · ${entry.type}`;
    case "work": return `${entry.focusedHours}h · ${entry.tag}`;
    case "meditation": return `${entry.minutes}min · ${entry.type}`;
    default: return "Logged";
  }
}

export default function QuickLogCards({ today, onCardTap }) {
  return (
    <div style={gridStyle}>
      {CARD_DEFS.map((c) => {
        const entry = today?.[c.key];
        const done = Boolean(entry);
        return (
          <button
            key={c.key}
            onClick={() => onCardTap(c.key)}
            style={{
              ...cardStyle,
              borderColor: done ? c.color : "var(--hairline)",
              background: done ? c.soft : "var(--card)",
            }}
            aria-label={`${c.label}: ${summaryFor(c.key, entry)}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{c.label}</span>
              {done && (
                <span style={{ ...checkStyle, background: c.color }} aria-hidden="true">✓</span>
              )}
            </div>
            <span style={{ fontSize: 12.5, color: done ? "var(--ink-soft)" : "var(--ink-faint)", marginTop: 6 }}>
              {summaryFor(c.key, entry)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const cardStyle = {
  textAlign: "left",
  padding: "14px 14px 16px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--hairline)",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  transition: "background 0.2s ease, border-color 0.2s ease",
};

const checkStyle = {
  width: 18, height: 18,
  borderRadius: "50%",
  color: "#fff",
  fontSize: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
