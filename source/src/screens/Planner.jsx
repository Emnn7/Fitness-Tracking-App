import React, { useState } from "react";
import HeatmapMonth from "../components/planner/HeatmapMonth";
import { ObjectiveCard, NewObjectiveForm } from "../components/planner/ObjectiveCard";
import WeekThemeEditor from "../components/planner/WeekThemeEditor";
import { TimeBlockList, NewTimeBlockForm } from "../components/planner/TimeBlockEditor";
import { useAppState, useAppDispatch, useDerived } from "../context/AppContext";
import { todayKey, monthKey } from "../lib/dates";

export default function Planner() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { currentWeekStart, currentWeekTheme } = useDerived();
  const [view, setView] = useState("month");

  const currentMonth = monthKey(todayKey());
  const monthObjectives = state.objectives.filter((o) => o.month === currentMonth);

  return (
    <div style={{ padding: "calc(20px + var(--safe-top)) 18px 100px" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 className="font-display" style={{ fontSize: 26, margin: 0 }}>Planner</h1>
      </header>

      <div style={toggleWrapStyle}>
        <button onClick={() => setView("month")} style={toggleBtnStyle(view === "month")}>Month</button>
        <button onClick={() => setView("week")} style={toggleBtnStyle(view === "week")}>Week</button>
      </div>

      {view === "month" ? (
        <>
          <Section title="Calendar">
            <HeatmapMonth monthAnchorKey={todayKey()} entriesByDate={state.entriesByDate} />
          </Section>

          <Section title="Monthly objectives">
            {monthObjectives.map((o) => (
              <ObjectiveCard
                key={o.id}
                objective={o}
                onUpdateProgress={(id, val) => dispatch({ type: "UPDATE_OBJECTIVE_PROGRESS", id, currentValue: val })}
                onDelete={(id) => dispatch({ type: "DELETE_OBJECTIVE", id })}
              />
            ))}
            <NewObjectiveForm
              defaultMonth={currentMonth}
              onCreate={(payload) => dispatch({ type: "CREATE_OBJECTIVE", ...payload })}
            />
          </Section>
        </>
      ) : (
        <>
          <Section title="Theme">
            <WeekThemeEditor
              weekStartKey={currentWeekStart}
              currentTheme={currentWeekTheme}
              onSetTheme={(weekStart, theme, suggestedBlocks) =>
                dispatch({ type: "SET_WEEKLY_THEME", weekStart, theme, suggestedBlocks })
              }
            />
          </Section>

          <Section title="Time blocks">
            <TimeBlockList
              blocks={state.timeBlocks}
              onDelete={(id) => dispatch({ type: "DELETE_TIME_BLOCK", id })}
            />
            <NewTimeBlockForm onCreate={(payload) => dispatch({ type: "CREATE_TIME_BLOCK", ...payload })} />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

const sectionTitleStyle = {
  fontSize: 13, fontWeight: 700, color: "var(--ink-soft)",
  textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 10px",
};

const toggleWrapStyle = {
  display: "flex", background: "var(--hairline)", borderRadius: "var(--radius-full)",
  padding: 3, marginBottom: 20, width: "fit-content",
};

function toggleBtnStyle(active) {
  return {
    padding: "7px 18px", borderRadius: "var(--radius-full)", border: "none",
    background: active ? "var(--card)" : "transparent",
    fontWeight: 700, fontSize: 13, cursor: "pointer",
    color: active ? "var(--ink)" : "var(--ink-faint)",
    boxShadow: active ? "var(--shadow-card)" : "none",
  };
}
