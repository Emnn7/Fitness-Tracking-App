import React from "react";

const TABS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "planner", label: "Planner", icon: PlannerIcon },
  { key: "sprints", label: "Sprints", icon: SprintsIcon },
  { key: "insights", label: "Insights", icon: InsightsIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav style={navStyle} aria-label="Main navigation">
      {TABS.map((t) => {
        const isActive = active === t.key;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            aria-current={isActive ? "page" : undefined}
            style={{
              ...btnStyle,
              color: isActive ? "var(--ink)" : "var(--ink-faint)",
            }}
          >
            <Icon active={isActive} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, marginTop: 3 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const navStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  background: "var(--card)",
  borderTop: "1px solid var(--hairline)",
  padding: "8px 4px calc(8px + var(--safe-bottom))",
  zIndex: 50,
};

const btnStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "none",
  border: "none",
  padding: "4px 0",
  cursor: "pointer",
};

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 11L12 4l9 7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlannerIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </svg>
  );
}
function SprintsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 20l6-6M14 4l6 6-9 9-6-6 9-9z" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InsightsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V10M11 19V5M18 19v-7" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </svg>
  );
}
