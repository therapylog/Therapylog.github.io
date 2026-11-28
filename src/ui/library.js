/* The Library (3a): the compound encyclopedia, and one compound's page.
 *
 *   search      over name, other names and class
 *   chips       All, then the design's six classes, then Other, so that no
 *               compound is out of reach
 *   rows        a hexagon for the class, the name, "Class · t½ · in your
 *               stack", and one status tag: Rx, Research or Supplement
 *
 * A compound's page (#/library/compound/<id>) has its class and status tags
 * once each, its other names, a half-life / route / status grid, the summary
 * and regulatory text, what the encyclopedia reports about benefits, risks,
 * reported protocols and monitoring, and the rows to check it against the
 * stack and to read the sources.
 *
 * The content is the encyclopedia's own (DB), unchanged. Reported protocols
 * are what the literature describes, beside the physician footnote; nothing
 * here computes a dose for anyone.
 */

/* The design's class chips, each with its hexagon icon, and the encyclopedia
   classes each one covers. */
var TL_LIB_GROUPS = [
  { value: 'peptides', label: 'Peptides', icon: 'dna',
    classes: ['peptides', 'addlpeptides', 'khavinson2', 'collagen', 'metabolic2', 'sexhealth', 'antiinflam'] },
  { value: 'testosterone', label: 'Testosterone', icon: 'drop', classes: ['androgens', 'aas'] },
  { value: 'gh', label: 'Growth hormone', icon: 'arrows-out-line-vertical', classes: ['ghs', 'hghclass'] },
  { value: 'ancillaries', label: 'Ancillaries', icon: 'shield-check', classes: ['ancil', 'addlancil'] },
  { value: 'pct', label: 'PCT', icon: 'arrow-u-up-left', classes: ['pct'] },
  { value: 'glp1', label: 'GLP-1', icon: 'chart-line-down', classes: ['glp1'] }
];
var TL_LIB_OTHER = { value: 'other', label: 'Other', icon: 'flask' };
/* GLP-1 drugs filed elsewhere in the encyclopedia still belong under GLP-1. */
var TL_LIB_GLP1 = /semaglutide|tirzepatide|retatrutide|liraglutide|cagrilintide|survodutide|mazdutide|orforglipron|dulaglutide|exenatide/i;

var tlLibState = { q: '', group: 'all' };

/* Every compound, once, with its class id. */
function tlLibDrugs() {
  if (typeof DB === 'undefined' || !DB || !DB.classes) return [];
  var out = [], seen = {};
  DB.classes.forEach(function (cl) {
    (cl.drugs || []).forEach(function (dr) {
      if (seen[dr.id]) return;
      seen[dr.id] = true;
      out.push({ drug: dr, cls: cl.id, clsName: cl.name });
    });
  });
  return out;
}

function tlLibGroup(entry) {
  if (TL_LIB_GLP1.test(entry.drug.name || '')) return TL_LIB_GROUPS[5];
  for (var i = 0; i < TL_LIB_GROUPS.length; i++) if (TL_LIB_GROUPS[i].classes.indexOf(entry.cls) >= 0) return TL_LIB_GROUPS[i];
  return TL_LIB_OTHER;
}

/* The regulatory text, whichever field this entry keeps it in. */
function tlLibRegText(dr) {
  return dr.approval || dr.approvalStatus || dr.reg || dr.legal || dr.status || '';
}

/* One status, shown once: Rx, Research or Supplement. It follows the old
   badge's reading of the regulatory text (getApprovalBadge), which knows
   "not FDA approved" from "FDA approved". */
function tlLibStatus(dr) {
  var text = tlLibRegText(dr), cls = 'research';
  if (typeof getApprovalBadge === 'function') {
    var m = /enc-badge (\w+)/.exec(getApprovalBadge(text) || '');
    if (m) cls = m[1];
  } else if (/\bprescription\b|\bfda[- ]approved\b/i.test(text) && !/\bnot\b/i.test(text)) cls = 'rx';
  if (dr.rx === true) cls = 'rx';
  if (cls === 'fda' || cls === 'rx') return { tag: 'Rx', long: 'Prescription', tone: 'neutral' };
  if (cls === 'otc') return { tag: 'Supplement', long: 'Supplement', tone: 'neutral' };
  return { tag: 'Research', long: 'Research only', tone: 'outline' };
}

/* Half-life in hours, from the PK table or the entry itself, as "6 d" or
   "4 h". */
