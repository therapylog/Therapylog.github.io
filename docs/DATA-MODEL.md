# TherapyLog data model

What `app.html` stores, in what shape, and which functions read and write it.
Written for Phase 0.2 of the app redesign: Phase 1 migrates this data to a new
protocol, rounds, supply and injection-site model, and those migrations are
written from this document.

Written against `app.html` as of 16 November 2026 (`APP_VERSION`
`2026.09.07`), before the redesign's logic was added, and extended in section
8 with what Phase 1 adds. Code is cited by function name, not by line: the
first command below prints the current line of every reader and writer.

    node scripts/inventory-data-layer.js           every stored key, with the
                                                   functions that touch it
    node scripts/inventory-data-layer.js --check   fails if this document does
                                                   not name something the app
                                                   stores (runs in CI)

The script reads the syntax tree, so it is complete for key names. It cannot
see a field read through an alias, a field added to an entry after it is
built, units, or meaning. Those are in this document by hand, and are the
parts to re-check when the code changes.

## 1. Where data lives

| Store | Name | Holds |
|---|---|---|
| localStorage | `tlv2` | The main record: one JSON object with everything the user logged. |
| IndexedDB | `TherapyLogDB`, object store `appdata`, key `tlv2` | A mirror of the main record, as a JSON string. |
| localStorage | 19 other keys (section 5) | Flags, settings, the entitlement, assistant state. **Not in any backup.** |
| IndexedDB | `TherapyLogBackup`, object store `handles` | One File System Access handle for the linked backup file. |
| Memory | `_memCache`, `S`, `clinicModeActive`, `labScanMeta` | Lost on reload. |

There is no account and no server copy. The assistant sends parts of the
record to `api.therapylog.app/api/ai-research` when the user asks it a
question in Personalized mode (`getCtx`, `getFullCtx`); nothing is stored
there.

## 2. The storage core

`gd()` reads; `sd(d)` writes. Nothing else should touch `tlv2`.
One thing does: `loadDemoData` writes it directly.

- **`gd()` returns a deep copy** of `_memCache`, filling the cache from
  localStorage on first use. Editing what it returns changes nothing until
  `sd()` is called. With nothing stored it returns `{ entries: [], proto: null }`.
- **`sd(d)`** first re-reads localStorage. If the stored copy has a newer
  `_savedAt` than `d` (another tab saved since this snapshot was taken), it
  unions four arrays by `ts`: `entries`, `photos`, `bodyComp`, `femcycle`.
  Items the other tab added are appended, then all four are re-sorted newest
  first. That sort happens only in this case; an ordinary save does not sort.
  Every other key is last-writer-wins. It then stamps `d._savedAt =
  Date.now()`, replaces `_memCache`, writes localStorage and calls `sdAsync`
  to mirror to IndexedDB. A failed `localStorage.setItem` (quota) is swallowed;
  the IndexedDB write still happens.
- **A `storage` event** from another tab replaces `_memCache`, or reloads the
  page if the key was removed.
- **Start-up, `initStorage()`:** when both stores hold a record, the one
  with the later `_savedAt` wins; if neither has `_savedAt`, the one with more
  entries wins. The winner is written to the other store. IndexedDB alone
  restores localStorage, which is what brings a record back after Safari
  clears localStorage.

**There is no schema version.** The record has no version field. Backup files
carry `version: 2` in their envelope (section 7) and nothing reads it.

## 3. The main record

Twelve top-level keys, plus `_savedAt`, and four more added by Phase 1 of the
redesign (section 8). Only `entries` and `proto` always
exist; every other key is absent until first written, and every reader guards
with `|| []` or `|| {}`.

| Key | Type | Section |
|---|---|---|
| `entries` | array | 3.1 |
| `proto` | object or `null` | 3.2 |
| `reminderTimes` | map: compound name → array of `"HH:MM"` | 3.3 |
| `remindersFired` | map: key → `true` | 3.3 |
| `supply` | map: compound name → `{ vials, sinceTs }` | 3.4 |
| `pk` | map: PK key → `{ hl, tmax }` | 3.5 |
| `profile` | object | 3.6 |
| `customMarkers` | map: `cm_` key → definition | 3.7 |
| `photos` | array | 3.8 |
| `bodyComp` | array | 3.9 |
| `femcycle` | array | 3.10 |
| `_bpSysBuffer` | map, transient | 3.11 |
| `_savedAt` | number, epoch ms | section 2 |

### 3.1 `entries`

Every logged item, one array, newest first. An entry is identified by its
`type` and `ts`. **Entries have no id.** `ts` is `nowStr()`, which is
`new Date().toISOString()`: a UTC instant with milliseconds, always the
moment of saving. There is no way to back-date an entry; only bloodwork
carries a separate, user-chosen `labDate`.

Ordering: newest first, kept that way by each writer using `unshift` rather
than by a sort on save. Three paths do sort by `ts` descending: `importData`,
the Apple Health import, and the cross-tab merge in `sd()`. `loadDemoData` is
the exception to the order: it writes entries grouped by type, and they stay
that way until one of those three runs.

Deleting and editing: **only blood-pressure readings can be deleted**
(`deleteBPEntry`, by position among the BP entries). No function deletes
or edits a weight, dose, body, symptom or bloodwork entry. The
"Delete this entry?" dialog the handoff assigns to log entries was the one in
`deletePhotoEntry`, which deletes photo check-ins (3.8), not entries. One path edits in place: the Apple Health import (below).

