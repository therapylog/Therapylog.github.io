/* Today (2a) and Customize Home (2b).
 *
 * Today replaces the old dashboard. From the top:
 *
 *   the hero    a carousel of views: Levels, In your system, Supply, Labs
 *   Today       the day's rounds, each a checklist of doses
 *   Inventory   doses left in each vial
 *   Lab flags   markers outside their reference range
 *
 * Which views and sections show, and in what order, is the user's
 * (settings.home, via Customize Home). A view with nothing to show (Levels
 * before any dose is logged, Labs before any panel) is skipped rather than
 * drawn empty.
 *
 * Every figure here comes from the logic layer: the rounds from tlRoundsFor,
 * levels from tlLevelSeries (the old Levels chart's model), supply from
 * tlSupplyAll, the panel from tlLatestPanel (the bloodwork screen's ranges).
 * Ticking a dose and "Log all" write through tlLogDose and tlLogRound, so the
 * Log sheet, the notification and this screen all write the same entries.
 */

var tlTodayState = { hero: 0, level: null };

/* The app's own pharmacology and lab ranges, for the logic layer. */
function tlPkEnv() {
  return {
    parse: typeof pkParseDose === 'function' ? pkParseDose : function () { return null; },
    params: typeof pkParamsFor === 'function' ? pkParamsFor : function () { return {}; },
    curve: typeof pkCurve === 'function' ? pkCurve : null
  };
}

function tlLabsEnv() {
  return {
    range: typeof labRangeFor === 'function' ? labRangeFor : function () { return null; },
    status: typeof labSt === 'function' ? labSt : function () { return 'neutral'; },
    label: tlMarkerLabel,
    /* wire.js: the unit the value is STORED in, which for a scanned value is
       the app's own, not the unit the lab printed. */
    unit: tlLabUnit
  };
}

function tlTodayData() {
  var d = gd(), p = tlProtocol(d, tlEnv()), now = Date.now(), today = tlDayKey(new Date(now));
  var entries = d.entries || [], pk = tlPkEnv();
  return {
    d: d, p: p, now: now, today: today,
    rounds: tlRoundsFor(p, today, entries),
    levels: pk.curve ? tlLevelSeries(entries, now, pk) : [],
    supply: tlSupplyAll(p, entries, today),
    panel: tlLatestPanel(entries, tlLabsEnv()),
    layout: tlHomeLayout(d)
  };
}

function tlHeroHas(key, x) {
  if (key === 'levels' || key === 'system') return x.levels.length > 0;
  if (key === 'supply') return x.supply.length > 0;
  if (key === 'labs') return !!x.panel;
  return false;
}

function tlClock(iso) { return tlMinToTime(tlMinuteOfDay(iso)); }

function tlShortDate(ms) {
  var d = new Date(ms);
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getDate();
}

/* ---- the hero ------------------------------------------------------------ */

/* Estimated levels are analysis, and analysis is paid; the log they come from
   stays free. A free user sees what the view is and the way to it, not the
   curve. */
function tlLevelsLocked() {
  return !!(window.TLTier && typeof TLTier.get === 'function' && TLTier.get() === 'free');
}

function tlLockedHero(label, text) {
  return '<section class="ds-hero tl-hero-card tl-hero-locked" aria-label="' + tlEsc(label) + '">' +
    '<div class="tl-lock-head"><span class="ds-label">' + tlEsc(label) + '</span><span class="ds-tag ds-tag-outline">Pro</span></div>' +
    '<p class="tl-lock-text">' + tlEsc(text) + '</p>' +
    '<button type="button" class="ds-btn ds-btn-primary" data-today="levels-pro">' + tlIcon('lock-simple') + 'See your levels with Pro</button>' +
    '<p class="tl-hero-foot">Your log, the doses these come from, stays free.</p>' +
    '</section>';
}

