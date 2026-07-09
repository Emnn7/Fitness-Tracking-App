// All "day" calculations use the LOCAL timezone of the device, since this is a
// local-first, offline app and the device's local time is what defines "today"
// for the person using it. This is what the brief means by "timezone aware day
// boundaries": a day boundary is midnight in the user's current local timezone,
// not UTC, and not a fixed reference timezone.

/** Returns YYYY-MM-DD for a Date object, in local time. */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's date key, local time. */
export function todayKey() {
  return toDateKey(new Date());
}

/** Parses a YYYY-MM-DD key into a local Date at midnight. */
export function fromDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Adds N days to a date key, returns a new date key. */
export function addDays(key, n) {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

/** Difference in whole days between two date keys (b - a). */
export function diffDays(aKey, bKey) {
  const a = fromDateKey(aKey);
  const b = fromDateKey(bKey);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

/** Returns an array of N date keys ending at (and including) endKey, oldest first. */
export function lastNDateKeys(n, endKey = todayKey()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(endKey, -i));
  }
  return out;
}

/** Monday-start week key, e.g. for grouping. Returns the date key of that week's Monday. */
export function weekStartKey(key) {
  const d = fromDateKey(key);
  const dow = d.getDay(); // 0 = Sunday
  const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

/** Month key, e.g. "2026-06" */
export function monthKey(key) {
  return key.slice(0, 7);
}

export function formatHuman(key) {
  const d = fromDateKey(key);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function isToday(key) {
  return key === todayKey();
}

export function isFuture(key) {
  return diffDays(todayKey(), key) > 0;
}
