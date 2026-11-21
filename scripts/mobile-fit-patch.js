#!/usr/bin/env node
/* Mobile-fit fixes that hold whether or not the redesign has landed.
 *
 *   node scripts/mobile-fit-patch.js [path/to/app.html]   rewrites in place
 *   node scripts/mobile-fit-patch.js --check [path]        exit 1 if it would change anything
 *
 * Safe to run twice: every rule skips what it has already done.
 *
 * This is the design handoff's handoff/mobile-fit-patch.js with one defect
 * fixed. The original routed every substitution through a replacer FUNCTION
 * and returned the replacement string from it. String.replace() only expands
 * "$1" in a replacement STRING; a function's return value is inserted as-is.
 * So `<input type="number" id="ww">` became `<input inputmode="decimal"$1
 * id="ww">` — the type attribute gone and a literal "$1" in the markup, on all
 * 151 number inputs — and `min-height:100vh` became the text `$1:100vh;$1:100dvh`,
 * which is not CSS. The dry run only printed match counts, and the counts were
 * right, so nothing looked wrong. Every rule below now builds its replacement
 * from the captured groups explicitly.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const check = args.includes('--check');
const file = args.find((a) => !a.startsWith('--')) || path.join(__dirname, '..', 'app.html');

const before = fs.readFileSync(file, 'utf8');
let src = before;
const report = {};
const sub = (name, re, to) => {
  let n = 0;
  src = src.replace(re, (...m) => { n++; return to(...m); });
  report[name] = n;
};

/* 1. Let people pinch-zoom. Inputs are already 16px, so focus does not zoom. */
sub('viewport zoom lock removed',
  /,\s*maximum-scale=1(\.0)?\s*,\s*user-scalable=no/g,
  () => '');

/* 2. Decimal keypad on every number field that has no inputmode yet. */
sub('number inputs given inputmode',
  /<input(?![^>]*\binputmode=)([^>]*\btype="number")/g,
  (_all, rest) => '<input inputmode="decimal"' + rest);

/* The public pages under /tools, /compounds and /markers are generated from
   this file: scripts/lib/app-source.js lifts the `html`, `body` and widget
   rules out of the FIRST <style> block and inlines them into every page, and
   each page's review date is guarded by a hash of the result. So a change to
   a lifted rule re-stamps the review date on all 136 public pages, for a
   change none of them asked for. Two things keep this patch out of them:

     - rule 3 leaves the stylesheet alone and only rewrites inline styles;
       the stylesheet's own 100vh gets its dvh override from the block below.
     - rule 4's block is wrapped in `@media all{}`. extractCss() skips at-rules
       by design, and a browser treats `@media all` as always true.

   `node scripts/build-pages.js --check` is what proves it. */
const styleOpen = src.indexOf('<style');
const styleShut = src.indexOf('</style>', styleOpen);
if (styleOpen < 0 || styleShut < 0) { console.error('no <style> block in ' + file); process.exit(1); }

/* 3. Dynamic viewport height so content is not hidden behind browser bars.
      The vh declaration stays as the fallback for browsers without dvh.
      The lookbehind pins the capture to the start of the property name.
      Without it the engine can retry from the "height" inside "min-height",
      the back-reference then reads "height", the already-patched text
      ";min-height:100dvh" no longer matches the guard, and a second run
      patches the same declaration again. */
const DVH = /(?<![\w-])([\w-]*height)\s*:\s*100vh(?!\s*;\s*\1\s*:\s*100dvh)/g;
{
  const head = src.slice(0, styleOpen), sheet = src.slice(styleOpen, styleShut), tail = src.slice(styleShut);
  let n = 0;
  const fix = (part) => part.replace(DVH, (_all, prop) => { n++; return prop + ':100vh;' + prop + ':100dvh'; });
  src = fix(head) + sheet + fix(tail);
  report['inline 100vh given a dvh fallback'] = n;
}

/* 4. One small stylesheet block: tap targets, small phones, clipped blocks,
      rubber-banding, and the dvh override for the stylesheet's own 100vh. */
const css = '/*mobile-fit*/@media all{'
  + '.site-btn{min-height:44px;font-size:12px}'
  + '[style*="width:340px"],[style*="width:360px"],[style*="width:420px"],[style*="width:480px"],[style*="width:700px"]{max-width:100%}'
  + '@media(max-width:359px){[style*="grid-template-columns:1fr 1fr"],[style*="grid-template-columns:2fr 1fr 1fr auto"]{grid-template-columns:1fr!important}}'
  + 'html,body{overscroll-behavior-y:none}'
  + '@supports (min-height:100dvh){body{min-height:100dvh}}'
  + '}';
if (src.includes('/*mobile-fit*/')) report['css block'] = 'already present';
else {
  /* Callback form again: a "$" in a replacement string is special. */
  src = src.replace('</style>', () => css + '</style>');
  report['css block'] = 'added';
}

/* A literal "$1" in the output is the signature of the original defect. The
   app legitimately contains a few (regex replacements in its own script), so
   compare against the input rather than against zero. */
const stray = (s) => (s.match(/\$1/g) || []).length;
if (stray(src) !== stray(before)) {
  console.error(`refusing to write: the number of literal "$1" changed (${stray(before)} -> ${stray(src)})`);
  process.exit(1);
}

console.table(report);
if (check) {
  if (src !== before) { console.error(file + ' is not mobile-fit patched. Run: node scripts/mobile-fit-patch.js'); process.exit(1); }
  console.log(file + ' is already patched.');
} else if (src !== before) {
  fs.writeFileSync(file, src);
}
