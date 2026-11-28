/*
 * Health -> Bloodwork (3b): one lab panel at a time, each marker on its
 * reference range.
 *
 * The panel and its rows come from tlPanelOf (src/logic/home.js), the same
 * reader Today's Labs card uses, on the bloodwork screen's own ranges
 * (labRangeFor, labSt): so "out of range" means one thing everywhere. The
 * screen presents; it does not interpret. The footnote says so.
 *
 * Logging, scanning, a marker's trend and the list of every panel are still
 * the old screens, reached from here: "+ Log labs" and the scan button open
 * the lab form (#/log/labs), a marker opens its trend (#/health/trend/<key>,
 * a paid feature), "All panels" opens the old history with its edit and
 * delete, and the report opens the old report builder (#/health/report).
 */

var tlBwState = { panel: null, filter: 'all' };

/* The header's buttons, in place of the profile button (TL_ROUTES `actions`). */
function tlBloodworkActions() {
  return '<div class="tl-bw-actions">' +
    '<button type="button" class="ds-btn ds-btn-secondary tl-bw-scan" data-tl-call="tlBwScan" aria-label="Scan a lab report">' + tlIcon('scan') + '</button>' +
    '<button type="button" class="ds-btn ds-btn-primary tl-bw-add" data-tl-go="log/labs">' + tlIcon('plus') + '<span>Log labs</span></button>' +
    '</div>';
}

/* The scan button: reading a report is the AI scanner, a Pro feature. With
   it, the lab form opens and the file picker with it, in the same tap. */
function tlBwScan() {
  if (window.TLTier && !TLTier.check('ai_scanner')) return;
  if (!tlGo('log/labs')) return;
  var input = document.getElementById('lab-file-input');
  if (input) input.click();
}

/* "Ranges for male, age 41". The ranges assume male and 35 when the profile
   says nothing (getAdjustedLabRanges), so it says when they do. */
function tlBwRangesFor(d) {
  var p = (d && d.profile) || {};
  var sex = p.sex ? String(p.sex).toLowerCase() : '';
  var age = null;
  if (p.dob) {
    var born = tlDay(p.dob).getTime();
    if (isFinite(born)) age = Math.floor((Date.now() - born) / (365.25 * 864e5));
  }
  var text = 'Ranges for ' + (sex || 'male (default)') + ', ' + (age !== null && age >= 0 ? 'age ' + age : 'age not set');
  return { text: text, incomplete: !sex || age === null };
}

function tlBwNames(rows) {
  return tlJoinNames(rows.map(function (r) { return '<span class="tl-bw-flag">' + tlEsc(r.name) + '</span>'; }));
}

/* "LH and FSH are below reference." */
function tlBwOutText(panel, ranged) {
  if (!ranged) return 'None of these markers has a reference range on file.';
  var below = panel.out.filter(function (r) { return r.dir === 'below'; });
  var above = panel.out.filter(function (r) { return r.dir === 'above'; });
  var other = panel.out.filter(function (r) { return r.dir !== 'below' && r.dir !== 'above'; });
  var parts = [];
  if (below.length) parts.push(tlBwNames(below) + (below.length > 1 ? ' are' : ' is') + ' below reference');
  if (above.length) parts.push(tlBwNames(above) + (above.length > 1 ? ' are' : ' is') + ' above reference');
  if (other.length) parts.push(tlBwNames(other) + (other.length > 1 ? ' are' : ' is') + ' outside reference');
  return parts.length ? parts.join('. ') + '.' : 'Every marker with a range is inside it.';
}

function tlBwSummary(panel) {
  var s = tlPanelSummary(panel), n = s.ranged.length;
  return '<section class="ds-hero tl-bw-sum" aria-label="Panel summary">' +
    '<div class="tl-bw-sum-big"><span class="ds-big">' + s.inRange + '</span><span class="ds-big-unit">/' + n + '</span>' +
      '<span class="tl-bw-sum-l">' + (n === 1 ? 'marker' : 'markers') + ' in range</span></div>' +
    (n ? '<div class="tl-bw-pips" aria-hidden="true">' + s.ranged.map(function (r) {
      return tlHex('', { tone: r.status === 'bad' ? 'danger' : 'accent', cls: 'tl-bw-pip' });
    }).join('') + '</div>' : '') +
    '<p class="tl-bw-sum-t">' + tlBwOutText(panel, n) + '</p>' +
    '</section>';
}