Duplicates: two entries saved in the same millisecond share a `ts`, and
import and the cross-tab merge both dedupe on `ts` alone, across types. The
combined-syringe logger (`syrLog`) writes several doses in one loop and can
produce this.

#### `weight`

```js
{ type: "weight", ts: "2026-11-16T15:00:00.000Z",
  weight: 195.2,            // number, pounds. null on Apple Health rows
  energy: 8,                // int 1-10 or null
  sleep: 7.5,               // hours, float or null
  hrv: 62,                  // int ms or null
  steps: 9500,              // int or null
  stress: 3,                // int 1-10 or null
  alcohol: 0,               // int drinks or null
  mood: { e: "⚡", l: "Great" },   // or null
  notes: "" }
```

Written by `saveWeight` from inputs `ww we ws whrv wsteps wstress
walcohol wn`. Zero is stored as `null` for every optional field, because each
is read with `parseInt(x) || null`. `mood` comes from `selMood`: `e` is an
emoji from `MOOD_MAP` (keys `sleep neutral good great peak`), `l` the button
label.

**The unit is pounds, always.** Nothing in the app stores or converts units;
labels say "lbs". There is no kg setting.

The Apple Health import (`importAppleHealth`) adds rows of the shape
`{ type: "weight", ts, hrv, weight: null }` for a day with an HRV sample and
no weight entry, and fills `hrv`, `steps` and `sleep` on an existing weight
entry whose `ts` starts with that local date. So **a weight entry can have
`weight: null`**, and can lack every other field.

#### `medication`

```js
{ type: "medication", ts: "2026-11-16T15:00:00.000Z",
  medication: "Testosterone Cypionate",   // free text
  dose: "100mg",                          // free text, may be ""
  site: "L Glute",                        // one of nine strings, or null
  notes: "" }
```

Four writers:

| Function | `medication` | `dose` | `site` | `notes` |
|---|---|---|---|---|
| `saveMed` | the `mmed` select, or free text when "Custom..." | input `md`, free text | `S.site` or `null` | input `mn` |
| `quickLogDose` | the protocol line's name | the protocol line's dose text | the suggested site or `null` | `"Logged via reminder"` |
| `syrLog` | the syringe row's name | `r.dose + r.unit` | `null` | `"Combined syringe"` |
| `loadDemoData` | literal | literal | literal | literal |

`site` is exactly one of: `L Delt`, `R Delt`, `L Glute`, `R Glute`, `L Quad`,
`R Quad`, `L Lat`, `R Lat`, `Sub-Q Belly`. The ninth button is labelled
"Sub-Q" but stores `Sub-Q Belly` (`selSite`; pinned in
`tests/sites-and-levels.test.js`). Route (IM or SubQ) is not stored anywhere.

`dose` is whatever was typed: `200mg`, `0.5ml`, `250mcg twice daily`,
`200mg/week`. `pkParseDose` is the only parser: first number, then an
optional unit directly after it (`mcg mg iu unit(s) ml`), default mg.

`medication` is the join key to the protocol, and it is compared by exact
string equality everywhere except the level chart (3.5).

#### `body`

```js
{ type: "body", ts, measurements: { chest: 44, waist: 34, hips: 40, neck: 16,
    larm: 15.5, rarm: 15.5, lthigh: 24, rthigh: 24, bf: 16.2 }, notes: "" }
```

`saveBody`. `measurements` holds only the keys that were filled in.
Inches, except `bf` which is a percentage. Not in the demo data.

#### `symptom`

```js
{ type: "symptom", ts, severity: 6,          // int 1-10 or null
  category: "Energy",                        // the `scat` select's value, may be ""
  description: "Afternoon crash",            // required
  related: "" }                              // free text
```

`saveSymptom` writes no `notes`; the demo entries have one.

#### `bloodwork`

```js
{ type: "bloodwork", ts,
  labDate: "2026-10-28",                     // YYYY-MM-DD from a date input, may be ""
  labs: { tott: 748, e2: 28, cm_zonulin: 42 },   // numbers, by marker key
  labMeta: { tott: { source: "scan", unit: "nmol/L", refLo: 8.6, refHi: 29,
                     converted: true, convertedFrom: "...", method: "LC/MS-MS" } },
  notes: "" }
```

`saveBloodwork`. `labs` keys are `LAB_FIELDS` keys plus custom
marker keys (3.7); only filled fields are present; values are numbers in the
app's canonical unit for that marker. **`labMeta` is added after the entry is
built** and only when at least one marker has metadata, so the inventory
script does not list it: per marker, any of `source`, `unit`, `refLo`,
`refHi`, `converted`, `convertedFrom`, `censoredAs`, `editedAfterScan`,
`method`. The history list shows `labDate || ts`.

#### `bloodpressure`

```js
{ type: "bloodpressure", ts, sys: 128, dia: 82,
  hr: 64,                                    // int or null; absent on Apple Health rows
  device: "Arm cuff",                        // "Arm cuff" | "Wrist cuff" | "Manual"
  conditions: "Resting AM", notes: "",
  stage: "Elevated" }                        // getBPStage(sys, dia).stage at save time
```

`saveBP` accepts systolic 60 to 250 and diastolic 40 to 150 and does
not check that systolic is above diastolic. `stage` is one of `Normal`,
`Elevated`, `High — Stage 1`, `High — Stage 2`, `Hypertensive Crisis`, or `""`,
frozen at save time (`getBPStage`; boundaries pinned in
`tests/blood-pressure.test.js`). Readers recompute it for display, so the
stored value can disagree with a later version of the rules.