function tlLevelsCard(x) {
  if (tlLevelsLocked()) return tlLockedHero('Levels', 'An estimated curve for each compound you log, from its published half-life: where it is now, and where your next week of doses takes it.');
  var list = x.levels;
  var sel = list.filter(function (s) { return s.label === tlTodayState.level; })[0] || list[0];
  tlTodayState.level = sel.label;
  var c = tlLevelChart(sel, 340, 140);
  var nowAt = Math.max(8, Math.min(92, c.nowX / 340 * 100));
  return '<section class="ds-hero tl-hero-card" aria-label="Levels">' +
    (list.length > 1 ? tlChips('Compound', list.map(function (s) { return { value: s.label, label: s.label }; }), sel.label, true).replace('class="ds-chips"', 'class="ds-chips tl-hero-chips"') : '') +
    '<div class="tl-lv-big">' + tlBig(sel.pct, '%') + '<span class="tl-lv-of">of peak · ' + tlEsc(sel.label) + '</span></div>' +
    '<svg class="tl-lv-chart" viewBox="0 0 340 140" preserveAspectRatio="none" role="img" aria-label="' +
      tlEsc('Estimated ' + sel.label + ' over the last four weeks and the next week. Now ' + sel.pct + '% of its peak.') + '">' +
      '<defs><linearGradient id="tl-lv-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="tl-lv-stop-a"/><stop offset="1" class="tl-lv-stop-b"/></linearGradient></defs>' +
      '<path class="tl-lv-area" d="' + c.area + '"/><path class="tl-lv-line" d="' + c.line + '"/><path class="tl-lv-proj" d="' + c.proj + '"/>' +
      '<line class="tl-lv-now" x1="' + c.nowX + '" y1="' + c.top + '" x2="' + c.nowX + '" y2="' + c.base + '"/>' +
      '<circle class="tl-lv-dot" cx="' + c.nowX + '" cy="' + c.nowY + '" r="4"/></svg>' +
    '<div class="tl-lv-axis" aria-hidden="true"><span>' + tlShortDate(sel.from) + '</span><span class="tl-lv-axis-now" style="left:' + nowAt + '%">Now</span></div>' +
    '<p class="tl-hero-foot">Half-life ' + tlEsc(tlHalfLifeText(sel.hl)) + '. Estimate from your logged doses, not a measurement.</p>' +
    '</section>';
}

function tlGaugeSvg(pct, i) {
  var fill = 44 * Math.max(0, Math.min(100, pct)) / 100;
  return '<svg viewBox="0 0 40 44" width="64" height="70" aria-hidden="true" focusable="false">' +
    '<defs><clipPath id="tl-gauge-' + i + '"><rect x="0" y="' + (44 - fill) + '" width="40" height="' + fill + '"/></clipPath></defs>' +
    '<polygon class="tl-gauge-fill" points="' + TL_HEX_POINTS + '" clip-path="url(#tl-gauge-' + i + ')"/>' +
    '<polygon class="tl-gauge-edge" points="' + TL_HEX_POINTS + '"/></svg>';
}

function tlSystemCard(x) {
  if (tlLevelsLocked()) return tlLockedHero('In your system', 'How much of each compound you log is estimated to be in your system right now, each against its own peak.');
  var n = x.levels.length;
  return '<section class="ds-hero tl-hero-card" aria-label="In your system">' +
    '<div class="ds-label">Estimated, right now</div>' +
    '<div class="tl-hero-sub">' + n + (n === 1 ? ' compound' : ' compounds') + ' from your log</div>' +
    '<div class="tl-gauges">' + x.levels.map(function (s, i) {
      return '<div class="tl-gauge">' + tlGaugeSvg(s.pct, i) +
        '<div class="tl-gauge-pct">' + s.pct + '%</div>' +
        '<div class="tl-gauge-name">' + tlEsc(s.label) + '</div>' +
        '<div class="tl-gauge-half">t½ ' + tlEsc(tlHalfLifeText(s.hl)) + '</div></div>';
    }).join('') + '</div>' +
    '<p class="tl-hero-foot">Each hexagon fills to that compound’s own peak. Estimate from your logged doses, not a measurement.</p>' +
    '</section>';
}

function tlStateCls(state) { return state === 'danger' ? 'tl-danger' : state === 'warn' ? 'tl-warn' : state === 'ok' ? 'tl-ok' : ''; }

