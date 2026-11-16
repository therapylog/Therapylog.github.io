/* Loading the app's logic into a test.
 *
 * app.html is one file with no build step, so there is nothing to import. The
 * tests under tests/ pin what its pure logic DOES today, and they can only do
 * that honestly by running the app's own text. This helper lifts named
 * functions and tables out of app.html with scripts/lib/app-source.js (the one
 * extractor in this repo; nothing here re-implements it), evaluates them
 * together in ONE node:vm context so they call each other exactly as they do in
 * the browser, and hands that context back.
 *
 *   const { loadApp, same } = require('./helpers/app');
 *   const app = loadApp({
 *     functions: ['parseFrequency', 'parseMeds', 'calcRefillAlerts'],
 *     consts: ['DRUG_COSTS'],
 *     record: { entries: [], proto: { meds: 'HCG, 500IU, EOD' } },
 *     now: '2026-03-04T12:00'
 *   });
 *   same(app.calcRefillAlerts(), []);
 *
 * Options, all optional:
 *
 *   functions     names of `function name(` declarations to lift from app.html
 *   consts        names of top-level `const|var|let NAME = ...` declarations:
 *                 data tables ({...} or [...], any number of lines) and one-line
 *                 values such as `var TL_DAY_MS = 864e5;` or an arrow helper
 *   files         plain browser scripts (top-level declarations, no module
 *                 syntax), evaluated in the same context BEFORE anything is
 *                 lifted. Paths are relative to the repo root. This is how the
 *                 src/logic/*.js files load: once a function has moved there,
 *                 name its file here and drop it from `functions`.
 *   record        the user's record. Defines gd() and sd() over an in-memory
 *                 copy, so nothing touches localStorage or IndexedDB
 *   now           freezes the clock (see below)
 *   toast         true defines toast(), recording into app.harness.toasts
 *   document      { id: { value: '10' }, ... } defines a document whose
 *                 getElementById() knows exactly those elements
 *   localStorage  { key: 'value' } defines an in-memory localStorage
 *   stubs         { name: value } for any other global the code under test
 *                 reaches for (prompt, a render function, a replacement table)
 *
 * Nothing impure is defined unless the test asks for it. A function that calls
 * gd() in a context loaded without `record` throws "gd is not defined", which
 * is the point: the load call states which edges a function touches.
 *
 * THE CLOCK. Tests must give the same answer on any machine, in any timezone,
 * on any day, and much of this code calls `new Date()` for itself. So the
 * context's Date is a stand-in: with arguments it is the real Date; with none,
 * and for Date.now(), it returns the frozen instant. If `now` was not given it
 * throws instead, so a test cannot quietly depend on the day it runs.
 *
 * `now` as a zone-less string ('2026-03-04T12:00', '2026-03-04') is LOCAL
 * wall-clock time, read in whatever timezone the tests run under. That is
 * deliberate: "what is due today" is a question about the local calendar day,
 * and noon on 4 March is a Wednesday in Chicago, UTC and Auckland alike,
 * whereas one fixed instant is two different calendar days across those
 * zones. Pass a number (epoch ms) or a Date to freeze an absolute instant.
 * Fixture timestamps should be built from the same clock, with local() or
 * app.harness.now(), never typed in as a literal ...Z string.
 *
 * REALMS. Arrays and objects the lifted code creates belong to the vm context,
 * so assert.deepStrictEqual() rejects them against a literal written in the
 * test even when every value matches. plain() copies a result into this realm
 * and same() is deepStrictEqual over that copy. Dates need no such care: the
 * context's Date builds ordinary Dates, so a test passes `new Date(2026, 2, 4)`
 * straight in and `instanceof Date` inside the lifted code is true.
 *
 * Run:  node --test tests/
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const A = require('../../scripts/lib/app-source.js');

const HERE = 'tests/helpers/app.js';
const fail = (message) => { throw new Error(`${HERE}: ${message}`); };

let appSource = null;
const source = () => (appSource === null ? (appSource = A.readApp()) : appSource);

/* ---- the clock ----------------------------------------------------------- */

/* A zone-less 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM[:SS]' as local wall-clock time.
   Built from the parts on purpose: `new Date('2026-03-04')` is UTC midnight,
   which is still 3 March in Chicago. */
function local(text) {
  const m = String(text).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) fail(`local() wants 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM[:SS]' with no zone, got ${JSON.stringify(text)}`);
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}

function toInstant(now) {
  if (now === null || now === undefined) return null;
  if (typeof now === 'number') {
    if (!Number.isFinite(now)) fail('now is not a finite number of milliseconds');
    return now;
  }
  if (now instanceof Date) {
    if (isNaN(now)) fail('now is an Invalid Date');
    return now.getTime();
  }
  return local(now).getTime();
}

