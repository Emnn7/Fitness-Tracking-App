import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState } from "../lib/storage";
import { makeId } from "../lib/id";
import { todayKey, weekStartKey, monthKey } from "../lib/dates";
import {
  computeStreak,
  canUseFreeze,
  canUseMonthlyGrace,
  pointsForDay,
  totalPoints,
  badgesEarned,
} from "../lib/streaks";

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ONBOARD_COMPLETE": {
      return {
        ...state,
        onboarded: true,
        settings: { ...state.settings, ...action.settings },
        objectives: [...state.objectives, ...(action.objectives || [])],
        weeklyThemes: { ...state.weeklyThemes, ...(action.weeklyThemes || {}) },
      };
    }

    // ---- POST /api/v1/daily-entry (create/update day) ----
    case "LOG_CATEGORY": {
      const { date, category, payload } = action;
      const existing = state.entriesByDate[date] || { date };
      const updated = {
        ...existing,
        [category]: payload,
        completedAt: { ...(existing.completedAt || {}), [category]: new Date().toISOString() },
      };
      return {
        ...state,
        entriesByDate: { ...state.entriesByDate, [date]: updated },
      };
    }
    case "UNLOG_CATEGORY": {
      const { date, category } = action;
      const existing = state.entriesByDate[date];
      if (!existing) return state;
      const updated = { ...existing, [category]: null };
      return { ...state, entriesByDate: { ...state.entriesByDate, [date]: updated } };
    }

    case "USE_FREEZE": {
      const { date } = action;
      if (!canUseFreeze(state.freezeDatesUsed, date)) return state;
      return { ...state, freezeDatesUsed: [...state.freezeDatesUsed, date] };
    }
    case "USE_MONTHLY_GRACE": {
      const { date } = action;
      if (!canUseMonthlyGrace(state.graceDatesUsed, date)) return state;
      return { ...state, graceDatesUsed: [...state.graceDatesUsed, date] };
    }

    // ---- POST /api/v1/objectives ----
    case "CREATE_OBJECTIVE": {
      const objective = {
        id: makeId(),
        title: action.title,
        metricLabel: action.metricLabel,
        targetValue: action.targetValue,
        currentValue: action.currentValue ?? 0,
        month: action.month || monthKey(todayKey()),
        createdAt: new Date().toISOString(),
      };
      return { ...state, objectives: [...state.objectives, objective] };
    }
    case "UPDATE_OBJECTIVE_PROGRESS": {
      return {
        ...state,
        objectives: state.objectives.map((o) =>
          o.id === action.id ? { ...o, currentValue: action.currentValue } : o
        ),
      };
    }
    case "DELETE_OBJECTIVE": {
      return { ...state, objectives: state.objectives.filter((o) => o.id !== action.id) };
    }

    case "SET_WEEKLY_THEME": {
      return {
        ...state,
        weeklyThemes: {
          ...state.weeklyThemes,
          [action.weekStart]: { theme: action.theme, suggestedBlocks: action.suggestedBlocks || [] },
        },
      };
    }

    // ---- POST /api/v1/sprints ----
    case "CREATE_SPRINT": {
      const sprint = {
        id: makeId(),
        title: action.title,
        startDate: action.startDate,
        endDate: action.endDate,
        tasks: action.tasks || [],
        createdAt: new Date().toISOString(),
      };
      return { ...state, sprints: [...state.sprints, sprint] };
    }
    case "ADD_SPRINT_TASK": {
      return {
        ...state,
        sprints: state.sprints.map((s) =>
          s.id === action.sprintId
            ? { ...s, tasks: [...s.tasks, { id: makeId(), title: action.title, done: false }] }
            : s
        ),
      };
    }
    case "TOGGLE_SPRINT_TASK": {
      return {
        ...state,
        sprints: state.sprints.map((s) =>
          s.id !== action.sprintId
            ? s
            : {
                ...s,
                tasks: s.tasks.map((t) => (t.id === action.taskId ? { ...t, done: !t.done } : t)),
              }
        ),
      };
    }
    case "DELETE_SPRINT": {
      return { ...state, sprints: state.sprints.filter((s) => s.id !== action.id) };
    }

    // ---- POST /api/v1/timeblocks ----
    case "CREATE_TIME_BLOCK": {
      const block = {
        id: makeId(),
        title: action.title,
        durationMinutes: action.durationMinutes,
        recurrence: action.recurrence || "once", // 'once' | 'daily' | 'weekly'
        schedule: action.schedule, // { dayOfWeek, time } or { date, time }
        createdAt: new Date().toISOString(),
      };
      return { ...state, timeBlocks: [...state.timeBlocks, block] };
    }
    case "DELETE_TIME_BLOCK": {
      return { ...state, timeBlocks: state.timeBlocks.filter((b) => b.id !== action.id) };
    }
    case "UPDATE_TIME_BLOCK": {
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      };
    }

    // ---- POST /api/v1/rewards/claim ----
    case "CLAIM_REWARD": {
      if (state.rewardsClaimed.includes(action.threshold)) return state;
      return { ...state, rewardsClaimed: [...state.rewardsClaimed, action.threshold] };
    }

    case "UPDATE_SETTINGS": {
      return { ...state, settings: { ...state.settings, ...action.patch } };
    }

    case "IMPORT_STATE": {
      return { ...action.state };
    }

    case "RESET_ALL": {
      return { ...action.freshState };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
  return ctx;
}

/** Derived values computed from state, memoized. */
export function useDerived() {
  const state = useAppState();

  return useMemo(() => {
    const streak = computeStreak(state.entriesByDate, {
      asOfKey: todayKey(),
      freezeDates: state.freezeDatesUsed,
    });
    const points = totalPoints(state.entriesByDate);
    const today = state.entriesByDate[todayKey()] || null;
    const todayPoints = pointsForDay(today);
    const earnedBadges = badgesEarned(streak);
    const unclaimedBadges = earnedBadges.filter((b) => !state.rewardsClaimed.includes(b));
    const currentWeekStart = weekStartKey(todayKey());
    const currentWeekTheme = state.weeklyThemes[currentWeekStart] || null;

    return {
      streak,
      points,
      today,
      todayPoints,
      earnedBadges,
      unclaimedBadges,
      currentWeekStart,
      currentWeekTheme,
    };
  }, [state]);
}