function tlSupplyCard(x) {
  var first = x.supply[0];
  var soonest = x.supply.filter(function (s) { return s.days !== null && s.days === first.days; });
  return '<section class="ds-hero tl-hero-card" aria-label="Supply">' +
    '<div class="ds-label">Next vial needed</div>' +
    '<div class="tl-sup-big"><span class="ds-big ' + tlStateCls(first.state) + '">' + (first.days === null ? '–' : first.days + ' d') + '</span>' +
      '<span class="tl-hero-sub">' + tlEsc((soonest.length ? soonest : [first]).map(function (s) { return s.name; }).join(', ')) + '</span></div>' +
    x.supply.slice(0, 4).map(function (s) {
      return '<div class="ds-hr"></div><div class="tl-sup-row"><span class="tl-sup-name">' + tlEsc(s.name) + '</span>' +
        '<span class="tl-sup-left">' + s.left + ' of ' + s.per + ' doses</span>' +
        '<span class="tl-sup-days ' + tlStateCls(s.state) + '">' + (s.days === null ? '–' : s.days + ' d') + '</span></div>';
    }).join('') +
    '<p class="tl-hero-foot">Counts follow your schedule and change when a dose step does.</p>' +
    '</section>';
}

function tlLabsCard(x) {
  var panel = x.panel, rows = tlPanelRows(panel, 4), out = panel.out;
  return '<section class="ds-hero tl-hero-card" aria-label="Labs">' +
    '<div class="ds-label">Latest panel · ' + tlEsc(tlShortDate(tlDay(panel.date).getTime())) + '</div>' +
    '<div class="tl-sup-big"><span class="ds-big' + (out.length ? ' tl-danger' : '') + '">' + out.length + '</span>' +
      '<span class="tl-hero-sub">out of range' + (out.length ? ' · ' + tlEsc(out.map(function (r) { return r.name; }).join(', ')) : '') + '</span></div>' +
    rows.map(function (r) {
      var bar = tlRangeBar(r);
      return '<div class="ds-hr"></div><div class="tl-lab-row"><span class="tl-lab-name">' + tlEsc(r.name) + '</span>' +
        (bar ? '<span class="tl-lab-bar" aria-hidden="true"><span class="tl-lab-range" style="left:' + (bar.from * 100) + '%;right:' + ((1 - bar.to) * 100) + '%"></span>' +
          '<span class="tl-lab-dot ' + (r.status === 'bad' ? 'tl-danger' : r.status === 'warn' ? 'tl-warn' : '') + '" style="left:' + (bar.at * 100).toFixed(1) + '%"></span></span>'
          : '<span class="tl-lab-bar tl-lab-bar-none" aria-hidden="true"></span>') +
        '<span class="tl-lab-val' + (r.status === 'bad' ? ' tl-danger' : '') + '">' + tlEsc(r.value) + ' <span class="tl-lab-unit">' + tlEsc(r.unit) + '</span>' +
        (r.dir ? '<span class="ds-sr">, ' + r.dir + ' reference</span>' : '') + '</span></div>';
    }).join('') +
    tlFootnote('The bar is the reference range. Take out-of-range results to your clinician.') +
    '</section>';
}

function tlHeroHtml(heroes, x) {
  var i = tlTodayState.hero, cur = heroes[i];
  var cards = { levels: tlLevelsCard, system: tlSystemCard, supply: tlSupplyCard, labs: tlLabsCard };
  return '<div class="tl-hero">' +
    '<div class="tl-hero-head">' +
      '<button type="button" class="tl-hero-title" data-hero-menu aria-haspopup="true" aria-expanded="false">' +
        '<span>' + tlEsc(cur.label) + '</span>' + tlIcon('caret-down') + '</button>' +
      (heroes.length > 1 ? '<div class="tl-dots">' + heroes.map(function (h, n) {
        return '<button type="button" class="tl-dot" data-hero="' + n + '" aria-label="' + tlEsc(h.label) + '"' + (n === i ? ' aria-current="true"' : '') + '><span></span></button>';
      }).join('') + '</div>' : '') +
      '<div class="tl-hero-menu" hidden>' +
        heroes.map(function (h, n) { return '<button type="button" class="ds-btn tl-menu-item" data-hero="' + n + '">' + tlEsc(h.label) + '</button>'; }).join('') +
        '<div class="ds-hr"></div>' +
        '<button type="button" class="ds-btn ds-btn-ghost tl-menu-item" data-tl-go="home/customize">' + tlIcon('sliders-horizontal') + 'Choose what shows here</button>' +
      '</div>' +
    '</div>' +
    '<div class="tl-hero-track">' + heroes.map(function (h) { return cards[h.key](x); }).join('') + '</div>' +
    '</div>';
}

