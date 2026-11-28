/*
 * Settings (5b), from the profile button, and its Rounds and alerts screen.
 *
 * Every row does what the old Settings page and the old Profile card did,
 * through the same functions: tlShareBackup (back up now), tlLinkBackupFile
 * (the weekly file, on a computer with Chrome or Edge), importData through
 * the old page's file input (restore), exportData and tlExportCsv (export),
 * exportCalendar, requestNotifPermission, toggleClinicMode, loadDemoData and
 * resetAllData (both ask first, through the confirm sheet). The plan rows read
 * the verified entitlement (tlReadEnt) and lead to Pro (5c) or the restore
 * that fits the platform (tlRestorePurchases).
 */

var tlSetState = { restoring: false, saved: 0 };

function tlSetPlatform() { return (window.Capacitor && window.Capacitor.getPlatform) ? window.Capacitor.getPlatform() : 'web'; }

/* "Male · 41 · sets your lab reference ranges". */
function tlSetProfileLine(d) {
  var p = (d && d.profile) || {}, parts = [];
  if (p.sex) parts.push(String(p.sex));
  if (p.dob) {
    var born = tlDay(p.dob).getTime();
    if (isFinite(born)) parts.push(String(Math.floor((Date.now() - born) / (365.25 * 864e5))));
  }
  return (parts.length ? parts.join(' · ') : 'Add your sex and age') + ' · sets your lab reference ranges';
}

/* The plan as two lines: "TherapyLog Pro" and "Yearly · renews Nov 16, 2027". */
function tlSetPlan() {
  var tier = window.TLTier ? TLTier.get() : 'free';
  var e = (typeof tlReadEnt === 'function' ? tlReadEnt() : null) || {};
  var name = tier === 'pro' ? 'TherapyLog Pro' : tier === 'byok' ? 'TherapyLog Pro · own key' : tier === 'standard' ? 'TherapyLog Standard' : null;
  var period = /month/i.test(e.plan || '') ? 'Monthly' : /year|annual/i.test(e.plan || '') ? 'Yearly' : e.lifetime ? 'Lifetime' : '';
  var when = '';
  if (e.expires) {
    var dt = new Date(e.expires * 1000);
    when = (e.willRenew ? 'renews ' : 'ends ') + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
  }
  return { tier: tier, name: name, line: [period, when].filter(Boolean).join(' · ') || 'Active', key: e.key || null, source: e.source || null };
}

function tlSetPlanCard() {
  var plan = tlSetPlan(), plat = tlSetPlatform();
  var first = plan.name
    ? '<div class="ds-row tl-set-plan-row">' + tlHex('crown-simple') +
        '<span class="ds-row-main"><span class="ds-row-title">' + tlEsc(plan.name) + ' <span class="ds-tag ds-tag-accent">Active</span></span>' +
        '<span class="ds-row-sub">' + tlEsc(plan.line) + '</span></span>' +
        '<button type="button" class="ds-btn ds-btn-secondary tl-set-manage" data-set="manage">Manage</button></div>'
    : tlRow({ as: 'button', hex: { icon: 'crown-simple' }, title: 'Upgrade to Pro', sub: 'Trends, supply, reports and the assistant', caret: true, attrs: 'data-set="upgrade"' });
  var idle = plat === 'ios' ? 'Reinstalled, or bought Pro on another device?' : 'Have a license key? Enter it here.';
  var sub = tlSetState.restoring ? '<span class="tl-set-spin" aria-hidden="true"></span>Checking with the App Store…' : tlEsc(idle);
  return '<section class="ds-card tl-set-plan" aria-label="Plan">' + first + '<div class="ds-hr"></div>' +
    '<button type="button" class="ds-row" data-set="restore"' + (tlSetState.restoring ? ' aria-busy="true"' : '') + '>' +
      tlHex('arrow-counter-clockwise', { tone: 'neutral' }) +
      '<span class="ds-row-main"><span class="ds-row-title">Restore purchases</span><span class="ds-row-sub" aria-live="polite">' + sub + '</span></span></button>' +
    '</section>';
}

function tlSetBackupWarn() {
  var days = typeof tlDaysSinceBackup === 'function' ? tlDaysSinceBackup() : null;
  if (days !== null && days < 7) return '';
  var text = days === null ? 'You have never backed up. Your log exists only on this phone.' : 'Last backup was ' + days + ' day' + (days === 1 ? '' : 's') + ' ago. Weekly is the recommendation.';
  return '<p class="tl-set-warn">' + tlIcon('warning') + '<span>' + text + '</span></p>';
}

function tlSetGroup(label, rows) {
  return '<h2 class="ds-label tl-set-h">' + label + '</h2><div class="ds-list tl-set-list">' + rows.join('<div class="ds-hr"></div>') + '</div>';
}

