import React, { useState } from "react";
import SprintCard from "../components/sprints/SprintCard";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { todayKey, addDays } from "../lib/dates";

export default function Sprints() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div style={{ padding: "calc(20px + var(--safe-top)) 18px 100px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 className="font-display" style={{ fontSize: 26, margin: 0 }}>Sprints</h1>
      </header>

      {state.sprints.length === 0 && !formOpen && (
        <p style={{ fontSize: 13.5, color: "var(--ink-faint)", marginBottom: 14 }}>
          Sprints help you focus on a 2–4 week push toward something specific.
        </p>
      )}

      {state.sprints
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((s) => (
          <SprintCard
            key={s.id}
            sprint={s}
            onToggleTask={(sprintId, taskId) => dispatch({ type: "TOGGLE_SPRINT_TASK", sprintId, taskId })}
            onAddTask={(sprintId, title) => dispatch({ type: "ADD_SPRINT_TASK", sprintId, title })}
            onDelete={(id) => dispatch({ type: "DELETE_SPRINT", id })}
          />
        ))}

      {formOpen ? (
        <NewSprintForm
          onCreate={(payload) => {
            dispatch({ type: "CREATE_SPRINT", ...payload });
            setFormOpen(false);
          }}
          onCancel={() => setFormOpen(false)}
        />
      ) : (
        <button onClick={() => setFormOpen(true)} style={addBtnStyle}>+ New sprint</button>
      )}
    </div>
  );
}

function NewSprintForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [weeks, setWeeks] = useState(2);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const start = todayKey();
        const end = addDays(start, weeks * 7);
        onCreate({ title: title.trim(), startDate: start, endDate: end, tasks: [] });
      }}
      style={formCardStyle}
    >
      <input autoFocus placeholder="Sprint title, e.g. Launch v2" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      <div>
        <label style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600 }}>Length</label>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[2, 3, 4].map((w) => (
            <button
              type="button"
              key={w}
              onClick={() => setWeeks(w)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: "var(--radius-sm)",
                border: weeks === w ? "2px solid var(--work)" : "1px solid var(--hairline-strong)",
                background: weeks === w ? "var(--work-soft)" : "var(--card)",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              {w} weeks
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
        <button type="submit" style={saveBtnStyle}>Create sprint</button>
      </div>
    </form>
  );
}

const addBtnStyle = {
  width: "100%", padding: "12px 0", borderRadius: "var(--radius-md)",
  border: "1.5px dashed var(--hairline-strong)", background: "transparent",
  color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
const formCardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-card)" };
const inputStyle = { padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 14 };
const cancelBtnStyle = { flex: 1, padding: "10px 0", borderRadius: "var(--radius-full)", border: "1px solid var(--hairline-strong)", background: "transparent", cursor: "pointer", fontWeight: 600 };
const saveBtnStyle = { flex: 2, padding: "10px 0", borderRadius: "var(--radius-full)", border: "none", background: "var(--ink)", color: "#fff", cursor: "pointer", fontWeight: 700 };
