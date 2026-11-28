/* The hidden components page.
 *
 * Every shared component, in both themes side by side, built with the same
 * builders and styles the screens use. It is how the design foundation is
 * checked by eye against the handoff, and what scripts/ui-check-kit.js runs
 * its checks on. No menu leads here: open app.html#ui-kit, or call
 * tlShowKit() from the console.
 */

function tlKitPane(theme) {
  var sec = function (title, body) {
    return '<section class="tl-kit-sec"><h2 class="ds-label">' + tlEsc(title) + '</h2>' + body + '</section>';
  };
  var row = function (html) { return '<div class="tl-kit-row">' + html + '</div>'; };
  return '<div class="tl-kit-pane ds-' + theme + ' ds-ui" data-theme="' + theme + '">' +
    '<div class="ds-screen">' +
    tlHeader(theme === 'dark' ? 'Dark' : 'Light', 'J') +

    sec('Type',
      '<p class="ds-h1">Heading 24</p><p class="ds-h2">Section 17</p><p class="ds-body">Body 14.5 on 1.55, for summaries and answers.</p>' +
      '<p>Base 14 on 1.45.</p><p class="ds-muted ds-small">Muted 12.5, for secondary copy.</p>' +
      '<p class="ds-tiny ds-muted">The floor: 12.</p>' +
      row('<span>' + tlBig('100', '%') + '</span><span class="ds-muted">of peak</span>') +
      row('<span>' + tlBig('128', '/82') + '</span>')) +

    sec('Buttons',
      row('<button type="button" class="ds-btn ds-btn-primary">' + tlIcon('plus') + 'Primary</button>' +
          '<button type="button" class="ds-btn ds-btn-secondary">Secondary</button>' +
          '<button type="button" class="ds-btn ds-btn-ghost">Ghost</button>') +
      row('<button type="button" class="ds-btn ds-btn-primary" disabled>Disabled</button>' +
          '<button type="button" class="ds-btn ds-btn-danger">Delete</button>' +
          '<button type="button" class="ds-btn ds-btn-warn">Clear</button>' +
          '<button type="button" class="ds-btn ds-btn-secondary ds-btn-icon" aria-label="Scan a report">' + tlIcon('scan') + '</button>') +
      '<button type="button" class="ds-btn ds-btn-primary ds-btn-block">Continue · $99.99 a year</button>' +
      '<button type="button" class="ds-btn ds-btn-secondary ds-btn-block">Customize Home</button>') +

    sec('Tags and chips',
      row('<span class="ds-tag ds-tag-accent">Peptides</span><span class="ds-tag ds-tag-neutral">Rx</span>' +
          '<span class="ds-tag ds-tag-outline">Research</span><span class="ds-tag ds-tag-warn">Stage 1 range</span>' +
          '<span class="ds-tag ds-tag-danger">Stage 2 range</span>') +
      tlChips('Class', [{ value: 'all', label: 'All' }, { value: 'pep', label: 'Peptides' }, { value: 'test', label: 'Testosterone' },
        { value: 'gh', label: 'Growth hormone' }, { value: 'anc', label: 'Ancillaries' }], 'all', true)) +

    sec('Segmented control',
      tlSegmented('Library section', [{ value: 'compounds', label: 'Compounds' }, { value: 'tools', label: 'Tools' }], 'compounds') +
      '<div style="height:10px"></div>' +
      tlSegmented('Health section', [{ value: 'bw', label: 'Bloodwork' }, { value: 'bp', label: 'BP' }, { value: 'body', label: 'Body' }, { value: 'photos', label: 'Photos' }], 'bp') +
      '<div style="height:10px"></div>' +
      tlSegmented('Appearance', [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }], theme, true)) +

    sec('Toggles',
      row(tlToggle(null, true, 'On') + tlToggle(null, false, 'Off') + tlToggle(null, true, 'Disabled', true))) +

    sec('List rows',
      '<div class="ds-list">' +
      tlRow({ as: 'button', hex: { icon: 'crown-simple' }, title: 'Upgrade to Pro', sub: 'Trends, supply, reports and the assistant', caret: true }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', hex: { icon: 'arrow-counter-clockwise', tone: 'neutral' }, title: 'Restore purchases', sub: 'Reinstalled, or bought Pro on another device?', caret: true }) +
      '<div class="ds-hr"></div>' +
      tlRow({ icon: 'calendar-check', title: 'Automatic weekly backup', trail: tlToggle(null, false, 'Automatic weekly backup') }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', tall: true, hex: { icon: 'drop' }, title: 'Testosterone cypionate', sub: 'Testosterone · t½ 6 d · in your stack',
        trail: '<span class="ds-tag ds-tag-neutral">Rx</span>', caret: true }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'trash', title: 'Delete all data', danger: true, caret: true }) +
      '</div>') +

    sec('Hexagons',
      row(tlHex('dna') + tlHex('test-tube', { tone: 'danger' }) + tlHex('warning', { tone: 'warn' }) +
          tlHex('arrow-counter-clockwise', { tone: 'neutral' }) + tlHex('trash', { tone: 'danger', size: 'lg' }) + tlHex('check-circle', { fill: true }))) +

    sec('Hero card',
      '<div class="ds-hero"><div class="ds-muted ds-small">Next vial needed</div>' +
      '<div style="margin:6px 0 4px">' + tlBig('6', ' d') + '</div>' +
      '<div class="ds-small">BPC-157 · No spare vial · reorder</div></div>' +
      '<div style="height:10px"></div><div class="ds-card">A plain card, for grouped settings.</div>') +

    sec('Fields',
      '<div class="ds-field"><label for="kit-dose-' + theme + '">Dose</label>' +
      '<input class="ds-input" id="kit-dose-' + theme + '" inputmode="decimal" value="80"></div>' +
      '<div style="height:10px"></div>' +
      '<div class="ds-search">' + tlIcon('magnifying-glass') +
      '<input class="ds-input" type="search" aria-label="Search compounds" placeholder="Search 131 compounds"></div>' +
      '<div style="height:10px"></div>' +
      '<div class="tl-kit-row"><button type="button" class="ds-askbar">' + tlIcon('sparkle', true) + '<span>Ask, or search 131 compounds</span></button>' +
      '<button type="button" class="ds-avatar" aria-label="Profile and settings">J</button></div>') +

    sec('Footnote',
      tlFootnote('Reference intervals, not a diagnosis. Review results with your physician.')) +

    sec('Sheet',
      '<button type="button" class="ds-btn ds-btn-secondary" data-kit-sheet="' + theme + '">Open a sheet</button>') +

    sec('Tab bar', tlTabBar('today', true)) +
    '</div></div>';
}

