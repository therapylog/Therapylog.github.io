/* The Protocol tab (6a): the stack editor.
 *
 *   the summary    compounds on protocol, rounds a day, the protocol's week
 *   the week       Monday to Sunday, each day's dose count, today ringed
 *   Your stack     each compound: dose, days, route, its round times, and how
 *                  many days its supply lasts. A tap opens the edit sheet.
 *   Changes        the dose-change log
 *   rows           interactions, templates, round alerts, calendar, the full
 *                  levels chart, and the protocol's name, start and length
 *
 * It replaces the old cycle page. What that page did is all still here: its
 * overview is the summary and the stack, its week view the strip, its setup
 * form the edit sheet and "Name, start and length", its reminders the round
 * alerts and "Add to calendar", and its levels chart a row of its own.
 *
 * Doses are the user's. The edit sheet starts on their own amount and the
 * screen never suggests one.
 */

/* An encyclopedia class as an icon for the stack's hexagons. */
var TL_CLASS_ICONS = {
  androgens: 'drop', aas: 'drop', peptides: 'dna', addlpeptides: 'dna', khavinson2: 'dna', collagen: 'dna',
  antiinflam: 'dna', sexhealth: 'dna', metabolic2: 'dna', ghs: 'arrows-out-line-vertical',
  hghclass: 'arrows-out-line-vertical', glp1: 'chart-line-down', metabolic: 'chart-line-down',
  ancil: 'shield-check', addlancil: 'shield-check', pct: 'shield-check', sarmsclass: 'fire', muscle: 'fire',
  performance: 'fire', bbcompounds: 'fire', thyroid: 'pulse', adrenal: 'pulse', nootroplonge: 'sparkle',
  neuro2: 'sparkle', 'sleep-neuro': 'moon', longevity2: 'sparkle', longevity3: 'sparkle', senolytics: 'sparkle'
};

function tlDrugInfo(id) {
  if (!id || typeof DB === 'undefined') return null;
  for (var i = 0; i < DB.classes.length; i++) {
    var cl = DB.classes[i];
    for (var j = 0; j < cl.drugs.length; j++) if (cl.drugs[j].id === id) return { name: cl.drugs[j].name, cls: cl.id };
  }
  return null;
}

function tlCompoundIcon(c) {
  var info = tlDrugInfo(c.drugId);
  return (info && TL_CLASS_ICONS[info.cls]) || 'flask';
}

function tlStartText(day) {
  if (!day) return '';
  var d = tlDay(day);
  return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
}