### 3.2 `proto`

```js
{ name: "TRT + Peptide Optimization Protocol",
  start: "2026-09-17",       // YYYY-MM-DD, local
  weeks: 16,                 // int
  meds: "Testosterone Cypionate, 200mg/week, Twice weekly (Mon/Thu)\nBPC-157, 250mcg twice daily, Twice daily",
  pct: "Nolvadex 40/40/20/20 ...",   // free text, never parsed
  _created: "2026-09-17T15:00:00.000Z" }
```

One protocol at a time, or `null`. Written whole by `saveProtocol` (inputs `cn cs cd cm cp`), `saveObStep4` (onboarding, `pct: ""`),
`loadDemoData`, and set to `null` by `clearProtocol`. `loadTemplate`
only fills the form; the user still saves. Import fills it only when
the device has none.

**The protocol is free text.** `meds` is one compound per line,
`name, dose, frequency`, split on every comma (`parseMeds`). There are
no compound ids: `parseMeds` assigns `id: "med-" + lineIndex` and a colour by
position at every call, so both change when a line is inserted. The name is
whatever was typed and need not match the encyclopedia.

`parseFrequency` matches the third field by substring, in this order:

| Contains | Result |
|---|---|
| `twice daily`, `2x daily`, `bid` | `{ type: "daily", times: 2 }` |
| `daily`, `once daily`, `every day`, `qd` | `{ type: "daily", times: 1 }` |
| `eod`, `every other day`, `every 2 day` | `{ type: "interval", interval: 2 }` |
| `e3d`, `every 3 day`, `every third` | `{ type: "interval", interval: 3 }` |
| `e3.5d`, `twice week`, `2x week`, `2x/week`, `biweekly` | `{ type: "weekly", count: 2, days: [1, 4] }` |
| `weekly`, `once week`, `1x week`, `per week` | `{ type: "weekly", count: 1, days: [1] }` |
| `monthly`, `once month` | `{ type: "monthly" }` |
| `10 day`, `10-day`, `pulse` | `{ type: "pulse" }` |
| anything else | `{ type: "daily", times: 1 }`, label is the raw text |

Each also carries `label` and `days`. The order matters and loses
information: `3x daily` becomes once daily, `3x week` becomes once weekly,
and an unrecognised phrase is silently daily. `tests/schedule-legacy.test.js`
pins every case.

**Nothing stores a schedule.** Two engines derive one from the text at every
call:

- **`getDoseDays` / `tlFreqDays`.** The one the user sees: the
  dashboard's next-dose card, the week view, reminders, both calendar exports,
  the report and the clinic view. Weekly protocols are placed from the
  protocol's start weekday (start day, and start day + 3 for twice weekly),
  ignoring `days: [1, 4]`. `pulse` is never a dose day.
- **`tlDueOn` and the rule engine.** Called only by
  `tlClinicalAnalysis`, to count expected doses for adherence. It accepts a
  richer rule (`daily`, `every.days` including 3.5, `every.weeks`, `weekdays`,
  `weeklyCount`, `monthly`, `taper` with `per`, `pattern.on/off`, `times`,
  `start`, `fromWeek`, `toWeek`, `fromDay`, `toDay`, `forWeeks`), and lifts a
  legacy med into one with `tlNormalizeRule`. For twice weekly it uses
  `days: [1, 4]`, Monday and Thursday, whatever the start day; `pulse` becomes
  daily.

So the two disagree on which weekdays a twice-weekly protocol falls on unless
it started on a Monday, and on pulse protocols. No rule in the engine's shape
is ever saved.

### 3.3 `reminderTimes` and `remindersFired`

```js
reminderTimes: { "Testosterone Cypionate": ["08:00"], "BPC-157": ["07:30", "20:00"] }
remindersFired: { "BPC-157-07:30-Mon Nov 16 2026": true }
```

`reminderTimes` is keyed by the compound's name exactly as typed in
`proto.meds`. Values are 24-hour local `HH:MM` strings, any number, any
minute. Written by `saveReminderTime`, `addReminderTime`,
`removeReminderTime`. A compound with no entry falls back to
`getDefaultTimes(freq)`: `["08:00", "21:00"]` for twice daily, `["08:00"]` for
daily, `["09:00"]` otherwise. Renaming or removing a line in the protocol
leaves its old key behind; nothing prunes this map.

`remindersFired` is `name-HH:MM-` + `new Date().toDateString()`, written by
`checkAndFireReminder` when a notification fires, and pruned to 30
days there. Because names can contain hyphens, the key cannot be split back
reliably; the pruner takes the last hyphen-separated part as the date.

The "discreet" switch is not here; it is localStorage `tl_notif_discreet`
(section 5). On the web, reminders are `setTimeout`s armed for the next hour
while the page is open (`scheduleAllReminders`, every five minutes). The
native shell replaces that with `TLNative.reschedule`, which reads
`proto` and `reminderTimes`.

### 3.4 `supply`

```js
supply: { "BPC-157": { vials: 2, sinceTs: "2026-11-01T15:00:00.000Z" } }
```

Keyed by compound name. Written only by `tlSetSupply`, which asks with
a browser `prompt()`. Read only by `calcRefillAlerts`. There is no
vial size, no dose count and no spare-vial count: "days per vial" is
`30 / DRUG_COSTS[name].monthly`, a fixed table keyed by exact name, so
a compound the table does not list has no refill tracking at all. The
arithmetic is pinned in `tests/supply.test.js`.

