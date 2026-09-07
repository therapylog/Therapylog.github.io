/* The interactive parts of the tool pages.
 *
 * Nothing here re-implements a calculation. Each widget is the app's own markup
 * with the app's own functions inlined verbatim, so a page cannot disagree with
 * the app about a number. The comment above tlReconSolve in app.html says why
 * that matters: "a wrong number here ends up in a syringe."
 *
 * What this file does do is the surgery that makes app markup work outside the
 * app: drop the fields that only mean something when logging, replace the
 * app-only buttons with the page's CTA, and provide the handful of globals a
 * lifted function reaches for. */

const A = require('../lib/app-source.js');

/* ---- markup surgery ----------------------------------------------------- */

/* Find the element that starts at `openIdx` and return [start, end) covering it,
   counting nested <div> opens and closes. The fragments are div-only, which is
   what makes this safe. */
function divExtent(html, openIdx) {
  let i = openIdx, depth = 0;
  while (i < html.length) {
    if (html.startsWith('<div', i)) { depth++; i = html.indexOf('>', i) + 1; continue; }
    if (html.startsWith('</div>', i)) { depth--; i += 6; if (!depth) return [openIdx, i]; continue; }
    i++;
  }
  throw new Error('unbalanced <div> from offset ' + openIdx);
}

/* Remove the whole <div class="ig"> group that contains the given id. */
function dropField(html, id) {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) throw new Error(`field ${id} not found in the lifted fragment`);
  const open = html.lastIndexOf('<div class="ig"', at);
  if (open < 0) throw new Error(`field ${id} is not inside a .ig group`);
  const [s, e] = divExtent(html, open);
  if (e < at) throw new Error(`field ${id} is not inside the .ig group found for it`);
  return html.slice(0, s) + html.slice(e);
}

/* Swap the contents of the element carrying `id`, keeping the element itself so
   any lifted code that toggles its display still finds it. */
function replaceInner(html, id, inner) {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) throw new Error(`element ${id} not found in the lifted fragment`);
  const open = html.lastIndexOf('<div', at);
  const [s, e] = divExtent(html, open);
  const tagEnd = html.indexOf('>', s) + 1;
  return html.slice(0, tagEnd) + inner + '</div>' + html.slice(e);
}

/* The #tool-calc fragment: from its own <div to the one that opens
   #tool-interact. Both ids are stable anchors in app.html's body markup. */
function reconFragment(src) {
  const a = src.indexOf('id="tool-calc"');
  const b = src.indexOf('id="tool-interact"');
  if (a < 0 || b < 0) throw new Error('app.html no longer has #tool-calc and #tool-interact');
  return src.slice(src.lastIndexOf('<div', a), src.lastIndexOf('<div', b));
}

/* The syringe builder's container markup exists only as a template literal
   inside tlFeaturesInit, interpolating SYR_SIZES. Lifting the literal and
   rendering it with the real SYR_SIZES beats transcribing it: the size options
   stay whatever the app offers. */
function syringeFragment(src, syrSizes) {
  const tpl = A.templateLiteral(src, "syr.id = 'tool-syringe'");
  if (!/id="syr-rows"/.test(tpl) || !/id="syr-result"/.test(tpl)) {
    throw new Error('the lifted syringe-builder template no longer contains #syr-rows and #syr-result');
  }
  /* The literal's only substitution is over SYR_SIZES. Rendering it in a bare
     Function with just that in scope means any other reference would throw here
     rather than ship a page with a hole in it. */
  return new Function('SYR_SIZES', 'return `' + tpl + '`;')(syrSizes).trim();
}

