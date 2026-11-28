#!/usr/bin/env node
/* Inline the logic modules into app.html.
 *
 * app.html is one file and is served as it is: GitHub Pages has no build
 * step, the native shell copies it whole, and the public pages lift functions
 * straight out of its text. None of that changes. What changes is where the
 * redesign's logic is WRITTEN: as small plain scripts under src/logic/, which
 * can be read, reviewed and tested one at a time, and which this script copies
 * into one block of app.html between two markers.
 *
 *   node scripts/build-app.js           rewrite the block in app.html
 *   node scripts/build-app.js --check   exit 1 if app.html does not match
 *
 * The same arrangement as build-pages.js and, in therapylog-app, the generated
 * www/index.html: the output is committed, and CI fails if it and its inputs
 * disagree. So the block cannot drift from src/logic/, and nobody has to
 * wonder which copy is the real one. It is src/logic/.
 *
 * Rules for a module, which this script enforces where it can:
 *
 *   - a plain browser script: top-level `function` and `var` declarations
 *     only. No import, export, require or module. The test helper evaluates
 *     the same file in a vm context, and the browser gets the same text.
 *   - nothing runs at load. Modules are concatenated in name order and must
 *     not depend on it, so a top-level statement may only declare.
 *   - names start with tl or TL_, so nothing collides with the app's globals.
 *   - no "</script", no "<!--" and no "<script" tag anywhere in the text,
 *     comments included (see htmlSafe below), and no copy of either marker.
 *
 * Data the logic needs that lives elsewhere in the repo is inlined the same
 * way, from the file that owns it: see DATA below. Its "<" characters are
 * escaped, so the data can say anything.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app.html');
/* Scripts, in this order: the logic, then the UI that draws it. Within each
   directory files go in name order and must not depend on it. */
const SRC_DIRS = ['src/logic', 'src/ui'];
/* Stylesheets, in this order: the order is the cascade. */
const CSS_FILES = ['src/ui/tokens.css', 'src/ui/icons.css', 'src/ui/components.css', 'src/ui/shell.css', 'src/ui/setup.css', 'src/ui/home.css', 'src/ui/log.css', 'src/ui/protocol.css', 'src/ui/library.css', 'src/ui/tools.css', 'src/ui/bloodwork.css'];

const START = '/* TL-LOGIC:START';
const END = '/* TL-LOGIC:END */';
/* Where the block goes the first time, when app.html has no markers yet: just
   before the app's main script, so every function here exists by the time
   that script's top-level code runs. */
const ANCHOR = '<script>const DB = {';

/* The stylesheet block, kept apart from the app's own. scripts/lib/app-source.js
   lifts rules out of the FIRST <style> block into every generated public page,
   and dates each page by a hash of the result, so new rules there would
   re-date all of them. This block goes straight after that one's </style>. */
const CSS_START = '/* TL-UI:START';
const CSS_END = '/* TL-UI:END */';

/* JSON owned by another part of the repo, exposed to the logic as a var. */
const DATA = [
  { name: 'TL_SITE_MAP', file: 'assets/figures/injection-sites.json',
    /* Only what the app reads; the file's comments and placement notes stay there. */
    pick: (j) => ({ figure: j.figure, sites: j.sites }) },
];

function fail(message) {
  console.error('build-app: ' + message);
  process.exit(1);
}

/* The block is the text of one <script> element, and the HTML parser reads it
   before any script does, with no idea what a JS comment or string is. It ends
   the element at the first "</script". After a "<!--" it reads a "<script"
   tag as the start of a nested script, and the element then runs on past its
   own "</script>" and swallows the app's main script, so neither runs. (A
   "<!--" is also a line comment to a classic script.) A "<script" is a tag to
   the parser when a space, "/", ">" or the end of the text follows the name;
   "<scripted" is not. --check cannot see any of this, because it compares
   app.html with the same generator, so the build refuses the text instead. */