/* ---- the sections -------------------------------------------------------- */

function tlDosesHtml(x) {
  var tally = tlRoundsTally(x.rounds);
  var head = '<div class="tl-sec-head"><h2 class="ds-h2">Today</h2>' +
    (tally.total ? '<span class="tl-sec-note">' + tally.done + ' of ' + tally.total + ' logged</span>' : '') + '</div>';
  if (!x.p.compounds.length) {
    return '<section class="tl-sec" aria-label="Today">' + head +
      '<div class="ds-card tl-empty"><p class="tl-empty-t">Nothing scheduled yet.</p>' +
      '<p class="ds-small ds-muted">Add the compounds you take, and Today lists each dose by round.</p>' +
      '<button type="button" class="ds-btn ds-btn-primary ds-btn-block" data-today="add">' + tlIcon('plus') + 'Add compound</button></div></section>';
  }
  if (!x.rounds.length) {
    return '<section class="tl-sec" aria-label="Today">' + head + '<p class="tl-empty-line">Nothing due today.</p></section>';
  }
  return '<section class="tl-sec" aria-label="Today">' + head + x.rounds.map(function (r) {
    var pending = r.doses.filter(function (d) { return !d.at; }).length;
    return '<div class="tl-round-h">' + tlIcon(r.icon.replace(/^ph-/, '')) +
      '<span class="tl-round-h-t">' + tlEsc(r.label) + ' · ' + r.time + (r.alert ? '' : ' · alert off') + '</span>' +
      (pending > 1 ? '<button type="button" class="ds-btn ds-btn-ghost tl-log-all" data-log-round="' + r.slot + '">Log all ' + pending + '</button>' : '') +
      '</div>' + r.doses.map(function (d) {
        var done = !!d.at;
        return '<div class="ds-hr"></div><div class="tl-dose">' +
          '<button type="button" class="tl-dose-check" data-dose="' + tlEsc(d.id) + '" aria-pressed="' + done + '" aria-label="' + tlEsc(d.name + ' logged') + '">' +
            (done ? tlIcon('check-circle', true) : tlIcon('circle')) + '</button>' +
          '<div class="tl-dose-main"><div class="tl-dose-name">' + tlEsc(d.name) + '</div>' +
            (d.dose ? '<div class="tl-dose-amt">' + tlEsc(d.dose) + '</div>' : '') + '</div>' +
          (done ? '<span class="tl-dose-at">Logged ' + tlClock(d.at) + '</span>'
            : '<button type="button" class="ds-btn ds-btn-primary tl-dose-log" data-dose="' + tlEsc(d.id) + '" aria-label="' + tlEsc('Log ' + d.name) + '">Log</button>') +
          '</div>';
      }).join('');
  }).join('') + '</section>';
}

function tlInventoryHtml(x) {
  if (!x.supply.length) {
    if (!x.p.compounds.length) return '';
    return '<section class="tl-sec" aria-label="Inventory"><div class="tl-sec-head"><h2 class="ds-h2">Inventory</h2></div>' +
      '<p class="tl-empty-line">Enter how many doses each vial holds, under Protocol, to see what is left and when to reorder.</p></section>';
  }
  return '<section class="tl-sec" aria-label="Inventory"><div class="tl-sec-head"><h2 class="ds-h2">Inventory</h2></div>' +
    x.supply.map(function (s) {
      var pips = tlSupplyPips(s), cls = tlStateCls(s.state);
      var bar = pips.length && pips.length <= 40
        ? '<div class="tl-pips ' + cls + '" aria-hidden="true">' + pips.map(function (on) { return '<span' + (on ? ' class="on"' : '') + '></span>'; }).join('') + '</div>'
        : '<div class="tl-fillbar ' + cls + '" aria-hidden="true"><span style="width:' + (s.per ? Math.round(s.left / s.per * 100) : 0) + '%"></span></div>';
      return '<div class="tl-inv"><div class="tl-inv-top"><span class="tl-inv-name">' + tlEsc(s.name) + '</span>' +
        '<span class="tl-inv-state ' + cls + '">' + (s.days === null ? '' : s.days + ' d · ') + tlEsc(s.stock) + '</span></div>' +
        bar + '<div class="tl-inv-note">' + tlEsc(s.note) + '</div></div><div class="ds-hr"></div>';
    }).join('') + '</section>';
}

