import { describe, it, expect } from "vitest";
import { pointsForDay, categoriesCompletedCount, dayCountsForStreak } from "../lib/streaks";

function rec(categories) {
  const r = { date: "2026-06-28" };
  for (const c of categories) r[c] = { logged: true };
  return r;
}

describe("categoriesCompletedCount", () => {
  it("counts zero for null/empty record", () => {
    expect(categoriesCompletedCount(null)).toBe(0);
    expect(categoriesCompletedCount({})).toBe(0);
  });
  it("counts each completed category", () => {
    expect(categoriesCompletedCount(rec(["mood"]))).toBe(1);
    expect(categoriesCompletedCount(rec(["mood", "exercise"]))).toBe(2);
    expect(categoriesCompletedCount(rec(["mood", "exercise", "work", "meditation"]))).toBe(4);
  });
});

describe("dayCountsForStreak", () => {
  it("is false when nothing logged", () => {
    expect(dayCountsForStreak(null)).toBe(false);
    expect(dayCountsForStreak({})).toBe(false);
  });
  it("is true if any single category logged", () => {
    expect(dayCountsForStreak(rec(["meditation"]))).toBe(true);
  });
});

describe("pointsForDay", () => {
  it("gives 0 points for an empty day", () => {
    expect(pointsForDay(null)).toBe(0);
    expect(pointsForDay({})).toBe(0);
  });
  it("gives 1 point per completed category", () => {
    expect(pointsForDay(rec(["mood"]))).toBe(1);
    expect(pointsForDay(rec(["mood", "exercise"]))).toBe(2);
    expect(pointsForDay(rec(["mood", "exercise", "work"]))).toBe(3);
  });
  it("gives +3 bonus for completing all four categories", () => {
    // 4 base + 3 bonus = 7, but capped at 6
    expect(pointsForDay(rec(["mood", "exercise", "work", "meditation"]))).toBe(6);
  });
  it("never exceeds the daily cap of 6", () => {
    const all = rec(["mood", "exercise", "work", "meditation"]);
    expect(pointsForDay(all)).toBeLessThanOrEqual(6);
  });
});