/* Ordering labs is planned, not built: the switch only remembers the wish,
   on this phone. */
function tlBwOrder(d) {
  var on = !!tlSetting(d, 'labsNotify', null);
  return '<section class="ds-card tl-bw-order" aria-label="Order labs">' +
    tlHex('flask', { size: 'lg' }) +
    '<div class="tl-bw-order-main"><div class="tl-bw-order-h"><span class="tl-bw-order-t">Order labs</span>' +
      '<span class="ds-tag ds-tag-accent">Coming soon</span></div>' +
      '<p class="tl-bw-order-s">Panels at wholesale prices, results filed here.</p>' +
      (on ? '<p class="tl-bw-order-s tl-bw-order-note">You will see it here when it opens. Nothing was sent anywhere.</p>' : '') +
    '</div>' +
    '<button type="button" class="ds-btn ds-btn-secondary tl-bw-notify" aria-pressed="' + on + '" data-bw="notify">' +
      (on ? tlIcon('check') + '<span>On the list</span>' : 'Notify me') + '</button>' +
    '</section>';
}

function tlBwNum(v) { return String(Math.round(v * 1000) / 1000); }

function tlBwRow(r) {
  var bar = tlMarkerBar(r), status = tlRangeStatus(r), out = r.status === 'bad';
  var label = r.full + ', ' + tlBwNum(r.value) + (r.unit ? ' ' + r.unit : '') + (status ? ', ' + status.toLowerCase() : '') + '. Show its trend';
  return '<button type="button" class="tl-bw-row" data-bw-trend="' + tlEsc(r.key) + '" aria-label="' + tlEsc(label) + '">' +
    '<span class="tl-bw-row-top"><span class="tl-bw-name">' + tlEsc(r.full) + '</span>' +
      '<span class="tl-bw-val">' + tlEsc(tlBwNum(r.value)) + '</span><span class="tl-bw-unit">' + tlEsc(r.unit) + '</span></span>' +
    (bar ? '<span class="tl-bw-bar" aria-hidden="true"><span class="tl-bw-band" style="left:' + (bar.from * 100).toFixed(1) + '%;right:' + ((1 - bar.to) * 100).toFixed(1) + '%"></span>' +
      '<span class="tl-bw-dot' + (out ? ' tl-bw-dot-out' : '') + '" style="left:' + (bar.at * 100).toFixed(2) + '%"></span></span>' : '') +
    '<span class="tl-bw-row-foot"><span>' + tlEsc(tlRangeText(r)) + '</span>' +
      (status ? '<span class="tl-bw-status' + (out ? ' tl-bw-status-out' : '') + '">' + status + '</span>' : '') + '</span>' +
    '</button>';
}

function tlBwRows(panel) {
  var rows = tlBwState.filter === 'out' ? panel.out : panel.rows;
  if (!rows.length) return '<p class="tl-bw-none">Nothing outside its reference range in this panel.</p>';
  return '<div class="tl-bw-list">' + rows.map(tlBwRow).join('') + '</div>';
}

function tlBwPicker(panels, cur, d) {
  var ranges = tlBwRangesFor(d);
  var label = function (e) { return 'Panel of ' + tlShortDate(tlDay(e.labDate || tlDayKey(e.ts)).getTime()); };
  return '<div class="tl-bw-pick">' +
    '<label class="tl-bw-select"><span class="tl-bw-select-t" aria-hidden="true">' + tlEsc(label(cur)) + (panels.length > 1 ? tlIcon('caret-down') : '') + '</span>' +
      '<select id="tl-bw-panel" aria-label="Lab panel"' + (panels.length > 1 ? '' : ' disabled') + '>' +
      panels.map(function (e) {
        return '<option value="' + tlEsc(e.ts) + '"' + (e === cur ? ' selected' : '') + '>' + tlEsc(label(e)) + '</option>';
      }).join('') + '</select></label>' +
    (ranges.incomplete
      ? '<button type="button" class="tl-bw-ranges tl-bw-ranges-link" data-tl-go="profile">' + tlEsc(ranges.text) + '</button>'
      : '<span class="tl-bw-ranges">' + tlEsc(ranges.text) + '</span>') +
    '</div>';
}