function tlLibHalfLife(dr) {
  var pk = typeof TL_PK !== 'undefined' ? TL_PK[dr.id] : null;
  var h = (pk && pk.hl) || (typeof dr.hl === 'number' ? dr.hl : null);
  if (!(h > 0)) return null;
  var r = function (x) { return x < 10 ? Math.round(x * 10) / 10 : Math.round(x); };
  return h >= 48 ? r(h / 24) + ' d' : r(h) + ' h';
}

function tlLibRoute(dr) {
  var pk = typeof TL_PK !== 'undefined' ? TL_PK[dr.id] : null;
  var r = pk && typeof tlRouteForMedium === 'function' ? tlRouteForMedium(pk.medium) : null;
  return { im: 'IM / SubQ', sq: 'SubQ', oral: 'Oral', topical: 'Topical' }[r] || null;
}

/* Compound ids on the user's protocol. */
function tlLibInStack() {
  var ids = {};
  try {
    var p = tlProtocol(gd(), tlEnv());
    (p.compounds || []).forEach(function (c) { if (c.drugId) ids[c.drugId] = true; });
  } catch (e) {}
  return ids;
}

function tlLibMatches(entry, q, group) {
  if (group !== 'all' && tlLibGroup(entry).value !== group) return false;
  if (!q) return true;
  var dr = entry.drug, hay = [dr.name, dr.aka, entry.clsName, dr.cls].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) >= 0; });
}

/* The class a row and a page name: the design's label where it is exact,
   otherwise the encyclopedia's own (progesterone is filed with the
   androgens, nandrolone with them under Testosterone's chip). */
function tlLibClassLabel(entry) {
  var g = tlLibGroup(entry);
  if (g.value === 'other' || (g.value === 'testosterone' && !/testosteron/i.test(entry.drug.name || ''))) return entry.clsName;
  return g.label;
}

function tlLibRows(drugs, stack) {
  var q = tlLibState.q.trim(), group = tlLibState.group;
  var list = drugs.filter(function (e) { return tlLibMatches(e, q, group); });
  if (!list.length) return '<p class="tl-lib-empty">Nothing matches. Try another name or class.</p>';
  return '<div class="ds-list tl-lib-list">' + list.map(function (e) {
    var dr = e.drug, g = tlLibGroup(e), st = tlLibStatus(dr), hl = tlLibHalfLife(dr);
    var sub = [tlLibClassLabel(e), hl ? 't½ ' + hl : '', stack[dr.id] ? 'in your stack' : '']
      .filter(Boolean).join(' · ');
    return tlRow({ as: 'button', hex: { icon: g.icon }, title: dr.name, sub: sub, tall: true, caret: true,
      trail: '<span class="ds-tag ds-tag-' + st.tone + '">' + tlEsc(st.tag) + '</span>',
      attrs: 'data-lib-open="' + tlEsc(dr.id) + '"' });
  }).join('') + '</div>';
}

function tlLibraryScreen(el) {
  var drugs = tlLibDrugs(), stack = tlLibInStack();
  var chips = [{ value: 'all', label: 'All' }].concat(TL_LIB_GROUPS.map(function (g) { return { value: g.value, label: g.label }; }))
    .concat([{ value: 'other', label: 'Other' }]);
  el.innerHTML = '<div class="ds-screen tl-lib ds-under-tabbar">' +
    '<div class="ds-search">' + tlIcon('magnifying-glass') +
    '<input class="ds-input" type="search" id="tl-lib-q" aria-label="Search compounds" placeholder="Search ' + drugs.length + ' compounds" value="' + tlEsc(tlLibState.q) + '"></div>' +
    '<div class="tl-lib-chips">' + tlChips('Compound class', chips, tlLibState.group, true) + '</div>' +
    '<div id="tl-lib-rows">' + tlLibRows(drugs, stack) + '</div>' +
    tlFootnote('Reference only, not medical advice. Your physician decides what you take and how much.') +
    '</div>';
  var root = el.firstChild;
  var rows = root.querySelector('#tl-lib-rows');
  var redraw = function () { rows.innerHTML = tlLibRows(drugs, stack); };
  root.querySelector('#tl-lib-q').addEventListener('input', function (e) { tlLibState.q = e.target.value; redraw(); });
  root.addEventListener('ds-change', function (e) {
    if (!e.detail || !e.target.closest('.tl-lib-chips')) return;
    tlLibState.group = e.detail.checked === false ? 'all' : e.detail.value;
    redraw();
  });
  root.addEventListener('click', function (e) {
    var open = e.target.closest ? e.target.closest('[data-lib-open]') : null;
    if (open) tlGo('library/compound/' + open.getAttribute('data-lib-open'));
  });
}