const GATE_SCRIPT = String.raw`/* ---- the one-free-run gate -----------------------------------------------
   Every tool page arrives with its worked example already computed. That stays
   free and unconditional: it is what proves the tool works, it is what the
   page ranks on, and a crawler never gets past it because a crawler never
   touches a control.

   What is metered is the visitor running the tool on THEIR numbers. The first
   recalculation is free. The second raises the wall.

   Deliberately a soft gate. It is a conversion prompt, not DRM — clearing site
   data resets it and that is fine. What it must not do is lie: it disables the
   controls rather than hiding a result that was already computed, so nothing is
   sitting in the DOM pretending to be locked.

   Tool pages are same-origin with /app, so a subscriber's entitlement is
   readable here and paying users never meet the gate at all. */
(function () {
  var FREE_RUNS = 1;
  var KEY = 'tl_gate:' + location.pathname;

  function subscribed() {
    try {
      var e = JSON.parse(localStorage.getItem('tl_ent') || 'null');
      if (!e || !e.tier || e.tier === 'free') return false;
      /* An expired plan is not a plan. Mirrors tlEffectiveTier()'s check. */
      if (e.expires && Date.now() > e.expires * 1000) return false;
      return true;
    } catch (_) { return false; }
  }
  function runs() { try { return parseInt(localStorage.getItem(KEY) || '0', 10) || 0; } catch (_) { return 0; } }
  function bump() { try { localStorage.setItem(KEY, String(runs() + 1)); } catch (_) {} }

  function controls() {
    return [].slice.call(document.querySelectorAll('.card input, .card select, .card button'))
      .filter(function (el) { return !el.closest('.cta-box'); });
  }

  function wall() {
    if (document.getElementById('tl-gate')) return;
    controls().forEach(function (el) {
      el.disabled = true;
      el.style.opacity = '0.45';
      el.style.cursor = 'not-allowed';
    });
    var host = document.querySelector('.card');
    if (!host) return;
    var d = document.createElement('div');
    d.id = 'tl-gate';
    d.style.cssText = 'margin-top:14px;padding:16px 18px;border-radius:12px;' +
      'background:var(--surface2);border:1px solid var(--border2);' +
      'border-left:3px solid var(--accent)';
    d.innerHTML =
      '<div style="font-size:14.5px;font-weight:600;margin-bottom:6px">That is the free run</div>' +
      '<div style="font-size:13.5px;color:var(--text2);line-height:1.6;margin-bottom:12px">' +
      'The worked example above stays on the page, and the arithmetic is the same the app runs. ' +
      'Running it on your own numbers whenever you like is part of TherapyLog — along with the ' +
      'dose log it saves into, bloodwork trends across every panel, a clinical report your ' +
      'physician can actually read, steady-state modelling, and the full dosing and stacking ' +
      'detail on 131 compounds.</div>' +
      '<a class="btn btn-p" href="/pro?utm_source=tools&amp;utm_medium=web&amp;utm_campaign=gate" ' +
      'style="text-decoration:none;display:block;text-align:center;line-height:1.4">See what Pro includes</a>' +
      '<div style="font-size:12px;color:var(--text3);margin-top:9px;text-align:center">' +
      'Already subscribed? <a href="/app" style="color:var(--text2)">Open the app</a> and this page unlocks.</div>';
    host.parentNode.insertBefore(d, host.nextSibling);
  }

  function arm() {
    if (subscribed()) return;
    if (runs() > FREE_RUNS) { wall(); return; }
    var counted = false;
    /* One interaction burst counts as one run: someone adjusting three fields
       for a single calculation has run the tool once, not three times. */
    function onUse() {
      if (counted) return;
      counted = true;
      bump();
      if (runs() > FREE_RUNS) setTimeout(wall, 400);
    }
    ['change', 'click'].forEach(function (evt) {
      document.addEventListener(evt, function (e) {
        var el = e.target;
        if (!el || !el.closest) return;
        if (!el.closest('.card')) return;
        if (el.closest('.cta-box')) return;
        if (!/^(INPUT|SELECT|BUTTON)$/.test(el.tagName)) return;
        onUse();
      }, true);
    });
  }

  /* Arm after the page's own pre-fill has run, so the worked example never
     counts against the visitor. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(arm, 0); });
  } else { setTimeout(arm, 0); }
})();`;

/* ---- the shared script prologue ----------------------------------------- */

/* Globals the lifted functions reach for, and nothing more. gd(), showPage(),
   showLogTab() and showCycleTab() are not stubbed because no lifted function
   calls them — adding unused stubs would only invite someone to lift a function
   that needs one and not notice. */
function prologue(o) {
  const parts = [];
  o = o || {};
  parts.push(`/* ---------------------------------------------------------------------------
   Everything between here and the end of this script is either lifted verbatim
   from app.html at build time (scripts/build-pages.js) or a small shim that
   lets the lifted code run outside the app. Do not edit this file: edit the
   app, or the generator, and regenerate. scripts/validate-public-pages.js
   fails the build if any lifted function stops matching app.html.
   --------------------------------------------------------------------------- */`);
  parts.push(o.attribution);
  parts.push(`
/* Shim: the app's toast(). Same job, no dependency on the app's chrome. */
function toast(msg) {
  var n = document.getElementById('tl-toast');
  if (!n) {
    n = document.createElement('div');
    n.id = 'tl-toast';
    n.setAttribute('role', 'status');
    n.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
      'background:var(--surface3);color:var(--text);border:1px solid var(--border2);' +
      'border-radius:11px;padding:10px 16px;font-size:13px;z-index:99;opacity:0;' +
      'transition:opacity .2s ease;pointer-events:none;max-width:88vw;text-align:center';
    document.body.appendChild(n);
  }
  n.textContent = msg;
  n.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { n.style.opacity = '0'; }, 2600);
}

/* An affiliate can link to a tool page, so forward ?ref= to the app and to /pro
   where the "Referred by" banner reads it. Never synthesises a ref. */
(function () {
  try {
    var ref = new URLSearchParams(location.search).get('ref');
    if (!ref) return;
    ref = ref.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
    if (!ref) return;
    try { localStorage.setItem('tl_ref', ref); } catch (e) {}
    document.querySelectorAll('a[href^="/app"], a[href^="/pro"]').forEach(function (a) {
      a.href += (a.href.indexOf('?') < 0 ? '?' : '&') + 'ref=' + encodeURIComponent(ref);
    });
  } catch (e) {}
})();`);
  /* The one-free-run gate ships only on pages with a calculator to meter.
     Reference pages carry controls too — the marker pages have a unit
     converter — and metering those would gate browsing, not a paid tool. */
  if (o.gate) parts.push(GATE_SCRIPT);

  return parts.join('\n');
}

