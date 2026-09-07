# Shell/web merge plan — resolving the two copies of the app

**Generated:** 5 September 2026, from a function-level classification of
`Therapylog.github.io/app.html` against `therapylog-app/www/index.html`,
adversarially audited. Companion to `RESTRUCTURE-PLAN.md` phase 0.2.

**Status: superseded in approach, still useful as a per-function record.**

The plan below assumed the two copies would be reconciled function by function
and then both maintained. That is no longer how it works. `www/index.html` is
now generated:

    vendor/app.html          this file, copied into therapylog-app, never edited there
  + shell/overrides/<fn>.js  one file per function that must differ
  + shell/native.js          the Capacitor layer
  = www/index.html

`therapylog-app/scripts/build-shell.js --check` runs in that repo's CI, so the
two copies cannot drift again — which was the actual problem. See
`therapylog-app/shell/README.md`.

What that changed, against the classification below:

- The **16 site-newer** functions needed no work at all. They are simply what
  the generator emits, because `app.html` is the input.
- The **23 site-only** functions likewise arrived for free: the scheduling
  engine, the PCT builder, the clinical analysis, PK steady-state, discreet
  reminders. The shell had none of them and now has all of them.
- The **6 platform** functions turned out to be **3** (`checkNotifSupport`,
  `requestNotifPermission`, `scheduleAllReminders`), and even those are inert
  on the web — their native branch is behind `window.TLNative &&
  TLNative.active()` — so they belong upstream in `app.html` too.
- The **16 shell-newer** functions are the only real remaining work. They sit
  in `shell/overrides/` as explicit, readable files rather than as invisible
  drift, and each is either work to merge back into `app.html` or a stale copy
  to delete. The per-function port plans below still apply to those.

Three things the classification did not catch, all found while building the
generator and all fixed:

- `getBPStage` in the shell called a hypertensive crisis "Stage 1" whenever one
  of the two numbers was normal. 200/85 told the user to modify their lifestyle.
- The shell gated 5 features where the web app gated 15, so six features
  advertised as paid shipped free in the store binaries.
- `TLNative.reschedule()` ignored the discreet-reminders switch, so OS
  notifications named the compound and dose on the lock screen with the switch
  on. (This one the plan *did* flag, under `scheduleAllReminders`.)

Steps 1-4 (the C-0 path) are done. The per-function detail below is retained
because it is the reasoning behind each override that still exists.


## Why this exists

Two hand-maintained copies of a ~930 KB single-file app drifted in both
directions. 251 functions are identical, 35 differ, 9 exist only on the web and
3 only in the shell. The web copy carried the C-0 privacy remediation the shell
never received; the shell carried a native layer the web never had. **Neither
file was a superset, so neither could replace the other.**


## Verdicts

| Verdict | Count | Meaning |
|---|---|---|
| `site-newer` | 16 | keep the web version; the shell was behind |
| `shell-newer` | 16 | the shell has real work the web lacks — port it in |
| `platform` | 6 | genuine platform split — merge both behind a runtime guard |
| `conflict` | 0 | **none** — every difference is resolvable |

The absence of conflicts is the headline: nothing here requires choosing which
side's behaviour to lose.


### Platform merges — both paths, one source (6)


#### `checkNotifSupport` · risk medium

Three-way difference. The shell adds a native branch (TLNative.permission() -> granted/denied/default card states, plus TLNative.reschedule()) that the site has no equivalent for. The shell's WEB branch also carries a 'notif-honesty-note' that the site has never had (0 occurrences in site app.html, no hit in site git history for -S notif-honesty-note) - that is real shell work from commit 873572c, not a site refactor. Conversely the site's granted branch sets `dc.checked = discreetReminders()` (site app.html line 3435) for the notif-discreet checkbox, a privacy control that exists only in the site (discreetReminders/setDiscreetReminders, key tl_notif_discreet); the shell's native branch never touches it, so a straight shell copy would render the discreet checkbox permanently unchecked on iOS/Android. Both sides are additive and compatible, so this is a guard-both-paths merge, not a conflict.


**Port plan.** Rewrite site app.html checkNotifSupport (line 3420) as: keep the two getElementById lookups and the early return; then insert the shell's native block verbatim from shell www/index.html lines 3321-3341 (`if (window.TLNative && TLNative.active()) { TLNative.permission().then(perm => {...}).catch(()=>{}); return; }`). Leave the site's existing `!('Notification' in window)` / isIOSBrowserTab block and the denied-note block byte-identical - do not take the shell's copies, they are the same text. Into the site's web `granted` branch add the shell's web-worded notif-honesty-note append (id notif-honesty-note, the 'these reminders fire while TherapyLog is open in your browser' text), keeping the site's existing `const dc = ...; dc.checked = discreetReminders();` line. Into the ported NATIVE granted branch add the same two lines - the shell's native-worded honesty note ('delivered by your phone even when TherapyLog is closed') AND a copy of `const dc = document.getElementById('notif-discreet'); if (dc) dc.checked = discreetReminders();` which the shell is missing. Guard condition is exactly `window.TLNative && TLNative.active()`, where TLNative.active() is `window.Capacitor && Capacitor.isNativePlatform() && Capacitor.Plugins.LocalNotifications` - inert on web. Requires the TLNative object (shell lines 8858-8941) to be ported into the site first; it is an object literal so it never showed up in the shell-only function inventory. No CI impact: checkNotifSupport is not in the LIFTABLE list in scripts/validate-public-pages.js.


#### `requestNotifPermission` · risk low

The site and shell web paths are byte-identical (isIOSBrowserTab toast, Notification.requestPermission, checkNotifSupport, scheduleAllReminders). The shell's only delta is a native early-return that asks the Capacitor LocalNotifications plugin for permission instead of the Web Notification API - genuinely platform-specific, since Notification.requestPermission does not exist / does not govern OS notifications inside the Capacitor WebView. Nothing is lost on either side.


**Port plan.** In site app.html requestNotifPermission (line 3452), prepend the shell's native block verbatim (shell www/index.html lines 3389-3395): `if (window.TLNative && TLNative.active()) { TLNative.request().then(perm => { checkNotifSupport(); if (perm === 'granted') { toast('Reminders enabled!'); TLNative.reschedule(); } else { toast('Notification permission denied'); } }).catch(() => {}); return; }`. Leave the entire remaining site body untouched - do not merge the two toast paths, do not touch the isIOSBrowserTab string. Same guard as checkNotifSupport: `window.TLNative && TLNative.active()`. Optional simplification to skip: once scheduleAllReminders carries its own native guard, the native branch could call scheduleAllReminders() instead of TLNative.reschedule(); keep the explicit reschedule to match the shell and avoid an extra indirection.


#### `scheduleAllReminders` · risk medium

Identical bodies except the shell's one-line native early-return `if (window.TLNative && TLNative.active()) { TLNative.reschedule(); return; }`. This is correct platform behaviour: on native the in-page setTimeout loop (checkAndFireReminder) cannot fire with the app closed, so TLNative pre-schedules 30 days of OS-level notifications instead. Elevated risk is not in this function but in what it delegates to: TLNative.reschedule() (shell lines 8892-8935) builds every title as `'\u{1F489} ' + med.name + ' Due'` with dose and injection site in the body, unconditionally - it predates the site's discreetReminders() and would silently ignore the discreet switch on native.


**Port plan.** In site app.html scheduleAllReminders (line 3471), prepend exactly one line: `if (window.TLNative && TLNative.active()) { TLNative.reschedule(); return; }`. Leave the rest of the site body (gd/parseMeds/reminderTimes/getDefaultTimes/checkAndFireReminder loop) unchanged. Leave the 5-minute `window._tlRemArm` interval at site lines 3483-3484 alone - on native it degrades to a cheap TLNative.reschedule() that early-returns on its `_sig` cache. When porting the TLNative block itself (shell lines 8858-8941, must be copied into the site verbatim as a new block near the end of the script), make one required edit: inside the offsets.forEach push, replace the hardcoded title/body with a discreet-aware pair, i.e. if `typeof discreetReminders === 'function' && discreetReminders()` push `{ at: at, title: '\u{1F514} Dose due', body: 'Open TherapyLog to see which.' }` else the shell's existing `'\u{1F489} ' + med.name + ' Due'` / dose + suggested-site body. Also add `discreetReminders()` to the `_sig` JSON.stringify array so toggling the switch invalidates the cache and forces a re-schedule.


#### `tlRefreshEntitlement` · risk medium

The web path (license key/email re-verify, lapse toast, mid-flight-change guard) is identical in both. The shell adds a native-only branch the site lacks entirely: on an ios-iap entitlement it re-validates the App Store receipt when the record is stale, past its expiry, or has no iosToken. The site instead returns early on `e.source === 'ios-iap'`, so on native a cancelled or expired subscription is never re-checked and stays Pro forever. Merged version must carry both paths. Site app.html:7846, shell index.html:7818.


**Port plan.** In app.html:7846 replace `if (!e || e.source === 'ios-iap') return;` with the shell's `if (!e) return;` followed by the shell's ios-iap block verbatim (stale / expiring / !e.iosToken → `if (... && window.TLIAP) { try { TLIAP.validate(); } catch (err) {} } return;`). The runtime guard is the one already in that code — the entitlement's own `source === 'ios-iap'` (only TLIAP/TLTier.set ever writes it, so it is unreachable on web) plus `window.TLIAP`; do NOT add a window.Capacitor test, and note TLIAP.validate() is self-inert on web because appReceipt() returns null. The branch is dead code unless three missing dependencies are ported in the SAME commit: (1) TLIAP.appReceipt() and TLIAP.validate() from shell index.html:7315-7357 into the site's TLIAP object at app.html:7358, which currently has neither; (2) the `iosToken: function() { var e = tlReadEnt(); return (e && e.source === 'ios-iap' && e.iosToken) || null; }` accessor from shell index.html:7906 into window.TLTier at app.html:7918; (3) the shell's TLTier.set body that preserves `prev.expires` and `prev.iosToken` when the previous source was ios-iap (shell index.html:7900-7905). Also add the two TLIAP.validate() calls the site's TLIAP.init lacks — one in the `.verified(...)` handler after TLTier.set, one after store.initialize().then. Leave the site's web lapse logic untouched. Re-run node scripts/ui-check-entitlement.js (line 120 drives TLTier.set('pro','ios-iap') and must still read back 'pro').


#### `sendChat` · risk high · **touches C-0**

