import React, { useRef } from "react";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { exportAsJSON, exportEntriesAsCSV, downloadFile } from "../lib/storage";
import { canUseFreeze, canUseMonthlyGrace } from "../lib/streaks";
import { todayKey } from "../lib/dates";

export default function Settings() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);

  const freezeOk = canUseFreeze(state.freezeDatesUsed, todayKey());
  const graceOk = canUseMonthlyGrace(state.graceDatesUsed, todayKey());

  function updateTarget(category, value) {
    dispatch({ type: "UPDATE_SETTINGS", patch: { targets: { ...state.settings.targets, [category]: Number(value) } } });
  }

  function handleExportJSON() {
    downloadFile(`habit-data-${todayKey()}.json`, exportAsJSON(state), "application/json");
  }
  function handleExportCSV() {
    downloadFile(`habit-entries-${todayKey()}.csv`, exportEntriesAsCSV(state.entriesByDate, { days: 365 }), "text/csv");
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (window.confirm("Import this data? This will replace everything currently stored on this device.")) {
          dispatch({ type: "IMPORT_STATE", state: parsed });
        }
      } catch (err) {
        window.alert("That file couldn't be read as valid app data.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ padding: "calc(20px + var(--safe-top)) 18px 100px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 className="font-display" style={{ fontSize: 26, margin: 0 }}>Settings</h1>
      </header>

      <Section title="Daily targets">
        <TargetRow label="Exercise" unit="minutes" value={state.settings.targets.exercise} onChange={(v) => updateTarget("exercise", v)} color="var(--exercise)" />
        <TargetRow label="Focused work" unit="hours" value={state.settings.targets.work} onChange={(v) => updateTarget("work", v)} color="var(--work)" step={0.5} />
        <TargetRow label="Meditation" unit="minutes" value={state.settings.targets.meditation} onChange={(v) => updateTarget("meditation", v)} color="var(--meditation)" />
      </Section>

      <Section title="Streak protection">
        <StatusRow label="Streak freeze (1 per 30 days)" available={freezeOk} />
        <StatusRow label="Monthly grace day" available={graceOk} />
        <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8 }}>
          Grace window: log up to {state.settings.graceHours} hours after midnight and it still counts for the previous day.
        </p>
      </Section>

      <Section title="Accessibility">
        <ToggleRow
          label="Colorblind-safe palette"
          checked={state.settings.colorblindMode}
          onChange={(checked) => {
            dispatch({ type: "UPDATE_SETTINGS", patch: { colorblindMode: checked } });
            document.documentElement.setAttribute("data-colorblind", checked ? "true" : "false");
          }}
        />
        <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>
          This app supports VoiceOver and other screen readers throughout — all rings, cards, and buttons have descriptive labels.
        </p>
      </Section>

      <Section title="Your data">
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12 }}>
          Everything is stored locally on this device. Nothing is sent anywhere unless you export it yourself.
        </p>
        <button onClick={handleExportCSV} style={actionBtnStyle}>Export CSV (last 365 days)</button>
        <button onClick={handleExportJSON} style={actionBtnStyle}>Export full backup (JSON)</button>
        <button onClick={() => fileInputRef.current?.click()} style={actionBtnStyle}>Import backup</button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} style={{ display: "none" }} />
      </Section>

      <Section title="Reset">
        <button
          onClick={() => {
            if (window.confirm("This will permanently erase all data on this device. Continue?")) {
              dispatch({
                type: "RESET_ALL",
                freshState: {
                  schemaVersion: 1,
                  onboarded: true,
                  settings: state.settings,
                  entriesByDate: {},
                  freezeDatesUsed: [],
                  graceDatesUsed: [],
                  objectives: [],
                  weeklyThemes: {},
                  sprints: [],
                  timeBlocks: [],
                  rewardsClaimed: [],
                },
              });
            }
          }}
          style={dangerBtnStyle}
        >
          Erase all data
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 10px" }}>
        {title}
      </h2>
      <div style={cardStyle}>{children}</div>
    </section>
  );
}

function TargetRow({ label, unit, value, onChange, color, step = 1 }) {
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 64, padding: "6px 8px", borderRadius: 8, border: `1.5px solid ${color}`, textAlign: "center", fontSize: 14 }}
          aria-label={`${label} target in ${unit}`}
        />
        <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{unit}</span>
      </div>
    </div>
  );
}

function StatusRow({ label, available }) {
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: available ? "var(--success)" : "var(--ink-faint)" }}>
        {available ? "Available" : "Used"}
      </span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={rowStyle}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
          background: checked ? "var(--work)" : "var(--hairline-strong)", position: "relative", transition: "background 0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3, width: 20, height: 20,
          borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

const cardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 6, boxShadow: "var(--shadow-card)" };
const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 10px" };
const actionBtnStyle = {
  width: "100%", textAlign: "left", padding: "12px 10px", borderRadius: "var(--radius-sm)",
  border: "none", background: "none", fontSize: 14, fontWeight: 600, color: "var(--work)", cursor: "pointer",
};
const dangerBtnStyle = {
  width: "100%", textAlign: "center", padding: "12px 10px", borderRadius: "var(--radius-sm)",
  border: "none", background: "none", fontSize: 14, fontWeight: 700, color: "var(--danger)", cursor: "pointer",
};