/* The context's Date. It constructs real Dates of THIS realm and shares the
   real prototype, so `x instanceof Date` holds inside the lifted code for a
   Date made on either side, and no method behaves differently. Only the two
   ways of reading the clock are replaced. */
function makeDate(clock) {
  function FrozenDate(...args) {
    if (!new.target) return new Date(clock()).toString();
    return Reflect.construct(Date, args.length ? args : [clock()]);
  }
  FrozenDate.prototype = Date.prototype;
  FrozenDate.now = () => clock();
  FrozenDate.parse = Date.parse;
  FrozenDate.UTC = Date.UTC;
  return FrozenDate;
}

/* ---- stubs for the impure edges ------------------------------------------ */

function makeElement(id, props) {
  const classes = new Set();
  const el = {
    id, value: '', textContent: '', innerHTML: '',
    style: { display: '' }, dataset: {},
    classList: {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      contains: (c) => classes.has(c)
    },
    addEventListener() {}, setAttribute() {}, appendChild() {}, focus() {}, blur() {}
  };
  const { style, ...rest } = props || {};
  Object.assign(el, rest);
  Object.assign(el.style, style || {});
  return el;
}

/* A document that knows the ids it was given and nothing else. An id the test
   did not seed is null, as it is in a browser, so a function reaching for an
   element nobody expected fails where it reaches. */
function makeDocument(seed) {
  const els = new Map();
  Object.keys(seed).forEach((id) => els.set(id, makeElement(id, seed[id])));
  return {
    els,
    document: {
      getElementById: (id) => (els.has(id) ? els.get(id) : null),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {}
    }
  };
}

function makeLocalStorage(seed) {
  const store = new Map();
  Object.keys(seed).forEach((k) => store.set(k, String(seed[k])));
  return {
    store,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(String(k), String(v)); },
      removeItem: (k) => { store.delete(k); },
      clear: () => store.clear(),
      key: (i) => [...store.keys()][i] ?? null,
      get length() { return store.size; }
    }
  };
}

/* ---- lifting ------------------------------------------------------------- */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function liftFunction(name) {
  try {
    return A.fnSource(source(), name);
  } catch (e) {
    fail(`cannot lift function "${name}" from app.html: ${e.message}`);
  }
}

/* Finds the one top-of-line declaration of `name` and hands the cutting to
   app-source.js: declaration() for a bracketed table, constSource() for a
   one-line const, block() to the end of the line for a one-line var or let. */
function liftConst(name) {
  const src = source();
  const hits = [...src.matchAll(new RegExp('^(const|var|let) ' + escapeRe(name) + '\\s*=\\s*', 'gm'))];
  if (!hits.length) {
    fail(`cannot lift const "${name}" from app.html: no line starts with ` +
         `"const ${name} =", "var ${name} =" or "let ${name} ="`);
  }
  if (hits.length > 1) {
    fail(`cannot lift const "${name}" from app.html: it is declared ${hits.length} times, ` +
         'so the wrong one could be lifted silently');
  }
  const marker = hits[0][0];
  if (src.indexOf(marker) !== hits[0].index) {
    fail(`cannot lift const "${name}" from app.html: the text "${marker.trim()}" also appears ` +
         'earlier in the file, where app-source.js would cut from instead');
  }
  const first = src[hits[0].index + marker.length];
  try {
    if (first === '{') return A.declaration(src, marker, '{', '}');
    if (first === '[') return A.declaration(src, marker, '[', ']');
    if (hits[0][1] === 'const') return A.constSource(src, name);
    return marker + A.block(src, marker, '\n');
  } catch (e) {
    fail(`cannot lift const "${name}" from app.html: ${e.message}`);
  }
}

/* ---- the loader ---------------------------------------------------------- */