function htmlSafe(rel, text) {
  if (/<\/script/i.test(text)) fail(`${rel} contains "</script", which would end the block early`);
  if (/<!--/.test(text)) fail(`${rel} contains "<!--", which with a "<script" tag anywhere in the block would run it on past its end`);
  if (/<script(?:[\s/>]|$)/i.test(text)) fail(`${rel} contains a "<script" tag, which after a "<!--" anywhere in the block would run it on past its end`);
  return text;
}

function modules() {
  return SRC_DIRS.flatMap((dir) => {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs).filter((f) => f.endsWith('.js')).sort().map((f) => ({ dir, f }));
  }).map(({ dir, f }) => {
    const text = fs.readFileSync(path.join(ROOT, dir, f), 'utf8').replace(/\s+$/, '');
    const rel = dir + '/' + f;
    /* The raw text, comments and all: the HTML parser sees those too. */
    htmlSafe(rel, text);
    if (text.includes(END) || text.includes(START)) fail(`${rel} contains a TL-LOGIC marker`);
    if (text.includes(CSS_END) || text.includes(CSS_START)) fail(`${rel} contains a TL-UI marker`);
    /* Checked on the code alone: a comment may say "export a backup first". */
    const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/^\s*import\s+[\w{*'"]/m.test(code) || /^\s*export\s+(default|const|let|var|function|class|async|\{|\*)/m.test(code) ||
        /\bmodule\.exports\b|\brequire\(/.test(code)) {
      fail(`${rel} uses module syntax. Modules are plain browser scripts: top-level function and var declarations only.`);
    }
    return { rel, text };
  });
}

function data() {
  return DATA.filter((d) => fs.existsSync(path.join(ROOT, d.file))).map((d) => {
    const json = JSON.parse(fs.readFileSync(path.join(ROOT, d.file), 'utf8'));
    /* In JSON a "<" can only be inside a string, where \u003c is the same
       character to the script and nothing at all to the HTML parser. So a site
       named "Right deltoid </script>" reaches the app as written and cannot
       end the block. */
    const text = 'var ' + d.name + ' = ' + JSON.stringify(d.pick ? d.pick(json) : json).replace(/</g, '\\u003c') + ';';
    htmlSafe(d.file, text);
    if (text.includes(END) || text.includes(START)) fail(`${d.file} contains a TL-LOGIC marker`);
    return { rel: d.file, text };
  });
}

/* Every module's top-level names share one scope in the browser. A second
   declaration of a name silently replaces the first, whichever file comes
   later in the block wins, and nothing errors: so a name may be declared by
   one module only. */
function uniqueNames(parts) {
  const seen = {};
  parts.forEach((p) => {
    const code = p.text.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of code.matchAll(/^(?:function\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))/gm)) {
      const n = m[1] || m[2];
      if (seen[n] && seen[n] !== p.rel) fail(`${n} is declared in both ${seen[n]} and ${p.rel}; the later one would silently replace the earlier`);
      seen[n] = p.rel;
    }
  });
  return parts;
}

function block() {
  const parts = uniqueNames(data().concat(modules()));
  const head = START + ' — generated by scripts/build-app.js from ' + SRC_DIRS.join('/, ') + '/ and the data files named below.\n' +
    '   Do not edit between these markers: change the source file and run `node scripts/build-app.js`.\n' +
    '   CI runs `node scripts/build-app.js --check`. */';
  /* Each part was checked; this covers the file names in the separators. */
  const body = htmlSafe('the generated block', parts.map((p) => '/* ---- ' + p.rel + ' ---- */\n' + p.text).join('\n\n'));
  return { text: head + '\n' + body + '\n' + END, count: parts.length };
}

