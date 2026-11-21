/* Round alerts on the web (2c).
 *
 * One alert per round, carrying its checklist (src/logic/alerts.js has the
 * words and the times). The native apps hand the plan to the OS scheduler;
 * that path is TLNative's and untouched here. On the web:
 *
 *   - a notification, with "Log {round} round" and "Open", when a round's time
 *     comes while the app is open or in a background tab and notifications
 *     are allowed. A closed tab cannot be woken; nothing on the web can do
 *     that without a push server.
 *   - an in-app banner for a round that is due, on every screen but Today
 *     (which already lists the round), whether or not notifications are
 *     allowed.
 *   - after "Log round", wherever it came from: "{Round} round logged, N doses
 *     at HH:MM", with Undo.
 *
 * The old app calls scheduleAllReminders() at start-up, every five minutes
 * and whenever the tab comes back into view; on the web that now calls
 * tlRoundReminders(). Fired alerts are remembered in the record's
 * remindersFired, as the old reminders were, so a reload does not repeat one.
 */

var tlRoundTimers = {};
var tlDueDismissed = {};
var tlLastRoundLog = null;      /* { slot, day, ts: [...] }, for Undo */
var TL_ALERT_AHEAD_MS = 60 * 60 * 1000;

function tlRoundReminders() {
  var d = gd(), p = tlProtocol(d, tlEnv()), now = Date.now(), entries = d.entries || [];
  tlRoundBannerRefresh();
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  var fired = d.remindersFired || {};
  tlAlertPlan(p, entries, now, 1).forEach(function (x) {
    var id = x.alert.id;
    if (x.at - now > TL_ALERT_AHEAD_MS || tlRoundTimers[id] || fired[id]) return;
    tlRoundTimers[id] = setTimeout(function () {
      delete tlRoundTimers[id];
      tlFireRound(x.alert.slot, x.alert.day);
    }, x.at - now);
  });
  /* Supply: once a day for each compound on its last vial. */
  var today = tlDayKey(new Date(now));
  tlSupplyAlerts(p, entries, today).forEach(function (a) {
    var key = a.id + ':' + today;
    if (fired[key]) return;
    tlMarkFired(key);
    fireNotification(a.title, { body: a.body, tag: a.id, data: { kind: 'supply' } });
  });
}

function tlMarkFired(key) {
  var d = gd();
  if (!d.remindersFired) d.remindersFired = {};
  d.remindersFired[key] = true;
  /* Keep a month: every key the new alerts write ends in its day. */
  var cutoff = tlDayKey(new Date(Date.now() - 31 * 864e5));
  Object.keys(d.remindersFired).forEach(function (k) {
    var m = /(\d{4}-\d{2}-\d{2})$/.exec(k);
    if (m && m[1] < cutoff) delete d.remindersFired[k];
  });
  sd(d);
}

/* A round's time has come: notify, if it still has something pending. */
function tlFireRound(slot, day) {
  var d = gd(), p = tlProtocol(d, tlEnv()), rounds = tlRoundsFor(p, day, d.entries || []);
  var i = -1;
  rounds.forEach(function (r, n) { if (r.slot === slot) i = n; });
  var r = rounds[i];
  if (!r || !r.alert || !r.doses.some(function (x) { return !x.at; })) return;
  var a = tlRoundAlert(r, rounds.slice(i + 1), p.discreet);
  tlMarkFired(a.id);
  fireNotification(a.title, {
    body: a.body, tag: a.id, renotify: true,
    data: { kind: 'round', slot: slot, day: day },
    actions: a.actions.map(function (x) { return { action: x.id, title: x.title }; })
  });
  tlRoundBannerRefresh();
}

/* Log a whole round now: from Today's "Log all", the banner, or the
   notification. Returns the entries added. */
function tlLogRoundNow(slot, day, fromAlert) {
  var d = gd(), p = tlProtocol(d, tlEnv()), nowIso = new Date().toISOString();
  var added = tlLogRound(d, p, slot, day, nowIso);
  if (!added.length) return added;
  sd(d);
  tlLastRoundLog = { slot: slot, day: day, ts: added.map(function (e) { return e.ts; }) };
  var def = tlSlotDef(slot), round = { slot: slot, label: def ? def.label : slot };
  var done = tlRoundLoggedAlert(round, added.length, tlMinToTime(tlMinuteOfDay(nowIso)));
  if (typeof tlAfterDoseChange === 'function') tlAfterDoseChange('[data-log-round="' + slot + '"], .tl-round-h');
  tlToast(done.title + ' · ' + done.body, { action: { label: 'Undo', run: function () { tlUndoRoundNow(slot, day); } } });
  if (fromAlert && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    fireNotification(done.title, {
      body: done.body, tag: 'round:' + slot + ':' + day,
      data: { kind: 'round', slot: slot, day: day },
      actions: done.actions.map(function (x) { return { action: x.id, title: x.title }; })
    });
  }
  return added;
}

