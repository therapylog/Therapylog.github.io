/* What scripts/build-app.js lets into app.html's logic block.
 *
 * The block is the text of one <script> element. The HTML parser ends that
 * element at the first "</script" it meets, and after a "<!--" it treats a
 * "<script" tag as the start of a nested script, so the element then runs on
 * past its own "</script>" and swallows the app's main script with it. Either
 * way no tl* function exists and the app does not start. --check cannot catch
 * this, because it compares app.html against the same generator.
 *
 * So the build has to refuse such text from a module, and has to write the
 * data files it inlines so that they cannot contain it. These tests run the
 * real script against a throwaway copy of the repo's layout in the system
 * temp directory, and read back what it wrote.
 *
 * Run:  node --test tests/*.test.js
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const REPO = path.join(__dirname, '..');
const SCRIPT = path.join(REPO, 'scripts', 'build-app.js');
const PAGE = '<!doctype html><body><script>const DB = {};\nwindow.started = typeof tlA;\n</script></body>\n';
const MODULE_A = '/* A module. */\nfunction tlA() { return 1; }\n';

/* A scratch repo: the real build script, the given modules, the site map when
   one is given, and an app.html with the anchor the block goes before. The
   script finds everything relative to its own folder, so a copy of it builds
   this scratch repo and nothing else. */
function scratch(t, { modules, sites }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tl-build-app-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(SCRIPT, path.join(root, 'scripts', 'build-app.js'));
  fs.mkdirSync(path.join(root, 'src', 'logic'), { recursive: true });
  for (const [name, text] of Object.entries(modules)) fs.writeFileSync(path.join(root, 'src', 'logic', name), text);
  if (sites) {
    fs.mkdirSync(path.join(root, 'assets', 'figures'), { recursive: true });
    fs.writeFileSync(path.join(root, 'assets', 'figures', 'injection-sites.json'),
      JSON.stringify({ _comment: 'scratch', figure: { male: [478, 1038] }, sites }, null, 2));
  }
  fs.writeFileSync(path.join(root, 'app.html'), PAGE);
  return root;
}

function run(root, ...args) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-app.js'), ...args], { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

const html = (root) => fs.readFileSync(path.join(root, 'app.html'), 'utf8');

/* The text of the logic block's <script> element, from just after its start
   tag to just before the end tag the build wrote for it. */
function blockOf(page) {
  const open = '<script>\n/* TL-LOGIC:START';
  const close = '/* TL-LOGIC:END */\n</script> <script>const DB = {';
  const a = page.indexOf(open), z = page.indexOf(close);
  assert.ok(a >= 0 && z > a, 'the build wrote a logic block');
  return page.slice(a + '<script>\n'.length, z + '/* TL-LOGIC:END */'.length);
}

/* What would end the element early, or make the parser carry it on past its
   end: the three things the build must keep out of the block. A "<script"
   counts as a tag when the parser would read it as one, that is when a space,
   "/", ">" or the end of the text follows the name. */
const UNSAFE = { '</script': /<\/script/i, '<!--': /<!--/, '<script tag': /<script(?:[\s/>]|$)/i };
function unsafe(text) {
  return Object.keys(UNSAFE).filter((k) => UNSAFE[k].test(text));
}

test('a site name containing "</script>" or "<!--" reaches the app unchanged and cannot end the block', (t) => {
  const names = ['Right deltoid </script><b>x</b>', 'Left glute <!-- old <SCRIPT async> note -->'];
  const root = scratch(t, { modules: { 'a.js': MODULE_A }, sites: names.map((name, i) => ({ id: 's' + i, name })) });
  const built = run(root);
  assert.equal(built.status, 0, built.out);

  const block = blockOf(html(root));
  assert.deepEqual(unsafe(block), [], 'the block as the HTML parser reads it');
  /* Escaped for the parser, the same characters for the script. */
  const ctx = vm.createContext({});
  vm.runInContext(block, ctx);
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(TL_SITE_MAP.sites.map(function (s) { return s.name; }))', ctx)), names);
  assert.equal(vm.runInContext('typeof tlA', ctx), 'function');

  assert.equal(run(root, '--check').status, 0, 'and --check agrees with what was written');
});

test('a module containing "<!--" fails the build, even in a comment', (t) => {
  for (const text of ['/* see <!-- the old note */\n' + MODULE_A, MODULE_A + 'function tlB() { return "<!--"; }\n']) {
    const root = scratch(t, { modules: { 'a.js': text } });
    const built = run(root);
    assert.equal(built.status, 1, built.out);
    assert.match(built.out, /src\/logic\/a\.js contains "<!--"/);
    assert.equal(html(root), PAGE, 'app.html is left as it was');
  }
});

test('a module containing a "<script" tag fails the build, even in a comment or a string', (t) => {
  const cases = [
    '/* loaded by <script async> */\n' + MODULE_A,
    MODULE_A + '// <script src="x.js">\n',
    MODULE_A + 'function tlB() { return "<SCRIPT>"; }\n',
    MODULE_A + 'function tlB() { return "<script/"; }\n',
    MODULE_A + '// the last words are <script',
  ];
  for (const text of cases) {
    const root = scratch(t, { modules: { 'a.js': text } });
    const built = run(root);
    assert.equal(built.status, 1, JSON.stringify(text) + '\n' + built.out);
    assert.match(built.out, /src\/logic\/a\.js contains a "<script" tag/);
    assert.equal(html(root), PAGE, 'app.html is left as it was');
  }
});

test('a module containing "</script" still fails the build', (t) => {
  const root = scratch(t, { modules: { 'a.js': MODULE_A + '// </script>\n' } });
  const built = run(root);
  assert.equal(built.status, 1, built.out);
  assert.match(built.out, /src\/logic\/a\.js contains "<\/script"/);
});

test('a module may still compare with "<" and use the word script', (t) => {
  const text = '/* Runs as a plain script; a<b is a comparison, and <scripted> is not a tag. */\n' +
    'function tlA(a, b) { return a<b ? "script" : a <= b; }\n';
  const root = scratch(t, { modules: { 'a.js': text } });
  const built = run(root);
  assert.equal(built.status, 0, built.out);
  assert.deepEqual(unsafe(blockOf(html(root))), []);
});

test('a data file carrying a TL-LOGIC marker fails the build rather than splitting the block', (t) => {
  const root = scratch(t, { modules: { 'a.js': MODULE_A }, sites: [{ id: 's0', name: 'x /* TL-LOGIC:END */ y' }] });
  const built = run(root);
  assert.equal(built.status, 1, built.out);
  assert.match(built.out, /assets\/figures\/injection-sites\.json contains a TL-LOGIC marker/);
  assert.equal(html(root), PAGE, 'app.html is left as it was');
});

test('the block built from this repo has nothing that would end or extend its script element', () => {
  const { block } = require(SCRIPT);
  assert.deepEqual(unsafe(block().text), []);
});
