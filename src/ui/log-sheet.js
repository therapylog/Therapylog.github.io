/* The Log sheet (5a): what the centre Log button opens.
 *
 *   the due card       the next round with anything pending: "Log {round} round"
 *   Something else     Dose, Weight, BP, Labs, Symptom, Photo, Measure, Scan
 *   the dose form      one dose of one compound, with its site
 *
 * The dose form starts on the user's own protocol amount, labelled as theirs;
 * nothing is suggested. "Save dose" ticks off that compound's next pending
 * dose today (tlLogCompoundDose), so Today, the round alert and this form all
 * write the same entry. The site comes from the injection-site map (4a,
 * site-map.js): the longest-rested site for the compound's route unless the
 * user picks another.
 *
 * The other tiles open the screens that log those things. Until their new
 * screens land (Phase 4, later), those are the old log page's tabs, reached
 * through the shell's routes.
 */

var tlLog = null;    /* { sheet, view, saved, form } while the sheet is open */

var TL_LOG_TILES = [
  { key: 'dose', label: 'Dose', icon: 'syringe' },
  { key: 'weight', label: 'Weight', icon: 'scales', go: 'log' },
  { key: 'bp', label: 'BP', icon: 'heartbeat', go: 'health/bp', pro: true },
  { key: 'labs', label: 'Labs', icon: 'test-tube', go: 'log/labs' },
  { key: 'symptom', label: 'Symptom', icon: 'thermometer-simple', go: 'log/symptom', pro: true },
  { key: 'photo', label: 'Photo', icon: 'camera', go: 'health/photos', pro: true },
  { key: 'measure', label: 'Measure', icon: 'ruler', go: 'health/body' },
  { key: 'scan', label: 'Scan', icon: 'scan', go: 'log/labs', pro: true, scan: true }
];

function tlLogFree() {
  return !!(window.TLTier && typeof TLTier.get === 'function' && TLTier.get() === 'free');
}

function tlLogContext() {
  var d = gd(), p = tlProtocol(d, tlEnv()), now = new Date();
  return { d: d, p: p, now: now, today: tlDayKey(now), rounds: tlRoundsFor(p, tlDayKey(now), d.entries || []) };
}

/* ---- the menu ------------------------------------------------------------ */

function tlLogMenuHtml() {
  var x = tlLogContext(), r = tlNextDueRound(x.rounds);
  var due;
  if (r) {
    var pending = r.doses.filter(function (d) { return !d.at; });
    due = '<div class="tl-log-due">' +
      '<div class="tl-log-due-at">' + tlIcon(r.icon.replace(/^ph-/, '')) + 'Due at ' + r.time + '</div>' +
      '<div class="tl-log-due-t">' + tlEsc(r.label) + ' round · ' + pending.length + ' to log</div>' +
      '<div class="tl-log-due-list">' + tlEsc(pending.map(function (d) { return d.name + (d.dose ? ' ' + d.dose : ''); }).join(' · ')) + '</div>' +
      '<button type="button" class="ds-btn ds-btn-primary ds-btn-block" data-log="round" data-slot="' + r.slot + '">Log ' + tlEsc(r.label.toLowerCase()) + ' round</button></div>';
  } else if (x.p.compounds.length) {
    due = '<div class="tl-log-due tl-log-due-done">' + tlIcon('check-circle', true) + '<span>Every round is logged for today.</span></div>';
  } else {
    due = '<div class="tl-log-due tl-log-due-done">' + tlIcon('info') + '<span>No protocol yet. Add the compounds you take on Today.</span></div>';
  }
  var free = tlLogFree();
  return '<div class="tl-log-head"><h2 class="ds-h1" tabindex="-1">Log</h2>' +
      '<button type="button" class="ds-btn ds-btn-ghost ds-btn-icon tl-log-x" data-log="close" aria-label="Close">' + tlIcon('x') + '</button></div>' +
    (tlLog.saved ? '<p class="tl-log-saved" role="status">' + tlIcon('check') + 'Saved · ' + tlEsc(tlLog.saved) + '</p>' : '') +
    due +
    '<h3 class="ds-label tl-log-label">Something else</h3>' +
    '<div class="tl-log-grid">' + TL_LOG_TILES.map(function (t) {
      return '<button type="button" class="tl-log-tile" data-log-tile="' + t.key + '">' + tlHex(t.icon) +
        '<span class="tl-log-tile-l">' + tlEsc(t.label) + '</span>' +
        (t.pro && free ? '<span class="tl-log-pro">Pro</span>' : '') + '</button>';
    }).join('') + '</div>';
}