Two independent edits on different lines, not a conflict. Site (app.html:2447) carries the C-0 fix: the consent gate `if (aiPersonalized() && !aiCtxConsented()) { if (showAICtxConsent(sendChat)) return; }` and `context: aiPersonalized() ? getFullCtx() : ""`. Shell carries `iosToken: (window.TLTier && TLTier.iosToken && TLTier.iosToken()) || ""` in the POST body, whose value is native-only, and still sends `context:getFullCtx()` unconditionally — the shipped privacy exposure. The merged function needs the site's gating plus the shell's iosToken field, so both platforms prove entitlement from one source.


**Port plan.** Keep app.html:2447-2478 exactly as it stands. Preserve byte-for-byte: the comment at 2449, the gate at 2450, and `context: aiPersonalized() ? getFullCtx() : ""` at 2468 — scripts/validate-compliance.js:161 tests /context:\s*aiPersonalized\(\)\s*\?\s*getFullCtx\(\)\s*:\s*""/ and validate-compliance.yml runs it, so reformatting fails CI. The shell's one contribution, `iosToken: (window.TLTier && TLTier.iosToken && TLTier.iosToken()) || "",` is ALREADY in place at 2472 (committed, 163681b) with its comment at 2469-2471 — apply nothing, change nothing. The `window.TLTier && TLTier.iosToken` chain is the platform guard (web sends ""); add no Capacitor check. Never take the shell's `context:getFullCtx()` or its gate-free opening. DROP the housekeeping step entirely: do NOT delete anything at or near app.html:2518 — there is no duplicate aiCtxConsented; 2518 is inside the comment above `const AI_CONSENT = {` (2521), and any cut there removes the consent keys tl_ai_ctx_ok/tl_ai_scan_ok that both AI gates depend on. Verify after any edit in this region: `grep -c 'function aiCtxConsented' app.html` must be 1, `grep -c 'const AI_CONSENT' app.html` must be 1, then `node scripts/validate-compliance.js` (currently green, 1426 checks).


#### `scanLabImage` · risk high · **touches C-0**

Same shape as sendChat, on the second AI egress path. Site (app.html:4290) has the scan consent gate `if (!aiConsented('scan')) { if (showAICtxConsent(scanLabImage, 'scan')) return; }` (key tl_ai_scan_ok) with its comment about the report image carrying name/DOB/MRN; the shell never received it and uploads the report image with no consent at all. The shell adds the native `iosToken:` field to the labscan POST body. Everything else — the LAB-SCAN-PROMPT block, resolveMarker/buildPanel routing, extras/proposed handling, error branches — is byte-identical, so the ~19KB size is not hiding a lost shell feature.


**Port plan.** Keep the site's consent comment and `if (!aiConsented('scan')) { if (showAICtxConsent(scanLabImage, 'scan')) return; }` exactly where it is — after the labFiles/labFilesBytes checks and BEFORE the DOM is switched into the scanning state; order is load-bearing because showAICtxConsent resumes by re-invoking scanLabImage, so nothing may be mutated ahead of it. Add only the shell's `iosToken: (window.TLTier && TLTier.iosToken && TLTier.iosToken()) || "",` before the `license:` line in the labscan fetch body; already applied in the working tree at app.html:4347-4349 — leave it, and it stays inert until TLTier.iosToken() is ported. The `window.TLTier && TLTier.iosToken` chain is the platform guard. Do not edit anything between the LAB-SCAN-PROMPT:START/END markers — scripts/validate-markers.js parses that region. Never regress to the shell's gate-free opening. Re-run node scripts/validate-markers.js and node scripts/validate-compliance.js.


### Port from the shell (16)


#### `renderRefillAlerts` · risk medium

The shell adds two independent pieces of real work the site never had. (1) A Standard-tier gate (index.html:6346-6357): when !TLTier.isStd() it renders a locked teaser card wired to TLTier.check('refill_tracker') and returns early. The site already lists refill_tracker in its own Standard feature array (app.html:7931) and its feature-label map (app.html:7952), but no code path in the site ever enforces it — the site advertises refill tracking as a paid Standard feature and ships it ungated to free users. That is an entitlement leak the shell closed. (2) A supply-tracking footer row per card (index.html:6367) that calls tlSetSupply(name) and switches copy between 'Estimate — tap to enter how many vials you have' and 'Based on N vials since <date> — refilled? Tap to update'. Everything else (the alert card markup: name/dose/freq/daysRemaining/cost) is byte-identical between the two files, and the two early-return guards are identical. This is not platform-specific: TLTier is defined in BOTH builds (app.html:7911, index.html:7893) with identical isStd/check implementations, and nothing in the added code touches Capacitor, native notifications, or IAP. The size delta is genuine added feature surface, not a site-side refactor into helpers — I checked, the site has no tlSetSupply and zero references to d.supply anywhere.


**Port plan.** Port the shell's version into the site, but land it as ONE coupled change across four sites — porting renderRefillAlerts alone ships a visible bug.

1. renderRefillAlerts (replace body at app.html:6434 with index.html:6341-6371). Keep the existing identical head (calcRefillAlerts() call, the !container and !alerts.length guards). Add exactly two things: (a) immediately after the !alerts.length guard, the shell's gate block `if (window.TLTier && TLTier.isStd && !TLTier.isStd()) { <locked teaser card onclick="if(window.TLTier)TLTier.check('refill_tracker')"> ... ; return; }` copied verbatim from index.html:6346-6357; (b) inside the per-alert template literal, as the last child of the card, the supply row from index.html:6367 (the `<div onclick="tlSetSupply(...)">` with the a.estimate ternary).

2. MANDATORY companion — calcRefillAlerts (app.html:~6390). Port the shell's supply-aware branch from index.html:6306-6320: `const supply = (d.supply || {})[med.name];` then if `supply && supply.vials >= 0` compute daysRemaining from `supply.vials * daysPerVial - (dosesSince / dosesPerDay)` counting only medication entries at/after supply.sinceTs, and set estimate=false; otherwise keep the site's EXISTING last-log fallback verbatim as the estimate=true path. Then add `estimate`, `vials: supply ? supply.vials : null`, `since: supply ? supply.sinceTs : null` to the pushed alert object (index.html:6333-6335). Without this, a.estimate is undefined on the site, the ternary falls to the else branch, and every card renders the literal string 'Based on undefined vials since Invalid Date' (fd(undefined)).

3. MANDATORY companion — tlSetSupply. Copy verbatim from only-shell-tlSetSupply.txt (index.html:6377-6388) and place it directly after renderRefillAlerts in app.html. No shims needed: gd (app.html:1586), sd (1596), toast (1666) and fd (1664, byte-identical to index.html:1669) all already exist in the site.

4. MANDATORY companion — importData persistence. Add 'supply' to the settings-merge key list at app.html:5522, changing `['customMarkers','pk','reminderTimes','labMeta']` to match the shell's `['customMarkers','pk','reminderTimes','labMeta','supply']` (index.html:5413). Otherwise restoring a backup silently discards on-hand vial counts and every med snaps back to the estimate path.

LEAVE ALONE: do not reflow or restyle the existing alert card markup (the name/dose/freq/days/cost block) — it is byte-identical across both files and touching it makes the diff unreviewable. Add NO Capacitor/isNativePlatform guard: TLTier exists on web and native, and the shell's own gate uses only the defensive `window.TLTier && TLTier.isStd &&` existence check, which is the correct and sufficient guard to carry over.

CI notes: calcRefillAlerts/renderRefillAlerts appear only in app.html and are NOT lifted into any generated public page, so validate-public-pages.js's byte-for-byte drift guard does not fire and no page regeneration is needed. scripts/ui-check-entitlement.js currently has no refill assertion — add one (free tier sees the locked teaser, standard sees the countdowns), since after this port the gate is enforced only inside app.html and nothing else would catch a regression.

Flag for a human before shipping (product decision, not a merge blocker): on the web build this REMOVES refill countdowns from free users who can see them today. It matches the site's own published tier table, but it is a user-visible downgrade on an existing surface.

Optional cleanup while touching it: the onclick escapes only single quotes (`a.name.replace(/'/g, "\\'")`), so a med name containing a double quote breaks the attribute — prefer a data-name attribute plus a delegated listener. And tlSetSupply uses window.prompt(), which is unstyled and can be suppressed in an iOS WKWebView; a small in-app modal would be more reliable on native once the shell is regenerated from this file.


#### `calcRefillAlerts` · risk medium

