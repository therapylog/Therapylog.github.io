/* Shared components for the redesigned screens: markup builders and the few
 * behaviours every screen needs. The styles are src/ui/components.css.
 *
 * Builders return HTML strings, because the app renders with innerHTML
 * throughout and a new screen has to sit beside the old ones. Every piece of
 * text that reaches a builder is escaped by it; nothing here trusts its input.
 *
 * Behaviours are attached once, to the document, so markup rendered at any
 * time works without wiring:
 *
 *   .ds-toggle            flips aria-checked on click
 *   .ds-seg [role=tab]    selects one option, arrow keys move between them
 *   .ds-chip[aria-pressed] flips aria-pressed on click (unless data-ds-radio)
 *
 * Each fires a "ds-change" event that bubbles, with detail { value, checked },
 * so a screen listens on its own root.
 */

/* ---- text -------------------------------------------------------------- */

function tlEsc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* A Phosphor icon. `fill` uses the filled weight. Decorative unless given a
   label. */
function tlIcon(name, fill, label) {
  var cls = (fill ? 'ph-fill' : 'ph') + ' ph-' + String(name).replace(/[^a-z0-9-]/g, '');
  return label
    ? '<i class="' + cls + '" role="img" aria-label="' + tlEsc(label) + '"></i>'
    : '<i class="' + cls + '" aria-hidden="true"></i>';
}

/* ---- the hexagon ------------------------------------------------------- */

var TL_HEX_POINTS = '20,1.5 38,12 38,32 20,42.5 2,32 2,12';

/* The logo's hexagon around an icon.
   opts: tone 'accent' | 'neutral' | 'danger' | 'warn', size 'lg', fill
   (filled icon), cls (extra classes), label (makes it an image). */
function tlHex(icon, opts) {
  opts = opts || {};
  var cls = 'ds-hex';
  if (opts.tone && opts.tone !== 'accent') cls += ' ds-hex-' + opts.tone;
  if (opts.size === 'lg') cls += ' ds-hex-lg';
  if (opts.cls) cls += ' ' + opts.cls;
  var a11y = opts.label ? ' role="img" aria-label="' + tlEsc(opts.label) + '"' : ' aria-hidden="true"';
  return '<span class="' + cls + '"' + a11y + '>' +
    '<svg viewBox="0 0 40 44" focusable="false" aria-hidden="true"><polygon points="' + TL_HEX_POINTS + '"/></svg>' +
    (icon ? tlIcon(icon, !!opts.fill) : '') + '</span>';
}

/* ---- controls ---------------------------------------------------------- */

/* A switch. `label` names it for a screen reader when no visible text does. */
function tlToggle(id, on, label, disabled) {
  return '<button type="button" class="ds-toggle" role="switch"' +
    (id ? ' id="' + tlEsc(id) + '"' : '') +
    ' aria-checked="' + (on ? 'true' : 'false') + '"' +
    (label ? ' aria-label="' + tlEsc(label) + '"' : '') +
    (disabled ? ' disabled' : '') + '></button>';
}

/* A segmented control. options: [{ value, label }]. As tabs (the default) it
   switches between views; with radio: true it is a choice, like Dark | Light. */
function tlSegmented(name, options, selected, radio) {
  var role = radio ? 'radio' : 'tab', state = radio ? 'aria-checked' : 'aria-selected';
  return '<div class="ds-seg" role="' + (radio ? 'radiogroup' : 'tablist') + '" aria-label="' + tlEsc(name) + '" data-ds-seg="' + tlEsc(name) + '">' +
    (options || []).map(function (o) {
      var on = o.value === selected;
      return '<button type="button" class="ds-seg-opt" role="' + role + '" ' + state + '="' + on + '"' +
        ' tabindex="' + (on ? '0' : '-1') + '" data-value="' + tlEsc(o.value) + '">' + tlEsc(o.label) + '</button>';
    }).join('') + '</div>';
}

/* Filter chips. options: [{ value, label }]. One can be on at a time when
   `single`, as with a class filter; otherwise each toggles. */
