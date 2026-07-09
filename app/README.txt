# Rings — Habit, Planning & Streak Tracker

A complete offline web app for tracking mood, exercise, work, and meditation,
with streaks, points, badges, monthly objectives, weekly themes, sprints,
time blocks, and analytics. Everything runs and stores data locally on your
phone — nothing is uploaded anywhere.

## How to install on your iPhone

1. Unzip this folder.
2. Open the **Files** app on your iPhone, find the folder, and tap `index.html`
   inside this `app` folder. It opens in Safari.
3. Tap the **Share** icon in Safari, scroll down, and tap **Add to Home Screen**.
4. Tap **Add**.

You'll have a "Rings" icon on your home screen that opens full-screen, like a
real app — no browser bar, and it works with no internet connection.

## What's included (per the brief)

- **Quick daily log** — one-tap logging for Mood, Exercise, Work, and Meditation.
- **Three-ring UI** — Exercise / Focus / Meditation rings on the Home screen,
  with overflow past 100%, a completion glow + "+3 bonus" state when all three
  hit their goal, and tap-to-log on each ring.
- **Streaks & rewards** — any category logged counts the day toward your streak;
  badges unlock at 7/21/60/180 days; one streak freeze every 30 days; one
  monthly grace day. Points: 1 per category, +3 bonus for all four, capped at
  6/day — all covered by automated unit tests (see the `source` folder).
- **Planning** — Monthly Objectives with progress tracking, Weekly Themes with
  template suggestions, Sprints with task lists and burndown charts, and
  recurring Time Blocks.
- **Analytics** — a calendar heatmap, 7/30/90-day trend charts, a mood vs.
  activity correlation view, and a personal consistency/streak summary.
- **Settings** — adjustable daily targets, a colorblind-safe palette toggle,
  CSV export (last 365 days) and full JSON backup/restore.
- **Accessibility** — every ring, card, and button has a descriptive label for
  VoiceOver, and keyboard focus is visible throughout.

## What's different from the original brief (and why)

The original brief describes a native iOS/Android app with HealthKit
integration, a watch complication, native push notifications, and encrypted
cloud sync. None of those are things that can exist as a single downloadable
file — they require:

- A native app signed and distributed through Xcode/App Store or TestFlight
  (for HealthKit, watch complications, and real push notifications).
- A backend server (for encrypted cloud sync and conflict resolution).

What you have instead is a fully working **local-first web app** that you
install to your home screen. It covers all the tracking, streak, planning,
and analytics logic from the brief — just without those four native-only
capabilities. If you later want the native version, this app's logic
(`source/src/lib/streaks.js`, `source/src/lib/dates.js`) is already
unit-tested and ports directly into a Swift/Kotlin/React Native rewrite.