function tlBloodworkScreen(el) {
  var d = gd(), panels = tlLabPanels(d.entries || []);
  var cur = null;
  panels.forEach(function (e) { if (e.ts === tlBwState.panel) cur = e; });
  if (!cur) { cur = panels[0] || null; tlBwState.panel = cur ? cur.ts : null; }
  var foot = tlFootnote('Reference intervals, not a diagnosis. Review results with your physician.');
  var more = '<div class="ds-list tl-bw-more">' +
    tlRow({ as: 'button', icon: 'clock-counter-clockwise', title: 'All panels', sub: 'Every panel you have logged, to edit or delete', caret: true, attrs: 'data-tl-go="health/panels"' }) +
    '<div class="ds-hr"></div>' +
    tlRow({ as: 'button', icon: 'file-text', title: 'Report for your physician', sub: 'Labs, doses and trends on one page', caret: true, attrs: 'data-tl-go="health/report"' }) +
    '</div>';
  var html;
  if (!cur) {
    html = '<section class="ds-hero tl-bw-empty"><h2 class="tl-bw-empty-t">No labs yet</h2>' +
      '<p class="tl-bw-empty-s">Log a panel by hand, or scan a report and check what it read before saving.</p>' +
      '<div class="tl-bw-empty-b"><button type="button" class="ds-btn ds-btn-primary" data-tl-go="log/labs">' + tlIcon('plus') + '<span>Log labs</span></button>' +
      '<button type="button" class="ds-btn ds-btn-secondary" data-tl-call="tlBwScan">' + tlIcon('scan') + '<span>Scan a report</span></button></div></section>' +
      tlBwOrder(d) + foot;
  } else {
    var panel = tlPanelOf(cur, tlLabsEnv());
    if (tlBwState.filter === 'out' && !panel.out.length) tlBwState.filter = 'all';
    html = tlBwPicker(panels, cur, d) + tlBwSummary(panel) + tlBwOrder(d) +
      '<div class="tl-bw-chips">' + tlChips('Markers', [{ value: 'all', label: 'All markers' },
        { value: 'out', label: 'Out of range · ' + panel.out.length }], tlBwState.filter, true) + '</div>' +
      '<div id="tl-bw-rows">' + tlBwRows(panel) + '</div>' + foot + more;
  }
  el.innerHTML = '<div class="ds-screen tl-bw ds-under-tabbar">' + html + '</div>';
  var root = el.firstChild;
  var redraw = function () { tlBloodworkScreen(el); };
  var sel = root.querySelector('#tl-bw-panel');
  if (sel) sel.addEventListener('change', function () { tlBwState.panel = sel.value; tlBwState.filter = 'all'; redraw(); });
  root.addEventListener('ds-change', function (e) {
    if (!e.detail || !e.target.closest('.tl-bw-chips')) return;
    tlBwState.filter = e.detail.value === 'out' ? 'out' : 'all';
    var rows = root.querySelector('#tl-bw-rows');
    if (rows && cur) rows.innerHTML = tlBwRows(tlPanelOf(cur, tlLabsEnv()));
  });
  root.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var trend = t.closest('[data-bw-trend]');
    if (trend) { tlGo('health/trend/' + trend.getAttribute('data-bw-trend')); return; }
    if (t.closest('[data-bw="notify"]')) {
      var rec = gd();
      if (tlSetting(rec, 'labsNotify', null)) delete rec.settings.labsNotify;
      else tlSetSetting(rec, 'labsNotify', new Date().toISOString());
      sd(rec);
      var card = root.querySelector('.tl-bw-order');
      if (card) card.outerHTML = tlBwOrder(rec);
      var btn = root.querySelector('[data-bw="notify"]');
      if (btn) btn.focus();
    }
  });
}

/* After the old lab form saves a panel (by hand or from a scan), show it:
   Bloodwork, on the panel just saved. Wrapped once by the shell at start-up
   (tlShellInit), as loadTemplate is. A save that added nothing (no value
   typed) leaves the form where it is. */
function tlWrapSaveBloodwork() {
  var orig = window.saveBloodwork;
  if (typeof orig !== 'function' || orig.tlWrapped) return;
  var wrapped = function () {
    var before = (gd().entries || []).length;
    var out = orig.apply(this, arguments);
    var d = gd(), first = (d.entries || [])[0];
    if ((d.entries || []).length > before && first && first.type === 'bloodwork' && document.body.classList.contains('tl-shell')) {
      tlBwState.panel = first.ts;
      tlBwState.filter = 'all';
      tlGo('health/bloodwork');
    }
    return out;
  };
  wrapped.tlWrapped = true;
  window.saveBloodwork = wrapped;
}