function tlAlertsOn() {
  if (window.TLNative && TLNative.active && TLNative.active()) return true;
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

/* ---- the screen ---------------------------------------------------------- */

function tlProtocolScreen(el) {
  var d = gd(), env = tlEnv(), p = tlProtocol(d, env), now = new Date(), today = tlDayKey(now);
  var sum = tlProtocolSummary(p, today);
  var supply = {};
  tlSupplyAll(p, d.entries || [], today).forEach(function (s) { supply[s.key] = s; });
  var free = !!(window.TLTier && TLTier.get && TLTier.get() === 'free');
  var flags = typeof INTERACTIONS !== 'undefined'
    ? tlStackInteractions(p, INTERACTIONS, function (id) { var i = tlDrugInfo(id); return i && i.name; }) : [];

  var sub = [p.name || '', sum.rounds ? sum.rounds + (sum.rounds === 1 ? ' round a day' : ' rounds a day') : '',
    sum.week ? 'week ' + sum.week + (sum.weeks ? ' of ' + sum.weeks : '') + ', started ' + tlStartText(sum.start) : (sum.start ? 'starts ' + tlStartText(sum.start) : '')]
    .filter(function (x) { return x; }).join(' · ');

  var html = '<div class="ds-screen tl-proto ds-under-tabbar">';
  html += '<div class="tl-pc-sum"><div class="tl-pc-big">' + tlBig(sum.count) +
    '<span class="tl-pc-big-l">' + (sum.count === 1 ? 'compound' : 'compounds') + ' on protocol</span></div>' +
    (sub ? '<p class="tl-pc-sub">' + tlEsc(sub) + '</p>' : '') + '</div>';

  if (p.compounds.length) {
    html += '<div class="tl-pc-week" role="list" aria-label="Doses per day this week">' + tlWeekStrip(p, now).map(function (w) {
      return '<div class="tl-pc-day" role="listitem" aria-label="' + tlEsc(w.name + ': ' + w.count + (w.count === 1 ? ' dose' : ' doses') + (w.today ? ', today' : '')) + '">' +
        '<span class="tl-pc-day-l" aria-hidden="true">' + w.letter + '</span>' +
        '<span class="tl-pc-day-n' + (w.today ? ' tl-pc-today' : '') + '" aria-hidden="true">' + w.count + '</span></div>';
    }).join('') + '</div>' +
      '<p class="tl-pc-cap">' + tlEsc(tlWeekCaption(p, now)) + '</p>';
  }

  html += '<div class="tl-sec-head tl-pc-head"><h2 class="ds-label">Your stack</h2>' +
    '<button type="button" class="ds-btn ds-btn-ghost" data-pc="add">' + tlIcon('plus') + 'Add compound</button></div>';
  if (!p.compounds.length) {
    html += '<div class="ds-card tl-empty"><p class="tl-empty-t">No compounds yet.</p>' +
      '<p class="ds-small ds-muted">Add each compound you take, with your dose, its days and the times you take it.</p></div>';
  }
  html += '<div class="tl-pc-list">' + p.compounds.map(function (c) {
    var s = supply[c.key];
    var days = s && s.days !== null && s.days !== undefined ? s.days + ' d' : s && s.known && s.days === null && s.state === 'ok' ? 'Lasts' : '';
    return '<div class="ds-hr"></div><button type="button" class="tl-pc-row" data-pc-edit="' + tlEsc(c.key) + '">' +
      tlHex(tlCompoundIcon(c)) +
      '<span class="tl-pc-main"><span class="tl-pc-name">' + tlEsc(c.name) + '</span>' +
        '<span class="tl-pc-line">' + tlEsc(tlCompoundLine(c)) + '</span>' +
        '<span class="tl-pc-times' + (c.slots.length ? '' : ' tl-pc-none') + '">' + tlEsc(tlSlotTimesText(c, p)) + '</span></span>' +
      (days ? '<span class="tl-pc-days ' + (s.state === 'danger' ? 'tl-danger' : s.state === 'warn' ? 'tl-warn' : '') + '">' + days + '</span>' : '') +
      tlIcon('caret-right') + '</button>';
  }).join('') + (p.compounds.length ? '<div class="ds-hr"></div>' : '') + '</div>';

  var changes = (d.doseChanges || []).slice(0, 5);
  if (changes.length) {
    html += '<h2 class="ds-label tl-pc-label">Changes</h2><div class="tl-pc-changes">' + changes.map(function (ch) {
      return '<div class="tl-pc-change"><span class="tl-pc-swatch" aria-hidden="true"></span>' +
        '<span class="tl-pc-main"><span class="tl-pc-name">' + tlEsc(tlDoseChangeLine(ch)) + '</span>' +
        '<span class="tl-pc-line">' + tlEsc(tlStartText(tlDayKey(ch.ts))) + '</span></span></div>';
    }).join('<div class="ds-hr"></div>') + '</div>';
  }

  html += '<div class="ds-list tl-pc-rows"><div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'intersect', tone: flags.some(function (f) { return f.severity === 'danger'; }) ? 'danger'
        : flags.some(function (f) { return f.severity === 'warn'; }) ? 'warn' : 'accent' }, title: 'Interactions',
      sub: flags.length ? flags.length + ' noted in our reference: ' + flags.map(function (f) { return f.title; }).join('; ')
        : (p.compounds.length > 1 ? 'Nothing flagged across your stack in our reference' : 'Add two or more compounds to check them'),
      caret: true, attrs: 'data-pc="ix"' }) + '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'clipboard-text' }, title: 'Start from a template', sub: 'Ready-made protocols to adapt with your physician',
      trail: free ? '<span class="tl-pc-note">Peptides free</span>' : '', caret: true, attrs: 'data-pc="templates"' }) + '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'bell-ringing' }, title: 'Round alerts',
      sub: tlAlertsOn() ? 'On. Times and switches are in Customize Home' : 'Off. Turn on to get one alert per round',
      caret: true, attrs: 'data-pc="alerts"' }) + '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'calendar-plus' }, title: 'Add to calendar', sub: 'Your rounds as repeating events (.ics)', caret: true, attrs: 'data-pc="ics"' }) + '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'chart-line-up' }, title: 'Full levels chart', sub: 'Every compound over time, and its half-life settings',
      trail: free ? '<span class="ds-tag ds-tag-outline">Pro</span>' : '', caret: true, attrs: 'data-pc="levels"' }) + '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', hex: { icon: 'note-pencil' }, title: 'Name, start and length', sub: [p.name || 'No name yet', p.start ? 'started ' + tlStartText(p.start) : 'no start date', p.weeks ? p.weeks + ' weeks' : 'ongoing'].join(' · '),
      caret: true, attrs: 'data-pc="details"' }) + '<div class="ds-hr"></div></div>';

  html += tlFootnote('Doses are what you and your physician set. TherapyLog records them and never suggests one.');
  html += '</div>';
  el.innerHTML = html;
  tlProtocolWire(el.firstChild);
}