/* Undo the round just logged: exactly the entries that logging added. After
   a reload, when that is no longer known, the whole round goes back to
   pending. */
function tlUndoRoundNow(slot, day) {
  var d = gd();
  if (tlLastRoundLog && tlLastRoundLog.slot === slot && tlLastRoundLog.day === day) {
    var ts = {};
    tlLastRoundLog.ts.forEach(function (t) { ts[t] = true; });
    d.entries = (d.entries || []).filter(function (e) { return !(e && e.type === 'medication' && ts[e.ts]); });
  } else {
    tlUndoRound(d, tlProtocol(d, tlEnv()), slot, day);
  }
  tlLastRoundLog = null;
  sd(d);
  if (typeof tlAfterDoseChange === 'function') tlAfterDoseChange();
}

/* ---- the in-app banner --------------------------------------------------- */

function tlRoundBannerRefresh() {
  if (typeof document === 'undefined') return;
  var el = document.getElementById('tl-due');
  var d = gd(), p = tlProtocol(d, tlEnv());
  var due = tlDueBanner(p, d.entries || [], Date.now());
  var hide = !due || tlDueDismissed[due.alert.id] || tlRoute === 'today' || !!document.getElementById('tl-ob') ||
    !document.body.classList.contains('tl-shell');
  if (hide) { if (el && el.parentNode) el.parentNode.removeChild(el); return; }
  var a = due.alert;
  if (!el) {
    el = document.createElement('div');
    el.id = 'tl-due';
    el.className = 'ds-ui tl-due';
    el.setAttribute('role', 'region');
    el.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-due]');
      if (!b) return;
      var act = b.getAttribute('data-due'), slot = el.getAttribute('data-slot'), day = el.getAttribute('data-day');
      if (act === 'log') tlLogRoundNow(slot, day, false);
      else if (act === 'open') tlGo('today');
      else tlDueDismissed[el.getAttribute('data-id')] = true;
      tlRoundBannerRefresh();
    });
    document.body.appendChild(el);
  }
  el.setAttribute('aria-label', a.title);
  el.setAttribute('data-slot', a.slot);
  el.setAttribute('data-day', a.day);
  el.setAttribute('data-id', a.id);
  el.innerHTML = '<div class="tl-due-head"><span class="tl-due-title">' + tlEsc(a.title) + '</span>' +
    '<button type="button" class="ds-btn ds-btn-icon tl-due-x" data-due="dismiss" aria-label="Dismiss">' + tlIcon('x') + '</button></div>' +
    '<div class="tl-due-lines">' + a.lines.map(function (l) { return '<div>' + tlEsc(l) + '</div>'; }).join('') + '</div>' +
    '<div class="tl-due-actions">' +
      '<button type="button" class="ds-btn ds-btn-primary" data-due="log">' + tlEsc(a.actions[0].title) + '</button>' +
      '<button type="button" class="ds-btn ds-btn-secondary" data-due="open">Open</button></div>';
}

/* ---- arriving from a notification ---------------------------------------- */

/* The service worker passes a notification's action to an open app as a
   message, or opens the app with it in the address. */
function tlRoundAction(action, slot, day) {
  if (action === 'log') tlLogRoundNow(slot, day, true);
  else if (action === 'undo') tlUndoRoundNow(slot, day);
  else tlGo('today');
}

function tlRoundAlertsInit(hash) {
  var q = String(hash || '').split('?')[1] || '';
  var m = /(?:^|&)round=(log|undo|open):(am|mid|eve|bed):(\d{4}-\d{2}-\d{2})/.exec(q);
  if (m) setTimeout(function () { tlRoundAction(m[1], m[2], m[3]); }, 0);
  if (typeof navigator !== 'undefined' && navigator.serviceWorker && !tlRoundAlertsInit.listening) {
    tlRoundAlertsInit.listening = true;
    navigator.serviceWorker.addEventListener('message', function (e) {
      var msg = e.data;
      if (msg && msg.type === 'tl-round') tlRoundAction(msg.action, msg.slot, msg.day);
    });
  }
}
