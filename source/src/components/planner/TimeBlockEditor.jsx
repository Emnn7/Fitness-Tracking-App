import React, { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimeBlockList({ blocks, onDelete }) {
  if (blocks.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--ink-faint)", padding: "8px 0" }}>No time blocks scheduled yet.</p>;
  }
  // group by day of week for weekly recurrence, otherwise show under "Once"
  const byDay = {};
  for (const b of blocks) {
    const key = b.schedule?.dayOfWeek != null ? DAYS[b.schedule.dayOfWeek] : (b.schedule?.date || "Once");
    byDay[key] = byDay[key] || [];
    byDay[key].push(b);
  }
  return (
    <div>
      {Object.entries(byDay).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 14 }}>
          <p style={dayLabelStyle}>{day}</p>
          {items
            .sort((a, b) => (a.schedule?.time || "").localeCompare(b.schedule?.time || ""))
            .map((b) => (
              <div key={b.id} style={blockRowStyle}>
                <div>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{b.title}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 8 }}>
                    {b.schedule?.time} · {b.durationMinutes}min
                  </span>
                </div>
                <button onClick={() => onDelete(b.id)} aria-label={`Delete ${b.title}`} style={deleteStyle}>✕</button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export function NewTimeBlockForm({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [recurrence, setRecurrence] = useState("weekly");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [time, setTime] = useState("09:00");

  if (!open) {
    return <button onClick={() => setOpen(true)} style={addBtnStyle}>+ New time block</button>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate({
          title: title.trim(),
          durationMinutes: Number(duration),
          recurrence,
          schedule: recurrence === "weekly" ? { dayOfWeek: Number(dayOfWeek), time } : { date: null, time },
        });
        setTitle(""); setOpen(false);
      }}
      style={formCardStyle}
    >
      <input autoFocus placeholder="Block title, e.g. Morning run" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      <div style={{ display: "flex", gap: 8 }}>
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ ...inputStyle, width: 90 }} aria-label="Duration in minutes" />
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          <option value="weekly">Repeats weekly</option>
          <option value="daily">Repeats daily</option>
          <option value="once">Once</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setOpen(false)} style={cancelBtnStyle}>Cancel</button>
        <button type="submit" style={saveBtnStyle}>Schedule</button>
      </div>
    </form>
  );
}

const dayLabelStyle = { fontSize: 12, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 6px" };
const blockRowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: "var(--card)", borderRadius: "var(--radius-sm)", padding: "10px 12px", marginBottom: 6,
  boxShadow: "var(--shadow-card)",
};
const deleteStyle = { border: "none", background: "none", color: "var(--ink-faint)", cursor: "pointer" };
const addBtnStyle = {
  width: "100%", padding: "12px 0", borderRadius: "var(--radius-md)",
  border: "1.5px dashed var(--hairline-strong)", background: "transparent",
  color: "var(--ink-soft)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 10,
};
const formCardStyle = { background: "var(--card)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 10, display: "flex", flexDirection: "column", gap: 10, boxShadow: "var(--shadow-card)" };
const inputStyle = { padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--hairline-strong)", fontSize: 14 };
const cancelBtnStyle = { flex: 1, padding: "10px 0", borderRadius: "var(--radius-full)", border: "1px solid var(--hairline-strong)", background: "transparent", cursor: "pointer", fontWeight: 600 };
const saveBtnStyle = { flex: 2, padding: "10px 0", borderRadius: "var(--radius-full)", border: "none", background: "var(--ink)", color: "#fff", cursor: "pointer", fontWeight: 700 };
