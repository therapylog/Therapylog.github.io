# Test fixtures

`demo-backup.json` is a full TherapyLog backup: the exact bytes the app's own export downloads once its demo patient is loaded. It is sample data and nothing else. The profile is a fictional "James Mitchell (sample data)", and no real person's records are in it.

It was made by `scripts/capture-backup-fixture.js`, which runs the app's `loadDemoData()` and `exportData()` in a real browser with the clock frozen at 2026-11-16T15:00:00Z, the time zone set to America/Chicago and the locale to en-US, so the same app always produces the same bytes.

To regenerate it, run `node scripts/capture-backup-fixture.js`. To check it, run `node scripts/capture-backup-fixture.js --check`, which captures again, compares the bytes with this file, then imports this file into an empty app and exports it again. Both need Playwright and Chromium; the script's header says how. The check compares bytes, so do not edit or reformat the file by hand (it has no trailing newline).

The restore half of the check runs twice. The first restore takes this file and may change one thing, which it names: import sorts `entries` newest-first, and the demo record lists them grouped by type because `loadDemoData()` is the one path that writes the record without going through `sd()`. No entry and no field is lost. The second restore takes the first one's own export, and that must come back identical in every field and every array's order. The redesign's migrations are held to the second: a backup of a real record restores to itself.