/* ---- widget bundles ----------------------------------------------------- */

const RECON_FNS = ['ucPreset', 'tlReconSolve', 'tlReconOptions', 'tlReconToggle',
                   'tlReconPick', 'tlReconRender', 'calcUnified', 'renderSyringe'];
const SYRINGE_FNS = ['syrAddRow', 'syrRemoveRow', 'syrField', 'syrSetSize', 'syrMediumOf',
                     'syrFragile', 'renderSyringeBuilder', 'syrRecalc'];
const PK_FNS = ['pkCurve', 'pkParseDose'];
const IX_FNS = ['checkInteractions'];

const lift = (src, names) => names.map((n) => A.fnSource(src, n)).join('\n\n');

/* The reconstitution widget, with presets optionally replaced for a
   compound-specific page. */
function reconWidget(src, o) {
  let html = reconFragment(src);
  html = dropField(html, 'uc-name');
  html = replaceInner(html, 'uc-cta', o.ctaInner || '');
  if (o.title) {
    html = html.replace('<div class="card-title">Peptide Dose Calculator</div>',
                        `<div class="card-title">${o.title}</div>`);
  }
  if (o.presets) {
    const before = html.match(/<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">[\s\S]*?<\/div>/);
    if (!before) throw new Error('the preset row in #tool-calc has moved');
    const btns = o.presets.map((p) =>
      `<button class="preset-btn" onclick="ucPreset(${p[0]},${p[1]})">${p[0]}mg / ${p[1]}ml</button>`).join('');
    html = html.replace(before[0],
      `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${btns}</div>`);
  }
  return { html: `    <div class="widget">\n${html}\n    </div>`, fns: lift(src, RECON_FNS) };
}

/* The combined-draw planner. syrInjectables() is the substitute the plan names:
   the app's version reads the live compound list, this one is a static array
   built at build time with Tier C removed, so the lifted syr* code runs
   unchanged. syrLog() is the app's "log this injection" button — on a public
   page that is exactly the CTA, so it sends the reader to the app. */
function syringeWidget(src, o) {
  const html = syringeFragment(src, o.syrSizes);
  const data = [
    `var SYR = { rows: [], size: 1 };`,
    `var PK_COLORS = ${JSON.stringify(o.pkColors)};`,
    `var TL_SYR_INJECTABLES = ${JSON.stringify(o.injectables)};`,
    `function syrInjectables() { return TL_SYR_INJECTABLES; }`,
    `function syrLog() {`,
    `  location.href = '/app?utm_source=tools&utm_medium=web&utm_campaign=${o.slug}'`,
    `    + (localStorage.getItem('tl_ref') ? '&ref=' + encodeURIComponent(localStorage.getItem('tl_ref')) : '');`,
    `}`
  ].join('\n');
  return {
    html: `    <div class="widget">\n${html}\n    </div>`,
    fns: data + '\n\n' + lift(src, SYRINGE_FNS),
    init: 'renderSyringeBuilder();'
  };
}

/* The combination checker. The lifted checkInteractions() reads one merged
   INTERACTIONS array; the generator merges the app's three and drops every pair
   that names a Tier C compound before inlining. */
function interactionWidget(src, o) {
  const opts = o.compounds.map((n) => `<option>${n}</option>`).join('');
  const html = `    <div class="widget">
      <div class="card">
        <div class="card-title">Can you take these together?</div>
        <div class="ig"><label class="il" for="ix-d1">Compound 1</label>
          <select id="ix-d1" onchange="checkInteractions()"><option value="">Select a compound&hellip;</option>${opts}</select></div>
        <div class="ig"><label class="il" for="ix-d2">Compound 2</label>
          <select id="ix-d2" onchange="checkInteractions()"><option value="">Select a compound&hellip;</option>${opts}</select></div>
        <div class="ig"><label class="il" for="ix-d3">Compound 3 <span style="font-weight:400;color:var(--text3)">(optional)</span></label>
          <select id="ix-d3" onchange="checkInteractions()"><option value="">Select a compound&hellip;</option>${opts}</select></div>
        <div id="ix-result"></div>
      </div>
    </div>`;
  return {
    html,
    fns: `var INTERACTIONS = ${JSON.stringify(o.pairs)};\n\n` + lift(src, IX_FNS)
  };
}

module.exports = {
  divExtent, dropField, replaceInner, reconFragment, syringeFragment, prologue,
  reconWidget, syringeWidget, interactionWidget, lift,
  RECON_FNS, SYRINGE_FNS, PK_FNS, IX_FNS
};