function tlSetToggleRow(icon, title, sub, id, on, disabled) {
  return '<div class="ds-row">' + '<span class="ds-row-icon">' + tlIcon(icon) + '</span>' +
    '<span class="ds-row-main"><span class="ds-row-title" id="' + id + '-l">' + tlEsc(title) + '</span>' + (sub ? '<span class="ds-row-sub">' + tlEsc(sub) + '</span>' : '') + '</span>' +
    '<span class="ds-row-trail">' + tlToggle(id, on, title, disabled) + '</span></div>';
}

function tlSetRoundsLine(d) {
  var p = tlProtocol(d, tlEnv()), rounds = tlSetupRounds(p);
  if (!rounds.length) return 'No rounds yet';
  return rounds.length + (rounds.length === 1 ? ' round' : ' rounds') + ' · ' + rounds.map(function (r) { return r.time; }).join(', ');
}

function tlSetNotifLine() {
  if (typeof Notification === 'undefined') return 'Not available in this browser';
  if (Notification.permission === 'granted') return 'On';
  if (Notification.permission === 'denied') return 'Blocked; allow them in your browser’s settings';
  return 'Off. Tap to allow alerts on this phone';
}

function tlSettingsScreen(el) {
  var d = gd(), p = tlProtocol(d, tlEnv());
  var saved = tlSetState.saved && Date.now() - tlSetState.saved < 120000;
  var canLink = typeof tlCanLinkFile === 'function' && tlCanLinkFile();
  var initial = tlInitial(d);
  var figure = tlSetting(d, 'figure', (d.profile && d.profile.sex === 'Female') ? 'female' : 'male');
  el.innerHTML = '<div class="ds-screen tl-set ds-under-tabbar">' +
    '<button type="button" class="ds-row tl-set-me" data-tl-go="profile">' +
      '<span class="tl-set-avatar" aria-hidden="true">' + (initial ? tlEsc(initial) : tlIcon('person-simple')) + '</span>' +
      '<span class="ds-row-main"><span class="ds-row-title">' + tlEsc((d.profile && d.profile.name) || 'Your profile') + '</span>' +
      '<span class="ds-row-sub">' + tlEsc(tlSetProfileLine(d)) + '</span></span>' +
      '<span class="ds-row-trail"><i class="ph ph-caret-right ds-caret" aria-hidden="true"></i></span></button>' +
    tlSetPlanCard() +
    '<h2 class="ds-label tl-set-h">Backup</h2>' + tlSetBackupWarn() +
    '<div class="ds-list tl-set-list">' +
      tlRow({ as: 'button', icon: 'cloud-arrow-up', title: 'Back up now', sub: saved ? 'Saved just now' : 'iCloud Drive, Google Drive or Files', caret: true, attrs: 'data-set="backup"' }) +
      '<div class="ds-hr"></div>' +
      tlSetToggleRow('calendar-check', 'Automatic weekly backup', canLink ? 'A file on this computer that updates itself' : 'Needs a computer with Chrome or Edge', 'tl-set-auto', false, !canLink) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'file-arrow-up', title: 'Restore from a backup file', caret: true, attrs: 'data-set="restore-file"' }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'export', title: 'Export my data', sub: 'CSV and JSON, to keep or share with your physician', caret: true, attrs: 'data-set="export"' }) +
    '</div>' +
    '<p class="tl-set-note">Your log lives on this phone only. A backup restored on another device is a copy, not a sync.</p>' +
    tlSetGroup('Reminders', [
      tlRow({ as: 'button', icon: 'bell-ringing', title: 'Rounds and alerts', sub: tlSetRoundsLine(d), caret: true, attrs: 'data-tl-go="settings/rounds"' }),
      tlSetToggleRow('eye-slash', 'Discreet alerts', 'Hide compound names on the lock screen', 'tl-set-discreet', !!p.discreet),
      tlRow({ as: 'button', icon: 'bell-ringing', title: 'Notifications', sub: tlSetNotifLine(), caret: true, attrs: 'data-set="notif"' }),
      tlRow({ as: 'button', icon: 'calendar-plus', title: 'Add to my calendar', sub: 'Your schedule as an .ics file', caret: true, attrs: 'data-set="calendar"' })
    ]) +
    '<h2 class="ds-label tl-set-h">Display</h2><div class="ds-list tl-set-list">' +
      '<div class="tl-set-seg"><span class="ds-row-icon">' + tlIcon('circle-half') + '</span><span class="tl-set-seg-l">Appearance</span>' +
        tlSegmented('Appearance', [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }], tlTheme(), true) + '</div>' +
      '<div class="ds-hr"></div>' +
      '<div class="tl-set-seg"><span class="ds-row-icon">' + tlIcon('person-simple') + '</span><span class="tl-set-seg-l">Body map figure</span>' +
        tlSegmented('Body map figure', [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }], figure, true) + '</div>' +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'stethoscope', title: 'Clinic mode', sub: 'A clean view to hand to a practitioner', caret: true, attrs: 'data-set="clinic"' }) +
    '</div>' +
    tlSetGroup('Data', [
      tlRow({ as: 'button', icon: 'clock-counter-clockwise', title: 'History', sub: 'Every entry, newest first', caret: true, attrs: 'data-tl-go="history"' }),
      tlRow({ as: 'button', icon: 'flask', title: 'Load demo data', sub: 'A sample log to explore, in place of yours', caret: true, attrs: 'data-set="demo"' }),
      tlRow({ as: 'button', icon: 'trash', title: 'Delete all data', danger: true, attrs: 'data-set="wipe"' })
    ]) +
    tlSetGroup('About', [
      tlRow({ as: 'a', icon: 'book-open', title: 'Guide', caret: true, attrs: 'href="/guide/" target="_blank" rel="noopener"' }),
      tlRow({ as: 'a', icon: 'book-open-text', title: 'Sources and methodology', caret: true, attrs: 'href="/sources/" target="_blank" rel="noopener"' }),
      tlRow({ as: 'a', icon: 'file-text', title: 'Terms and privacy', caret: true, attrs: 'href="/terms" target="_blank" rel="noopener"' }),
      tlRow({ as: 'button', icon: 'paper-plane-right', title: 'Send feedback', caret: true, attrs: 'data-set="feedback"' })
    ]) +
    '<p class="tl-set-foot">TherapyLog ' + tlEsc(typeof APP_VERSION !== 'undefined' ? APP_VERSION : '') + '. Records and presents; not a medical device.</p>' +
    '</div>';
  var root = el.firstChild;
  var redraw = function () { tlSettingsScreen(el); };
  /* The weekly file's switch shows whether one is linked; that takes a read
     of IndexedDB, so it fills in a moment later. */
  if (canLink && typeof tlGetHandle === 'function') {
    tlGetHandle().then(function (h) {
      var t = root.querySelector('#tl-set-auto');
      if (t) t.setAttribute('aria-checked', h ? 'true' : 'false');
    });
  }
  root.addEventListener('ds-change', function (e) {
    var id = (e.target && e.target.id) || '', seg = e.target.closest ? e.target.closest('[data-ds-seg]') : null;
    if (seg && seg.getAttribute('data-ds-seg') === 'Appearance') { if (e.detail.value === 'dark' || e.detail.value === 'light') tlSetTheme(e.detail.value); return; }
    if (seg && seg.getAttribute('data-ds-seg') === 'Body map figure') { var rec = gd(); tlSetSetting(rec, 'figure', e.detail.value); sd(rec); return; }
    if (id === 'tl-set-discreet') { tlCustomSaveProtocol(function (q) { q.discreet = !!e.detail.checked; }); return; }
    if (id === 'tl-set-auto') {
      if (e.detail.checked) {
        Promise.resolve(tlLinkBackupFile()).then(function () { return tlGetHandle(); }).then(function (h) {
          var t = root.querySelector('#tl-set-auto'); if (t) t.setAttribute('aria-checked', h ? 'true' : 'false');
        });
      } else {
        tlUnlinkBackupFile().then(function () { if (typeof tlToast === 'function') tlToast('Automatic backup off'); });
      }
    }
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-set]') : null;
    if (!b) return;
    var act = b.getAttribute('data-set');
    if (act === 'upgrade') openUpgrade(null, 'pro');
    else if (act === 'manage') tlSetManage();
    else if (act === 'restore') {
      if (tlSetPlatform() === 'ios') {
        tlSetState.restoring = true; redraw();
        setTimeout(function () { tlSetState.restoring = false; if (el.isConnected) redraw(); }, 8000);
      }
      tlRestorePurchases();
    } else if (act === 'backup') {
      Promise.resolve(typeof tlShareBackup === 'function' ? tlShareBackup() : exportData()).then(function () {
        if (typeof tlDaysSinceBackup === 'function' && tlDaysSinceBackup() === 0) tlSetState.saved = Date.now();
        if (el.isConnected) redraw();
      });
    } else if (act === 'restore-file') { var input = document.getElementById('import-file'); if (input) input.click(); }
    else if (act === 'export') tlSetExport();
    else if (act === 'notif') { if (typeof requestNotifPermission === 'function') Promise.resolve(requestNotifPermission()).then(function () { setTimeout(redraw, 300); }); }
    else if (act === 'calendar') { if (typeof exportCalendar === 'function') exportCalendar(); }
    else if (act === 'clinic') { if (typeof toggleClinicMode === 'function' && !clinicModeActive) toggleClinicMode(); }
    else if (act === 'demo') loadDemoData();
    else if (act === 'wipe') resetAllData();
    else if (act === 'feedback') { if (typeof sendFeedback === 'function') sendFeedback(); }
  });
}

