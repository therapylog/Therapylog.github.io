# TherapyLog data model

What `app.html` stores, in what shape, and which functions read and write it.
Written for Phase 0.2 of the app redesign: Phase 1 migrates this data to a new
protocol, rounds, supply and injection-site model, and those migrations are
written from this document.

Line numbers are for `app.html` as of 16 November 2026 (`APP_VERSION`
`2026.09.07`) and will drift. The key names will not, and they are checked:

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

`gd()` (1589) reads; `sd(d)` (1599) writes. Nothing else should touch `tlv2`.
One thing does: `loadDemoData` (8688) writes it directly.

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
- **Start-up, `initStorage()` (1634):** when both stores hold a record, the one
  with the later `_savedAt` wins; if neither has `_savedAt`, the one with more
  entries wins. The winner is written to the other store. IndexedDB alone
  restores localStorage, which is what brings a record back after Safari
  clears localStorage.

**There is no schema version.** The record has no version field. Backup files
carry `version: 2` in their envelope (section 7) and nothing reads it.

## 3. The main record

Twelve top-level keys, plus `_savedAt`. Only `entries` and `proto` always
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
`new Date().toISOString()` (1670): a UTC instant with milliseconds, always the
moment of saving. There is no way to back-date an entry; only bloodwork
carries a separate, user-chosen `labDate`.

Ordering: newest first, kept that way by each writer using `unshift` rather
than by a sort on save. Three paths do sort by `ts` descending: `importData`,
the Apple Health import, and the cross-tab merge in `sd()`. `loadDemoData` is
the exception to the order: it writes entries grouped by type, and they stay
that way until one of those three runs.

Deleting and editing: **only blood-pressure readings can be deleted**
(`deleteBPEntry`, 8255, by position among the BP entries). No function deletes
or edits a weight, dose, body, symptom or bloodwork entry. The
`confirm('Delete this entry?')` at 7095 belongs to photo check-ins (3.8), not
to this array. One path edits in place: the Apple Health import (below).

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

Written by `saveWeight` (1712) from inputs `ww we ws whrv wsteps wstress
walcohol wn`. Zero is stored as `null` for every optional field, because each
is read with `parseInt(x) || null`. `mood` comes from `selMood`: `e` is an
emoji from `MOOD_MAP` (keys `sleep neutral good great peak`), `l` the button
label.

**The unit is pounds, always.** Nothing in the app stores or converts units;
labels say "lbs". There is no kg setting.

The Apple Health import (`importAppleHealth`, 8325) adds rows of the shape
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
| `saveMed` (1730) | the `mmed` select, or free text when "Custom..." | input `md`, free text | `S.site` or `null` | input `mn` |
| `quickLogDose` (4705) | the protocol line's name | the protocol line's dose text | the suggested site or `null` | `"Logged via reminder"` |
| `syrLog` (10648) | the syringe row's name | `r.dose + r.unit` | `null` | `"Combined syringe"` |
| `loadDemoData` (8588) | literal | literal | literal | literal |

`site` is exactly one of: `L Delt`, `R Delt`, `L Glute`, `R Glute`, `L Quad`,
`R Quad`, `L Lat`, `R Lat`, `Sub-Q Belly`. The ninth button is labelled
"Sub-Q" but stores `Sub-Q Belly` (`selSite`, 1708; pinned in
`tests/sites-and-levels.test.js`). Route (IM or SubQ) is not stored anywhere.

`dose` is whatever was typed: `200mg`, `0.5ml`, `250mcg twice daily`,
`200mg/week`. `pkParseDose` (10302) is the only parser: first number, then an
optional unit directly after it (`mcg mg iu unit(s) ml`), default mg.

`medication` is the join key to the protocol, and it is compared by exact
string equality everywhere except the level chart (3.5).

#### `body`

```js
{ type: "body", ts, measurements: { chest: 44, waist: 34, hips: 40, neck: 16,
    larm: 15.5, rarm: 15.5, lthigh: 24, rthigh: 24, bf: 16.2 }, notes: "" }
```

`saveBody` (1748). `measurements` holds only the keys that were filled in.
Inches, except `bf` which is a percentage. Not in the demo data.