/* ---- the dose form ------------------------------------------------------- */

/* "Last used 9 days ago", "Last used today", "Not used yet". */
function tlLastUsedText(days, used) {
  if (!used) return 'Not used yet';
  return 'Last used ' + (days === 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago');
}

function tlLogSiteFor(c, entries) {
  var f = tlLog.form;
  if (!c || (c.route !== 'im' && c.route !== 'sq') || typeof TL_SITE_MAP === 'undefined') return null;
  var now = Date.now();
  if (f.siteId) {
    var picked = tlSiteStates(TL_SITE_MAP, c.route, entries, now).filter(function (s) { return s.site.id === f.siteId; })[0];
    if (picked) return { pick: true, state: picked };
  }
  var best = tlLongestRested(TL_SITE_MAP, c.route, entries, now);
  return best ? { pick: false, state: best } : null;
}

function tlLogDoseHtml() {
  var x = tlLogContext(), f = tlLog.form, c = tlCompound(x.p, f.key);
  var routeName = c && c.route === 'im' ? 'IM' : c && c.route === 'sq' ? 'SubQ' : '';
  var site = tlLogSiteFor(c, x.d.entries || []);
  var now = tlMinToTime(tlMinuteOfDay(new Date().toISOString()));
  var siteSub = site ? site.state.site.name + ' · ' + tlLastUsedText(site.state.days, !!site.state.lastUsed) : '';
  return '<div class="tl-log-head"><button type="button" class="ds-btn ds-btn-ghost ds-btn-icon tl-log-back" data-log="menu" aria-label="Back">' + tlIcon('caret-left') + '</button>' +
      '<h2 class="ds-h1" tabindex="-1">Log a dose</h2></div>' +
    (x.p.compounds.length > 1 ? tlChips('Compound', x.p.compounds.map(function (k) { return { value: k.key, label: k.name }; }), f.key, true).replace('class="ds-chips"', 'class="ds-chips tl-log-chips"') : '') +
    '<form class="tl-log-form" novalidate>' +
    '<div class="ds-field"><label for="tl-log-amount">Dose' + (c ? ' of ' + tlEsc(c.name) : '') + '</label>' +
      '<div class="tl-cs-dose"><input class="ds-input" id="tl-log-amount" type="text" inputmode="decimal" autocomplete="off" value="' + tlEsc(f.amount) + '"' +
        (f.text ? ' placeholder="' + tlEsc(f.text) + '"' : '') + '>' +
      '<select class="ds-input" id="tl-log-unit" aria-label="Unit">' + TL_UNITS.map(function (u) { return '<option' + (u === f.unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></div>' +
      '<p class="ds-small ds-muted">' + (f.text ? 'Your protocol says “' + tlEsc(f.text) + '”. Enter the amount you took.' : 'From your protocol. Change it if today was different.') + '</p></div>' +
    '<div class="tl-log-line"><span class="ds-field-label">Time</span><span>Now · ' + now + '</span></div>' +
    (site ? tlRow({ as: 'button', icon: 'syringe', title: 'Site · ' + (site.pick ? 'your choice' : 'longest rested') + ', ' + routeName, sub: siteSub,
      trail: '<span class="tl-log-map">Map</span>', caret: true, attrs: 'data-log="map"' }) : '') +
    '<div class="ds-field"><label for="tl-log-notes">Notes</label>' +
      '<textarea class="ds-input" id="tl-log-notes" rows="2" placeholder="Reaction, timing, soreness">' + tlEsc(f.notes) + '</textarea></div>' +
    '<p class="tl-cs-error" role="alert"></p>' +
    '<button type="submit" class="ds-btn ds-btn-primary ds-btn-block tl-log-save">Save dose</button>' +
    '</form>';
}

/* Read the form's fields into tlLog.form, so a redraw or a trip to the map
   keeps what was typed. */
function tlLogReadForm() {
  var el = tlLog && tlLog.sheet && tlLog.sheet.el;
  if (!el || tlLog.view !== 'dose') return;
  var a = el.querySelector('#tl-log-amount'), u = el.querySelector('#tl-log-unit'), n = el.querySelector('#tl-log-notes');
  if (a) tlLog.form.amount = a.value;
  if (u) tlLog.form.unit = u.value;
  if (n) tlLog.form.notes = n.value;
}

function tlLogStartForm(key) {
  var x = tlLogContext();
  var c = key ? tlCompound(x.p, key) : tlDefaultDoseCompound(x.p, x.rounds);
  var dose = tlFormDose(c);
  tlLog.form = { key: c ? c.key : null, amount: dose.amount, unit: dose.unit, text: dose.text, notes: '', siteId: null };
}

/* Save the dose in the form. Returns the saved line, or null with the
   problem shown. */
function tlLogSave() {
  tlLogReadForm();
  var f = tlLog.form, el = tlLog.sheet && tlLog.sheet.el;
  var d = gd(), p = tlProtocol(d, tlEnv()), c = tlCompound(p, f.key);
  if (!c) return null;
  var amount = String(f.amount || '').trim();
  if (amount && tlAmountOf(amount) === null) {
    var err = el && el.querySelector('.tl-cs-error');
    if (err) err.textContent = 'The dose has to be a number, like 0.5 or 200.';
    var a = el && el.querySelector('#tl-log-amount');
    if (a) a.focus();
    return null;
  }
  var doseText = amount ? tlAmountOf(amount) + ' ' + f.unit : (f.text || tlDoseText(c.dose));
  var site = tlLogSiteFor(c, d.entries || []);
  var out = tlLogCompoundDose(d, p, c.key, new Date().toISOString(), {
    dose: doseText, notes: String(f.notes || '').trim(),
    site: site ? site.state.site.name : null, siteId: site ? site.state.site.id : null
  });
  if (!out) return null;
  sd(d);
  if (typeof tlAfterDoseChange === 'function') tlAfterDoseChange();
  return tlSavedLine(out.entry);
}

/* ---- the sheet ----------------------------------------------------------- */

function tlLogDraw(focusHeading) {
  var el = tlLog.sheet.el, box = el.querySelector('.tl-log');
  box.innerHTML = tlLog.view === 'dose' ? tlLogDoseHtml() : tlLogMenuHtml();
  el.setAttribute('aria-label', tlLog.view === 'dose' ? 'Log a dose' : 'Log');
  if (focusHeading) { var h = box.querySelector('h2'); if (h) h.focus(); }
}

/* Open the sheet: on its menu, or straight on the dose form (view 'dose'). */
function tlOpenLogSheet(view, keepState) {
  if (!keepState || !tlLog) tlLog = { view: 'menu', saved: null, form: null };
  if (view) tlLog.view = view;
  if (tlLog.view === 'dose' && !tlLog.form) tlLogStartForm();
  var sheet = tlOpenSheet('<div class="tl-log"></div>', {
    label: 'Log', cls: 'tl-log-scrim',
    onClose: function () { if (tlLog && tlLog.sheet === sheet && !tlLog.keep) tlLog = null; }
  });
  tlLog.sheet = sheet;
  tlLog.keep = false;
  tlLogDraw(true);
  var el = sheet.el;

  el.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t || !tlLog) return;
    var act = t.closest('[data-log]');
    var a = act && act.getAttribute('data-log');
    if (a === 'close') { sheet.close(); return; }
    if (a === 'menu') { tlLogReadForm(); tlLog.view = 'menu'; tlLogDraw(true); return; }
    if (a === 'round') {
      var slot = act.getAttribute('data-slot'), def = tlSlotDef(slot);
      var added = tlLogRoundNow(slot, tlDayKey(new Date()), false);
      tlLog.saved = added.length ? (def ? def.label : slot) + ' round, ' + tlDoseCount(added.length) : null;
      tlLogDraw(true);
      return;
    }
    if (a === 'map') { tlLogReadForm(); tlLogOpenMap(); return; }
    var tile = t.closest('[data-log-tile]');
    if (tile) {
      var key = tile.getAttribute('data-log-tile');
      var def2 = TL_LOG_TILES.filter(function (x) { return x.key === key; })[0];
      if (key === 'dose') {
        if (!tlProtocol(gd(), tlEnv()).compounds.length) {
          sheet.close();
          tlGo('today');
          if (typeof tlAddCompoundFlow === 'function') tlAddCompoundFlow();
          return;
        }
        tlLog.saved = null;
        tlLogStartForm();
        tlLog.view = 'dose';
        tlLogDraw(true);
        return;
      }
      sheet.close();
      if (def2 && def2.go && tlGo(def2.go) && def2.scan) {
        var card = document.getElementById('lab-scan-btn') || document.querySelector('#page-log [onclick*="lab-file-input"]');
        if (card && card.scrollIntoView) card.scrollIntoView({ block: 'center' });
      }
    }
  });

  el.addEventListener('ds-change', function (e) {
    if (!tlLog || !e.target.closest || !e.target.closest('.tl-log-chips') || !e.detail) return;
    tlLogReadForm();
    var notes = tlLog.form.notes;
    tlLogStartForm(e.detail.value);
    tlLog.form.notes = notes;
    tlLogDraw(false);
    var on = el.querySelector('.tl-log-chips [aria-pressed="true"]');
    if (on) on.focus();
  });

  el.addEventListener('submit', function (e) {
    e.preventDefault();
    var line = tlLogSave();
    if (line === null) return;
    tlLog.saved = line;
    tlLog.view = 'menu';
    tlLog.form = null;
    tlLogDraw(true);
  });
  return sheet;
}

/* What the map picked: a site, and the compound when another chip was
   chosen there. The notes typed so far stay. */
function tlLogTakePick(key, siteId) {
  if (key && key !== tlLog.form.key) {
    var notes = tlLog.form.notes;
    tlLogStartForm(key);
    tlLog.form.notes = notes;
  }
  tlLog.form.siteId = siteId || null;
}

/* To the map and back. The sheet closes while the map is open, so the two
   never fight over focus or the Escape key, and opens again on return with
   the form as it was. */
function tlLogOpenMap() {
  var x = tlLogContext(), c = tlCompound(x.p, tlLog.form.key);
  if (!c) return;
  tlLog.keep = true;
  tlLog.sheet.close();
  var state = tlLog;
  tlOpenSiteMap({
    protocol: x.p, compound: c, siteId: state.form.siteId,
    onBack: function (key, siteId) {
      tlLog = state;
      tlLogTakePick(key, siteId);
      tlOpenLogSheet('dose', true);
    },
    onLog: function (key, siteId) {
      tlLog = state;
      tlLogTakePick(key, siteId);
      tlOpenLogSheet('dose', true);
      var line = tlLogSave();
      if (line === null) return;
      tlLog.saved = line;
      tlLog.view = 'menu';
      tlLog.form = null;
      tlLogDraw(true);
    }
  });
}