function tlFlagsHtml(x) {
  var f = tlFlagsText(x.panel);
  if (!f) return '';
  return '<section class="tl-sec" aria-label="Lab flags">' +
    tlRow({ as: 'button', hex: { icon: 'test-tube', tone: 'danger' }, title: f.title, sub: f.sub, caret: true, attrs: 'data-tl-go="health/bloodwork"' }) +
    '</section>';
}

/* ---- drawing and acting -------------------------------------------------- */

function tlTodayScreen(el) {
  var x = tlTodayData();
  var heroes = x.layout.hero.filter(function (h) { return h.on && tlHeroHas(h.key, x); });
  if (tlTodayState.hero >= heroes.length) tlTodayState.hero = 0;
  var sections = { doses: tlDosesHtml, inventory: tlInventoryHtml, flags: tlFlagsHtml };
  el.innerHTML = '<div class="ds-screen tl-today ds-under-tabbar">' +
    /* What the schedule reader has to tell or ask: the one-time note on what
       now reads differently, "biweekly", a schedule it cannot read. */
    '<div id="tl-today-sched" class="tl-today-sched"></div>' +
    (heroes.length ? tlHeroHtml(heroes, x) : '') +
    x.layout.sections.filter(function (s) { return s.on; }).map(function (s) { return sections[s.key](x); }).join('') +
    '<button type="button" class="ds-btn ds-btn-secondary ds-btn-block tl-home-custom" data-tl-go="home/customize">' + tlIcon('sliders-horizontal') + 'Customize Home</button>' +
    '</div>';
  /* Listeners go on the screen's own root, which every redraw replaces: on
     the host they would pile up, one more per redraw, and a tap would toggle
     a dose twice. */
  tlTodayWire(el.firstChild, heroes);
  if (typeof renderScheduleCheck === 'function') { try { renderScheduleCheck(); } catch (e) {} }
}

/* Draw Today again in place, keeping the scroll position and the focus. */
function tlTodayRefresh(focusSel) {
  if (tlRoute !== 'today') return;
  var host = document.getElementById('tl-screen');
  if (!host) return;
  var y = window.scrollY;
  tlTodayScreen(host);
  window.scrollTo(0, y);
  if (focusSel) {
    var f = host.querySelector(focusSel);
    if (f) f.focus();
  }
}

function tlTodayWire(el, heroes) {
  var track = el.querySelector('.tl-hero-track');
  var cards = track ? track.children : [];
  var step = function () { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1; };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mark(i) {
    tlTodayState.hero = i;
    var title = el.querySelector('.tl-hero-title span');
    if (title && heroes[i]) title.textContent = heroes[i].label;
    Array.prototype.forEach.call(el.querySelectorAll('.tl-dot'), function (d, n) {
      if (n === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }
  function go(i) {
    if (!track) return;
    track.scrollTo({ left: i * step(), behavior: reduce ? 'auto' : 'smooth' });
    mark(i);
  }
  if (track) {
    track.scrollLeft = tlTodayState.hero * step();
    var pending = false;
    track.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var i = Math.max(0, Math.min(heroes.length - 1, Math.round(track.scrollLeft / step())));
        if (i !== tlTodayState.hero) mark(i);
      });
    });
  }

  var menu = el.querySelector('.tl-hero-menu'), opener = el.querySelector('[data-hero-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    opener.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = menu.querySelector('button'); if (first) first.focus(); }
  }

  el.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    if (t.closest('[data-hero-menu]')) { setMenu(menu.hidden); return; }
    var hero = t.closest('[data-hero]');
    if (hero) { setMenu(false); go(+hero.getAttribute('data-hero')); if (opener && hero.closest('.tl-hero-menu')) opener.focus(); return; }
    if (menu && !menu.hidden && !t.closest('.tl-hero-menu')) setMenu(false);
    var dose = t.closest('[data-dose]');
    if (dose) { tlTodayToggle(dose.getAttribute('data-dose')); return; }
    var round = t.closest('[data-log-round]');
    if (round) { tlLogRoundNow(round.getAttribute('data-log-round'), tlDayKey(new Date()), false); return; }
    if (t.closest('[data-today="add"]')) tlAddCompoundFlow();
    if (t.closest('[data-today="levels-pro"]') && window.TLTier) TLTier.check('cycle_tracker');
  });
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); opener.focus(); }
  });
  el.addEventListener('ds-change', function (e) {
    if (e.target && e.target.closest && e.target.closest('.tl-hero-chips') && e.detail) {
      tlTodayState.level = e.detail.value;
      tlTodayRefresh('.tl-hero-chips [aria-pressed="true"]');
    }
  });
}