function tlChips(name, options, selected, single) {
  var sel = Array.isArray(selected) ? selected : [selected];
  return '<div class="ds-chips" role="group" aria-label="' + tlEsc(name) + '"' + (single ? ' data-ds-radio' : '') + '>' +
    (options || []).map(function (o) {
      return '<button type="button" class="ds-chip" aria-pressed="' + (sel.indexOf(o.value) >= 0) + '" data-value="' + tlEsc(o.value) + '">' +
        '<span>' + tlEsc(o.label) + '</span></button>';
    }).join('') + '</div>';
}

/* A list row. opts: icon (Phosphor name) or hex (tlHex options with .icon),
   title, sub, trail (HTML for the right side), caret (bool), tall, danger,
   as 'button' | 'div' (default div), attrs (raw attribute string, for
   onclick or data-), label (aria-label when the row is a button). */
function tlRow(opts) {
  opts = opts || {};
  var tag = opts.as === 'button' ? 'button' : opts.as === 'a' ? 'a' : 'div';
  var cls = 'ds-row' + (opts.tall ? ' ds-row-tall' : '') + (opts.danger ? ' ds-row-danger' : '');
  var lead = opts.hex ? tlHex(opts.hex.icon, opts.hex)
    : opts.icon ? '<span class="ds-row-icon">' + tlIcon(opts.icon) + '</span>' : '';
  return '<' + tag + ' class="' + cls + '"' + (tag === 'button' ? ' type="button"' : '') +
    (opts.label ? ' aria-label="' + tlEsc(opts.label) + '"' : '') + (opts.attrs ? ' ' + opts.attrs : '') + '>' +
    lead +
    '<span class="ds-row-main"><span class="ds-row-title">' + tlEsc(opts.title) + '</span>' +
    (opts.sub ? '<span class="ds-row-sub">' + tlEsc(opts.sub) + '</span>' : '') + '</span>' +
    (opts.trail || opts.caret ? '<span class="ds-row-trail">' + (opts.trail || '') +
      (opts.caret ? '<i class="ph ph-caret-right ds-caret" aria-hidden="true"></i>' : '') + '</span>' : '') +
    '</' + tag + '>';
}

/* The compliance footnote. Keep every one the design has. */
function tlFootnote(text) {
  return '<p class="ds-foot">' + tlIcon('stethoscope') + '<span>' + tlEsc(text) + '</span></p>';
}

/* A big numeral with its unit: "48" and "%". */
function tlBig(value, unit) {
  return '<span class="ds-big">' + tlEsc(value) + '</span>' + (unit ? '<span class="ds-big-unit">' + tlEsc(unit) + '</span>' : '');
}

/* The top of a tab: its title and the profile button. */
function tlHeader(title, initial) {
  return '<header class="ds-header"><h1 class="ds-h1">' + tlEsc(title) + '</h1>' +
    '<button type="button" class="ds-avatar" aria-label="Profile and settings" data-ds-action="profile">' +
    tlEsc(String(initial || '').trim().charAt(0).toUpperCase() || '?') + '</button></header>';
}

/* ---- the tab bar ------------------------------------------------------- */

var TL_TABS = [
  { key: 'today', label: 'Today', icon: 'house-simple' },
  { key: 'protocol', label: 'Protocol', icon: 'stack' },
  { key: 'log', label: 'Log', icon: 'plus' },
  { key: 'health', label: 'Health', icon: 'heartbeat' },
  { key: 'library', label: 'Library', icon: 'books' }
];

/* The bar, with `active` marked. The centre Log button opens the log sheet;
   it is never the current page. `inline` draws it in place rather than fixed
   to the bottom of the screen, for the components page. */
function tlTabBar(active, inline) {
  return '<nav class="ds-tabbar ds-ui' + (inline ? ' ds-tabbar-inline' : '') + '" aria-label="Main">' + TL_TABS.map(function (t) {
    if (t.key === 'log') {
      return '<button type="button" class="ds-tab ds-tab-log" data-ds-tab="log">' +
        tlHex('plus') + '<span class="ds-tab-label">' + t.label + '</span></button>';
    }
    var on = t.key === active;
    return '<button type="button" class="ds-tab" data-ds-tab="' + t.key + '"' + (on ? ' aria-current="page"' : '') + '>' +
      tlIcon(t.icon, on) + '<span class="ds-tab-label">' + t.label + '</span></button>';
  }).join('') + '</nav>';
}