function loadApp(options) {
  const o = options || {};
  const known = ['functions', 'consts', 'files', 'record', 'now', 'toast', 'document',
                 'localStorage', 'stubs'];
  Object.keys(o).forEach((k) => {
    if (!known.includes(k)) fail(`loadApp() does not know the option "${k}" (it knows: ${known.join(', ')})`);
  });

  /* Where each global came from, so a name defined twice is an error that says
     by whom rather than a silent last-one-wins. Phase 1 moves functions from
     app.html into src/logic; a test that still lifts the old copy over the new
     file would go on passing while exercising the wrong one. */
  const origin = new Map();
  const claim = (name, by) => {
    if (origin.has(name)) fail(`"${name}" is defined twice: by ${origin.get(name)} and by ${by}. Keep one.`);
    origin.set(name, by);
  };

  let instant = toInstant(o.now);
  const clock = () => {
    if (instant === null) {
      fail('the code under test read the clock (new Date() or Date.now()) but the test did not ' +
           "freeze it. Pass { now: 'YYYY-MM-DDTHH:MM' } to loadApp().");
    }
    return instant;
  };

  const sandbox = { console, Date: makeDate(clock) };
  const context = vm.createContext(sandbox);
  const contextJSON = vm.runInContext('JSON', context);

  const harness = {
    /* The frozen instant in epoch ms, and a way to move it mid-test. */
    now: () => clock(),
    setNow: (now) => { instant = toInstant(now); },
    toasts: []
  };
  claim('harness', 'the test harness');
  sandbox.harness = harness;

  if (o.record !== undefined) {
    let json = JSON.stringify(o.record);
    harness.saves = 0;
    /* A copy of the record as last saved, in the test's realm. */
    harness.record = () => JSON.parse(json);
    harness.setRecord = (r) => { json = JSON.stringify(r); };
    /* gd() hands out a fresh deep copy every call, as the app's does, so a
       function that edits what it read changes nothing until it calls sd().
       sd() here only stores: the app's also merges another tab's entries and
       writes localStorage and IndexedDB, none of which is logic under test. */
    claim('gd', 'the record stub'); claim('sd', 'the record stub');
    sandbox.gd = () => contextJSON.parse(json);
    sandbox.sd = (d) => { json = JSON.stringify(d); harness.saves++; };
  }
  if (o.toast) {
    claim('toast', 'the toast stub');
    sandbox.toast = (message) => { harness.toasts.push(message); };
  }
  if (o.document !== undefined) {
    const d = makeDocument(o.document);
    claim('document', 'the document stub');
    sandbox.document = d.document;
    harness.el = (id) => (d.els.has(id) ? d.els.get(id) : null);
  }
  if (o.localStorage !== undefined) {
    const l = makeLocalStorage(o.localStorage);
    claim('localStorage', 'the localStorage stub');
    sandbox.localStorage = l.localStorage;
    harness.stored = () => Object.fromEntries(l.store);
  }
  Object.keys(o.stubs || {}).forEach((name) => {
    claim(name, 'options.stubs');
    sandbox[name] = o.stubs[name];
  });

  /* Plain scripts first, so lifted functions can call into them. Top-level
     function and var declarations become properties of the context; that is
     how the names each file defined are learned. */
  (o.files || []).forEach((rel) => {
    const file = path.resolve(A.ROOT, rel);
    let code;
    try {
      code = fs.readFileSync(file, 'utf8');
    } catch (e) {
      fail(`cannot read script file "${rel}": ${e.message}`);
    }
    const before = new Map(Object.keys(sandbox).map((k) => [k, sandbox[k]]));
    try {
      vm.runInContext(code, context, { filename: file });
    } catch (e) {
      fail(`script file "${rel}" does not evaluate as a plain browser script ` +
           `(top-level declarations, no require/module/import/export): ${e.message}`);
    }
    Object.keys(sandbox).forEach((name) => {
      if (!before.has(name) || before.get(name) !== sandbox[name]) claim(name, `the file ${rel}`);
    });
  });

  (o.consts || []).forEach((name) => {
    claim(name, 'a const lifted from app.html');
    const text = liftConst(name);
    try {
      vm.runInContext(text, context, { filename: `app.html (const ${name})` });
      /* const and let do not become properties of the context the way var and
         function do; publish the value so a test can read the real table. The
         lifted code still sees its own binding, so assigning to this property
         replaces nothing: to substitute a table, pass it in `stubs` instead. */
      sandbox[name] = vm.runInContext(name, context);
    } catch (e) {
      fail(`const "${name}" lifted from app.html does not evaluate: ${e.message}`);
    }
  });

  (o.functions || []).forEach((name) => {
    claim(name, 'a function lifted from app.html');
    const text = liftFunction(name);
    try {
      vm.runInContext(text, context, { filename: `app.html (function ${name})` });
    } catch (e) {
      fail(`function "${name}" lifted from app.html does not evaluate: ${e.message}`);
    }
    if (typeof sandbox[name] !== 'function') {
      fail(`function "${name}" was lifted from app.html but did not define a function`);
    }
  });

  return context;
}

/* ---- results ------------------------------------------------------------- */

/* A deep copy in this realm: arrays, plain objects and Dates rebuilt, every
   primitive kept as it is (undefined, NaN and Infinity included, which a JSON
   round trip would lose). */
function plain(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return Array.from(value, plain);
  if (Object.prototype.toString.call(value) === '[object Date]') return new Date(value.getTime());
  const out = {};
  Object.keys(value).forEach((k) => { out[k] = plain(value[k]); });
  return out;
}

const same = (actual, expected, message) => assert.deepStrictEqual(plain(actual), expected, message);

const DAY_MS = 864e5;

module.exports = { loadApp, plain, same, local, DAY_MS };
