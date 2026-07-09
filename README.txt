# Rings — Habit, Planning & Streak Tracker

Two folders here:

## `app/` — the installable app

This is what you want. Open `app/index.html` on your iPhone (via the Files app)
and tap **Add to Home Screen** in Safari's share sheet. Full instructions and
a rundown of what's included are in `app/README.txt`.

## `source/` — the React source code

For developers who want to modify or rebuild the app. Run `npm install` then
`npm run dev` inside this folder, or `npm test` to run the 27 unit tests
covering the streak/points/freeze/grace logic. `npm run build` regenerates
the build output (to a local `dist/` folder) that mirrors what's in `app/`.