/* Forget the linked backup file: the weekly writes stop, the file stays. */
function tlUnlinkBackupFile() {
  if (typeof tlIdb !== 'function') return Promise.resolve(false);
  return Promise.resolve(tlIdb()).then(function (db) {
    return new Promise(function (resolve) {
      var tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles')['delete']('backup');
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { resolve(false); };
    });
  }, function () { return false; });
}

/* Export: the backup file (everything, restorable) or a spreadsheet. */
function tlSetExport() {
  var s = tlOpenSheet('<h2 class="tl-set-sheet-h">Export my data</h2>' +
    '<div class="ds-list">' +
      tlRow({ as: 'button', icon: 'file-text', title: 'Backup file (JSON)', sub: 'Everything, and the file a restore reads. Photos are exported from Photos.', attrs: 'data-exp="json"' }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'export', title: 'Spreadsheet (CSV)', sub: 'Every entry, to read or share; it cannot be restored from', attrs: 'data-exp="csv"' }) +
    '</div><button type="button" class="ds-btn ds-btn-ghost ds-btn-block" data-exp="close">Cancel</button>', { label: 'Export my data' });
  s.el.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-exp]') : null;
    if (!b) return;
    var k = b.getAttribute('data-exp');
    s.close();
    if (k === 'json') exportData();
    else if (k === 'csv' && typeof tlExportCsv === 'function') tlExportCsv();
  });
}

