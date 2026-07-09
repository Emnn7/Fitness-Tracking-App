import React, { useState } from "react";

const MOOD_EMOJIS = ["😞", "😕", "😐", "🙂", "😄"];
const WORK_TAGS = ["Writing", "Entrepreneurial", "Admin", "Meetings"];
const EXERCISE_TYPES = ["Running", "Cycling", "Strength", "Yoga", "Walking", "Other"];
const MEDITATION_TYPES = ["Breathing", "Body scan", "Guided", "Silent", "Other"];

const CATEGORY_META = {
  mood: { label: "Mood", color: "var(--mood)", soft: "var(--mood-soft)" },
  exercise: { label: "Exercise", color: "var(--exercise)", soft: "var(--exercise-soft)" },
  work: { label: "Work", color: "var(--work)", soft: "var(--work-soft)" },
  meditation: { label: "Meditation", color: "var(--meditation)", soft: "var(--meditation-soft)" },
};

/**
 * category: 'mood' | 'exercise' | 'work' | 'meditation'
 * initialValue: existing payload for this category, or null
 * onSave(payload), onClose(), onClear() (optional, only when initialValue exists)
 */
export default function QuickLogSheet({ category, initialValue, onSave, onClose, onClear }) {
  const meta = CATEGORY_META[category];

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Log ${meta.label}`}
    >
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>
            Log {meta.label}
          </h2>
          <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>✕</button>
        </div>

        {category === "mood" && <MoodForm initial={initialValue} onSave={onSave} />}
        {category === "exercise" && <ExerciseForm initial={initialValue} onSave={onSave} />}
        {category === "work" && <WorkForm initial={initialValue} onSave={onSave} />}
        {category === "meditation" && <MeditationForm initial={initialValue} onSave={onSave} />}

        {initialValue && onClear && (
          <button onClick={onClear} style={clearBtnStyle}>
            Remove today's {meta.label.toLowerCase()} entry
          </button>
        )}
      </div>
    </div>
  );
}

function MoodForm({ initial, onSave }) {
  const [intensity, setIntensity] = useState(initial?.intensity ?? 3);
  const [note, setNote] = useState(initial?.note ?? "");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ intensity, emoji: MOOD_EMOJIS[intensity - 1], note }); }}>
      <Label>How are you feeling?</Label>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0 20px" }}>
        {MOOD_EMOJIS.map((emoji, i) => {
          const value = i + 1;
          const selected = intensity === value;
          return (
            <button
              type="button"
              key={value}
              onClick={() => setIntensity(value)}
              aria-pressed={selected}
              aria-label={`Mood level ${value} of 5`}
              style={{
                fontSize: 28,
                width: 48, height: 48,
                borderRadius: "50%",
                border: selected ? "2px solid var(--mood)" : "2px solid transparent",
                background: selected ? "var(--mood-soft)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {emoji}
            </button>
          );
        })}
      </div>
      <Label htmlFor="mood-note">Note (optional)</Label>
      <textarea
        id="mood-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything on your mind..."
        rows={2}
        style={textareaStyle}
        maxLength={140}
      />
      <SaveButton color="var(--mood)" />
    </form>
  );
}

function ExerciseForm({ initial, onSave }) {
  const [type, setType] = useState(initial?.type ?? EXERCISE_TYPES[0]);
  const [minutes, setMinutes] = useState(initial?.minutes ?? 30);
  const [intensity, setIntensity] = useState(initial?.intensity ?? 2);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ type, minutes: Number(minutes), intensity }); }}>
      <Label htmlFor="ex-type">Type</Label>
      <select id="ex-type" value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
        {EXERCISE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <Label htmlFor="ex-minutes">Minutes</Label>
      <NumberStepper id="ex-minutes" value={minutes} onChange={setMinutes} step={5} min={0} max={300} color="var(--exercise)" />

      <Label>Intensity</Label>
      <IntensityPicker value={intensity} onChange={setIntensity} color="var(--exercise)" />

      <SaveButton color="var(--exercise)" />
    </form>
  );
}

function WorkForm({ initial, onSave }) {
  const [tag, setTag] = useState(initial?.tag ?? WORK_TAGS[0]);
  const [focusedHours, setFocusedHours] = useState(initial?.focusedHours ?? 2);
  const [taskTitle, setTaskTitle] = useState(initial?.taskTitle ?? "");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ tag, focusedHours: Number(focusedHours), taskTitle }); }}>
      <Label htmlFor="work-tag">Category</Label>
      <select id="work-tag" value={tag} onChange={(e) => setTag(e.target.value)} style={selectStyle}>
        {WORK_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <Label htmlFor="work-hours">Focused hours</Label>
      <NumberStepper id="work-hours" value={focusedHours} onChange={setFocusedHours} step={0.5} min={0} max={16} color="var(--work)" decimal />

      <Label htmlFor="work-title">Task title (optional)</Label>
      <input
        id="work-title"
        type="text"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        placeholder="What did you work on?"
        style={inputStyle}
        maxLength={80}
      />

      <SaveButton color="var(--work)" />
    </form>
  );
}

function MeditationForm({ initial, onSave }) {
  const [minutes, setMinutes] = useState(initial?.minutes ?? 10);
  const [type, setType] = useState(initial?.type ?? MEDITATION_TYPES[0]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ minutes: Number(minutes), type }); }}>
      <Label htmlFor="med-minutes">Minutes</Label>
      <NumberStepper id="med-minutes" value={minutes} onChange={setMinutes} step={5} min={0} max={180} color="var(--meditation)" />

      <Label htmlFor="med-type">Type</Label>
      <select id="med-type" value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
        {MEDITATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <SaveButton color="var(--meditation)" />
    </form>
  );
}

function NumberStepper({ id, value, onChange, step = 1, min = 0, max = 999, color, decimal = false }) {
  const dec = (v) => Math.max(min, decimal ? Math.round((v - step) * 10) / 10 : v - step);
  const inc = (v) => Math.min(max, decimal ? Math.round((v + step) * 10) / 10 : v + step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 20px" }}>
      <button type="button" onClick={() => onChange(dec(value))} aria-label="Decrease" style={stepperBtnStyle(color)}>−</button>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...inputStyle, textAlign: "center", width: 72, margin: 0 }}
        inputMode="decimal"
      />
      <button type="button" onClick={() => onChange(inc(value))} aria-label="Increase" style={stepperBtnStyle(color)}>+</button>
    </div>
  );
}

function IntensityPicker({ value, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "8px 0 20px" }}>
      {[1, 2, 3].map((lvl) => (
        <button
          type="button"
          key={lvl}
          onClick={() => onChange(lvl)}
          aria-pressed={value === lvl}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "var(--radius-sm)",
            border: value === lvl ? `2px solid ${color}` : "1px solid var(--hairline-strong)",
            background: value === lvl ? color : "var(--card)",
            color: value === lvl ? "#fff" : "var(--ink-soft)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {lvl === 1 ? "Light" : lvl === 2 ? "Moderate" : "Intense"}
        </button>
      ))}
    </div>
  );
}

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 4 }}>
      {children}
    </label>
  );
}

function SaveButton({ color }) {
  return (
    <button
      type="submit"
      style={{
        width: "100%",
        padding: "14px 0",
        borderRadius: "var(--radius-full)",
        border: "none",
        background: color,
        color: "#fff",
        fontWeight: 700,
        fontSize: 16,
        cursor: "pointer",
        marginTop: 4,
      }}
    >
      Save
    </button>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(28,27,25,0.42)",
  display: "flex",
  alignItems: "flex-end",
  zIndex: 100,
};

const sheetStyle = {
  width: "100%",
  background: "var(--card)",
  borderTopLeftRadius: "var(--radius-lg)",
  borderTopRightRadius: "var(--radius-lg)",
  padding: "22px 20px calc(28px + var(--safe-bottom))",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-float)",
};

const closeBtnStyle = {
  border: "none",
  background: "var(--paper)",
  width: 32, height: 32,
  borderRadius: "50%",
  fontSize: 14,
  color: "var(--ink-soft)",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--hairline-strong)",
  fontSize: 15,
  marginBottom: 20,
  background: "var(--card)",
  color: "var(--ink)",
};

const textareaStyle = { ...inputStyle, resize: "none", fontFamily: "inherit" };
const selectStyle = { ...inputStyle, appearance: "auto" };

function stepperBtnStyle(color) {
  return {
    width: 40, height: 40,
    borderRadius: "50%",
    border: `1px solid ${color}`,
    background: "transparent",
    color,
    fontSize: 20,
    cursor: "pointer",
    lineHeight: 1,
  };
}

const clearBtnStyle = {
  width: "100%",
  marginTop: 8,
  padding: "10px 0",
  background: "transparent",
  border: "none",
  color: "var(--danger)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
