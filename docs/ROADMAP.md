# Roadmap: what is left before the redesign ships

Updated 22 November 2026. This follows the build sequence in the design handoff's README (Phases 0 to 7). Each item says where it stands in the code today, not in the handoff's November counts.

Sizes: **S** is part of one working session, **M** is about one session, **L** is several sessions.

## Where things stand

| | Where | Status |
|---|---|---|
| Phase 0: baseline (backup fixture, data-model inventory, mobile-fit patch, test runner) | `main`, [#59](https://github.com/therapylog/Therapylog.github.io/pull/59) | **Live** |
| Phase 1: logic layer (protocol model, rounds, supply, alerts, sites, dose changes, confirm sheet, gates, backup, theme) and its review fixes | `main`, [#59](https://github.com/therapylog/Therapylog.github.io/pull/59) | **Live** |
| Schedule accuracy (section 1) | `main`, [#61](https://github.com/therapylog/Therapylog.github.io/pull/61), merged into the UI branch | **Live** since 22 November |
| Phase 2: design foundation (tokens, fonts, icons, components) | UI branch, [#60](https://github.com/therapylog/Therapylog.github.io/pull/60) | Done, not live |
| Phase 3: shell and navigation (five tabs, router, Ask bar, segments) | UI branch | Done, not live |
| Phase 4: screens | UI branch | **8 of 18 screens done:** Onboarding 3d + 4b, Today 2a, Customize Home 2b, Round alert 2c, Log sheet 5a, Injection site 4a, Protocol 6a |
| Phase 5: hardening | | Not started |
| Phase 6: website templates W1 to W6 | | Not started |
| Phase 7: release checklist | | Not started |

The new UI goes live in one release, when #60 merges. Until then the live app is the old UI running on the new logic.

## 1. Schedule accuracy: fix now, on the live app (before the visual work)

**Done: live since 22 November ([#61](https://github.com/therapylog/Therapylog.github.io/pull/61)).** The reader replaces the old reading only for text it reads in full, and keeps the old reading for everything else. Nine review rounds, a sweep of every line they reported and a generated corpus of 22,866 lines found no line that reads differently and wrong. The one-time note, the "biweekly" question and the check on an unreadable schedule show on the old home screen and at the top of the redesign's Today. Left for the redesign:

- **A line the reader keeps the old reading for becomes a fixed rule when the model is stored.** "2x weekly, Sat & Sun off" keeps its old reading (twice weekly from the start day), and storing the model writes that as named days, which can fall on a rest day, and drops the note on the next save. In the new UI such a line should be a compound to check, with no rule until the user chooses one, as "biweekly" is. **S.**
- **"Every 2 weeks" and other whole-number intervals are written to the old text as a pulse** (never due on the old screens) when the model is stored, as designed before the reader could read them back. The reader now reads "Every 14 days" from the start day; writing it would keep them scheduled on the old screens, but a note naming days after it then reads as a conflict and the line falls back to daily. Revisit with the item above. **S.**

The original analysis follows.

**This is what live users notice.** The old app reads a protocol from free text with `parseFrequency()` and `parseMeds()`. Phase 1 pinned about twenty of its misreadings in the tests as suspected bugs, and left fixing them as a product call. The new protocol model reads an existing user's protocol through the same parser, so it inherits most of the same mistakes (it does read weekday names like `Mon/Thu` correctly). The new screens show a wrong reading plainly ("Daily" where the user wrote "once a week"), but the reading stays wrong until the user corrects it by hand.

The parser is shared, so one fix corrects the live old UI now and every migration into the new model later. It can go to `main` as its own small PR, without waiting for #60.

| The user wrote | The app reads it today | The right reading |
|---|---|---|
| `once a week`, `every 7 days`, `every 2 weeks`, `every other week`, `once a month`, `QOD`, `Mon/Thu`, `M/W/F` | **Daily.** A weekly injection is scheduled, reminded and counted seven times a week. | What it says |
| `3x daily`, `three times daily`, `twice a day`, `TID`, `2x/day` | Once a day | Two or three doses a day, each its own round |
| `2x per week`, `3x per week`, `3x weekly`, `Twice per week` | Once a week | That many days a week, spread out |
| `Sema, 1,000mcg, weekly` (a comma inside a number) | Dose `1`, frequency `000mcg`, so **daily**. The weekly schedule is lost. | 1,000 mcg weekly |
| A dose range, `250-500mcg` | The level chart reads **250 mg**, a thousand times the low end | No single amount: keep the text, and draw no curve |
| `10-day pulse cycle` | No dose days, reminders or refill alerts in one engine; daily in the other | "No schedule set", with a prompt to set one |
| A start date in the future | Dose days before the protocol starts | Nothing until the start date |
| Monthly, started on the 31st | No dose in months without a 31st | The last day of short months |
| `biweekly` | Twice a week | Ambiguous: ask the user (see the decisions below) |
| The app's own templates: `Split dose AM and noon`, `250mcg AM + 250mcg PM`, `Mon/Thu alongside Test injection`, `Before bed SubQ` | Once daily, in the morning | Two rounds; Monday and Thursday; the bedtime round |

The same review found three more inaccuracies in other old code:
- **Blood pressure:** a diastolic above the systolic, or a number no person has, is staged like any other reading. Fix: refuse it with a message (systolic 60 to 250, diastolic 30 to 160, systolic above diastolic). The new BP screen will do this anyway.
- **Injection sites:** a subcutaneous compound with "test" in its name is offered glute and quad sites. Fix: decide by route, not by name.
- **Refill alerts:** they only work for compound names that match the price table exactly, and they reset to a full vial on every log, so someone who logs daily is never warned. The Phase 1 supply walk already fixes this in the new UI. On the old UI the fix is to use it there too.

**Size:** M. **Risk:** existing users' reminders and checklists change on their next load. That is the point, but the change should come with a one-time note: "We now read 'once a week' as weekly. Check your protocol."

## 2. Independent review of the Phase 4 screens

An independent review of onboarding, Today, round alerts, the Log sheet, the site map and Protocol. It was started, but usage limits stopped it before any reviewer ran. It can run again after **22 November, 21:00 UTC**. Confirmed findings get fixed on the UI branch. **Size:** S to run, M to fix.

## 3. The rest of Phase 4: screens

Each screen is wired to the Phase 1 logic, matched to the design and its screenshot, and checked in both themes at 320 px, with its own browser check in CI. This is the handoff's order.

| # | Screen | What it involves | Size |
|---|---|---|---|
| 5 | ~~**Library 3a** and the compound page~~ **Done** | The 131-compound encyclopedia in the new list and page layout: classes, search, one status tag. The content is unchanged. `scripts/ui-check-library.js`. | M |
| 5 | ~~**Tools 3c**~~ **Done** | Reconstitution calculator plus the tools list, the PCT builder included. Each other tool is its own route (`#/library/pct` and so on) showing the old tool's panel without the old row of tabs, until Phase 5 restyles them. `scripts/ui-check-library-tools.js`. | M |
| 6 | **Health: Bloodwork 3b** | Lab panels and range bars. Phase 1 `health.js` and Today's lab code already have the logic. | M |
| 6 | **Health: BP 4c** | Staging (already in Phase 1), input limits (item 1), the "Order labs: coming soon" switch, kept on the device. | S |
| 6 | **Health: Body 6c** | Weight and body measurements. | S |
| 6 | **Health: Photos 6d** | **Blocked on a decision.** Today "Photos" stores written check-ins only. The design shows real photos, which need on-device image storage (IndexedDB) and a backup plan. | M to L |
| 7 | **Settings 5b** | Upgrade and Restore Purchases at the top, Appearance (theme), backup, discreet alerts, clinic mode, delete all. | M |
| 7 | **Pro 5c** | The upgrade sheet, carrying the gated feature's name. Free / Own key / Pro. The Own-key (BYOK) plan already exists in the app and the API, so this is UI only. | S to M |
| 7 | **Confirm 5d** | Restyle the Phase 1 sheet with the design's components. The behaviour is done and checked (37 checks). | S |
| 8 | **Ask 6b** | The new chat UI on the existing assistant backend. | M |
| 9 | **Restyle only** | History, Profile, Clinic mode, FemCycle; the Weight, Symptom and Measure forms (5a pattern); the Labs form (4c pattern). | L in total |

## 4. Phase 5: hardening

Measured in `app.html` today:

| Item | Now | What it takes |
|---|---|---|
| Browser dialogs | `confirm()` 0, `alert()` 0, `prompt()` **1**: `tlSetSupply`, "How many vials…" | Replace it with the compound sheet's Supply section, built for Protocol. S |
| Clickable `div`/`span` (screen readers cannot use them) | **15** | Make them buttons, or remove them with the old UI. S |
| Emoji used as icons | **244** characters | They go with the old UI. The new screens use the icon font. |
| Text under 12 px | **342** declarations in the old CSS | Goes with the old UI |
| Screen-reader pass (VoiceOver, TalkBack), pinch zoom, large text | | One pass over every new screen. M |
| Offline | Service worker cache v7 | Check every screen with the network off, after the old code is removed. S |
| Render only the active tab | `app.html` is 1.55 MB | Build a screen when its tab is opened. M |
| Remove the old UI code | Old pages, hub grids, `.fab-ai`, the Google Fonts request | Last, once every route has a new screen. Shrinks the file and removes most of the lines above. L |

## 5. Phase 6: the website (its own PR, can run alongside Phase 4)

The website does not depend on the app screens. It shares only the Phase 2 tokens, which are done. It can be built and shipped as a separate PR whenever there is room.

- **Generated pages (140):** compounds 82, markers 17, tools 37, directory 2, providers 2. Built by `scripts/build-pages.js` from `scripts/page-templates/`. Port the tokens and components into `shell.js` and `widgets.js`, then rebuild W2 (index pages), W3 (reference), W4 (calculators). M to L
- **Hand-written pages (11):** `index`, `marketing`, `download` (W1); `pro` (W5); `privacy`, `health-data-privacy`, `terms`, `support`, `guide`, `partnership`, `404` (W6). Each is restyled by hand, or moved into the generator. M to L
- **Must not change:** every URL, title, meta description, canonical link and piece of structured data. `validate-public-pages.js` (6,004 checks) and `validate-compliance.js` (1,491 checks) already guard this.

## 6. Phase 7: release checklist (before #60 merges)

- A backup round trip on the Phase 0 fixture and on a real user's data.
- Round notifications fire, and the web fallback banner works.
- Gate → Pro → purchase → restore.
- Both themes, at 320 px and 430 px, on every screen.
- No `confirm()`, `prompt()` or `alert()`, and no emoji icons, left in the code.
- The three AI-scan checks in `scripts/ui-check-bloodwork.js` fail, on `main` as well. Find out why before release.

## 7. Decisions (answered 21 November)

1. **Schedule accuracy: fix it now on the live app.** Yes. Built as its own PR to `main`, with a one-time note on the home screen for anyone whose protocol now reads differently.
2. **"Biweekly": ask.** The live app asks on the home screen ("Every 2 weeks" or "Twice a week") and writes the answer into the line. Until then the line has no reminders. The redesign's Today and Protocol still need the same question (item 3).
3. **Today's Levels: Pro.** Done on the UI branch, for both views drawn from estimated levels (Levels and In your system). Supply and Labs stay free.
4. **Protocol stays free; peptide templates free, the rest Pro.** Done on the UI branch: the three templates made only of peptides are free and listed first; any template with a hormone, a steroid or a PCT drug is Pro, showing its compounds but not its doses. Only three of the thirteen templates are peptide-only. Getting to six means writing new templates, and their doses need sign-off first; see the open question below.
5. **Photos: on the device, kept out of the backup file.** See the note in the chat of 21 November: on the web, images live in the browser's private storage for this site, compressed, with their own export; in the native apps, an album or folder the app owns, read back with permission limited to the photos it made.

**Open:** the Female GLP-1 template says semaglutide rises "by 0.25mg every 4 weeks to max 2.4mg". The labelled schedule is not even steps (0.25, 0.5, 1, 1.7, 2.4 mg, four weeks each). Template doses need a check by someone qualified before any new peptide template is written from them.

## 8. Parked

- **iOS and Android store builds.** See `docs/STORE-BUILDS-NOTES.md`. Note: `therapylog-app/vendor/app.html` was last synced on **5 September**. It has none of #59's fixes, so the native apps run the September app until the store-build work syncs it.