### 3.5 `pk`

```js
pk: { "tc": { hl: 192, tmax: 48 }, "raw:myblend": { hl: 12, tmax: 2 } }
```

Per-compound overrides of half-life and time to peak, in hours
(`pkSaveOverride`). The key is `pkKeyFor(name)`: an encyclopedia drug
id when `pkResolve` can match the name, otherwise `raw:` + the normalised
name. `pkResolve` is the one fuzzy name match in the app: normalised
equality against drug names and aliases, then a prefix match either way for
names longer than three characters. The level chart (`renderPKLevels`) reads
medication entries, resolves each name this way, and parses `dose` with
`pkParseDose`.

### 3.6 `profile`

```js
{ name: "James Mitchell", dob: "1985-03-14", sex: "Male",
  diagnosis: "...", notes: "...", height: "5'11\"", goal: "...",
  physician: "...", clinic: "...", specialty: "...", drPhone: "...",
  nextAppt: "2026-11-30", drNotes: "...", updatedAt: "2026-11-11T15:00:00.000Z" }
```

`saveProfile` replaces the whole object from the profile form.
Onboarding (`saveObStep2`, `saveObStep3`) sets individual fields. Everything
is a string. `sex` is `"Male"`, `"Female"`, `"Other"` or `""`; `isFemale()` is `sex === "Female"` exactly, and it decides whether the cycle page is
offered.
`dob` and `nextAppt` are `YYYY-MM-DD`. `height` is free text. `sex` and the
age from `dob` adjust lab reference ranges (`getAdjustedLabRanges`).

Not in the profile, and not anywhere: a unit preference, a body-map figure,
the user's initial as a separate field.

### 3.7 `customMarkers`

```js
customMarkers: { cm_zonulin: { name: "Zonulin", unit: "ng/mL", lo: 0, hi: 40,
                               added: "2026-11-16T15:00:00.000Z", hidden: true } }
```

User-defined lab markers. The key is `cm_` + the normalised name, cut to 40
characters (`customMarkerKey`), and is the key used inside a bloodwork
entry's `labs`. `removeCustomMarker` deletes an unused definition and
sets `hidden: true` on one that past panels reference.

### 3.8 `photos`

```js
{ ts, date: "2026-11-16", week: "Week 8 Check-in",
  weight: 195.2, bf: 16.2,              // numbers or null
  notice: "...", conditions: "...", mood: "4", protocol: "Week 8 of 16", notes: "" }
```

**There are no photos in `photos`.** It is a list of written progress
check-ins: `savePhotoEntry` stores text and two numbers, and no image
data exists anywhere in the app's storage. `deletePhotoEntry` removes
by array index. Newest first by `unshift`; import appends without re-sorting.

### 3.9 `bodyComp`

```js
{ ts, weight: 195.2, bf: 16.2, lean: 163.6, fat: 31.6 }
```

`saveBodyComp`, from the body-composition tool. Pounds and percent;
`lean = weight × (1 − bf/100)` and `fat = weight × bf/100`, each rounded to
one decimal and stored. This is a third place a weight lives, beside `weight`
entries and photo check-ins, and a second place body fat lives, beside
`body` entries' `measurements.bf`. Nothing reconciles them. No FFMI is
computed anywhere.

### 3.10 `femcycle`

```js
{ ts, date: "2026-11-10", type: "period", flow: "medium", notes: "" }
{ ts, date, type: "symptom", cramps: 2, bloat: 1, mood: "...", energy: 6,
  libido: 5, breast: "...", headache: "...", notes: "" }
{ ts, date, type: "ovulation", cm: "...", opk: "...", bbt: 97.9, mittelschmerz: "...", notes: "" }
```

`saveFemEntry`. Its `type` is `period`, `symptom` or `ovulation`, a
different vocabulary from `entries[].type`. `getCycleStats` takes
period entries whose `flow` is not `end` or `spotting` as cycle starts and
keeps gaps of 16 to 49 days.

### 3.11 `_bpSysBuffer`

Scratch space inside `importAppleHealth`: systolic values waiting for their
diastolic pair. It is deleted before the save and never reaches
storage.

## 4. What is not stored

Worth stating because the redesign assumes some of it exists:

- no schedule, slot or round: times are per compound, in `reminderTimes`
- no record of a dose being due, skipped or taken on time: a dose is "taken"
  if a medication entry with that name exists that day
- no route, no site history beyond the `site` text on each dose
- no dose-change history: saving the protocol overwrites it
- no inventory beyond `supply[].vials`
- no images
- no units, theme-independent display settings, or figure choice
- clinic mode (`clinicModeActive`) and the open tab are memory only

## 5. localStorage outside the main record

None of these is in a backup or restored by import. "Reset" is whether
`resetAllData` removes it.