/* Manage: the App Store's subscriptions on iOS; elsewhere what the plan is
   and where to change it, since a web plan is managed from the receipt. */
function tlSetManage() {
  if (tlSetPlatform() === 'ios') { window.open('https://apps.apple.com/account/subscriptions', '_blank'); return; }
  var plan = tlSetPlan();
  var s = tlOpenSheet('<h2 class="tl-set-sheet-h">' + tlEsc(plan.name || 'Your plan') + '</h2>' +
    '<p class="tl-set-sheet-p">' + tlEsc(plan.line) + (plan.key ? '<br>License key <span class="tl-set-key">' + tlEsc(plan.key) + '</span>' : '') + '</p>' +
    '<p class="tl-set-sheet-p">To change or cancel, use the Stripe billing portal linked in your receipt email. Cancelling stops the next charge; access runs to the end of the period you paid for.</p>' +
    '<button type="button" class="ds-btn ds-btn-secondary ds-btn-block" data-man="key">Enter a different license key</button>' +
    '<button type="button" class="ds-btn ds-btn-ghost ds-btn-block" data-man="close">Close</button>', { label: 'Manage plan' });
  s.el.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-man]') : null;
    if (!b) return;
    s.close();
    if (b.getAttribute('data-man') === 'key' && window.TLTier) TLTier.showActivation();
  });
}

/* ---- Rounds and alerts ---------------------------------------------------- */

function tlSettingsRoundsScreen(el) {
  var p = tlProtocol(gd(), tlEnv());
  el.innerHTML = '<div class="ds-screen tl-set-rounds ds-under-tabbar">' +
    '<p class="tl-set-note">Each round’s alert and its time. Today and the round alert use the same times.</p>' +
    '<div class="tl-cust-rounds">' + tlRoundCardsHtml(p, 'tl-cu', 'No rounds yet. Add compounds and the times you take them under Protocol.') + '</div>' +
    tlDiscreetRowHtml(p.discreet, 'tl-cu') + '</div>';
  var root = el.firstChild;
  root.addEventListener('ds-change', function (e) {
    var id = (e.target && e.target.id) || '';
    var m = /^tl-cu-alert-(am|mid|eve|bed)$/.exec(id);
    if (m) {
      tlCustomSaveProtocol(function (q) { q.slots[m[1]].alert = !!e.detail.checked; });
      var card = e.target.closest('.tl-round');
      if (card) { if (e.detail.checked) card.removeAttribute('data-off'); else card.setAttribute('data-off', ''); }
      return;
    }
    if (id === 'tl-cu-discreet') tlCustomSaveProtocol(function (q) { q.discreet = !!e.detail.checked; });
  });
  root.addEventListener('click', function (e) {
    var shift = e.target.closest && e.target.closest('[data-shift]');
    if (!shift) return;
    var parts = shift.getAttribute('data-shift').split(':');
    var q = tlCustomSaveProtocol(function (x) { tlShiftSlot(x, parts[0], +parts[1]); });
    root.querySelector('.tl-cust-rounds').innerHTML = tlRoundCardsHtml(q, 'tl-cu', '');
    var again = root.querySelector('[data-shift="' + parts.join(':') + '"]');
    if (again) again.focus();
  });
}
