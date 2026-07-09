import React from "react";
import { nextBadge } from "../../lib/streaks";

export default function StreakBar({ streak, points, todayPoints }) {
  const next = nextBadge(streak);
  return (
    <div style={wrapStyle}>
      <div style={statStyle}>
        <span className="font-display" style={numStyle}>{streak}</span>
        <span style={labelStyle}>day streak</span>
      </div>
      <div style={dividerStyle} />
      <div style={statStyle}>
        <span className="font-display" style={numStyle}>{points}</span>
        <span style={labelStyle}>total points</span>
      </div>
      <div style={dividerStyle} />
      <div style={statStyle}>
        <span className="font-display" style={numStyle}>{todayPoints}<span style={{ fontSize: 14, color: "var(--ink-faint)" }}>/6</span></span>
        <span style={labelStyle}>today</span>
      </div>
      {next && (
        <div style={nextBadgeStyle}>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            {next - streak} {next - streak === 1 ? "day" : "days"} to {next}-day badge
          </span>
        </div>
      )}
    </div>
  );
}

const wrapStyle = {
  display: "flex",
  alignItems: "center",
  background: "var(--card)",
  borderRadius: "var(--radius-md)",
  padding: "16px 8px",
  boxShadow: "var(--shadow-card)",
  position: "relative",
  flexWrap: "wrap",
};

const statStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

const numStyle = { fontSize: 26, fontWeight: 600, color: "var(--ink)", lineHeight: 1 };
const labelStyle = { fontSize: 11, color: "var(--ink-faint)", fontWeight: 500, letterSpacing: "0.02em" };
const dividerStyle = { width: 1, height: 32, background: "var(--hairline)" };
const nextBadgeStyle = {
  width: "100%",
  textAlign: "center",
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid var(--hairline)",
};
