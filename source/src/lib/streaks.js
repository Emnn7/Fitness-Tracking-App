import { addDays, diffDays, todayKey } from "./dates";

export const CATEGORIES = ["mood", "exercise", "work", "meditation"];

export const BADGE_THRESHOLDS = [7, 21, 60, 180];

export const POINTS_PER_CATEGORY = 1;
export const ALL_FOUR_BONUS = 3;
export const DAILY_POINTS_CAP = 6;

export const DEFAULT_GRACE_HOURS = 12;
export const FREEZE_WINDOW_DAYS = 30;
export const MONTHLY_GRACE_DAYS = 1;

/**
 * A "day record" looks like:
 * {
 *   date: "2026-06-28",
 *   mood: { intensity, emoji, note } | null,
 *   exercise: { type, minutes, intensity } | null,
 *   work: { tag, focusedHours, taskTitle } | null,
 *   meditation: { minutes, type } | null,
 *   completedAt: { mood: isoString, exercise: ..., ... } // when each category was logged
 *   freezeUsed: boolean,
 *   graceUsed: boolean
 * }
 */

/** True if a given category has a logged entry for that day. */
export function categoryCompleted(dayRecord, category) {
  return Boolean(dayRecord && dayRecord[category]);
}

/** Count of categories completed (0-4) for a day. */
export function categoriesCompletedCount(dayRecord) {
  if (!dayRecord) return 0;
  return CATEGORIES.reduce((n, c) => n + (categoryCompleted(dayRecord, c) ? 1 : 0), 0);
}

/** True if ANY category was completed — this is what counts a day toward the streak. */
export function dayCountsForStreak(dayRecord) {
  return categoriesCompletedCount(dayRecord) > 0;
}

/**
 * Points for a single day: 1 per completed category, +3 bonus if all four done,
 * capped at DAILY_POINTS_CAP (6). 4 categories + bonus = 4 + 3 = 7 uncapped, so the
 * cap of 6 is the binding constraint when all four are completed in one day.
 */
export function pointsForDay(dayRecord) {
  const n = categoriesCompletedCount(dayRecord);
  let points = n * POINTS_PER_CATEGORY;
  if (n === CATEGORIES.length) points += ALL_FOUR_BONUS;
  return Math.min(points, DAILY_POINTS_CAP);
}

/**
 * Computes the current streak (consecutive days counting backward from `asOfKey`,
 * default today) given a map of dateKey -> dayRecord, a list of freeze dateKeys
 * already applied, and the grace window in hours.
 *
 * Rules implemented:
 * - A day "counts" if any category was logged (dayCountsForStreak).
 * - If a day is missing entirely, the streak breaks UNLESS a freeze covers that day.
 * - At most one freeze may be consumed per rolling FREEZE_WINDOW_DAYS-day window.
 * - The grace window only affects whether *today* (the in-progress day) is treated
 *   as "not yet broken" while still within `graceHours` of the day boundary —
 *   it does not retroactively save past missed days.
 */
export function computeStreak(entriesByDate, { asOfKey = todayKey(), freezeDates = [] } = {}) {
  const freezeSet = new Set(freezeDates);
  let streak = 0;
  let cursor = asOfKey;

  // If today has nothing logged yet, that's fine — we just don't count today,
  // and start counting from yesterday backward. Today still "in progress."
  if (!dayCountsForStreak(entriesByDate[cursor])) {
    cursor = addDays(cursor, -1);
  }

  while (true) {
    const rec = entriesByDate[cursor];
    if (dayCountsForStreak(rec)) {
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    if (freezeSet.has(cursor)) {
      // Frozen day doesn't break the streak, but doesn't add to it either.
      streak += 0;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }
  return streak;
}

/**
 * Determines whether a freeze can be applied to cover a missed day, i.e. whether
 * fewer than 1 freeze has been used in the trailing FREEZE_WINDOW_DAYS days.
 */
export function canUseFreeze(freezeDates, asOfKey = todayKey()) {
  const recentFreezes = freezeDates.filter(
    (d) => diffDays(d, asOfKey) >= 0 && diffDays(d, asOfKey) < FREEZE_WINDOW_DAYS
  );
  return recentFreezes.length < 1;
}

/**
 * Determines whether the user is still within the grace window for "yesterday"
 * (i.e. can still log yesterday's entry and have it count), given the configured
 * grace hours and the current time.
 */
export function withinGraceWindow(missedDateKey, now = new Date(), graceHours = DEFAULT_GRACE_HOURS) {
  // Grace extends past the missed day's midnight boundary by graceHours.
  const missedDayEnd = new Date(missedDateKey);
  missedDayEnd.setHours(0, 0, 0, 0);
  missedDayEnd.setDate(missedDayEnd.getDate() + 1); // midnight at the END of missedDateKey
  const graceDeadline = new Date(missedDayEnd.getTime() + graceHours * 60 * 60 * 1000);
  return now.getTime() <= graceDeadline.getTime();
}

/** Monthly grace days used so far in the month containing `asOfKey`. */
export function monthlyGraceUsed(graceDatesUsed, asOfKey = todayKey()) {
  const month = asOfKey.slice(0, 7);
  return graceDatesUsed.filter((d) => d.slice(0, 7) === month).length;
}

export function canUseMonthlyGrace(graceDatesUsed, asOfKey = todayKey()) {
  return monthlyGraceUsed(graceDatesUsed, asOfKey) < MONTHLY_GRACE_DAYS;
}

/** Which badge thresholds have been crossed by a given streak length. */
export function badgesEarned(streakLength) {
  return BADGE_THRESHOLDS.filter((t) => streakLength >= t);
}

/** The next badge threshold not yet reached, or null if all are earned. */
export function nextBadge(streakLength) {
  return BADGE_THRESHOLDS.find((t) => streakLength < t) ?? null;
}

/** Total points across all logged days (sum of pointsForDay). */
export function totalPoints(entriesByDate) {
  return Object.values(entriesByDate).reduce((sum, rec) => sum + pointsForDay(rec), 0);
}
