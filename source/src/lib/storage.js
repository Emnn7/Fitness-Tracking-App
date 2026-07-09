const STORAGE_KEY = "habit_app_state_v1";

const DEFAULT_STATE = {
  schemaVersion: 1,
  onboarded: false,
  settings: {
    targets: {
      exercise: 30, // minutes
      work: 4, // focused hours
      meditation: 10, // minutes
    },
    colorblindMode: false,
    reminderTime: "20:00",
    graceHours: 12,
    weeklyThemeTemplate: null,
  },
  entriesByDate: {}, // dateKey -> dayRecord
  freezeDatesUsed: [], // array of dateKeys where a streak freeze was applied
  graceDatesUsed: [], // array of dateKeys where monthly grace was applied
  objectives: [], // { id, title, metricLabel, targetValue, currentValue, month, createdAt }
  weeklyThemes: {}, // weekStartKey -> { theme, suggestedBlocks: [] }
  sprints: [], // { id, title, startDate, endDate, tasks: [{id, title, done}], createdAt }
  timeBlocks: [], // { id, title, durationMinutes, recurrence, schedule: {dayOfWeek, time} or {date,time}, createdAt }
  rewardsClaimed: [], // badge thresholds claimed, e.g. [7, 21]
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // Shallow-merge with defaults so new fields introduced in updates don't break old data.
    return {
      ...structuredCloneSafe(DEFAULT_STATE),
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
  } catch (e) {
    console.error("Failed to load state, resetting to defaults.", e);
    return structuredCloneSafe(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Failed to save state.", e);
    return false;
  }
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function exportAsJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function exportEntriesAsCSV(entriesByDate, { days = 365 } = {}) {
  const keys = Object.keys(entriesByDate).sort();
  const limited = days ? keys.slice(-days) : keys;
  const header = [
    "date",
    "mood_intensity", "mood_emoji", "mood_note",
    "exercise_type", "exercise_minutes", "exercise_intensity",
    "work_tag", "work_focused_hours", "work_task_title",
    "meditation_minutes", "meditation_type",
  ];
  const rows = limited.map((date) => {
    const r = entriesByDate[date] || {};
    const m = r.mood || {};
    const e = r.exercise || {};
    const w = r.work || {};
    const md = r.meditation || {};
    return [
      date,
      m.intensity ?? "", m.emoji ?? "", csvEscape(m.note ?? ""),
      csvEscape(e.type ?? ""), e.minutes ?? "", e.intensity ?? "",
      csvEscape(w.tag ?? ""), w.focusedHours ?? "", csvEscape(w.taskTitle ?? ""),
      md.minutes ?? "", csvEscape(md.type ?? ""),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function csvEscape(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadFile(filename, content, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