#### `symptom`

```js
{ type: "symptom", ts, severity: 6,          // int 1-10 or null
  category: "Energy",                        // the `scat` select's value, may be ""
  description: "Afternoon crash",            // required
  related: "" }                              // free text
```

`saveSymptom` (1760) writes no `notes`; the demo entries have one.

#### `bloodwork`

```js
{ type: "bloodwork", ts,
  labDate: "2026-10-28",                     // YYYY-MM-DD from a date input, may be ""
  labs: { tott: 748, e2: 28, cm_zonulin: 42 },   // numbers, by marker key
  labMeta: { tott: { source: "scan", unit: "nmol/L", refLo: 8.6, refHi: 29,
                     converted: true, convertedFrom: "...", method: "LC/MS-MS" } },
  notes: "" }
```

`saveBloodwork` (1775). `labs` keys are `LAB_FIELDS` keys (4722) plus custom
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

`saveBP` (8200) accepts systolic 60 to 250 and diastolic 40 to 150 and does
not check that systolic is above diastolic. `stage` is one of `Normal`,
`Elevated`, `High — Stage 1`, `High — Stage 2`, `Hypertensive Crisis`, or `""`,
frozen at save time (`getBPStage`, 8172; boundaries pinned in
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

One protocol at a time, or `null`. Written whole by `saveProtocol` (1822,
inputs `cn cs cd cm cp`), `saveObStep4` (6490, onboarding, `pct: ""`),
`loadDemoData`, and set to `null` by `clearProtocol` (4241). `loadTemplate`
(3905) only fills the form; the user still saves. Import fills it only when
the device has none.

**The protocol is free text.** `meds` is one compound per line,
`name, dose, frequency`, split on every comma (`parseMeds`, 4159). There are
no compound ids: `parseMeds` assigns `id: "med-" + lineIndex` and a colour by
position at every call, so both change when a line is inserted. The name is
whatever was typed and need not match the encyclopedia.

`parseFrequency` (4139) matches the third field by substring, in this order:

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

- **`getDoseDays` / `tlFreqDays` (4170).** The one the user sees: the
  dashboard's next-dose card, the week view, reminders, both calendar exports,
  the report and the clinic view. Weekly protocols are placed from the
  protocol's start weekday (start day, and start day + 3 for twice weekly),
  ignoring `days: [1, 4]`. `pulse` is never a dose day.
- **`tlDueOn` and the rule engine (5440 to 5645).** Called only by
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
`removeReminderTime` (4580 to 4604). A compound with no entry falls back to
`getDefaultTimes(freq)`: `["08:00", "21:00"]` for twice daily, `["08:00"]` for
daily, `["09:00"]` otherwise. Renaming or removing a line in the protocol
leaves its old key behind; nothing prunes this map.

`remindersFired` is `name-HH:MM-` + `new Date().toDateString()`, written by
`checkAndFireReminder` (4382) when a notification fires, and pruned to 30
days there. Because names can contain hyphens, the key cannot be split back
reliably; the pruner takes the last hyphen-separated part as the date.

The "discreet" switch is not here; it is localStorage `tl_notif_discreet`
(section 5). On the web, reminders are `setTimeout`s armed for the next hour
while the page is open (`scheduleAllReminders`, every five minutes). The
native shell replaces that with `TLNative.reschedule` (11526), which reads
`proto` and `reminderTimes`.

### 3.4 `supply`

```js
supply: { "BPC-157": { vials: 2, sinceTs: "2026-11-01T15:00:00.000Z" } }
```

Keyed by compound name. Written only by `tlSetSupply` (8160), which asks with
a browser `prompt()`. Read only by `calcRefillAlerts` (8061). There is no
vial size, no dose count and no spare-vial count: "days per vial" is
`30 / DRUG_COSTS[name].monthly`, a fixed table (6914) keyed by exact name, so
a compound the table does not list has no refill tracking at all. The
arithmetic is pinned in `tests/supply.test.js`.

### 3.5 `pk`

```js
pk: { "tc": { hl: 192, tmax: 48 }, "raw:myblend": { hl: 12, tmax: 2 } }
```

Per-compound overrides of half-life and time to peak, in hours
(`pkSaveOverride`, 10550). The key is `pkKeyFor(name)`: an encyclopedia drug
id when `pkResolve` can match the name, otherwise `raw:` + the normalised
name. `pkResolve` (10272) is the one fuzzy name match in the app: normalised
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

`saveProfile` (5408) replaces the whole object from the profile form.
Onboarding (`saveObStep2`, `saveObStep3`) sets individual fields. Everything
is a string. `sex` is `"Male"`, `"Female"`, `"Other"` or `""`; `isFemale()`
(8718) is `sex === "Female"` exactly, and it decides whether the cycle page is
offered.
`dob` and `nextAppt` are `YYYY-MM-DD`. `height` is free text. `sex` and the
age from `dob` adjust lab reference ranges (`getAdjustedLabRanges`, 6983).

Not in the profile, and not anywhere: a unit preference, a body-map figure,
the user's initial as a separate field.

### 3.7 `customMarkers`

```js
customMarkers: { cm_zonulin: { name: "Zonulin", unit: "ng/mL", lo: 0, hi: 40,
                               added: "2026-11-16T15:00:00.000Z", hidden: true } }
```

User-defined lab markers. The key is `cm_` + the normalised name, cut to 40
characters (`customMarkerKey`), and is the key used inside a bloodwork
entry's `labs`. `removeCustomMarker` (4882) deletes an unused definition and
sets `hidden: true` on one that past panels reference.

### 3.8 `photos`

```js
{ ts, date: "2026-11-16", week: "Week 8 Check-in",
  weight: 195.2, bf: 16.2,              // numbers or null
  notice: "...", conditions: "...", mood: "4", protocol: "Week 8 of 16", notes: "" }
```

**There are no photos in `photos`.** It is a list of written progress
check-ins: `savePhotoEntry` (7038) stores text and two numbers, and no image
data exists anywhere in the app's storage. `deletePhotoEntry` (7093) removes
by array index. Newest first by `unshift`; import appends without re-sorting.

### 3.9 `bodyComp`

```js
{ ts, weight: 195.2, bf: 16.2, lean: 163.6, fat: 31.6 }
```

`saveBodyComp` (3918), from the body-composition tool. Pounds and percent;
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

`saveFemEntry` (8745). Its `type` is `period`, `symptom` or `ovulation`, a
different vocabulary from `entries[].type`. `getCycleStats` (8779) takes
period entries whose `flow` is not `end` or `spotting` as cycle starts and
keeps gaps of 16 to 49 days.

### 3.11 `_bpSysBuffer`

Scratch space inside `importAppleHealth`: systolic values waiting for their
diastolic pair. It is deleted before the save (8422) and never reaches
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
- clinic mode (`clinicModeActive`, 7314) and the open tab are memory only

## 5. localStorage outside the main record

None of these is in a backup or restored by import. "Reset" is whether
`resetAllData` (7204) removes it.

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

`tlEffectiveTier()` (9563) is the only thing that should be asked for the
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
in IndexedDB `TherapyLogBackup` / `handles`, and `tlAutoBackup` (9465)
rewrites that file on start-up when `tl-last-export` is more than seven days
old. `tlDaysSinceBackup()` returns whole days since the last export, or
`null` if there has never been one. The dashboard banner (`checkPersistBanner`)
appears after seven days without an export.

**Import is a merge, not a restore** (`importData`, 7141). It accepts the
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

**Reset** (`resetAllData`, 7204) asks two `confirm()` questions, removes
`tlv2` and the fifteen keys marked "yes" above, and deletes every IndexedDB
database it can enumerate.

**Demo data** (`loadDemoData`, 8564) asks one `confirm()`, then replaces the
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
15. **Six functions use browser dialogs on data paths**: `tlSetSupply` (a
    real `window.prompt()`, which the handoff's audit did not count),
    and `loadDemoData`, `clearProtocol`, `deleteBPEntry`, `deletePhotoEntry`
    and `resetAllData` (`confirm()`, twice in the last). The fixture capture
    script answers `loadDemoData`'s dialog and will need updating when it
    becomes an in-app sheet.