/* Tick a dose off, or take it back. */
function tlTodayToggle(id) {
  var parsed = tlParseDoseId(id);
  if (!parsed) return;
  var d = gd(), p = tlProtocol(d, tlEnv());
  var dose = tlFindDose(tlRoundsFor(p, parsed.day, d.entries || []), id);
  if (!dose) return;
  if (dose.at) tlUndoDose(d, p, id); else tlLogDose(d, p, id, new Date().toISOString());
  sd(d);
  tlAfterDoseChange('.tl-dose-check[data-dose="' + id + '"]');
}

/* Everything that follows a change to the dose log: Today, the alerts. */
function tlAfterDoseChange(focusSel) {
  tlTodayRefresh(focusSel);
  if (typeof tlRoundReminders === 'function') { try { tlRoundReminders(); } catch (e) {} }
}

/* With no protocol yet, Today's own way to start one. */
function tlAddCompoundFlow() {
  var d = gd(), p = tlProtocol(d, tlEnv());
  tlCompoundSheet({
    compound: null, protocol: p,
    onSave: function (c) {
      var d2 = gd(), p2 = tlProtocol(d2, tlEnv());
      p2.compounds.push(c);
      tlSaveProtocol(d2, p2, new Date().toISOString());
      sd(d2);
      tlAfterDoseChange('.tl-today h2');
    }
  });
}

/* ---- Customize Home (2b) ------------------------------------------------- */

function tlCustomRows(list, kind) {
  return list.map(function (x) {
    return '<div class="tl-cust-row" data-key="' + x.key + '">' +
      '<button type="button" class="tl-handle" data-move="' + kind + ':' + x.key + '" aria-label="' + tlEsc('Move ' + x.label + '. Up and down arrow keys move it.') + '">' + tlIcon('dots-six-vertical') + '</button>' +
      '<span class="ds-row-main"><span class="ds-row-title">' + tlEsc(x.label) + '</span><span class="ds-row-sub">' + tlEsc(x.sub) + '</span></span>' +
      tlToggle('tl-home-' + kind + '-' + x.key, x.on, 'Show ' + x.label) + '</div>';
  }).join('');
}

function tlCustomizeScreen(el) {
  var d = gd(), layout = tlHomeLayout(d), p = tlProtocol(d, tlEnv());
  el.innerHTML = '<div class="ds-screen tl-custom">' +
    '<header class="tl-custom-head"><h1 class="ds-h1">Customize Home</h1>' +
      '<button type="button" class="ds-btn ds-btn-ghost" data-tl-back>Done</button></header>' +
    '<p class="tl-custom-lede ds-muted">Pick what sits front and centre.</p>' +
    '<h2 class="ds-label tl-custom-label">Hero views, in swipe order</h2>' +
    '<div class="tl-cust-list" data-list="hero">' + tlCustomRows(layout.hero, 'hero') + '</div>' +
    '<div class="tl-cust-row tl-cust-soon" aria-disabled="true"><span class="tl-handle">' + tlIcon('watch') + '</span>' +
      '<span class="ds-row-main"><span class="ds-row-title">Watch data</span><span class="ds-row-sub">Steps, resting heart rate</span></span>' +
      '<span class="ds-tag ds-tag-neutral">Soon</span></div>' +
    '<h2 class="ds-label tl-custom-label">Sections below the hero</h2>' +
    '<div class="tl-cust-list" data-list="sections">' + tlCustomRows(layout.sections, 'sections') + '</div>' +
    '<h2 class="ds-label tl-custom-label">Round alerts</h2>' +
    '<p class="ds-small ds-muted tl-custom-note">From your protocol. One alert per round, carrying its checklist.</p>' +
    '<div class="tl-cust-rounds">' + tlRoundCardsHtml(p, 'tl-cu', 'No rounds yet. Add compounds and the times you take them under Protocol.') + '</div>' +
    tlDiscreetRowHtml(p.discreet, 'tl-cu') +
    '</div>';
  tlCustomWire(el.firstChild);
}