| Key | Value | Written by | Read by | Reset |
|---|---|---|---|---|
| `tl-theme` | `"light"` or `"dark"`; absent means follow the OS | `toggleTheme` | `initTheme`, which sets class `light-mode` on `body` | yes |
| `tl-ob-done` | `"1"` | `obFinish`, `obSkip`, `loadDemoData` | `checkOnboarding`, `acceptDisclaimer` | yes |
| `tl-disclaimer-done` | `{"v":2,"at":"<ISO>","age18":true}`; legacy `"1"` re-prompts | `acceptDisclaimer` | `disclaimerCurrent` | yes |
| `tl-last-export` | epoch ms as a string | `exportData`, `exportDataFromBanner`, `tlShareBackup`, `tlWriteLinkedBackup` | `checkPersistBanner`, `tlAutoBackup`, `tlDaysSinceBackup` | yes |
| `tl-banner-dismissed` | epoch ms as a string | `dismissPersistBanner` | `checkPersistBanner` | yes |
| `tl_notif_discreet` | `"1"` or `"0"` | `setDiscreetReminders` | `discreetReminders` | yes |
| `tl-chat-history` | JSON array of the last 20 chat messages | `saveChatMemory` | `loadChatMemory` | yes |
| `tl_ai_mode` | `"managed"` or `"byok"`; absent means managed | `setAIMode`, `saveByokKey` | `sendChat`, `scanLabImage`, `initAISettings` | yes |
| `tl_ai_key` | the user's own API key, plain text | `saveByokKey` | `sendChat`, `scanLabImage`, `TLTier.hasOwnKey` | yes |
| `tl_ai_personalize` | `"on"` or `"off"`; absent means on. Whether the record is sent with a question | `setAIPersonalize` | `aiPersonalized` | yes |
| `tl_ai_ctx_ok` | `{"v":1,"at":"<ISO>"}`: consent to send the record in chat | `aiCtxConsent` | `aiConsented` | yes |
| `tl_ai_scan_ok` | `{"v":1,"at":"<ISO>"}`: consent to send a lab image | `aiCtxConsent` | `aiConsented` | yes |
| `tl_ai_usage` | `{"date":"YYYY-MM-DD","count":n}`, UTC date | `sendChat` | `sendChat` | yes |
| `tl_ai_quota` | `{remaining, limit, remainingDay, limitDay, ...}` from the server | `tlAiQuotaRecord` | `tlAiQuotaRead` | **no** |
| `tl_ent` | the entitlement, below | `tlWriteEnt` | `tlReadEnt` | **no** |
| `tl_iap_active` | set by `TLIAP.init` on iOS | `TLIAP` | nothing in `app.html` | **no** |
| `tl_ios_receipt` | App Store receipt | `TLIAP.validate` | `TLIAP.appReceipt` | **no** |
| `tl_attr` | first-touch `{utm_*, ref, landedAt, landingPage}` | `tlCaptureAttribution` | `tlAttribution` | yes |
| `tl_fab_pos` | position of the floating assistant button | `savePos` | `loadPos` | yes |

**`tl_ent`**, the entitlement:

```js
{ tier: "pro",              // "standard" | "byok" | "pro"; absent or "free" is free
  status: "active", expires: 1794000000,   // epoch SECONDS, or null
  plan: null,               // whatever the licence server sent, or null
  lifetime: false, willRenew: true,
  key: "TL-XXXX-XXXX-XXXX", email: null,
  verifiedAt: 1794000000000,               // epoch ms
  source: "license",                       // or "ios-iap"
  iosToken: null }
```

`tlEffectiveTier()` is the only thing that should be asked for the
tier: it returns `free` once `expires` plus seven days has passed, or once a
licence has gone seven days unverified. `window.TLTier` wraps it: `get`,
`isPro()` (pro only), `isStd()` (standard, byok or pro), `canByok()`,
`check(feature)` against a free allowlist, and `prompt(tier, feature)`, the
upgrade overlay the redesign replaces. `tlRefreshEntitlement()` re-verifies
daily against `api.therapylog.app/api/verify-license`. Resetting all data
deliberately leaves the entitlement in place.

## 6. Backup, import, reset and demo data

**Two exports, two envelopes.**

| Path | Envelope | File |
|---|---|---|
| `exportData` → `_doExportData` (manual button, banner) | `{ version: 2, exportedAt, appName: "TherapyLog", data }` | `therapylog-backup-YYYY-MM-DD.json`, download |
| `tlBackupPayload` (share sheet, linked file, weekly auto-backup) | the same plus `appVersion` | same name |

`data` is the whole main record as `gd()` returns it, pretty-printed with two
spaces. Nothing from section 5 is included, so a restored backup arrives
without its theme, reminder privacy setting, assistant settings or
entitlement. There is no CSV export.

**Weekly backup.** There is no stored "weekly" switch. If the user linked a
file (`tlLinkBackupFile`, File System Access, Chromium only), its handle sits
in IndexedDB `TherapyLogBackup` / `handles`, and `tlAutoBackup`
rewrites that file on start-up when `tl-last-export` is more than seven days
old. `tlDaysSinceBackup()` returns whole days since the last export, or
`null` if there has never been one. The dashboard banner (`checkPersistBanner`)
appears after seven days without an export.

**Import is a merge, not a restore** (`importData`). It accepts the
envelope or a bare record, and then, key by key:

| Key | Rule |
|---|---|
| `entries` | adds items whose `ts` is not already present; re-sorts newest first |
| `photos`, `bodyComp`, `femcycle` | adds items whose `ts` is not already present |
| `profile`, `proto` | taken **only if this device has none**; otherwise the device's stays, whole |
| `customMarkers`, `pk`, `reminderTimes`, `supply`, `labMeta` | shallow merge per top-level key; the device's value wins on conflict |
| anything else | **dropped** |

Entries are never removed or updated by an import. A top-level `labMeta` is
merged but nothing writes one; per-entry `labMeta` travels inside its entry.

**Reset** (`resetAllData`) asks first (section 8), removes
`tlv2` and the fifteen keys marked "yes" above, and deletes every IndexedDB
database it can enumerate.

