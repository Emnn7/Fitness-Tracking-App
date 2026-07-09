import React, { useState } from "react";

export function ObjectiveCard({ objective, onUpdateProgress, onDelete }) {
  const pct = objective.targetValue > 0 ? Math.min(100, Math.round((objective.currentValue / objective.targetValue) * 100)) : 0;
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{objective.title}</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ink-faint)" }}>
            {objective.currentValue} / {objective.targetValue} {objective.metricLabel}
          </p>
        </div>
        <button onClick={() => onDelete(objective.id)} aria-label="Delete objective" style={deleteBtnStyle}>✕</button>
      </div>
      <div style={trackStyle}>
        <div style={{ ...fillStyle, width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={() => onUpdateProgress(objective.id, Math.max(0, objective.currentValue - 1))} style={stepBtnStyle}>−</button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, alignSelf: "center" }}>{pct}%</span>
        <button onClick={() => onUpdateProgress(objective.id, objective.currentValue + 1)} style={stepBtnStyle}>+</button>
      </div>
    </div>
  );
}

export function NewObjectiveForm({ onCreate, defaultMonth }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [metricLabel, setMetricLabel] = useState("sessions");
  const [targetValue, setTargetValue] = useState(20);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={addBtnStyle}>+ New monthly objective</button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate({ title: title.trim(), metricLabel, targetValue: Number(targetValue), month: defaultMonth });
        setTitle(""); setOpen(false);
      }}
      style={formCardStyle}
    >
      <input
        autoFocus
        placeholder="Objective title, e.g. Read more"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          style={{ ...inputStyle, width: 80 }}
          aria-label="Target value"
        />
        <input
          placeholder="unit, e.g. books"
          value={metricLabel}
          onChange={(e) => setMetricLabel(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
          aria-label="Metric label"
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setOpen(false)} style={cancelBtnStyle}>Cancel</button>
        <button type="submit" style={saveBtnStyle}>Add objective</button>
      </div>
    </form>
  );
}

const cardStyle = {
  background: "var(--card)",
  borderRadius: "var(--radius-md)",
  padding: 14,
  boxShadow: "var(--shadow-card)",
  marginBottom: 10,
};
const trackStyle = { height: 8, background: "var(--hairline)", borderRadius: 4, marginTop: 10, overflow: "hidden" };
const fillStyle = { height: "100%", background: "var(--work)", borderRadius: 4, transition: "width 0.4s ease" };
const deleteBtnStyle = { border: "none", background: "none", color: "var(--ink-faint)", cursor: "pointer", fontSize: 13 };
const stepBtnStyle = { width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--hairline-strong)", background: "var(--paper)", cursor: "pointer", fontSize: 16 };
const addBtnStyle = {
  width: "100%", padding: "12px 0", borderRadius: "var(--radius-md)",
  border: "1.5px dashed var(--hairline-strong)", background: "transparent",
  color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 10,
};
const formCardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 10, display: "flex", flexDirection: "column", gap: 10, boxShadow: "var(--shadow-card)" };
const inputStyle = { padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 14 };
const cancelBtnStyle = { flex: 1, padding: "10px 0", borderRadius: "var(--radius-full)", border: "1px solid var(--hairline-strong)", background: "transparent", cursor: "pointer", fontWeight: 600 };
const saveBtnStyle = { flex: 2, padding: "10px 0", borderRadius: "var(--radius-full)", border: "none", background: "var(--ink)", color: "#fff", cursor: "pointer", fontWeight: 700 };
