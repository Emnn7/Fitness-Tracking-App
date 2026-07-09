import React, { useState } from "react";
import Burndown from "./Burndown";

export default function SprintCard({ sprint, onToggleTask, onAddTask, onDelete }) {
  const [newTask, setNewTask] = useState("");
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{sprint.title}</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-faint)" }}>
            {sprint.startDate} → {sprint.endDate}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setExpanded((e) => !e)} style={iconBtnStyle} aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? "−" : "+"}
          </button>
          <button onClick={() => onDelete(sprint.id)} style={iconBtnStyle} aria-label="Delete sprint">✕</button>
        </div>
      </div>

      {expanded && (
        <>
          <div style={{ margin: "12px 0" }}>
            <Burndown sprint={sprint} />
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {sprint.tasks.map((t) => (
              <li key={t.id} style={taskRowStyle}>
                <button
                  onClick={() => onToggleTask(sprint.id, t.id)}
                  aria-pressed={t.done}
                  aria-label={`Mark "${t.title}" as ${t.done ? "not done" : "done"}`}
                  style={{ ...checkboxStyle, background: t.done ? "var(--work)" : "transparent" }}
                >
                  {t.done && "✓"}
                </button>
                <span style={{ fontSize: 13.5, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--ink-faint)" : "var(--ink)" }}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTask.trim()) return;
              onAddTask(sprint.id, newTask.trim());
              setNewTask("");
            }}
            style={{ display: "flex", gap: 6, marginTop: 8 }}
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task"
              style={taskInputStyle}
            />
            <button type="submit" style={addTaskBtnStyle}>Add</button>
          </form>
        </>
      )}
    </div>
  );
}

const cardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, boxShadow: "var(--shadow-card)", marginBottom: 14 };
const iconBtnStyle = { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--hairline-strong)", background: "var(--paper)", cursor: "pointer", fontSize: 14, color: "var(--ink-soft)" };
const taskRowStyle = { display: "flex", alignItems: "center", gap: 10, padding: "7px 0" };
const checkboxStyle = { width: 20, height: 20, borderRadius: 6, border: "1.5px solid var(--work)", color: "#fff", fontSize: 12, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" };
const taskInputStyle = { flex: 1, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 13 };
const addTaskBtnStyle = { padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" };
