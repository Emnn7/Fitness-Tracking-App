import { describe, it, expect } from "vitest";
import {
  computeStreak,
  canUseFreeze,
  withinGraceWindow,
  canUseMonthlyGrace,
  badgesEarned,
  nextBadge,
} from "../lib/streaks";
import { addDays } from "../lib/dates";

function loggedDay() {
  return { mood: { intensity: 3 } };
}

describe("computeStreak", () => {
  it("is 0 with no entries at all", () => {
    expect(computeStreak({}, { asOfKey: "2026-06-28" })).toBe(0);
  });

  it("counts consecutive logged days ending yesterday when today is not yet logged", () => {
    const today = "2026-06-28";
    const entries = {
      [addDays(today, -1)]: loggedDay(),
      [addDays(today, -2)]: loggedDay(),
      [addDays(today, -3)]: loggedDay(),
    };
    expect(computeStreak(entries, { asOfKey: today })).toBe(3);
  });

  it("includes today if today is already logged", () => {
    const today = "2026-06-28";
    const entries = {
      [today]: loggedDay(),
      [addDays(today, -1)]: loggedDay(),
    };
    expect(computeStreak(entries, { asOfKey: today })).toBe(2);
  });

  it("breaks the streak on a missed day with no freeze", () => {
    const today = "2026-06-28";
    const entries = {
      [addDays(today, -1)]: loggedDay(),
      // gap at -2
      [addDays(today, -3)]: loggedDay(),
    };
    expect(computeStreak(entries, { asOfKey: today })).toBe(1);
  });

  it("bridges a missed day if a freeze is applied to that date", () => {
    const today = "2026-06-28";
    const missed = addDays(today, -2);
    const entries = {
      [addDays(today, -1)]: loggedDay(),
      [addDays(today, -3)]: loggedDay(),
      // -2 is missing but frozen
    };
    const streak = computeStreak(entries, { asOfKey: today, freezeDates: [missed] });
    // -1 counts, -2 frozen (bridges, doesn't add), -3 counts => total 2
    expect(streak).toBe(2);
  });

  it("is deterministic: same inputs always produce same output", () => {
    const today = "2026-06-28";
    const entries = {
      [today]: loggedDay(),
      [addDays(today, -1)]: loggedDay(),
      [addDays(today, -2)]: loggedDay(),
    };
    const a = computeStreak(entries, { asOfKey: today });
    const b = computeStreak(entries, { asOfKey: today });
    expect(a).toBe(b);
    expect(a).toBe(3);
  });

  it("treats a day with ANY category logged as a streak day, not requiring all four", () => {
    const today = "2026-06-28";
    const entries = {
      [today]: { exercise: { minutes: 10 } }, // only one category
    };
    expect(computeStreak(entries, { asOfKey: today })).toBe(1);
  });
});

describe("canUseFreeze", () => {
  it("allows a freeze when none used in the last 30 days", () => {
    expect(canUseFreeze([], "2026-06-28")).toBe(true);
  });
  it("disallows a second freeze within the 30-day window", () => {
    const used = ["2026-06-10"];
    expect(canUseFreeze(used, "2026-06-28")).toBe(false);
  });
  it("allows a freeze again once the prior one is more than 30 days old", () => {
    const used = ["2026-05-01"];
    expect(canUseFreeze(used, "2026-06-28")).toBe(true);
  });
});

describe("withinGraceWindow", () => {
  it("is true immediately after the missed day's midnight boundary", () => {
    const missed = "2026-06-27";
    const now = new Date(2026, 5, 28, 1, 0, 0); // 1am on the 28th, 1hr after boundary
    expect(withinGraceWindow(missed, now, 12)).toBe(true);
  });
  it("is false once past the configured grace hours", () => {
    const missed = "2026-06-27";
    const now = new Date(2026, 5, 28, 13, 0, 0); // 13hrs after boundary, grace=12
    expect(withinGraceWindow(missed, now, 12)).toBe(false);
  });
});

describe("canUseMonthlyGrace", () => {
  it("allows grace if none used this month", () => {
    expect(canUseMonthlyGrace([], "2026-06-28")).toBe(true);
  });
  it("disallows a second grace day in the same month", () => {
    expect(canUseMonthlyGrace(["2026-06-05"], "2026-06-28")).toBe(false);
  });
  it("allows grace again in a new month", () => {
    expect(canUseMonthlyGrace(["2026-05-05"], "2026-06-28")).toBe(true);
  });
});

describe("badgesEarned / nextBadge", () => {
  it("earns no badges below 7-day streak", () => {
    expect(badgesEarned(6)).toEqual([]);
    expect(nextBadge(6)).toBe(7);
  });
  it("earns the 7-day badge at exactly 7", () => {
    expect(badgesEarned(7)).toEqual([7]);
  });
  it("earns multiple badges at higher streaks", () => {
    expect(badgesEarned(65)).toEqual([7, 21, 60]);
    expect(nextBadge(65)).toBe(180);
  });
  it("returns null next badge once all are earned", () => {
    expect(nextBadge(200)).toBe(null);
  });
});