function styles() {
  const parts = CSS_FILES.filter((rel) => fs.existsSync(path.join(ROOT, rel))).map((rel) => {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\s+$/, '');
    if (/<\/style/i.test(text)) fail(`${rel} contains "</style", which would end the block early`);
    if (text.includes(CSS_END) || text.includes(CSS_START) || text.includes(START) || text.includes(END)) fail(`${rel} contains a marker`);
    /* scripts/mobile-fit-patch.js rewrites "height:100vh" everywhere outside
       the first stylesheet, which would make this block differ from its
       source. Write 100dvh (with a fallback in a separate declaration). */
    if (/height\s*:\s*100vh/i.test(text)) fail(`${rel} uses height:100vh; use 100dvh`);
    return { rel, text };
  });
  const head = CSS_START + ' — generated by scripts/build-app.js from ' + CSS_FILES.join(', ') + '.\n' +
    '   Do not edit between these markers. CI runs `node scripts/build-app.js --check`. */';
  const body = parts.map((p) => '/* ---- ' + p.rel + ' ---- */\n' + p.text).join('\n\n');
  return { text: head + '\n' + body + '\n' + CSS_END, count: parts.length };
}

function placeStyles(html) {
  const c = styles();
  if (!c.count) return { html, count: 0 };
  const a = html.indexOf(CSS_START);
  if (a < 0) {
    const first = html.indexOf('</style>');
    if (first < 0) fail('app.html has no </style> to place the TL-UI block after');
    const at = first + '</style>'.length;
    return { html: html.slice(0, at) + '<style id="tl-ui">\n' + c.text + '\n</style>' + html.slice(at), count: c.count };
  }
  const z = html.indexOf(CSS_END, a);
  if (z < 0) fail('app.html has a TL-UI:START with no TL-UI:END after it');
  if (html.indexOf(CSS_START, a + 1) >= 0) fail('app.html has more than one TL-UI:START');
  return { html: html.slice(0, a) + c.text + html.slice(z + CSS_END.length), count: c.count };
}

function build(html) {
  const placed = placeStyles(html);
  const cssCount = placed.count;
  html = placed.html;
  const b = block();
  b.count += cssCount;
  const a = html.indexOf(START);
  if (a < 0) {
    const at = html.indexOf(ANCHOR);
    if (at < 0) fail('app.html has no TL-LOGIC markers and no "' + ANCHOR + '" to place them before');
    if (html.indexOf(ANCHOR, at + 1) >= 0) fail('"' + ANCHOR + '" appears more than once in app.html');
    return { html: html.slice(0, at) + '<script>\n' + b.text + '\n</script> ' + html.slice(at), count: b.count };
  }
  const z = html.indexOf(END, a);
  if (z < 0) fail('app.html has a TL-LOGIC:START with no TL-LOGIC:END after it');
  if (html.indexOf(START, a + 1) >= 0) fail('app.html has more than one TL-LOGIC:START');
  return { html: html.slice(0, a) + b.text + html.slice(z + END.length), count: b.count };
}

function main() {
  const check = process.argv.includes('--check');
  const before = fs.readFileSync(APP, 'utf8');
  const out = build(before);

  if (!check) {
    if (out.html !== before) fs.writeFileSync(APP, out.html);
    console.log(`build-app: ${out.count} source file(s) inlined into app.html` + (out.html === before ? ' (no change)' : ''));
    return;
  }
  if (out.html === before) {
    console.log(`build-app --check OK: app.html carries ${out.count} source file(s) exactly as src/ has them`);
    return;
  }
  let i = 0;
  while (i < before.length && i < out.html.length && before[i] === out.html[i]) i++;
  const line = before.slice(0, i).split('\n').length;
  console.error('build-app --check FAILED: the TL-LOGIC block in app.html does not match its sources.\n');
  console.error(`  first difference at line ${line}:`);
  console.error('    app.html:  ' + JSON.stringify(before.slice(i, i + 80)));
  console.error('    generated: ' + JSON.stringify(out.html.slice(i, i + 80)));
  console.error('\nThe block is generated. Edit the file under src/logic/ (or the data file it names),');
  console.error('then run `node scripts/build-app.js` and commit app.html with it.');
  process.exit(1);
}

if (require.main === module) main();
module.exports = { build, block, modules, styles, START, END, CSS_START, CSS_END };