function tlProtocolRefresh(focusSel) {
  if (tlRoute !== 'protocol') return;
  var host = document.getElementById('tl-screen');
  if (!host) return;
  var y = window.scrollY;
  tlProtocolScreen(host);
  window.scrollTo(0, y);
  var f = focusSel && host.querySelector(focusSel);
  if (f) f.focus();
}

/* Store a change to the protocol and tell everything that reads it. */
function tlProtocolChange(change, focusSel) {
  var d = gd(), nowIso = new Date().toISOString();
  var before = tlProtocol(d, tlEnv());
  var out = tlEditProtocol(d, tlEnv(), nowIso, change);
  sd(d);
  if (typeof tlRoundReminders === 'function') { try { tlRoundReminders(); } catch (e) {} }
  tlProtocolRefresh(focusSel);
  return { before: before, after: out.protocol, changes: out.changes };
}

function tlProtocolWire(el) {
  el.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var edit = t.closest('[data-pc-edit]');
    if (edit) { tlProtocolEdit(edit.getAttribute('data-pc-edit')); return; }
    var act = t.closest('[data-pc]');
    if (!act) return;
    var a = act.getAttribute('data-pc');
    if (a === 'add') tlProtocolEdit(null);
    else if (a === 'ix') tlProtocolInteractions();
    else if (a === 'templates') tlGo('library/templates');
    else if (a === 'alerts') {
      if (tlAlertsOn()) tlGo('home/customize');
      else if (typeof requestNotifPermission === 'function') requestNotifPermission();
    }
    else if (a === 'ics') { if (typeof exportRemindersICS === 'function') exportRemindersICS(); }
    else if (a === 'levels') tlGo('protocol/levels');
    else if (a === 'details') tlProtocolDetails();
  });
}

/* Add (key null) or edit a compound, in the compound sheet with its supply. */
function tlProtocolEdit(key) {
  var d = gd(), p = tlProtocol(d, tlEnv());
  var prev = key ? tlCompound(p, key) : null;
  tlCompoundSheet({
    compound: prev, protocol: p, supply: true, title: prev ? prev.name : null, saveLabel: 'Done',
    onSave: function (c) {
      var out = tlProtocolChange(function (q) {
        if (prev) q.compounds = q.compounds.map(function (x) { return x.key === prev.key ? c : x; });
        else q.compounds.push(c);
      }, '[data-pc-edit="' + c.key + '"]');
      if (out.changes.length) tlToast('Dose change recorded: ' + tlDoseChangeLine(out.changes[0]));
    },
    onRemove: prev ? function () {
      var out = tlProtocolChange(function (q) {
        q.compounds = q.compounds.filter(function (x) { return x.key !== prev.key; });
      }, '[data-pc="add"]');
      tlToast(prev.name + ' removed. Its log entries stay.', { action: { label: 'Undo', run: function () {
        tlProtocolChange(function (q) {
          var at = out.before.compounds.map(function (x) { return x.key; }).indexOf(prev.key);
          var back = out.before.compounds[at];
          q.compounds.splice(Math.min(at, q.compounds.length), 0, back);
        }, '[data-pc-edit="' + prev.key + '"]');
      } } });
    } : null
  });
}