function tlShowKit() {
  var old = document.getElementById('tl-kit');
  if (old) old.parentNode.removeChild(old);
  var el = document.createElement('div');
  el.id = 'tl-kit';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Components');
  el.innerHTML =
    '<style>' +
    '#tl-kit{position:fixed;inset:0;z-index:9500;overflow-y:auto;background:#000}' +
    '#tl-kit .tl-kit-top{position:sticky;top:0;z-index:2;display:flex;justify-content:flex-end;padding:8px;background:#000}' +
    '#tl-kit .tl-kit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}' +
    '#tl-kit .tl-kit-pane{background:var(--color-bg)}' +
    '#tl-kit .tl-kit-sec{padding:14px 0;display:flex;flex-direction:column;gap:8px}' +
    '#tl-kit .tl-kit-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '</style>' +
    '<div class="tl-kit-top ds-ui ds-dark"><button type="button" class="ds-btn ds-btn-secondary" data-kit-close>' + tlIcon('x') + 'Close</button></div>' +
    '<div class="tl-kit-grid">' + tlKitPane('dark') + tlKitPane('light') + '</div>';
  el.addEventListener('click', function (e) {
    if (e.target.closest('[data-kit-close]')) {
      el.parentNode.removeChild(el);
      if (location.hash === '#ui-kit') history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    var open = e.target.closest('[data-kit-sheet]');
    if (open) {
      var s = tlOpenSheet(
        tlHex('trash', { tone: 'danger', size: 'lg' }) +
        '<h2 class="ds-h2" style="font-size:20px;margin:12px 0 8px">Delete this reading?</h2>' +
        '<p class="ds-body ds-muted" style="margin-bottom:16px">128/82, pulse 64, today at 07:12. Your averages and chart update.</p>' +
        '<button type="button" class="ds-btn ds-btn-danger ds-btn-block" data-kit-done>Delete reading</button>' +
        '<button type="button" class="ds-btn ds-btn-ghost ds-btn-block" data-kit-done>Cancel</button>',
        { label: 'Example sheet', cls: 'ds-' + open.getAttribute('data-kit-sheet'), focus: '[data-kit-done]:last-child' });
      s.el.addEventListener('click', function (ev) { if (ev.target.closest('[data-kit-done]')) s.close(); });
    }
  });
  document.body.appendChild(el);
  return el;
}

if (typeof window !== 'undefined' && window.location && window.location.hash === '#ui-kit') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { tlShowKit(); });
  else tlShowKit();
}
