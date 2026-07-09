import React, { useState } from "react";
import { useAppDispatch } from "../context/AppContext";
import { todayKey, monthKey, weekStartKey } from "../lib/dates";

const THEME_TEMPLATES = ["Deep Work", "Recovery", "Launch Push", "Learning"];

export default function Onboarding() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [objectives, setObjectives] = useState([{ title: "", targetValue: 20, metricLabel: "sessions" }]);
  const [theme, setTheme] = useState(THEME_TEMPLATES[0]);
  const [privacy, setPrivacy] = useState("local-only");

  const steps = [
    <ReminderStep key="reminder" value={reminderTime} onChange={setReminderTime} />,
    <ObjectivesStep key="objectives" objectives={objectives} setObjectives={setObjectives} />,
    <ThemeStep key="theme" value={theme} onChange={setTheme} />,
    <PrivacyStep key="privacy" value={privacy} onChange={setPrivacy} />,
  ];

  function finish() {
    const validObjectives = objectives
      .filter((o) => o.title.trim())
      .map((o) => ({
        title: o.title.trim(),
        targetValue: Number(o.targetValue),
        metricLabel: o.metricLabel || "units",
        currentValue: 0,
        month: monthKey(todayKey()),
        createdAt: new Date().toISOString(),
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }));

    dispatch({
      type: "ONBOARD_COMPLETE",
      settings: { reminderTime, privacyMode: privacy },
      objectives: validObjectives,
      weeklyThemes: { [weekStartKey(todayKey())]: { theme, suggestedBlocks: [] } },
    });
  }

  return (
    <div style={wrapStyle}>
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "calc(40px + var(--safe-top))" }}>
        {steps[step]}
      </div>
      <div style={footerStyle}>
        <div style={dotsStyle}>
          {steps.map((_, i) => (
            <span key={i} style={{ ...dotStyle, background: i === step ? "var(--ink)" : "var(--hairline-strong)" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} style={backBtnStyle}>Back</button>
          )}
          <button
            onClick={() => (step < steps.length - 1 ? setStep((s) => s + 1) : finish())}
            style={nextBtnStyle}
          >
            {step < steps.length - 1 ? "Continue" : "Start tracking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderStep({ value, onChange }) {
  return (
    <StepShell
      title="When should we nudge you?"
      subtitle="Choose a daily reminder time. Since this is a browser-based app, the reminder shows as an in-app banner rather than a phone push notification."
    >
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...bigInputStyle, width: 160 }}
        aria-label="Reminder time"
      />
    </StepShell>
  );
}

function ObjectivesStep({ objectives, setObjectives }) {
  function update(i, patch) {
    setObjectives((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }
  function add() {
    if (objectives.length >= 3) return;
    setObjectives((prev) => [...prev, { title: "", targetValue: 20, metricLabel: "sessions" }]);
  }
  return (
    <StepShell title="Set 1–3 objectives" subtitle="What do you want to be true by the end of this month?">
      {objectives.map((o, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <input
            placeholder={`Objective ${i + 1}, e.g. Read more`}
            value={o.title}
            onChange={(e) => update(i, { title: e.target.value })}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input type="number" value={o.targetValue} onChange={(e) => update(i, { targetValue: e.target.value })} style={{ ...inputStyle, width: 80 }} aria-label="Target value" />
            <input placeholder="unit" value={o.metricLabel} onChange={(e) => update(i, { metricLabel: e.target.value })} style={{ ...inputStyle, flex: 1 }} aria-label="Unit" />
          </div>
        </div>
      ))}
      {objectives.length < 3 && (
        <button onClick={add} style={addLinkStyle}>+ Add another objective</button>
      )}
    </StepShell>
  );
}

function ThemeStep({ value, onChange }) {
  return (
    <StepShell title="Pick a theme for this week" subtitle="You can change this any time in the Planner.">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {THEME_TEMPLATES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              padding: "10px 16px", borderRadius: "var(--radius-full)",
              border: value === t ? "2px solid var(--work)" : "1px solid var(--hairline-strong)",
              background: value === t ? "var(--work-soft)" : "var(--card)",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function PrivacyStep({ value, onChange }) {
  return (
    <StepShell title="Your data, your device" subtitle="Choose how your data is handled.">
      <label style={radioRowStyle}>
        <input type="radio" name="privacy" checked={value === "local-only"} onChange={() => onChange("local-only")} />
        <div>
          <strong style={{ fontSize: 14 }}>Local only</strong>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", margin: "2px 0 0" }}>
            Everything stays on this device. Nothing is uploaded anywhere.
          </p>
        </div>
      </label>
      <label style={radioRowStyle}>
        <input type="radio" name="privacy" checked={value === "export-friendly"} onChange={() => onChange("export-friendly")} />
        <div>
          <strong style={{ fontSize: 14 }}>Local + export reminders</strong>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", margin: "2px 0 0" }}>
            Same as above, plus occasional nudges to back up your data via export.
          </p>
        </div>
      </label>
    </StepShell>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div style={{ padding: "0 22px" }}>
      <h1 className="font-display" style={{ fontSize: 26, margin: "0 0 8px" }}>{title}</h1>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "0 0 22px", lineHeight: 1.5 }}>{subtitle}</p>
      {children}
    </div>
  );
}

const wrapStyle = { height: "100dvh", display: "flex", flexDirection: "column", background: "var(--paper)" };
const footerStyle = { padding: "16px 22px calc(20px + var(--safe-bottom))", borderTop: "1px solid var(--hairline)", background: "var(--paper)" };
const dotsStyle = { display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 };
const dotStyle = { width: 7, height: 7, borderRadius: "50%" };
const backBtnStyle = { flex: 1, padding: "13px 0", borderRadius: "var(--radius-full)", border: "1px solid var(--hairline-strong)", background: "transparent", fontWeight: 600, fontSize: 15, cursor: "pointer" };
const nextBtnStyle = { flex: 2, padding: "13px 0", borderRadius: "var(--radius-full)", border: "none", background: "var(--ink)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" };
const bigInputStyle = { fontSize: 22, padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--hairline-strong)", textAlign: "center" };
const inputStyle = { width: "100%", padding: "11px 13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 14 };
const addLinkStyle = { border: "none", background: "none", color: "var(--work)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", padding: "6px 0" };
const radioRowStyle = { display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--hairline)", cursor: "pointer" };