/* ---- one compound ------------------------------------------------------- */

function tlLibFind(id) {
  var all = tlLibDrugs();
  for (var i = 0; i < all.length; i++) if (all[i].drug.id === id) return all[i];
  return null;
}

function tlLibList(items) {
  return '<ul class="tl-lib-bullets">' + items.map(function (x) { return '<li>' + tlEsc(x) + '</li>'; }).join('') + '</ul>';
}

function tlCompoundScreen(el) {
  var entry = tlLibFind(tlRouteArg);
  var back = '<div class="ds-header tl-top-row"><button type="button" class="ds-btn ds-btn-ghost tl-back" data-tl-go="library/compounds">' +
    tlIcon('caret-left') + '<span>Library</span></button></div>';
  if (!entry) {
    el.innerHTML = '<div class="ds-screen tl-lib-page">' + back + '<p class="tl-lib-empty">That compound is not in the Library.</p></div>';
    return;
  }
  var dr = entry.drug, g = tlLibGroup(entry), st = tlLibStatus(dr), hl = tlLibHalfLife(dr), route = tlLibRoute(dr);
  var reg = tlLibRegText(dr), mon = dr.mon || dr.monitoring || '';
  var cons = (dr.cons || []).concat(Array.isArray(dr.sideEffects) ? dr.sideEffects : []);
  var stat = function (label, value) {
    return '<div class="tl-lib-stat"><span class="ds-label">' + tlEsc(label) + '</span><span class="tl-lib-stat-v">' + tlEsc(value || '—') + '</span></div>';
  };
  var html = '<div class="ds-screen tl-lib-page">' + back +
    '<div class="tl-lib-tags"><span class="ds-tag ds-tag-accent">' + tlEsc(tlLibClassLabel(entry)) + '</span>' +
    '<span class="ds-tag ds-tag-' + st.tone + '">' + tlEsc(st.long) + '</span></div>' +
    '<h1 class="tl-lib-name">' + tlEsc(dr.name) + '</h1>' +
    (dr.aka ? '<p class="tl-lib-aka">Also known as ' + tlEsc(dr.aka) + '</p>' : '') +
    '<div class="tl-lib-grid">' + stat('Half-life', hl) + stat('Route', route) + stat('Status', st.tag) + '</div>' +
    (dr.summary ? '<div class="ds-label tl-lib-h">Summary</div><p class="tl-lib-body">' + tlEsc(dr.summary) + '</p>' : '') +
    (reg ? '<div class="tl-lib-callout">' + tlIcon('scales') + '<div><div class="tl-lib-callout-t">Regulatory status · Aug 2026</div>' +
      '<p>' + tlEsc(reg) + '</p></div></div>' : '') +
    (dr.pros && dr.pros.length ? '<div class="ds-label tl-lib-h">What the research reports</div>' + tlLibList(dr.pros) : '') +
    (cons.length ? '<div class="ds-label tl-lib-h">Risks and side effects</div>' + tlLibList(cons) : '') +
    (dr.doses && dr.doses.length ? '<div class="ds-label tl-lib-h">Protocols reported in the literature</div>' +
      '<div class="ds-list tl-lib-doses">' + dr.doses.map(function (x) {
        return '<div class="ds-row ds-row-tall"><span class="ds-row-main"><span class="ds-row-title">' + tlEsc(x.l || '') + '</span>' +
          '<span class="ds-row-sub">' + tlEsc([x.d, x.f, x.c].filter(Boolean).join(' · ')) + '</span></span></div>';
      }).join('') + '</div>' +
      tlFootnote('What studies and clinics report, not a dose for you. Your physician decides what you take and how much.') : '') +
    (mon ? '<div class="ds-label tl-lib-h">Monitoring</div><p class="tl-lib-body">' + tlEsc(mon) + '</p>' : '') +
    '<div class="ds-list tl-lib-links">' +
    tlRow({ as: 'button', icon: 'shield-check', title: 'Check against my stack', sub: 'The interaction checker', caret: true, attrs: 'data-tl-go="library/interactions"' }) +
    '<div class="ds-hr"></div>' +
    tlRow({ as: 'a', icon: 'books', title: 'Sources and methodology', sub: 'Where this comes from', caret: true, attrs: 'href="/sources/" target="_blank" rel="noopener"' }) +
    '</div>' +
    tlFootnote('Reference only, not medical advice. Your physician decides what you take and how much.') +
    '</div>';
  el.innerHTML = html;
}