The shell has a real feature the site lacks: user-entered vials-on-hand inventory. The site can only estimate days remaining from the timestamp of the last logged dose (daysPerVial - daysSinceLog). The shell keeps that as a fallback and adds a `d.supply[med.name] = {vials, sinceTs}` branch that counts doses actually logged since the refill (`daysRemaining = supply.vials * daysPerVial - dosesSince/dosesPerDay`) and tags every alert with `estimate`, `vials` and `since`. Nothing platform-specific - no Capacitor, no native API. Verified this is not a site refactor into helpers: site app.html has 0 occurrences of d.supply, supply[, tlSetSupply and no git history for any of them; the feature came from shell commit 873572c, whose message claims a matching website PR that never landed on app.html.


**Port plan.** Replace the body of site app.html calcRefillAlerts (line 6397) from `const lastLog = ...` through the alerts.push with the shell's version (shell www/index.html lines 6289-6340): keep the DRUG_COSTS/dosesPerDay/daysPerVial preamble identical, then insert `const supply = (d.supply || {})[med.name]; let daysRemaining, estimate;` with the shell's if/else, and extend the pushed object with `estimate: estimate, vials: supply ? supply.vials : null, since: supply ? supply.sinceTs : null`. This must land as one coordinated change with three other edits, or it is dead weight / a runtime break: (1) copy tlSetSupply verbatim from scratchpad only-shell-tlSetSupply.txt into the site next to renderRefillAlerts - it is the only writer of d.supply; (2) renderRefillAlerts (site line 6434, owned by another batch) must take the shell's tap-to-enter row that reads a.estimate/a.vials/a.since and calls tlSetSupply, so the field contract stays exactly estimate:boolean, vials, since; (3) importData (site, also another batch) must add 'supply' to `['customMarkers','pk','reminderTimes','labMeta']` as the shell does, or imported inventory is dropped. d.supply lives inside the existing gd()/sd() blob, so no new localStorage key and no validate-storage.js change. calcRefillAlerts is not in the LIFTABLE drift-guard list in scripts/validate-public-pages.js, so no public page regeneration is needed.


#### `renderPKLevels` · risk low

Full diff of the two bodies is exactly one hunk, 8 lines, in the shell's favour; the remaining ~120 lines (dose collection, the peak/decay landmark resampling, per-unit series splitting, Chart.js config, the adjust/override cards) are byte-identical. The shell fixes a real bug in the empty-state early return. The site computes mlSkipped, then `if (!meds.length) { empty.style.display=''; ...; return; }` and throws the value away — so a user whose doses are ALL logged in ml (a common case for injectables) gets the generic 'nothing to chart' empty state with no explanation, because the existing #pk-ml-note is only ever appended to #pk-chart-card, which is hidden on that path. The shell adds a second note node (#pk-ml-note-empty) appended to #pk-empty with the same 'Not charted (doses logged in ml — log the mg/mcg amount to include): …' text, plus the matching cleanup branch. Pure DOM work, no Capacitor or native API involved, so this is not a platform split.


**Port plan.** Port the shell's 8-line block into the site. In /home/user/Therapylog.github.io/app.html, replace the single-line early return `if (!meds.length) { empty.style.display=''; chartCard.style.display='none'; wrap.innerHTML=''; return; }` with the shell's expanded block: keep the three existing statements, then `let _mn = document.getElementById('pk-ml-note-empty');` / if mlSkipped.length create-or-reuse a div with that id and cssText 'font-size:10.5px;color:var(--text3);margin-top:8px' appended to `empty`, set its textContent to the same 'Not charted (doses logged in ml…)' string, `else if (_mn) { _mn.remove(); }` / `return;`. Leave everything else alone — in particular do NOT touch the existing #pk-ml-note block that appends to chartCard further down; the two notes are for mutually exclusive paths and both are needed. No new markup is required: id="pk-empty" already exists in app.html. Keep the two ids distinct (pk-ml-note vs pk-ml-note-empty) so neither path's cleanup removes the other's node. Only real risk: no CI covers PK at all (no script under /home/user/Therapylog.github.io/scripts/ references renderPKLevels, pk-empty, pk-list or pk-ml-note), so verify by hand with a med logged only in ml.


#### `toggleClinicMode` · risk medium

Bodies are byte-identical except the shell adds a two-line entitlement gate at the top: a comment plus `if (!clinicModeActive && window.TLTier && !TLTier.check('clinical_reports')) return;` (shell index.html:5547). This is not platform-specific and not a shell-only paywall experiment: the SITE's own TLTier already lists 'clinical_reports' in its std feature array and in TLTier.names (app.html ~7940-7960), and TLTier.prompt already branches to BOTH an iOS path (window.Capacitor.getPlatform()==='ios' -> TLIAP.showPurchaseSheet()) and a web path (link to therapylog.app/download, 'Get Full Access — from $8.99/mo'). The site declares the gate and never calls it — `grep -o "TLTier.check([^)]*)" app.html` returns only ai_scanner and ai_assistant, while the shell has seven call sites. Worse, the site's own published pricing says the free tier gets none of this: download.html:325 'No clinical reports' vs :343/:364 'Clinical reports and clinic mode'. So the site is shipping a feature it publicly says is paid. Site git history confirms the site never had it wired (only one commit, 51ff233, ever changed the `TLTier.check(` count in app.html). The shell's gate is also the more careful version — it deliberately gates only on the way IN so a lapsed plan cannot trap a user inside the clinic overlay with no way to leave.


**Port plan.** In /home/user/Therapylog.github.io/app.html, insert immediately after `function toggleClinicMode() {` (line 5661) the two lines copied verbatim from shell index.html:5546-5547, comment included:
  /* gate only on the way IN — a lapsed plan must never trap someone inside clinic view */
  if (!clinicModeActive && window.TLTier && !TLTier.check('clinical_reports')) return;
Keep the `!clinicModeActive &&` guard exactly as written — dropping it re-introduces the trap it exists to prevent (a user whose plan lapses while clinic mode is on could no longer hide the overlay). Change nothing else in the function; the remaining 11 lines are already identical. Do NOT wrap the gate in a Capacitor check — the site's TLTier.prompt already handles the web/iOS CTA split internally, so one unguarded call is correct for both builds. No site-side helper already does this (verified: the site has zero references to 'clinical_reports' outside the TLTier std array and names map). Two follow-ups outside this function, do not silently skip them: (1) generateReport needs the matching gate (separate decision in this batch) — clinic mode and the report are two independent entry points to the same paid feature; (2) the free-tier web user now hits an upgrade overlay on a control the public /guide tells them to tap, so /guide copy should note the plan requirement. CI is safe: scripts/validate-guide.js:116 only asserts the literal string 'Generate Clinical Report' is present in app.html, it never clicks it, and no ui-check-*.js exercises clinic mode.


#### `generateReport` · risk medium

A clean bidirectional diff with disjoint regions — NOT a conflict. Only two deltas across 156 lines: (a) the shell adds `if (window.TLTier && !TLTier.check('clinical_reports')) return;` as the first statement (shell index.html:4477); (b) the site adds a lab caveat div in the inclLabs block — the '“Sub-optimal” is measured against a non-diagnostic preference band, not a clinical reference range...' paragraph, which came from site commit bf2c501 'Six cardiovascular markers never flagged sub-optimal; calculator and report caveats' and is load-bearing for CI (validate-markers.js:176 and validate-public-pages.js:941-954 both enforce that an optimal band is labelled non-diagnostic wherever shown). Nothing overlaps, so both changes survive. Same reasoning as toggleClinicMode applies to the gate: the site already ships the whole entitlement apparatus for 'clinical_reports' (std array, names map, dual iOS/web upgrade CTA) and download.html:325 advertises 'No clinical reports' on the free tier, but the site never calls the gate. The report is a second, independent entry point to the same paid feature, so gating clinic mode alone would leave the paywall trivially bypassable via the report button.


**Port plan.** In /home/user/Therapylog.github.io/app.html, insert exactly one line immediately after `function generateReport() {` (line 4548), copied verbatim from shell index.html:4477:
  if (window.TLTier && !TLTier.check('clinical_reports')) return;
That is the entire port. Leave every other line of the site's function alone — in particular KEEP the site-only caveat div at site-relative line 94 of the function (the 'Sub-optimal is measured against a non-diagnostic preference band' paragraph inside the inclLabs block); the shell lacks it and removing it would break validate-markers.js / validate-public-pages.js non-diagnostic assertions. When the shell is regenerated from the merged site it correctly GAINS that caveat. Do not guard the gate on Capacitor — TLTier.prompt already picks the iOS vs web CTA. Note the early return fires before `document.getElementById('rpt-profile').checked` and friends are read, so it is safe even if the report form has not been rendered; keep it as the first statement rather than moving it below the const block. Same two follow-ups as toggleClinicMode: /guide copy names 'Generate Clinical Report' as a tap target for all users, and validate-guide.js:116 asserts only that the string exists (static check, no click), so CI passes either way.


#### `showHub` · risk low

The two bodies are byte-identical except that the shell adds a lapsed-plan fallback: it changes `const section` to `let section` and, when the restored section is 'femcycle' or 'photos' and `TLTier.isStd()` is false, silently rewrites it to `HUB_SECTIONS[hub][0]` ('bloodwork') and writes that back to hubState. This is not platform-specific — the site (app.html:7915) already defines the identical TLTier object with isStd(), check(), and a names map that lists cycle_tracker and progress_photos as Standard features; the site simply never wired the enforcement in. hubState (site:6741) is an in-memory object, so the case being defended is an entitlement demotion mid-session (tlRefreshEntitlement) leaving the hub pointed at a now-gated section, which the site would render ungated. Note the shell deliberately uses isStd() rather than check() here so no upsell overlay pops on an ordinary bottom-nav tap — that asymmetry with switchHubSection is intentional, not an oversight.


**Port plan.** In /home/user/Therapylog.github.io/app.html, function showHub at line 6766: change line 6785 from `const section = hubState[hub];` to `let section = hubState[hub];`, then insert the shell's block (therapylog-app/www/index.html:6803-6807) immediately after it and before `showHubSection(hub, section);` — the comment line, `if ((section === 'femcycle' || section === 'photos') && window.TLTier && TLTier.isStd && !TLTier.isStd()) { section = (typeof HUB_SECTIONS !== 'undefined' && (HUB_SECTIONS[hub] || [])[0]) || section; hubState[hub] = section; }`. Keep isStd(), do NOT substitute check() — check() calls prompt() and would throw the upgrade overlay on every hub tap. Leave the rest of the function (scroll, .page/.hub-page/.nav-btn class resets, the fab-ai display rule, the home/log early returns, the hub-nav-btn active sync) exactly as the site has it; it is identical in both. No markup change: HUB_SECTIONS is identical in both files (site:6742) and is declared above showHub, and showHub only runs post-load, so the `typeof` guard is harmless as written.


#### `switchHubSection` · risk medium

Identical bodies apart from one prepended line in the shell that hard-returns when the target section is 'femcycle' or 'photos' and TLTier.check('cycle_tracker'/'progress_photos') fails. The site's own TLTier.check (app.html:~7947) already lists cycle_tracker and progress_photos in its `std` array and has names entries for both, and TLTier.prompt has a working non-iOS branch (app.html:8017-8031) that renders an <a> to therapylog.app/download|/pro — so the gate is fully functional in the browser build and is not platform-specific. download.html markets cycle tracking as a paid-tier feature while listing the web Free tier as excluding it, so the ungated site is leaking a paid feature, not intentionally giving it away. This is also the deep-link chokepoint: showPage('femcycle'/'photos') routes through switchHubSection, so this one line covers the nav button and the router.


**Port plan.** In /home/user/Therapylog.github.io/app.html, function switchHubSection at line 6793: insert the shell's line (therapylog-app/www/index.html:6816) as the very first statement, above `_tlScrollTop();` — `if ((section === 'femcycle' || section === 'photos') && window.TLTier && !TLTier.check(section === 'femcycle' ? 'cycle_tracker' : 'progress_photos')) return;`. Order matters: it must precede `_tlScrollTop()` and `hubState[hub] = section;` so a blocked click neither scrolls nor persists the gated section. Change nothing below it — the renderBackupCard refresh and the `setTimeout(tlSizeChatCard, 60)` for the 'ai' section are already present verbatim in both files. No markup edit needed: the hbtn-femcycle / hbtn-photos onclick attributes are byte-identical in the two files. Pair this with the showHub fallback above so the paired silent-fallback / prompt-on-click behaviour lands together.


#### `showLogTab` · risk medium

Bodies identical except the shell prepends a tier gate on the 'bp' and 'symp' tabs (TLTier.check('blood_pressure'/'symptoms')). Both feature ids are already in the site's TLTier std array and names map (app.html:~7948, 'Blood Pressure Tracker' / 'Symptom Logging'), and download.html sells 'Blood pressure and cycle tracking' and 'Symptom and side-effect logging' as paid while the Free web tier bullet list excludes them — so the site is shipping paid tabs unlocked on web, mirroring the same 'machinery present, call site missing' pattern as the other hub functions. Not platform: TLTier.prompt has a web branch. The site did not refactor this into a helper — grep shows only two TLTier.check call sites in the whole site file, both for ai_scanner/ai_assistant.


**Port plan.** In /home/user/Therapylog.github.io/app.html, function showLogTab (line ~1665, the `S.logTab = tab;` write is at 1678): insert the shell's first line (therapylog-app/www/index.html:1674) as the first statement, above the `lt-labs-slot` reordering — `if ((tab === 'bp' || tab === 'symp') && window.TLTier && !TLTier.check(tab === 'bp' ? 'blood_pressure' : 'symptoms')) return;`. Leave everything else alone: the labs slot re-parenting, the six-tab display loop, the seg-btn active swap, the deferred renderBPHistory/renderBPChart, renderCustomMarkerFields, and `S.logTab = tab;` are identical in both. No startup-prompt hazard to guard against: S.logTab is written at 1678 and never read back to restore a tab, and the only non-onclick invocations target 'weight' (app.html:2258 area quick-button) and 'meds' (app.html:2258, 6160) — never a gated tab. Flag for product sign-off: a free web user who already logged BP or symptoms loses the UI to view or edit those existing rows once this lands.


#### `showBWTab` · risk medium

Identical apart from the shell's prepended `if (tab === 'trends' && window.TLTier && !TLTier.check('bloodwork_trends')) return;`. 'bloodwork_trends' is already declared Standard in the site's own TLTier.check std array and carries the display name 'Bloodwork Trends' in TLTier.names, and download.html's Free web tier explicitly reads 'No bloodwork tracking' — so the site's ungated trends tab contradicts both its own entitlement table and its published pricing. Cross-platform (TLTier.prompt's else branch links therapylog.app), so not a platform split.


**Port plan.** In /home/user/Therapylog.github.io/app.html, function showBWTab: insert the shell's line (therapylog-app/www/index.html:6124) as the first statement, above the `['overview','trends','log','history']` display loop. Leave the rest untouched — the seg-btn active swap and the trends/log/history dispatch (renderBWTrends, moveBWFormToTab, the lazy renderBW when bw-hist is empty) are identical in both files. Safe on load: all four call sites are seg-btn onclicks in markup that is byte-identical across the two files, the default active tab is 'overview', and nothing invokes showBWTab programmatically, so no upgrade overlay can fire at startup.


#### `_defineCustomMarker` · risk medium

The shell adds a 6th parameter `explicit` plus real unit-change logic the site never had (unitNew/unitPrev/sameUnit/unitChanged). The site's version can never overwrite a saved unit (`unit: prev.unit || unit || ''`), so a user who typed the wrong unit into the marker form is permanently stuck with it, and a lo/hi typed alongside a corrected unit is silently dropped. The shell distinguishes the two writers: user-typed (explicit) wins on unit and range and nulls a stale lo/hi when the unit actually changed; scanned panels (non-explicit) only fill blanks. This is the 'lab unit-change handling' the background attributes to the shell. Not a site refactor — no helper in the site covers it; the site body is simply the older, weaker version.


**Port plan.** Replace the site body of _defineCustomMarker at /home/user/Therapylog.github.io/app.html:3954 with the shell body from /home/user/therapylog-app/www/index.html:3973 verbatim, including the 6th param `explicit` and the explanatory comment. No helpers need porting: _ALIAS_INDEX, _norm, customMarkerKey, CUSTOM_KEY_PREFIX, _isNum and nowStr all already exist in the site. Leave the scan call site at app.html:4063 (addScannedMarkers) at 5 args — `explicit` is then undefined/falsy, which is exactly the intended scan behaviour (fill blanks, never clobber a saved unit); the shell keeps that call site at 5 args too (index.html:4088). The only other call site, addCustomMarker at app.html:3977, must gain `, true` — see that entry, and land the two edits together. After porting, re-run scripts/validate-encyclopedia.js since customMarkers shape is user data written by this function.


#### `addCustomMarker` · risk low

Identical to the site except it passes `true` as the new `explicit` argument to _defineCustomMarker. It is the sole caller that represents a user typing into the marker form, so it is the half of the _defineCustomMarker change that turns the new behaviour on. Trivially the shell's, with no competing site change.


**Port plan.** In /home/user/Therapylog.github.io/app.html:3977 change `const res = _defineCustomMarker(d, name, unit, lo, hi);` to `const res = _defineCustomMarker(d, name, unit, lo, hi, true);`. Nothing else in the function changes (gd/sd/builtIn early-out are identical). Apply this in the same commit as the _defineCustomMarker port: porting _defineCustomMarker alone leaves explicit permanently undefined, so user-typed unit corrections stay ignored and the port is a no-op; porting this line alone passes an argument nothing reads.


#### `sd` · risk low

Byte-identical to the site except for the post-merge re-sort: the site sorts only `d.entries`, the shell sorts all four cross-tab-merged arrays (entries, photos, bodyComp, femcycle) descending by ts. The shell's is a strict superset and a genuine bugfix — every one of those arrays is written with unshift (entries at app.html:1705/1724/1740/1750/1794/3816/6513/8684, bodyComp:3089, photos:5388, femcycle:7052), so newest-first is the file-wide invariant, and consumers depend on it: `(d.bodyComp || []).slice(0, 20).reverse()` at app.html:3098 and `(d.femcycle || []).slice(0, 15)` at :7165 both take the newest N off the front. Without the shell's line, entries recovered from another tab get appended to the tail of photos/bodyComp/femcycle and are invisible to those slices while older rows are shown instead.


**Port plan.** In /home/user/Therapylog.github.io/app.html, inside sd's cross-tab merge block, replace the single line `if (Array.isArray(d.entries)) d.entries.sort((a,b) => new Date(b.ts)-new Date(a.ts));` with the shell's `['entries','photos','bodyComp','femcycle'].forEach(k => { if (Array.isArray(d[k])) d[k].sort((a,b) => new Date(b.ts)-new Date(a.ts)); });` (/home/user/therapylog-app/www/index.html, same position). Change nothing else — the union-by-ts loop above it, the `_savedAt` stamp, `_memCache`, the localStorage write and the sdAsync(d) tail are already identical. The sort stays inside the `stored._savedAt > d._savedAt` branch, so it costs nothing on the common single-tab path.


#### `renderWeekView` · risk low

The two functions are identical apart from one line in the 30-day adherence denominator loop. Site (app.html:3794): `else if (f.type === 'weekly') is = f.days && f.days.includes(dd.getDay());`. Shell (index.html:3813): `else if (f.type === 'weekly') { const wd = tlFreqDays(f, d.proto.start) || f.days || []; is = wd.includes(dd.getDay()); }`. The shell's is right: parseFrequency hardcodes `days:[1,4]` for twice-weekly and `days:[1]` for weekly regardless of protocol start (app.html:3313-3315), while the forward-looking week calendar in this same function goes through getDoseDays -> tlFreqDays, which derives the dose days from proto.start. So on the site today a protocol started on a Wednesday paints dots on Wed/Sat in the calendar but counts Mon/Thu in the denominator — the two halves of one card disagree. The shell being slightly larger here is a one-line fix, not a lost site refactor.


**Port plan.** In /home/user/Therapylog.github.io/app.html, inside renderWeekView's totalExpected reduce, replace line 3794 with the shell's weekly branch from /home/user/therapylog-app/www/index.html:3813 verbatim. No helper port is needed: tlFreqDays already exists in the site at app.html:3334 and is byte-identical to the shell's at index.html:3319. Leave the rest of the function alone — week-scroll markup, today-doses cards, quickLogDose wiring, the daily/interval/monthly branches and the adherence card markup are all identical. Note this only changes the denominator, so reported adherence percentages will shift for weekly protocols not starting on Monday; that is the intended correction, and it brings this loop in line with the site's own getDoseDays and googleCalUrlForMed (app.html:3572, 3623), which already call tlFreqDays.


#### `importData` · risk low

Single delta in a ~70-line function: the settings-merge list. Site has ['customMarkers','pk','reminderTimes','labMeta']; shell has ['customMarkers','pk','reminderTimes','labMeta','supply']. Everything else - entry/photo/bodyComp/femcycle de-dupe by ts, the profile/proto gap-fill, the success and failure HTML, the reader plumbing - is byte-identical. `supply` is real state from the shell's refill feature: tlSetSupply writes `d.supply[name] = { vials: n, sinceTs: ... }` (/home/user/therapylog-app/www/index.html) and calcRefillAlerts reads `(d.supply || {})[med.name]`. It lives inside the tlv2 blob, so _doExportData (which serializes the whole `gd()` object as `data`) already writes it into every backup file - but the site's import drops it on the floor, so restoring a native backup silently loses the user's refill inventory. This is a one-token data-loss fix, not a refactor.


**Port plan.** In /home/user/Therapylog.github.io/app.html, add 'supply' to the array so the line reads ['customMarkers','pk','reminderTimes','labMeta','supply'].forEach(...). Nothing else in importData changes. Land this even if the supply feature itself (tlSetSupply / calcRefillAlerts / renderRefillAlerts, other batches) is deferred: Object.assign({}, importedData.supply, current.supply || {}) on a site build with no supply feature just parks the object in tlv2 untouched, which is exactly what makes native backups round-trip. It is also forward-compatible - if the supply feature lands later, no second edit to importData is needed. Guard rails: the merge direction here is 'imported fills gaps, this device wins', which is correct for supply (a stale vial count from a backup must not overwrite the count on the device). Do not extend the list further; entries/photos/bodyComp/femcycle are arrays and are handled by the ts de-dupe blocks above, not this loop.


#### `googleCalUrlForMed` · risk medium

Both sides independently rewrote the same base line (`if (start < new Date()) start.setDate(start.getDate() + 1);`) - the site in 77661de (2026-08-31, 'Fix 27 more bugs... wave 2'), the shell in 273bb32 (2026-09-01, the sync commit) - and `git log -S` confirms neither exact form ever existed in the other repo, so this is a hand-rewrite during the sync, not a stale copy. The rest of the function (the _gOff[0] > 0 branch, the tlFreqDays BYDAY fix from the same site commit, the 15-minute end, the RRULE construction, the URLSearchParams) is byte-identical, and the single call site is identical in both files (the 'Add TherapyLog dose reminders as a recurring event to Google Calendar' link list). The two fallbacks agree for daily meds and for any med with >=2 dose days in the 31-day window; they differ only when today is a dose day (_gOff[0] === 0, or _gOff is empty), today's dose time has already passed, the med is non-daily, and getDoseDays returned <=1 day - i.e. monthly meds and long-interval meds (interval > 30). There the site adds +1 day and the shell adds 0. Because the URL carries an RRULE, DTSTART is the recurrence anchor, so the site's +1 permanently misanchors: a monthly med recurs on the wrong day-of-month forever, a 90-day interval recurs on the wrong cycle day forever. Worse, it is inconsistent - getDoseDays(med, start, 31) scans i = 0..30, so a monthly med returns [0] in a 31-day month (site adds +1, wrong) but [0, 30] in a 30-day month (site adds _gOff[1], right), flipping behaviour by calendar month. The shell's 0 keeps today, a genuine dose day, as the anchor; the only cost is a first occurrence a few hours in the past, which Google Calendar accepts and which the recurrence immediately moves past. The shell's rewrite is the more correct logic, and nothing about it is platform-specific.


**Port plan.** In /home/user/Therapylog.github.io/app.html, replace the site's else-if with the shell's expression verbatim: `else if (start < new Date()) start.setDate(start.getDate() + ((med.freq && med.freq.type === 'daily') ? 1 : (_gOff.length > 1 ? _gOff[1] : 0)));`. That is the entire port - one line. Leave everything else in the function as the site has it, in particular the `if (_gOff.length && _gOff[0] > 0)` branch and the `(tlFreqDays(freq, (gd().proto || {}).start) || freq.days)` BYDAY fix, both of which the shell already matches. Optional hardening if a DTSTART earlier today is unacceptable when the protocol has no upcoming doses at all: make the final fallback `(_gOff.length ? 0 : 1)` - this changes only the _gOff-is-empty case (protocol ended or paused) and preserves the anchor fix for monthly/long-interval meds. Do not add a `med.freq` existence guard here: getDoseDays does `const freq = med.freq; ... freq.type` two lines earlier, so a med with no freq already throws identically in both versions, and a guard here would only mask it. No test covers this path in either repo (no scripts/*.js references googleCal), so verify by hand with three meds after the edit - daily (expect unchanged +1), weekly with a later dose day this week (expect unchanged _gOff[1]), and monthly whose dose time has passed today (expect DTSTART today, not tomorrow, and a FREQ=MONTHLY on the correct day-of-month).


#### `tlSetSupply` · risk medium

Genuinely shell-only and the only real finding in this batch. tlSetSupply is defined at shell index.html:6472 and has zero occurrences in the site — the site's only match for 'supply' is an unrelated comment at app.html:7936 about BYOK users supplying an API key. It is the setter for a complete refill-inventory feature the site never had: the site's calcRefillAlerts can only estimate days-remaining from the timestamp of the last logged dose, whereas the shell added a real-inventory branch that counts vials on hand minus doses actually logged since the refill. The site's calcRefillAlerts is a strict subset of the shell's — the shell wrapped the site's estimate logic in an else branch and added estimate/vials/since to the pushed alert — so this is clean additive work, not a refactor into helpers and not a conflict. Confirmed not on the C-0 path: tlSetSupply writes d.supply through the app's own gd()/sd() blob, not a new localStorage key, and getFullCtx (site app.html:3204) assembles AI context from an explicit field allowlist (d.proto, d.bodyComp, weight/medication/bloodwork entries, d.profile) with no JSON.stringify(d) and no key loop, so the new d.supply key does not reach the AI endpoint.


**Port plan.** Copy the 12-line function tlSetSupply(name) verbatim from shell index.html:6472-6483 into site app.html immediately after renderRefillAlerts()'s closing brace, matching the shell's placement just before getBPStage(). No runtime guard is needed and none should be added: prompt() is a plain web global that works in the browser and in both the Capacitor WKWebView and Android WebView, and every helper it calls already exists in the site — gd() app.html:1586, sd() app.html:1596, toast() app.html:1666, and fd as a const arrow at app.html:1664 (note fd is an arrow, not a `function fd`, so a grep for 'function fd' will wrongly report it missing). Ship it together with its two companion ports, which fall in other batches, or the build breaks in one direction or the other: (a) calcRefillAlerts must gain the shell's supply branch (shell:6400-6430) so each alert carries estimate/vials/since, and (b) renderRefillAlerts must gain the tap-to-set row (shell:6469) that actually invokes tlSetSupply. Porting renderRefillAlerts without tlSetSupply throws ReferenceError on tap; porting tlSetSupply alone leaves it unreachable dead code. Also port the one-token delta in importData: add 'supply' to the settings-object merge list ['customMarkers','pk','reminderTimes','labMeta'] (shell:5507), or a restored backup silently drops the user's vial counts. Explicitly leave alone: do NOT bring across the shell's TLTier.isStd() paywall wrapper that surrounds renderRefillAlerts (shell:6395-6412) — that is a separate entitlement decision, not part of this feature. Do NOT add d.supply to getFullCtx. No CI work is required: tlSetSupply is not in the LIFTABLE byte-for-byte drift-guard list in scripts/validate-public-pages.js:396-401, and no validator references the refill or supply feature (scripts/validate-storage.js concerns the TL_STORAGE drug-storage guidance tables, which are unrelated to d.supply).


### Keep the web version (16)

`checkAndFireReminder`, `getApprovalBadge`, `checkInteractions`, `showDrugPage`, `renderClinicViewBase`, `runCorrelation`, `tlFeaturesInit`, `initAISettings`, `checkOnboarding`, `acceptDisclaimer`, `labSt`, `getBPStage`, `loadDemoData`, `resetAllData`, `_aiInline`, `exportFmt`

Take nothing from the shell for these.


## Ordered steps


### 1. STOP AND RE-BASELINE BEFORE ANY EDIT. Two facts invalidate parts of the classification input. (a) The shell on disk moved after the dumps were taken: therapylog-app commit 54331ff 'Carry the C-0 AI privacy fix into the native builds' (98 insertions) already ported aiPersonalized/setAIPersonalize/AI_CONSENT/aiConsented/aiCtxConsented/showAICtxConsent, the gated `context: aiPersonalized() ? getFullCtx() : ""`, initAISettings, scanLabImage, resetAllData and the consent markup into www/index.html. Verified live: both files now grep identically for context:, aiPersonalized (4), tl_ai_personalize (3), tl_ai_ctx_ok/tl_ai_scan_ok (2 each). So fn-sendChat.txt / fn-scanLabImage.txt / fn-initAISettings.txt / fn-resetAllData.txt are historical records of a divergence that no longer exists on disk. (b) only-shell-_aiInline.txt (241KB) and only-shell-exportFmt.txt (237KB) are extraction garbage from a '^}' line-match boundary finder running away in a zero-indent file. Action: re-dump every function with the repo's own brace-aware extractor, scripts/lib/app-source.js (A.fnSource), against the CURRENT app.html and the CURRENT www/index.html, and re-diff. Treat the new dumps as the record; delete the two corrupt ones.

**Where.** /tmp/claude-0/-home-user/b963eeaf-3cba-5ace-ba58-38918eaf1568/scratchpad/merge/ (regenerate), using /home/user/Therapylog.github.io/scripts/lib/app-source.js


**Guard.** none — tooling step, no file under either repo is modified


**Verify.** node -e "const A=require('/home/user/Therapylog.github.io/scripts/lib/app-source.js')" runs; the regenerated fn-_aiInline / fn-exportFmt dumps are ~0.5KB and ~5.7KB with identical site/shell halves, not 240KB; the set of genuinely differing functions is re-derived rather than inherited. Record `git rev-parse HEAD` for both repos and `git status --porcelain` (both must be clean) in the merge commit message.


**Risk.** Skipping this is the single highest-cost mistake available here. Working from the stale dumps means re-porting a C-0 fix that is already in the shell (harmless but confusing), and, far worse, hand-applying only-shell-_aiInline.txt or only-shell-exportFmt.txt would splice ~150 and ~143 duplicate top-level function declarations into app.html — a 500KB corruption of the tested file that node --check would not necessarily reject (duplicate function declarations are legal JS) and that would silently shadow later definitions.


### 2. Build the merge harness before merging: a script that extracts every <script> block from app.html to a temp .js and runs `node --check` on it, plus a grep-based C-0 invariant assertion list. Wire both into a single command so every subsequent step ends with one call. The C-0 invariant list is the non-negotiable set: exactly one `function aiCtxConsented`, exactly one `const AI_CONSENT`, exactly one `function aiPersonalized`, exactly one `function setAIPersonalize`, exactly one `function showAICtxConsent`, exactly one match for /context:\s*aiPersonalized\(\)\s*\?\s*getFullCtx\(\)\s*:\s*""/, zero matches for /context:\s*getFullCtx\(\)/, and every key in AI_CONSENT present in the resetAllData key array.

**Where.** new /home/user/Therapylog.github.io/scripts/merge-guard.js (or a scratchpad script if it must not land in the repo)


**Guard.** none


**Verify.** Run it on the untouched app.html: all invariants pass, node --check clean. That green run is the baseline every later step is compared against.


**Risk.** Without it, a C-0 regression introduced mid-merge is only caught by validate-compliance.js at the end, after dozens of intermixed edits, making bisection expensive. The specific failure this guards against is real: the original portPlan for sendChat instructed deleting a non-existent 'duplicate aiCtxConsented at line 2518', which is actually inside the comment introducing `const AI_CONSENT` at 2521 — following it would cut out tl_ai_ctx_ok (2523) and tl_ai_scan_ok (2536) and take down BOTH the chat gate and the scanner gate at once.


### 3. C-0 FREEZE — assert, do not edit. Confirm and then leave byte-for-byte alone: sendChat's comment + `if (aiPersonalized() && !aiCtxConsented()) { if (showAICtxConsent(sendChat)) return; }` and its `context: aiPersonalized() ? getFullCtx() : ""`; scanLabImage's `if (!aiConsented('scan')) { if (showAICtxConsent(scanLabImage, 'scan')) return; }` positioned AFTER the labFiles/labFilesBytes checks and BEFORE any DOM mutation; initAISettings' three personalization lines; the whole helper block aiPersonalized / setAIPersonalize / AI_CONSENT / aiConsented / aiCtxConsented / aiCtxConsent / showAICtxConsent. The shell contributes exactly one thing on this path, `iosToken: (window.TLTier && TLTier.iosToken && TLTier.iosToken()) || ""`, and it is ALREADY committed in the site (163681b) in both the chat and labscan POST bodies — 6 occurrences of iosToken in app.html today. Apply nothing here.

**Where.** /home/user/Therapylog.github.io/app.html — sendChat (~2447), scanLabImage (~4290), initAISettings (~2585), helper block ~2504-2600


**Guard.** `window.TLTier && TLTier.iosToken` is the platform guard for the iosToken field and is sufficient — on web the chain short-circuits to "". Do NOT add a window.Capacitor test; the site currently has zero TLNative references and adding a Capacitor gate here would make the field dead on native too once TLNative lands.


**Verify.** node scripts/validate-compliance.js green (it regex-tests the exact gated-context string at line 161, and validate-compliance.yml runs it in CI, so any reformatting of that line fails the build). Plus the step-2 invariant greps: `grep -c 'function aiCtxConsented' app.html` == 1, `grep -c 'const AI_CONSENT' app.html` == 1.


**Risk.** Highest-stakes surface in the merge. Reformatting the gated-context line breaks CI; taking the shell's historical `context:getFullCtx()` re-opens the exposure the whole plan exists to close; and the discredited 'delete the duplicate at 2518' step destroys the consent key table for both AI egress paths.


### 4. resetAllData: extend the localStorage key array only. Current site array (app.html:5552) already clears tl_ai_personalize, tl_ai_ctx_ok, tl_ai_scan_ok and tl_notif_discreet — keep all of them. Add 'tl_ios_receipt', which the shell's TLIAP.appReceipt writes and nothing clears, so a base64 App Store receipt currently survives a full 'Delete ALL TherapyLog data'. Prefer referencing constants where in scope over retyping literals.

**Where.** /home/user/Therapylog.github.io/app.html:5552, inside async function resetAllData


**Guard.** None needed and none should be added — localStorage.removeItem on an absent key is a no-op, so this stays a single cross-platform code path. This must NOT become a Capacitor branch.


**Verify.** Grep every AI_CONSENT[*].key value and every tl_ai_* / tl_ios_receipt setItem in the merged file and confirm each appears in this array; that grep is the standing C-0 regression check for this function. Manually: set a receipt, run reset, confirm gone.


**Risk.** Low. Getting it wrong the other way (narrowing the array toward the shell's older list) leaves AI personalization and per-feature AI consent flags switched on for the next user of a wiped device — a C-0-adjacent regression.


### 5. NATIVE PREREQUISITE 1 — port the receipt-validation members into the site's TLIAP object: appReceipt() and validate() copied verbatim from shell www/index.html:7315-7357 into the site's TLIAP at app.html:7358 (the site has neither today). Also add the two TLIAP.validate() calls the site's TLIAP.init lacks: one in the `.verified(...)` handler after TLTier.set, one after store.initialize().then.

**Where.** /home/user/Therapylog.github.io/app.html, TLIAP object ~7358


**Guard.** TLIAP.validate() is self-inert on web because appReceipt() returns null there; that is the guard. No Capacitor test needed.


**Verify.** node --check on extracted scripts; node scripts/ui-check-entitlement.js still green (it drives TLTier.set('pro','ios-iap') at line 120 and must read back 'pro'). Confirm on web that calling TLIAP.validate() from the console is a silent no-op.


**Risk.** Medium. This is the dependency floor for step 9 — porting tlRefreshEntitlement's native branch without it produces a call to an undefined method inside a try/catch, which silently swallows the failure and leaves cancelled subscriptions Pro forever, i.e. the exact bug the port is meant to fix, now invisible.


### 6. NATIVE PREREQUISITE 2 — port `iosToken: function() { var e = tlReadEnt(); return (e && e.source === 'ios-iap' && e.iosToken) || null; }` from shell index.html:7906 into window.TLTier at app.html:7918, and replace the site's TLTier.set body with the shell's version that preserves prev.expires and prev.iosToken when the previous source was ios-iap (shell index.html:7900-7905).

**Where.** /home/user/Therapylog.github.io/app.html, window.TLTier ~7918


**Guard.** The entitlement record's own `source === 'ios-iap'` is the guard — only TLIAP/TLTier.set ever writes that source, so the branch is unreachable on web.


**Verify.** node scripts/ui-check-entitlement.js. Then confirm the already-committed iosToken fields in sendChat and scanLabImage stop evaluating to "" on a simulated ios-iap entitlement and still evaluate to "" on web (TLTier.iosToken() returns null → `|| ""`).


**Risk.** Medium. Until this lands, the iosToken fields committed in 163681b are permanently "" — the site looks like it supports native entitlement proof but does not. Getting TLTier.set wrong in the other direction (dropping prev.iosToken) silently de-authenticates native Pro users on the next entitlement write.


### 7. NATIVE PREREQUISITE 3 — port the TLNative object literal (shell index.html:8858-8941: active, platform, _ln, permission, request, _cancelPending, reschedule) verbatim into app.html as a new top-level block near the end of the script. It is an object literal, which is why it never appeared in the function inventory, and it is the hard dependency of steps 10-12.

**Where.** /home/user/Therapylog.github.io/app.html, new block near end of the main <script>


**Guard.** TLNative.active() is itself the guard: `window.Capacitor && Capacitor.isNativePlatform() && Capacitor.Plugins.LocalNotifications`. On web every member is unreachable and the literal costs ~3KB of parse. Every call site must use the defensive `window.TLNative && TLNative.active()` form.


**Verify.** node --check clean; load app.html in a browser with no Capacitor and confirm `TLNative.active()` is falsy and no console error at startup; confirm nothing calls TLNative at module scope.


**Risk.** Medium. If the literal is pasted into the wrong scope (inside an IIFE or after its call sites in a way that breaks hoisting — object literals are not hoisted like function declarations), the notification functions throw on native. Place it above first use or rely solely on the `window.TLNative &&` existence check at every call site.


### 8. REQUIRED EDIT TO THE PORTED TLNative — make reschedule() discreet-aware. The shell's version builds every notification title as '\u{1F489} ' + med.name + ' Due' with dose and injection site in the body, unconditionally; it predates the site's discreetReminders(). Inside the offsets.forEach push, branch: if `typeof discreetReminders === 'function' && discreetReminders()` push `{ at, title: '\u{1F514} Dose due', body: 'Open TherapyLog to see which.' }`, else the shell's existing named title/body. Also add `discreetReminders()` to the `_sig` JSON.stringify array so toggling the switch invalidates the cache and forces a re-schedule.

**Where.** /home/user/Therapylog.github.io/app.html, inside the TLNative literal ported in step 7 (from shell index.html:8892-8935)


**Guard.** `typeof discreetReminders === 'function' && discreetReminders()` — defensive because this block will be copied into the generated shell where load order could differ.


**Verify.** On a device or simulator: enable discreet reminders, toggle a med, confirm the OS notification reads 'Dose due' and never names the compound; disable it and confirm the named form returns. Confirm the _sig change actually re-schedules (the cache must not swallow the toggle).


**Risk.** HIGH if skipped, and easy to skip because it is not a function-level diff. scheduleAllReminders early-returns to TLNative on native, so checkAndFireReminder — the only place the discreet branch exists today — is never reached there. Porting TLNative unmodified ships a privacy control that is silently inert on iOS/Android: the user turns on 'discreet' and the compound name still appears on the lock screen. That is the same class of failure as C-0 (a control the UI promises and the native path ignores), on a different surface.


### 9. tlRefreshEntitlement — platform merge. Replace `if (!e || e.source === 'ios-iap') return;` with `if (!e) return;` followed by the shell's ios-iap block verbatim (re-validate the App Store receipt when the record is stale, past expiry, or has no iosToken: `if (... && window.TLIAP) { try { TLIAP.validate(); } catch (err) {} } return;`). Leave the site's web license-key/email re-verify, lapse toast and mid-flight-change guard untouched.

**Where.** /home/user/Therapylog.github.io/app.html:7846 (shell index.html:7818)


**Guard.** `e.source === 'ios-iap'` plus `window.TLIAP`. Do NOT add a window.Capacitor test.


**Verify.** node scripts/ui-check-entitlement.js. Simulate an expired ios-iap record and confirm validate() is attempted; on web confirm the ios-iap branch is never entered and the license path behaves exactly as before.


**Risk.** Medium. Today the site returns early on ios-iap, so a cancelled or expired native subscription is never re-checked and stays Pro forever — this is a revenue leak, not a safety issue. Botching it in the other direction (falling through to the web license path on an ios-iap record) would wrongly lapse paying native users.


### 10. checkNotifSupport — three-way platform merge, the most delicate of the notification set. Keep the two getElementById lookups and the early return. Insert the shell's native block verbatim (index.html:3321-3341, `if (window.TLNative && TLNative.active()) { TLNative.permission().then(perm => {...}).catch(()=>{}); return; }`). Leave the site's `!('Notification' in window)` / isIOSBrowserTab block and denied-note block byte-identical. Add the shell's WEB-worded notif-honesty-note ('these reminders fire while TherapyLog is open in your browser') into the site's web granted branch, keeping the site's existing `const dc = document.getElementById('notif-discreet'); dc.checked = discreetReminders();`. Into the NEW native granted branch add BOTH the native-worded honesty note ('delivered by your phone even when TherapyLog is closed') AND a copy of the two discreet-checkbox lines, which the shell is missing.

**Where.** /home/user/Therapylog.github.io/app.html:3420 (shell index.html:3321-3341)


**Guard.** `window.TLNative && TLNative.active()`


**Verify.** Web: the discreet checkbox still reflects stored state and the honesty note appears once (id notif-honesty-note must not be duplicated across branches). Native: same, via the new branch. Grep that notif-honesty-note is created in exactly one place per branch and that both branches set dc.checked.


**Risk.** Medium. Straight-copying the shell's native branch (the tempting move) renders the discreet checkbox permanently unchecked on iOS/Android — the setting reads 'off' while the stored value is 'on', so the user re-toggles it and, combined with a step-8 omission, gets neither the correct UI state nor the correct behaviour.


### 11. requestNotifPermission — prepend the shell's native early return verbatim (index.html:3389-3395): `if (window.TLNative && TLNative.active()) { TLNative.request().then(perm => { checkNotifSupport(); if (perm === 'granted') { toast('Reminders enabled!'); TLNative.reschedule(); } else { toast('Notification permission denied'); } }).catch(() => {}); return; }`. Leave the entire remaining site body untouched; do not merge the toast paths, do not touch the isIOSBrowserTab string.

**Where.** /home/user/Therapylog.github.io/app.html:3452


**Guard.** `window.TLNative && TLNative.active()`


**Verify.** Web path unchanged (Notification.requestPermission still called, checkNotifSupport + scheduleAllReminders still run). Native: tapping enable produces the OS prompt and the granted toast.


**Risk.** Low. The web bodies are already byte-identical between the two files, so the only failure mode is a misplaced guard causing the native branch to run in a browser, where TLNative.active() is falsy — self-limiting.


### 12. scheduleAllReminders — prepend exactly one line: `if (window.TLNative && TLNative.active()) { TLNative.reschedule(); return; }`. Leave the gd/parseMeds/reminderTimes/getDefaultTimes/checkAndFireReminder loop and the 5-minute `window._tlRemArm` interval (app.html:3483-3484) alone; on native the interval degrades to a cheap reschedule() that early-returns on its _sig cache.

**Where.** /home/user/Therapylog.github.io/app.html:3471


**Guard.** `window.TLNative && TLNative.active()`


**Verify.** Web: in-page setTimeout reminders still fire. Native: confirm 30 days of OS notifications are pre-scheduled and that the app being closed no longer suppresses them. Confirm _sig caching prevents a reschedule storm from the 5-minute interval.


**Risk.** Medium, entirely because of what it delegates to. This line is the reason checkAndFireReminder (and its discreet branch) is dead on native. It is correct only if step 8 landed. Ship 8 and 12 in the same commit.


### 13. checkAndFireReminder — NO CHANGE. Keep the site's `if (discreetReminders())` wrapper and its explanatory comment verbatim; discard the shell's unconditional fireNotification call. The shell simply predates discreetReminders/setDiscreetReminders/tl_notif_discreet (0 occurrences in the shell file).

**Where.** /home/user/Therapylog.github.io/app.html:3487 (fireNotification at 3413 is identical in both and needs nothing)


**Guard.** n/a


**Verify.** Diff after merge shows this function untouched. Toggle discreet on web and confirm both notification wordings.


**Risk.** Low as written; the danger is a mechanical 'take the shell where it differs' pass silently reverting a shipped privacy control.


### 14. SUPPLY / REFILL FEATURE — land as ONE coupled commit, four edits, no partial landing. (a) calcRefillAlerts: insert `const supply = (d.supply || {})[med.name]; let daysRemaining, estimate;` with the shell's if/else — inventory branch when `supply && supply.vials >= 0` (vials * daysPerVial minus doses logged at/after supply.sinceTs, estimate=false), else the site's EXISTING last-log fallback verbatim as the estimate=true path — and extend the pushed alert with `estimate`, `vials`, `since` (shell index.html:6289-6340). (b) tlSetSupply: copy verbatim from shell index.html:6472-6483 and place immediately after renderRefillAlerts. (c) renderRefillAlerts: add ONLY the supply footer row (shell index.html:6367, the `<div onclick="tlSetSupply(...)">` with the a.estimate ternary) as the last child of the alert card — NOT the tier gate, which is step 16. (d) importData: change `['customMarkers','pk','reminderTimes','labMeta']` to `['customMarkers','pk','reminderTimes','labMeta','supply']` (app.html:5522).

**Where.** /home/user/Therapylog.github.io/app.html — calcRefillAlerts ~6397, renderRefillAlerts ~6434, new tlSetSupply after it, importData:5522


**Guard.** None — d.supply lives inside the existing gd()/sd() blob, needs no new localStorage key and no validate-storage.js change. prompt() works in the browser and in both the Capacitor WKWebView and the Android WebView. Explicitly do NOT add d.supply to getFullCtx: getFullCtx uses an explicit field allowlist with no JSON.stringify(d) and no key loop, which is why a new top-level key is not an automatic C-0 exposure — keep it that way.


**Verify.** All helpers already exist in the site: gd (1586), sd (1596), toast (1666), fd (1664, an arrow const — a grep for 'function fd' wrongly reports it missing). Manually: set vials on a med, confirm the card switches from 'Estimate — tap to enter…' to 'Based on N vials since <date>', log doses and confirm the countdown decrements; export and re-import a backup and confirm vial counts survive.


**Risk.** Medium, and the failure mode is loud. Porting renderRefillAlerts' row without calcRefillAlerts leaves a.estimate undefined, the ternary falls to the else branch, and every card renders the literal 'Based on undefined vials since Invalid Date'. Porting renderRefillAlerts without tlSetSupply throws ReferenceError on tap. Porting tlSetSupply alone is unreachable dead code. Omitting the importData token silently discards inventory on every restore.


### 15. CORRECTNESS PORTS — small, independent, low-blast-radius; batch them. (a) _defineCustomMarker: replace the site body (app.html:3954) with the shell's (index.html:3973) including the 6th param `explicit` and its comment; AND in the same commit change addCustomMarker (app.html:3977) to `_defineCustomMarker(d, name, unit, lo, hi, true)`. Leave the scan call site (app.html:4063) at 5 args — undefined/falsy is the intended scan behaviour. (b) sd: replace the entries-only re-sort with the shell's `['entries','photos','bodyComp','femcycle'].forEach(k => { if (Array.isArray(d[k])) d[k].sort((a,b) => new Date(b.ts)-new Date(a.ts)); });`. (c) renderWeekView (app.html:3794): take the shell's weekly branch `const wd = tlFreqDays(f, d.proto.start) || f.days || []; is = wd.includes(dd.getDay());`. (d) renderPKLevels: expand the `!meds.length` early return with the shell's #pk-ml-note-empty block, keeping the id distinct from the existing #pk-ml-note. (e) googleCalUrlForMed: replace the site's else-if with the shell's `start.setDate(start.getDate() + ((med.freq && med.freq.type === 'daily') ? 1 : (_gOff.length > 1 ? _gOff[1] : 0)))`.

**Where.** /home/user/Therapylog.github.io/app.html — 3954, 3977, sd (~1596 block), 3794, renderPKLevels early return, googleCalUrlForMed


**Guard.** None of these are platform-conditional. tlFreqDays already exists in the site at 3334 and is byte-identical to the shell's.


**Verify.** (a) re-run node scripts/validate-encyclopedia.js (customMarkers shape is user data written here); type a wrong unit, correct it, confirm the correction now sticks and a stale lo/hi is nulled. (b) two-tab test: save in tab A, save in tab B, confirm photos/bodyComp/femcycle come back newest-first (app.html:3098 and :7165 both slice off the front). (c) start a weekly protocol on a Wednesday and confirm calendar dots and the adherence denominator now agree. (d) log a med only in ml and confirm the empty state explains why nothing is charted. (e) hand-test three meds — daily (unchanged +1), weekly with a later dose day (unchanged _gOff[1]), monthly whose dose time has passed today (DTSTART today, FREQ=MONTHLY on the correct day-of-month).


**Risk.** Low-medium each, but (c) visibly shifts reported adherence percentages for weekly protocols not starting Monday — that is the intended correction, and it should be called out in the release notes so it does not read as a regression. (e) has no test coverage in either repo. renderPKLevels has no CI coverage at all — no script references renderPKLevels, pk-empty, pk-list or pk-ml-note.


### 16. ENTITLEMENT GATES — HOLD FOR HUMAN SIGN-OFF, then land as one commit. Seven call sites the site declares in TLTier but never invokes (the site has only 2 TLTier.check call sites, both AI; the shell has 8): toggleClinicMode (`if (!clinicModeActive && window.TLTier && !TLTier.check('clinical_reports')) return;` — keep the `!clinicModeActive &&` so a lapsed plan cannot trap a user inside the overlay), generateReport (`if (window.TLTier && !TLTier.check('clinical_reports')) return;` as the first statement), showHub (`const section` → `let section` plus the silent femcycle/photos → HUB_SECTIONS[hub][0] fallback using isStd(), NOT check()), switchHubSection (check('cycle_tracker'/'progress_photos') as the very first statement, above _tlScrollTop() and the hubState write), showLogTab (check('blood_pressure'/'symptoms') for tabs bp/symp), showBWTab (check('bloodwork_trends') for the trends tab), and renderRefillAlerts (the shell's locked-teaser block from index.html:6346-6357, after the !alerts.length guard).

**Where.** /home/user/Therapylog.github.io/app.html — toggleClinicMode 5661, generateReport 4548, showHub 6766/6785, switchHubSection 6793, showLogTab ~1665, showBWTab (trends dispatch), renderRefillAlerts ~6434


**Guard.** `window.TLTier && ...` existence check only. Do NOT wrap any of these in a Capacitor test — TLTier.prompt already branches internally between the iOS TLIAP.showPurchaseSheet() path and the web therapylog.app/download link, so one unguarded call is correct for both builds. The isStd()-vs-check() split in showHub/switchHubSection is deliberate: isStd() for the silent fallback on a bottom-nav tap, check() for the explicit click that should raise the upsell.


**Verify.** Extend scripts/ui-check-entitlement.js with assertions for each gate (free tier: locked teaser on refill, blocked trends/bp/symp/femcycle/photos, no clinic overlay, no report; standard tier: all present) — nothing else in CI covers these, and after this port the gates live only inside app.html. Startup safety already checked: showBWTab's default tab is 'overview' and it is never invoked programmatically; showLogTab's non-onclick callers target 'weight' and 'meds' only; so no upsell overlay can fire at load.


**Risk.** Medium technically, HIGH in product terms. On the web build this REMOVES features free users can see today — refill countdowns, BP and symptom tabs, bloodwork trends, cycle and photo sections, clinic mode and the clinical report. It matches the site's own published tier table (download.html:325 'No clinical reports', 'No bloodwork tracking'), but it is a user-visible downgrade on live surfaces, and a free user who already logged BP or symptoms loses the UI to view or edit those existing rows. /guide also tells all users to tap 'Generate Clinical Report' (validate-guide.js:116 asserts only that the string exists, so CI passes either way) — that copy needs updating.


### 17. NO-CHANGE CONFIRMATIONS — assert the site wins and nothing regresses. Explicitly take nothing from the shell for: getApprovalBadge (site's clause-splitting/NEG/ABROAD/SHORT-map rewrite), showDrugPage (single getApprovalBadge(drug.approval || drug.approvalStatus || drug.status) call; the shell still renders a duplicate legacy pill), checkInteractions (site's 'not a complete list' / 'not a safety clearance' wording — CI-locked in ui-check-tools.js:302 and validate-public-pages.js:797, and it is in the LIFTABLE byte-for-byte list so its source is compared against every generated public page), renderClinicViewBase (non-diagnostic caveat, 'Notes from my provider (as recorded by the patient)', the self-reported footer), runCorrelation (the timing-not-correlation rewrite and its source comment), tlFeaturesInit (syringe dosing disclaimer), labSt (the _num typeof-number guard — the shell's truthiness test can never flag olo:0 bands and its isFinite(null) hole flags any positive value as bad), getBPStage (the shell's ascending rewrite uses || where the inverted form needs && and under-stages hypertensive crisis: sys 200 / dia 70 reads 'Stage 1'), loadDemoData (sanitized sample profile), checkOnboarding + acceptDisclaimer + DISCLAIMER_VERSION + disclaimerCurrent (audit finding A-3), and _aiInline + exportFmt (identical in both; the only-shell dumps are extraction garbage — discard them).

**Where.** /home/user/Therapylog.github.io/app.html — no edits; this step is a diff review


**Guard.** n/a


**Verify.** After the whole merge, `git diff` on app.html must show zero hunks inside any of these functions. Re-run validate-markers.js, validate-public-pages.js, ui-check-tools.js.


**Risk.** Low if honoured, high if a mechanical pass 'reconciles' them. Reverting getBPStage reintroduces a clinical mis-staging bug; reverting checkInteractions or renderClinicViewBase fails CI and puts the app's output back at odds with the site's non-diagnostic claims; ORing checkOnboarding's two reads (`disclaimerCurrent() || localStorage.getItem(...)`) reinstates exactly the A-3 bypass the version check closed.


### 18. REGENERATE THE SHELL FROM THE MERGED SITE — this is the point of the whole exercise. Produce www/index.html mechanically from app.html rather than hand-patching, so the two stop diverging. Write the generator (or, at minimum, a copy-with-documented-deltas script) and record any intentional shell-only delta in a checked-in list. Markup must travel with the code: the ob-step-0 18+/Privacy Policy paragraph and 'I am 18 or older — Continue' button, the input[name="aipersonalize"] radio pair and #ai-personalize-note, the notif-discreet checkbox, and the consent sheet.

**Where.** /home/user/therapylog-app/www/index.html, generated from /home/user/Therapylog.github.io/app.html


**Guard.** n/a


**Verify.** In the generated shell: `grep -c 'function tlFeaturesInit'` == 1; the syringe/unit-converter dosing disclaimer string appears 3 times (twice in the static tools markup, once in tlFeaturesInit) — a count of 1 is a REGENERATION FAILURE, not a success, and the earlier '~ exactly once' instruction was wrong in the direction that deletes two genuine 1.4.1 disclaimers; `querySelectorAll('input[name=aipersonalize]').length === 2`; `getElementById('ai-personalize-note')` exists; DISCLAIMER_VERSION and disclaimerCurrent are present (both are 0 in the shell today, so A-3 is still open in shipped binaries); the _num helper travels with labSt (3 call sites — emitting labSt without _num is a ReferenceError on every lab status computation); no `context: getFullCtx()` remains; node --check on the extracted script.


**Risk.** High if hand-patched instead of generated — that is precisely how the current divergence arose. The named greps are the ones where a plausible-looking manual copy silently drops a compliance string or a helper.


### 19. SHELL RELEASE — bump version/build and ship. Source fixes in www/index.html do not remove exposure from binaries already on devices; only a released build does. Include in the release notes: the C-0 consent gate (already in source as 54331ff), the discreet-reminder fix on native from step 8, the hypertensive-crisis staging fix, the badge fix for the 23 short-status compounds, and — if step 16 landed — the entitlement gates.

**Where.** /home/user/therapylog-app (capacitor.config.json / codemagic.yaml version fields; there is no ios/ dir in-repo, the build runs on Codemagic)


**Guard.** n/a


**Verify.** `npx cap sync` clean; a device build where the assistant refuses to send context until consent is given, the discreet toggle suppresses the compound name on the lock screen, and TLIAP.validate() re-checks an expired receipt.


**Risk.** This is where the actual user-facing exposure ends. Everything before it is preparation; a merge that lands perfectly and is never released leaves the shipped binaries exactly as exposed as they were before step 1.


## Verification suite

- node --check on every extracted <script> block from the merged app.html — run after EVERY step, not once at the end. This is the only thing that catches a botched brace-boundary paste, and two of the supplied dumps were produced by exactly that class of bug.
- node scripts/validate-compliance.js — the C-0 gate. Tests /context:\s*aiPersonalized\(\)\s*\?\s*getFullCtx\(\)\s*:\s*""/ (line 161), the existence of aiCtxConsented/showAICtxConsent, /18 or older/i and /therapylog\.app\/privacy/. Runs in CI via .github/workflows/validate-compliance.yml. Must be green before and after every C-0-adjacent step.
- Custom C-0 invariant greps (step 2 harness): exactly one each of `function aiCtxConsented`, `const AI_CONSENT`, `function aiPersonalized`, `function setAIPersonalize`, `function showAICtxConsent`; zero matches for `context: getFullCtx()`; every AI_CONSENT key present in the resetAllData array.
- node scripts/validate-encyclopedia.js — required after the _defineCustomMarker port (customMarkers is user data written by that function) and as the general content guard for the 131 compounds.
- node scripts/validate-public-pages.js — the byte-for-byte drift guard. checkInteractions is in its LIFTABLE list (scripts/validate-public-pages.js:396-401) and is compared against every generated /tools/ page, so any accidental edit to it fails here; it also sandbox-runs the function to build the public stack pages, and asserts the non-diagnostic band wording at 941-954.
- node scripts/validate-markers.js — enforces the non-diagnostic labelling wherever an optimal band is shown (line 176) and parses the LAB-SCAN-PROMPT:START/END region, so it is the guard for scanLabImage edits.
- node scripts/validate-guide.js, validate-storage.js, validate-bloodwork-flow.js, validate-claims.js, validate-marketing.js, validate-marketing-static.js — the remaining validators; all should be green before and after so any new failure is attributable to the merge.
- node scripts/ui-check-entitlement.js — mandatory for steps 5, 6 and 9 (it drives TLTier.set('pro','ios-iap') at line 120 and must read back 'pro'), and it must be EXTENDED in step 16 with per-gate assertions (free: locked refill teaser, blocked trends/bp/symp/femcycle/photos, no clinic overlay, no report; standard: all present) — nothing else in the repo covers those gates.
- node scripts/ui-check-tools.js — asserts checkInteractions' 'not a complete list' / 'not a safety clearance' strings (line 302); the guard against reverting that wording to the shell's.
- node scripts/ui-check-bloodwork.js, ui-check-chat-layout.js, ui-check-recon.js, ui-check-site.js, ui-check-storage.js, ui-check-marketing.js — the rest of the UI suite.
- node scripts/build-pages.js followed by `git diff --exit-code` on the generated pages — proves the public pages are still reproducible from the merged app.html and that nothing was hand-edited into them.
- node scripts/capture-guide-shots.js — re-run after the merge; it calls loadDemoData() to render published guide screenshots, so any image still baked from the pre-sanitization fabricated physician note must be regenerated.
- MANUAL, because no automation exists for these: renderPKLevels (no script in scripts/ references renderPKLevels, pk-empty, pk-list or pk-ml-note) with a med logged only in ml; googleCalUrlForMed with daily / weekly / monthly meds; the discreet-reminder path on a real device or simulator, which is the only way to confirm step 8; the two-tab sd() merge test for photos/bodyComp/femcycle ordering.
- POST-REGENERATION shell greps (step 18): dosing-disclaimer string count == 3 (NOT 1), tlFeaturesInit count == 1, aipersonalize radios == 2, #ai-personalize-note present, DISCLAIMER_VERSION and disclaimerCurrent present, _num present alongside labSt, no `context: getFullCtx()`, node --check clean.

## Decisions for a human — do not automate these


- THE ENTITLEMENT GATES (step 16) — do not automate. Porting seven TLTier.check call sites is a two-line-each mechanical change with a product consequence: it removes, from the live web app, features free users can use today — refill countdowns, blood-pressure and symptom log tabs, bloodwork trends, cycle tracking, progress photos, clinic mode and the clinical report. It is defensible (the site's own TLTier tables and download.html:325/343/364 already describe all of these as paid), but it is a downgrade on shipped surfaces and a free user who already logged BP or symptoms loses the UI to view or edit their own existing rows. A human decides whether to ship it, grandfather existing data, or gate only new entry.

- WHETHER TO TREAT DIVERGENCE AS CLOSED OR ONGOING. The shell was hand-patched with C-0 at 23:43 on 2026-09-04 (54331ff) — after the analysis dumps were taken, and in the opposite direction from this plan's stated merge direction. Two hand-copies patched independently is exactly the failure mode that created this mess. Someone should decide, before step 18, whether www/index.html becomes a generated artifact with a CI drift guard (recommended) or stays a hand-maintained file; the rest of the plan is worth much less under the second answer.

- /guide COPY AND THE PUBLIC TIER TABLE. The guide tells every user to tap 'Generate Clinical Report'; validate-guide.js:116 only asserts the string exists, so CI will not catch the mismatch. If the gates land, marketing copy and the guide need updating in the same release — a writing/positioning decision, not a merge decision.

- THE googleCalUrlForMed FALLBACK CHOICE. Both sides independently rewrote the same line during the sync (site 77661de, shell 273bb32); neither form ever existed in the other repo. The shell's is more defensible (a monthly med anchored on a real dose day rather than permanently one day off), but it can emit a DTSTART a few hours in the past. Whether that is acceptable, or whether to use the hardened `(_gOff.length ? 0 : 1)` variant, is a product call with zero test coverage in either repo.

- THE ADHERENCE NUMBER MOVING. Step 15(c) changes the 30-day denominator for weekly protocols not starting on Monday, so users will see their adherence percentage shift with no action of their own. Correct, but it needs a release note and possibly an in-app explanation — a human should approve the framing.

- acceptDisclaimer's CATCH PATH. In storage-restricted browsers the fallback writes '1', which disclaimerCurrent() then reads as stale, so those users are re-prompted on every launch. Pre-existing site behaviour, deliberately out of scope here; someone should decide whether it is a follow-up ticket or a blocker.

- WHETHER STEP 4 SHOULD ALSO CLEAR tl_ent. TL_ENT_KEY is removed elsewhere in both files but not in the resetAllData array; adding it means a full wipe also drops a cached Pro entitlement, which is arguably correct and arguably a support burden. Product/support call.