**Demo data** (`loadDemoData`) asks first (section 8), then replaces the
record with a literal: `entries` (35, no `body` type), `proto`, `profile`,
`bodyComp`, `photos`, `reminderTimes`. Its dates are relative to the moment
it runs. It bypasses `sd()`, so the record has no `_savedAt` and unsorted
entries until the next save. `tests/fixtures/demo-backup.json` is this record
exported.

## 7. What the redesign has to handle

Each of these is a property of the data above, with the consequence for
Phase 1.

1. **New top-level keys are dropped by import, and by every older build.**
   `importData` copies a fixed list. A protocol, slot or site key added in
   Phase 1 will not survive a backup round trip until `importData` learns it,
   and a backup made by the new app loses those keys when opened in an old
   one. The cross-tab merge in `sd()` likewise only unions four named arrays.
   Phase 1 must extend both, and should version the record at the same time.
2. **There is no version field to migrate from.** The absence of a version is
   the only marker of today's format. The migration must be idempotent and
   keyed on what is present.
3. **The compound name is the only join key**, compared exactly, between
   `proto.meds`, `reminderTimes`, `supply`, `DRUG_COSTS` and
   `entries[].medication`. A new protocol model with stable compound keys has
   to map every historical name onto one, and keep names it cannot map.
4. **The protocol must be parsed out of free text**, with `parseFrequency`'s
   exact matching, so each stored protocol means the same after migration as
   it does today. Where the two schedule engines disagree (twice weekly not
   started on a Monday; pulse), the migration follows `getDoseDays`, the one
   the user has been seeing.
5. **Reminder times are arbitrary minutes per compound; the new model has
   four shared slots.** Each stored time has to be assigned to a slot, and a
   slot can only keep one time for all its compounds.
6. **Dose is free text.** Amount and unit have to be parsed, and text that
   does not parse has to be kept as it is rather than guessed at.
7. **Nine site strings map onto the new site ids**, including `Sub-Q Belly`,
   which the handoff lists as "Sub-Q". Doses logged by reminder or by the
   syringe builder have `site: null`.
8. **Doses have no slot and no scheduled date.** Past medication entries can
   be attributed to a day from `ts`, in local time, but not to a slot except
   by nearest time.
9. **Supply cannot be converted, only seeded.** `vials` and `sinceTs` say
   nothing about vial size or doses per vial. Doses per vial has to come from
   the user.
10. **Entries have no ids, and most cannot be deleted.** Undo for a logged
    dose, and the "Delete this entry?" sheet, need a way to address one entry.
    `type` plus `ts` is unique except for same-millisecond writes.
11. **Weights are pounds and lengths inches, unlabelled.** A kg or cm option
    is new state plus conversion at the edges; stored values stay as they are.
12. **`weight` can be `null`** on weight entries, and body fat lives in three
    places.
13. **Photos are text.** The Photos screen in the redesign needs image
    storage that does not exist, and that a JSON backup cannot reasonably
    carry.
14. **Settings in localStorage are not backed up.** Where the redesign's new
    settings live decides whether a restore brings them back: slot times, the
    discreet flag, the figure and the theme are part of the user's setup, and
    today's equivalents are lost on restore.