function tlCustomSaveLayout(el) {
  var d = gd(), layout = tlHomeLayout(d);
  ['hero', 'sections'].forEach(function (kind) {
    var list = el.querySelector('[data-list="' + kind + '"]');
    var order = Array.prototype.map.call(list.querySelectorAll('.tl-cust-row'), function (r) { return r.getAttribute('data-key'); });
    layout[kind] = order.map(function (key) {
      var tog = document.getElementById('tl-home-' + kind + '-' + key);
      return { key: key, on: tog ? tog.getAttribute('aria-checked') === 'true' : true };
    });
  });
  tlSetHomeLayout(d, layout);
  sd(d);
}

/* Store a change to the rounds: the protocol model, written through. */
function tlCustomSaveProtocol(change) {
  var d = gd(), p = tlProtocol(d, tlEnv());
  change(p);
  tlSaveProtocol(d, p, new Date().toISOString());
  sd(d);
  try { localStorage.setItem('tl_notif_discreet', p.discreet ? '1' : '0'); } catch (e) {}
  if (typeof tlRoundReminders === 'function') { try { tlRoundReminders(); } catch (e) {} }
  return p;
}

function tlCustomWire(el) {
  el.addEventListener('ds-change', function (e) {
    var id = (e.target && e.target.id) || '';
    if (/^tl-home-(hero|sections)-/.test(id)) { tlCustomSaveLayout(el); return; }
    var m = /^tl-cu-alert-(am|mid|eve|bed)$/.exec(id);
    if (m) {
      tlCustomSaveProtocol(function (p) { p.slots[m[1]].alert = !!e.detail.checked; });
      var card = e.target.closest('.tl-round');
      if (card) { if (e.detail.checked) card.removeAttribute('data-off'); else card.setAttribute('data-off', ''); }
      return;
    }
    if (id === 'tl-cu-discreet') tlCustomSaveProtocol(function (p) { p.discreet = !!e.detail.checked; });
  });

  el.addEventListener('click', function (e) {
    var shift = e.target.closest && e.target.closest('[data-shift]');
    if (!shift) return;
    var parts = shift.getAttribute('data-shift').split(':');
    var p = tlCustomSaveProtocol(function (q) { tlShiftSlot(q, parts[0], +parts[1]); });
    el.querySelector('.tl-cust-rounds').innerHTML = tlRoundCardsHtml(p, 'tl-cu', '');
    var again = el.querySelector('[data-shift="' + parts.join(':') + '"]');
    if (again) again.focus();
  });

  /* Reordering: the arrow keys on a handle, or dragging it. */
  el.addEventListener('keydown', function (e) {
    var h = e.target.closest && e.target.closest('.tl-handle[data-move]');
    if (!h || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    var row = h.closest('.tl-cust-row');
    var other = e.key === 'ArrowUp' ? row.previousElementSibling : row.nextElementSibling;
    if (!other) return;
    if (e.key === 'ArrowUp') row.parentNode.insertBefore(row, other);
    else row.parentNode.insertBefore(other, row);
    h.focus();
    tlCustomSaveLayout(el);
  });

  el.addEventListener('pointerdown', function (e) {
    var h = e.target.closest && e.target.closest('.tl-handle[data-move]');
    if (!h) return;
    var row = h.closest('.tl-cust-row'), startY = e.clientY, moved = false;
    e.preventDefault();
    try { h.setPointerCapture(e.pointerId); } catch (err) {}
    row.classList.add('tl-dragging');
    function onMove(ev) {
      var dy = ev.clientY - startY, hgt = row.offsetHeight;
      if (dy > hgt / 2 && row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
        startY += hgt; moved = true;
      } else if (dy < -hgt / 2 && row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
        startY -= hgt; moved = true;
      }
    }
    function onUp() {
      h.removeEventListener('pointermove', onMove);
      h.removeEventListener('pointerup', onUp);
      h.removeEventListener('pointercancel', onUp);
      row.classList.remove('tl-dragging');
      if (moved) tlCustomSaveLayout(el);
    }
    h.addEventListener('pointermove', onMove);
    h.addEventListener('pointerup', onUp);
    h.addEventListener('pointercancel', onUp);
  });
}