/* ---- the bottom sheet -------------------------------------------------- */

/* Open a sheet holding `html`. Returns { el, close }. Escape and a tap on the
   scrim close it; focus moves into it, stays there, and goes back where it
   was. `onClose` runs once, however it closed. */
function tlOpenSheet(html, opts) {
  opts = opts || {};
  var before = document.activeElement;
  var scrim = document.createElement('div');
  scrim.className = 'ds-scrim ds-ui' + (opts.cls ? ' ' + opts.cls : '');
  scrim.innerHTML = '<div class="ds-sheet" role="dialog" aria-modal="true"' +
    (opts.label ? ' aria-label="' + tlEsc(opts.label) + '"' : '') + '><div class="ds-grabber" aria-hidden="true"></div>' + html + '</div>';
  var sheet = scrim.firstChild, closed = false;

  function focusables() {
    return Array.prototype.filter.call(
      sheet.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && n.offsetParent !== null; });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) { e.preventDefault(); return; }
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
    if (before && typeof before.focus === 'function') { try { before.focus(); } catch (e) {} }
    if (opts.onClose) opts.onClose();
  }
  scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(scrim);
  var first = opts.focus ? sheet.querySelector(opts.focus) : focusables()[0];
  if (first) first.focus(); else { sheet.setAttribute('tabindex', '-1'); sheet.focus(); }
  return { el: sheet, close: close };
}

/* ---- behaviours, attached once ---------------------------------------- */

function tlDsChange(el, value, checked) {
  var ev;
  try { ev = new CustomEvent('ds-change', { bubbles: true, detail: { value: value, checked: checked } }); }
  catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('ds-change', true, false, { value: value, checked: checked }); }
  el.dispatchEvent(ev);
}

function tlSegSelect(opt) {
  var seg = opt.parentNode, state = opt.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-selected';
  Array.prototype.forEach.call(seg.querySelectorAll('.ds-seg-opt'), function (o) {
    var on = o === opt;
    o.setAttribute(state, on ? 'true' : 'false');
    o.setAttribute('tabindex', on ? '0' : '-1');
  });
  tlDsChange(seg, opt.getAttribute('data-value'), true);
}

function tlDsAttach() {
  if (typeof document === 'undefined' || document.documentElement.hasAttribute('data-ds-ready')) return;
  document.documentElement.setAttribute('data-ds-ready', '');
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var tog = t.closest('.ds-toggle');
    if (tog && !tog.disabled) {
      var on = tog.getAttribute('aria-checked') !== 'true';
      tog.setAttribute('aria-checked', on ? 'true' : 'false');
      tlDsChange(tog, tog.id || null, on);
      return;
    }
    var opt = t.closest('.ds-seg-opt');
    if (opt) { tlSegSelect(opt); return; }
    var chip = t.closest('.ds-chip');
    if (chip && chip.hasAttribute('aria-pressed')) {
      var group = chip.parentNode;
      if (group && group.hasAttribute('data-ds-radio')) {
        Array.prototype.forEach.call(group.querySelectorAll('.ds-chip'), function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        tlDsChange(group, chip.getAttribute('data-value'), true);
      } else {
        var pressed = chip.getAttribute('aria-pressed') !== 'true';
        chip.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        tlDsChange(chip, chip.getAttribute('data-value'), pressed);
      }
    }
  });
  /* Arrow keys move between the options of a segmented control, as in any
     tab list or radio group. */
  document.addEventListener('keydown', function (e) {
    var opt = e.target && e.target.closest ? e.target.closest('.ds-seg-opt') : null;
    if (!opt || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
    var all = Array.prototype.slice.call(opt.parentNode.querySelectorAll('.ds-seg-opt'));
    var i = all.indexOf(opt);
    var next = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1
      : (i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
    e.preventDefault();
    all[next].focus();
    tlSegSelect(all[next]);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tlDsAttach);
  else tlDsAttach();
}