/* Name, start, length and the after-protocol notes; and clearing it. */
function tlProtocolDetails() {
  var p = tlProtocol(gd(), tlEnv());
  var html = '<form class="tl-cs" novalidate>' +
    '<h2 class="ds-h2">Name, start and length</h2>' +
    '<div class="ds-field"><label for="tl-pd-name">Name</label><input class="ds-input" id="tl-pd-name" type="text" autocomplete="off" value="' + tlEsc(p.name || '') + '"></div>' +
    '<div class="ds-field"><label for="tl-pd-start">Started</label><input class="ds-input" id="tl-pd-start" type="date" value="' + tlEsc(p.start || '') + '"></div>' +
    '<div class="ds-field"><label for="tl-pd-weeks">Length in weeks</label><input class="ds-input" id="tl-pd-weeks" type="text" inputmode="numeric" autocomplete="off" placeholder="Ongoing" value="' + tlEsc(p.weeks || '') + '"></div>' +
    '<div class="ds-field"><label for="tl-pd-pct">After the protocol (PCT) notes</label><textarea class="ds-input" id="tl-pd-pct" rows="3">' + tlEsc(p.pct || '') + '</textarea></div>' +
    '<p class="tl-cs-error" role="alert"></p>' +
    '<button type="submit" class="ds-btn ds-btn-primary ds-btn-block">Done</button>' +
    (p.compounds.length || p.name ? '<button type="button" class="ds-btn ds-btn-ghost ds-btn-block tl-cs-remove" data-pd-clear>' + tlIcon('trash') + 'Clear the protocol</button>' : '') +
    '</form>';
  var sheet = tlOpenSheet(html, { label: 'Name, start and length' });
  var el = sheet.el, $ = function (s) { return el.querySelector(s); };
  el.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var weeks = $('#tl-pd-weeks').value.trim();
    if (weeks && !(/^\d+$/.test(weeks) && +weeks > 0)) { $('.tl-cs-error').textContent = 'Length is a number of weeks, like 12, or blank for ongoing.'; $('#tl-pd-weeks').focus(); return; }
    var start = $('#tl-pd-start').value;
    sheet.close();
    tlProtocolChange(function (q) {
      q.name = $('#tl-pd-name').value.trim() || q.name;
      if (/^\d{4}-\d{2}-\d{2}$/.test(start)) q.start = start;
      q.weeks = weeks ? +weeks : null;
      q.pct = $('#tl-pd-pct').value.trim();
    }, '[data-pc="details"]');
  });
  var clear = $('[data-pd-clear]');
  if (clear) clear.addEventListener('click', function () {
    sheet.close();
    if (typeof clearProtocol !== 'function') return;
    Promise.resolve(clearProtocol()).then(function () { tlProtocolRefresh('[data-pc="add"]'); });
  });
}

/* The interaction checker, with the stack's flagged pair (or its first two
   compounds) already chosen. */
function tlProtocolInteractions() {
  var p = tlProtocol(gd(), tlEnv());
  var names = p.compounds.map(function (c) { var i = tlDrugInfo(c.drugId); return i ? i.name : c.name; });
  var flags = typeof INTERACTIONS !== 'undefined'
    ? tlStackInteractions(p, INTERACTIONS, function (id) { var i = tlDrugInfo(id); return i && i.name; }) : [];
  var pick = flags.length ? flags[0].drugs.slice(0, 3) : names.slice(0, 3);
  if (!tlGo('library/interactions')) return;
  ['ix-d1', 'ix-d2', 'ix-d3'].forEach(function (id, i) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var want = pick[i] || '';
    var opt = Array.prototype.filter.call(sel.options, function (o) { return o.value.toLowerCase() === String(want).toLowerCase(); })[0];
    sel.value = opt ? opt.value : '';
  });
  if (typeof checkInteractions === 'function') { try { checkInteractions(); } catch (e) {} }
  var box = document.getElementById('ix-d1');
  if (box && box.scrollIntoView) box.scrollIntoView({ block: 'center' });
}

/* The template list's "Load" (an old screen) builds the protocol model, not
   the old form's text. Put in place of the old loadTemplate by the shell. */
function tlLoadTemplate(tid) {
  var all = [].concat(typeof TEMPLATES !== 'undefined' ? TEMPLATES : [], typeof FEMALE_TEMPLATES !== 'undefined' ? FEMALE_TEMPLATES : []);
  var t = all.filter(function (x) { return x.id === tid; })[0];
  if (!t) return;
  /* Templates made only of peptides are free; the rest are Pro. */
  if (typeof tlTemplateLocked === 'function' && tlTemplateLocked(t) && !TLTier.check('protocol_templates')) return;
  var d = gd(), p = tlProtocol(d, tlEnv());
  var ask = p.compounds.length && typeof tlAsk === 'function' ? tlAsk(tlConfirmCopy('template', { name: t.name })) : Promise.resolve(true);
  Promise.resolve(ask).then(function (ok) {
    if (!ok || ok === 'cancel') return;
    var next = tlTemplateProtocol(t, tlDayKey(new Date()), tlEnv());
    tlGo('protocol');
    tlProtocolChange(function (q) {
      q.name = next.name; q.start = next.start; q.weeks = next.weeks; q.pct = next.pct; q.created = null;
      q.compounds = next.compounds;
    });
    tlToast(t.name + ' loaded. Check every dose with your physician.');
  });
}