15. **Six functions used browser dialogs on data paths**: `tlSetSupply` (a
    real `window.prompt()`, which the handoff's audit did not count),
    and `loadDemoData`, `clearProtocol`, `deleteBPEntry`, `deletePhotoEntry`
    and `resetAllData` (`confirm()`, twice in the last). The five
    `confirm()` paths now ask through the in-app sheet (section 8).
    `tlSetSupply`'s `prompt()` remains until the inventory editor replaces
    it.

## 8. What Phase 1 adds

Phase 1 of the redesign adds logic under `src/logic/`, inlined into
`app.html` by `scripts/build-app.js`, and with it four top-level keys and
four fields on medication entries. Nothing here is written for a user who
only uses the screens that existed before: the new keys appear on the first
write through the new model. `tests/fixtures/demo-backup-v3.json` is a record
that has them all.

| Key | Type | Written by |
|---|---|---|
| `v` | number. Absent before the redesign; `3` once the record holds a protocol model | `tlMigrateRecord`, `tlStoreProtocol`, `tlImportModel`, `tlAfterLegacyProtocolSave` |
| `protocol` | object, below | `tlMigrateRecord`, `tlStoreProtocol`, `tlImportModel`, and `tlAfterLegacyProtocolSave` when a save from the old protocol form finds one stored; deleted by `clearProtocol` |
| `doseChanges` | array, newest first | `tlRecordDoseChanges`, `tlImportModel` |
| `settings` | object: `{ figure, units }` so far | `tlSetSetting`, `tlImportModel` |

### `protocol`

```js
{ name, start, weeks, pct, created,              // carried from proto
  discreet: false,                               // hide compound names in alerts (so does the device's switch)
  slots: { am: { t: 480, alert: true }, mid: { t: 750, alert: true },
           eve: { t: 1200, alert: true }, bed: { t: 1290, alert: true } },   // t = minutes since midnight
  compounds: [{
    key: "bpc",                                  // stable; safe inside a dose id
    name: "BPC-157",                             // as typed; still the join to older entries
    drugId: "bpc",                               // encyclopedia id, or null
    dose: { amount: 250, unit: "mcg", text: "250mcg twice daily" },   // text always kept; amount null if unclear
    route: "sq",                                 // "im" | "sq" | "oral" | "topical" | null
    rule: { daily: true },                       // tlDueOn()'s rule shape; null = no schedule
    freqText: "Twice daily",                     // the old frequency text, when there was one
    note: "glute only",                          // the old line's text after its frequency; absent if none
    slots: ["am", "eve"],
    inv: { per: 20, left: 7, spare: 0, since: "2026-11-16T15:00:00.000Z" }   // or null
  }] }
```

`tlProtocol(record, env)` returns it. **While a record has no `protocol`, the
model is derived from `proto`, `reminderTimes` and `supply` at every call and
nothing is stored** (`tlProtocolFromLegacy`); the derived object carries
`derived: true`. Once stored, `protocol` is the truth, and each
`tlStoreProtocol` also rewrites `proto` and `reminderTimes` from it as the
closest thing the old shape can say, for the code and the older builds that
still read them. `supply` is not rewritten.

How each old field is read is in `src/logic/protocol.js` and pinned in
`tests/protocol.test.js` and `tests/review-protocol.test.js`. In short:

- **Weekdays.** Days the user wrote out in the frequency text become the rule
  only when they are a plain list ("Mon/Thu", "Monday, Wednesday and Friday",
  plurals such as "Sundays") or a range, which covers the days between
  ("Mon-Fri", "Mon through Fri", "Monday to Friday"; a dash joining three days
  or more, "Mon-Wed-Fri", is a list). They are not used, and the line is read
  as `getDoseDays` reads it, when an exception or anchor word comes before a
  day ("except", "excluding", "skip", "no", "not", "off", "start", "starting",
  "begin", "from", "until", "till"), for a pulse, an interval or a monthly
  line, or for a weekly line that names a different number of days than it
  takes a week ("Twice weekly (Mon)"). The count is the one the text states
  when it states one: `parseFrequency` reads "3x weekly" as once a week, but
  "3x weekly (Mon/Wed/Fri)" is Monday, Wednesday and Friday.
- Otherwise weekly protocols fall on the start weekday, as `getDoseDays`
  placed them, and the 10-day pulse gets no rule.
- **Notes.** `parseMeds` reads three comma-separated fields and ignores the
  rest. Everything after the third comma is kept as the compound's `note`, and
  written back after the frequency. Days in a note count only for a weekly line
  whose frequency names none, and only as many as the line takes ("Twice
  weekly, Mon AM and Thu PM" is Monday and Thursday); a daily line's note never
  changes its days.
- **Dose.** An amount is read only when the text is unambiguous. A number with
  no unit read is left as text when a word, a `%` or a slash follows it ("250
  mcg/day", "2 sprays", "250 mcgs", "250 twice daily"), so a dose never loses
  its unit; "80 mg IM" is still 80 mg.
- Reminder times map to the four slots by time of day.

**Keys.** A compound's `key` is its encyclopedia id, or its name reduced to
`a-z`, digits and hyphens, or, for a name with none of those ("Сустанон"),
`c-` and a hash of the name (32-bit FNV-1a, base 36), so it does not depend on
where the line is. Two lines with one id get `-2`, `-3` by position, which is
why a model read from the text is never paired by key (`doseChanges`, below).
`tlNormalizeProtocol` keeps a stored key that is a non-empty string with no
colon and not already used by an earlier compound, since logged doses carry
it; any other compound with a name gets a key made from the name, never one a
later compound holds. A compound with neither a key nor a name is dropped.

**A stored protocol from a file is not trusted to have its shape.** A field of
the wrong type is replaced rather than read (slots that are not a list are no
slots), so a damaged compound cannot stop the read or the import it is part
of. Each slot's time is kept inside its own span, morning 04:00 to 10:59,
midday 11:00 to 15:59, evening 16:00 to 20:29 and bedtime 20:30 to 03:59,
moving to the nearer end when outside it; the derivation applies the same
clamp. Otherwise a morning round at 11:30 would be written to `reminderTimes`
and read back as midday.

**What `tlStoreProtocol` writes into the old fields** (`tlProtocolToLegacy`):

- Each line is `name, dose, frequency`, then `, note` if there is one. A comma
  in the name or dose becomes `;`.
- The dose is the text the user typed when it states the model's amount and
  unit, otherwise the amount itself ("80 mg"), so the line never says a dose
  the model does not.
- The frequency is one the old screens and the derivation both read back as
  the same doses on the same days: daily or twice daily, every other day and
  every 3 days, monthly, one or two named weekdays, and weekly or twice weekly
  from the start day written out as those weekdays. Intervals, monthly and
  start-day weekly need `start`. **Any other rule, and a null rule, is written
  as a pulse**, "Every 2 weeks (pulse - see app)" (or "Custom schedule (pulse -
  see app)" where the label would read as another frequency), which every old
  reader treats as never due: an older build shows no dose days rather than
  dosing a fortnightly compound daily. An unscheduled compound whose own old
  text was already a pulse keeps that text.
- `reminderTimes` is keyed by the name exactly as the line has it, one time
  per slot from the protocol's slot times; a scheduled compound in no slot
  gets `[]` rather than the defaults.

**`discreet`.** Two switches hide compound names: the stored protocol's
`discreet` and the device's old discreet-reminders setting (localStorage
`tl_notif_discreet`, section 5), passed in as `env.discreet`. `tlProtocol`
returns `discreet: true` when either is on, so names are shown only when both
are off. A derived protocol follows the device setting alone.

`inv` is never decremented. Doses left now is `left` minus the medication
entries for that compound since `since`, opening a spare when the open vial
runs out (`tlSupply`).

### `doseChanges`

```js
{ ts: "2026-11-16T15:00:00.000Z", key: "hcg2", name: "HCG", from: "250 IU", to: "500 IU" }
```

One row per compound whose dose changed in a protocol save, from either the
new model or the old protocol form (`saveProtocol` calls
`tlAfterLegacyProtocolSave`). Unique `ts` per row. `from` and `to` are the
dose as text (`tlDoseText`), so a dose read as text only keeps its unit.

Which compound is which across a save is `tlPairCompounds`
(`src/logic/changes.js`), one to one, in passes: same name, dose and
frequency text (an unchanged line); same name and frequency text; same name,
the rest in order; and, only when neither protocol was read from the text,
same key. Names compare without case or spacing. Where the earlier protocol is
a stored model, its frequency text also matches the text `tlStoreProtocol`
wrote for it. A compound left over on either side was added or removed, and
neither is a change. So removing, reordering or adding a line, two lines that
resolve to one encyclopedia id ("BPC-157" and "BPC-157 Oral", "Anastrozole"
and "Arimidex"), and a dose split over two lines with one name record nothing
unless a dose really changed. `tests/review-protocol-save.test.js` has each
case, with the app's own resolver.

### `settings`

Display settings that belong to the person rather than the device, kept in
the record so that a restored backup brings them back. `figure` (`"male"` or
`"female"`, the body map) and `units` (`"imperial"` or `"metric"`) are the two
defined so far. The theme stays in localStorage `tl-theme`, where it has to be
readable before the record loads.

### Medication entries

A dose logged through the rounds checklist is an ordinary `medication` entry
with up to four more fields:

| Field | Meaning |
|---|---|
| `key` | the compound's `protocol.compounds[].key` |
| `slot` | `am`, `mid`, `eve` or `bed` |
| `day` | the local day the dose was due, `YYYY-MM-DD`, which can be the day before `ts` for a bedtime dose logged after midnight |
| `siteId` | an id from `assets/figures/injection-sites.json`, alongside the site's name in `site` |

Together `key:slot:day` is the dose id. An entry without them, logged from an
old screen, is matched to a round by compound name, local day and nearest
time (`tlRoundsFor`). Entries logged in one tap get consecutive milliseconds
so that no two share a `ts`.

### What changed in the old code paths

- `importData` now calls `tlImportModel` for the four keys above, with the
  same manners as the rest of the import: a merge, and the device wins. The
  model follows `importData`'s decision about `proto`, so the two always
  describe one protocol: when the device takes the file's `proto` it takes the
  file's `protocol` with it, or drops its own when the file has none; when it
  keeps its own `proto` it keeps its own model, or lack of one; when neither
  has a `proto`, a device model with compounds is kept and an empty one is
  treated as no protocol. A model taken from the file also rewrites
  `reminderTimes` for its compounds from its slots, and writes `proto` from
  it when the device has none, so stale times on the device cannot disagree
  with it. A file whose `v` is higher than this build's is still imported,
  with a note that some of it may not have carried over.
- A file whose `protocol` cannot be read is still imported: `tlImportModel`
  skips the model and returns `skipped: true`, and `importData` also catches
  any failure of the call on its own. Either way the entries and the rest of
  the file are saved, and the result line says the protocol schedule was left
  out.
- `sd()`'s cross-tab merge unions `doseChanges` along with the four arrays it
  already did.
- `saveProtocol` records dose changes. With no stored `protocol` nothing is
  stored, as before. With one, `tlAfterLegacyProtocolSave` keeps it: the model
  is read again from the text just saved, and each compound paired with a
  stored one (the `doseChanges` pairing) keeps its key, encyclopedia id, route
  and `inv`, and its rule too while its frequency text is unchanged, so a rule
  the text could only write as a pulse survives a save that left its line
  alone. A line the text adds gets a new key, never one the stored model held.
  The protocol keeps its slot times, alert switches and `discreet`. That is
  stored as `protocol` (`v` 3); `proto` and `reminderTimes` keep exactly what
  the user typed. If bringing the model up to date fails, `saveProtocol` drops
  it rather than the save: the text is saved, and the model is read from it.
  `clearProtocol` drops the model.
- Item 1 of section 7 is therefore handled for these keys. It will be true
  again of any key added later: `tlImportModel` is the place to add it.

### Questions before destructive actions

The six `confirm()` dialogs are gone. `clearProtocol`, `deleteBPEntry`,
`deletePhotoEntry`, `resetAllData` and `loadDemoData` are now `async` and ask
through `tlAsk(tlConfirmCopy(kind, detail))` (`src/logic/confirm.js`): an
in-app sheet that names the thing being deleted, offers "Export a backup
first" before the two actions that replace everything, and resolves only when
the user answers. The two questions `resetAllData` used to ask are one.

Two behaviours a caller relies on:

- The functions return a promise that settles after the question is answered,
  and nothing has changed while it is open. Scripts that load demo data
  (`capture-backup-fixture.js`, `ui-check-features.js`,
  `capture-guide-shots.js`) click the sheet's action button; a browser dialog
  appearing on these paths is now a failure. `scripts/ui-check-confirm.js`
  checks every path in a browser.
- `deleteBPEntry` and `deletePhotoEntry` still take a position in a list, as
  their buttons pass one, but find the item again by its timestamp once the
  answer comes back, so a list that changed while the sheet was open cannot
  lose the wrong item.
