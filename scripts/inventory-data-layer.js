#!/usr/bin/env node
/* What does app.html keep, and which functions touch it?
 *
 * docs/DATA-MODEL.md answers that in prose. This script answers it from the
 * syntax tree, so the prose has something to be checked against: every stored
 * key, every function that reads or writes it, and the fields of every entry
 * the app creates. The redesign's migrations (protocol, rounds, supply, sites)
 * are written against the document, and a key the document does not know about
 * is a key a migration silently drops.
 *
 *   node scripts/inventory-data-layer.js            print the inventory
 *   node scripts/inventory-data-layer.js --json     the same, as JSON
 *   node scripts/inventory-data-layer.js --check    fail if docs/DATA-MODEL.md
 *                                                   does not name something
 *                                                   the app stores
 *
 * What it finds:
 *
 *   the main record   everything goes through gd() and sd(). A variable bound
 *                     to gd() is followed, and each property read or written on
 *                     it is recorded against the enclosing function.
 *   entries           object literals carrying both `type` and `ts` — the shape
 *                     of every row in d.entries, by the function that builds it.
 *   localStorage      every getItem/setItem/removeItem, with constant keys
 *   sessionStorage    resolved to their string values.
 *   IndexedDB         every database opened and object store created.
 *
 * What it cannot see: a field read off an alias (`const e = d.entries` and
 * then `e[0].mood`), or a key built at run time. Those are listed as dynamic
 * rather than guessed at, and the document covers them by hand.
 *
 * Needs acorn, which CI installs the same way build-brain.js gets it:
 *   npm install --no-save acorn
 */
const fs = require('fs');
const path = require('path');

let acorn;
try { acorn = require('acorn'); }
catch (e) {
  console.error('inventory-data-layer: acorn is not installed. Run: npm install --no-save acorn');
  process.exit(2);
}

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app.html');
const DOC = path.join(ROOT, 'docs', 'DATA-MODEL.md');

/* ---- parse ------------------------------------------------------------- */

function scriptBlocks(html) {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || '';
    if (/type\s*=\s*["'](?!text\/javascript|module|application\/javascript)/.test(attrs)) continue;
    const at = m.index + m[0].indexOf(m[2]);
    out.push({ code: m[2], start: at });
  }
  return out;
}

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (offset) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

/* ---- the walk ---------------------------------------------------------- */

const MUTATORS = new Set(['push', 'unshift', 'splice', 'sort', 'reverse', 'pop', 'shift', 'fill']);
const STORES = new Set(['localStorage', 'sessionStorage']);

function inventory(html) {
  const lineOf = lineIndex(html);
  const main = {};          /* key path -> { read: {fn: [lines]}, write: {fn: [lines]} } */
  const entries = {};       /* type -> [{ fn, line, fields }] */
  const web = {};           /* store -> key -> { get|set|remove: {fn: [lines]} } */
  const idb = [];           /* { op, name, fn, line } */
  const constants = {};     /* top-level NAME -> string, and NAME.prop -> string */

  const blocks = scriptBlocks(html).map((b) => {
    let ast;
    try { ast = acorn.parse(b.code, { ecmaVersion: 'latest' }); }
    catch (e) { throw new Error('app.html has a script block that does not parse: ' + e.message); }
    return { ast, start: b.start, code: b.code };
  });

  /* Pass 1: string constants, so localStorage.getItem(DB_KEY) reads as "tlv2".
     Object literals are flattened three levels deep, which is what it takes to
     resolve AI_CONSENT.<which>.key. */
  const flatten = (prefix, obj, depth) => {
    for (const p of obj.properties) {
      if (p.type !== 'Property' || p.computed) continue;
      const name = prefix + '.' + (p.key.name || p.key.value);
      if (p.value.type === 'Literal' && typeof p.value.value === 'string') constants[name] = p.value.value;
      else if (p.value.type === 'ObjectExpression' && depth < 3) flatten(name, p.value, depth + 1);
    }
  };
  for (const b of blocks) {
    for (const node of b.ast.body) {
      if (node.type !== 'VariableDeclaration') continue;
      for (const d of node.declarations) {
        if (d.id.type !== 'Identifier' || !d.init) continue;
        if (d.init.type === 'Literal' && typeof d.init.value === 'string') constants[d.id.name] = d.init.value;
        if (d.init.type === 'ObjectExpression') flatten(d.id.name, d.init, 1);
      }
    }
  }

  const note = (table, key, kind, fn, line) => {
    const row = (table[key] = table[key] || {});
    const by = (row[kind] = row[kind] || {});
    (by[fn] = by[fn] || []).push(line);
  };

  /* The dotted path of a member chain rooted at a data variable, or null.
     Computed parts become [] so d.supply[name] reads as "supply[]". */
  function pathOf(node, dataVars) {
    const parts = [];
    let n = node;
    while (n && n.type === 'MemberExpression') {
      if (n.computed) {
        if (n.property.type === 'Literal' && typeof n.property.value === 'string') parts.unshift(n.property.value);
        else parts.unshift('[]');
      } else parts.unshift(n.property.name);
      n = n.object;
    }
    if (!n) return null;
    const rooted = (n.type === 'Identifier' && dataVars.has(n.name)) ||
      (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'gd');
    if (!rooted || !parts.length) return null;
    /* Fold "[]" into the part before it, and stop at depth 3. */
    const out = [];
    for (const p of parts) {
      if (p === '[]') { if (out.length) out[out.length - 1] += '[]'; } else out.push(p);
      if (out.length === 3) break;
    }
    return out.join('.');
  }

  /* One key, or several when the app picks one of a fixed set at run time:
     AI_CONSENT[which].key can only be one of the keys AI_CONSENT declares. */
  function keyTexts(arg, code) {
    if (!arg) return ['<none>'];
    if (arg.type === 'Literal') return [String(arg.value)];
    if (arg.type === 'Identifier' && constants[arg.name] !== undefined) return [constants[arg.name]];
    const src = code.slice(arg.start, arg.end);
    if (arg.type === 'MemberExpression') {
      if (constants[src] !== undefined) return [constants[src]];
      const inner = arg.object;
      if (!arg.computed && inner.type === 'MemberExpression' && inner.computed && inner.object.type === 'Identifier') {
        const re = new RegExp('^' + inner.object.name + '\\.[^.]+\\.' + arg.property.name + '$');
        const hits = Object.keys(constants).filter((k) => re.test(k)).map((k) => constants[k]);
        if (hits.length) return hits;
      }
    }
    return ['<dynamic: ' + src.replace(/\s+/g, ' ').slice(0, 60) + '>'];
  }
  const keyText = (arg, code) => keyTexts(arg, code)[0];

  /* The fields of an object literal written into the record, as sub-paths:
     d.proto = { name, start } records proto.name and proto.start. Arrays of
     object literals record their items' fields under "[]". */
  function noteLiteral(prefix, obj, fn, ln, depth) {
    for (const p of obj.properties) {
      if (p.type !== 'Property' || p.computed) continue;
      const key = (prefix ? prefix + '.' : '') + (p.key.name || p.key.value);
      note(main, key, 'write', fn, ln);
      if (depth >= 2) continue;
      if (p.value.type === 'ObjectExpression') noteLiteral(key, p.value, fn, ln, depth + 1);
      if (p.value.type === 'ArrayExpression') {
        p.value.elements.forEach((el) => { if (el && el.type === 'ObjectExpression' && key !== 'entries') noteLiteral(key + '[]', el, fn, ln, depth + 1); });
      }
    }
  }

  for (const b of blocks) {
    const line = (node) => lineOf(b.start + node.start);

    (function walk(node, parent, fnName, dataVars, owner, locals) {
      if (!node || typeof node !== 'object') return;

      /* `var TLIAP = { validate: function(){} }` and `window.TLTier = { ... }`:
         remember whose object this is, so its methods get a full name. */
      if (node.type === 'ObjectExpression' && parent) {
        if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') owner = parent.id.name;
        else if (parent.type === 'AssignmentExpression' && parent.right === node) owner = b.code.slice(parent.left.start, parent.left.end);
      }

      /* A new function: name it, and give it its own set of data variables.
         It inherits the outer ones, since closures do read them, minus any it
         shadows with a parameter. Anonymous callbacks keep the name of the
         function around them. */
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression') {
        let name = null;
        if (node.id) name = node.id.name;
        else if (parent && parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') name = parent.id.name;
        else if (parent && parent.type === 'Property' && !parent.computed) name = (owner ? owner + '.' : '') + (parent.key.name || parent.key.value);
        else if (parent && parent.type === 'AssignmentExpression' && parent.right === node) name = b.code.slice(parent.left.start, parent.left.end);
        if (name) fnName = fnName === '<top level>' || (parent && parent.type === 'Property') ? name : fnName + ' > ' + name;
        dataVars = new Set(dataVars);
        locals = Object.assign({}, locals);
        owner = null;
        const drop = (pat) => {
          if (!pat) return;
          if (pat.type === 'Identifier') { dataVars.delete(pat.name); delete locals[pat.name]; }
          else if (pat.type === 'AssignmentPattern') drop(pat.left);
          else if (pat.type === 'RestElement') drop(pat.argument);
          else if (pat.type === 'ObjectPattern') pat.properties.forEach((q) => drop(q.value || q.argument));
          else if (pat.type === 'ArrayPattern') pat.elements.forEach(drop);
        };
        node.params.forEach(drop);
      }

      if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
        const isGd = node.init && node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' && node.init.callee.name === 'gd';
        /* const d = gd() starts tracking; const d = new Date() stops it. */
        if (isGd) dataVars.add(node.id.name); else dataVars.delete(node.id.name);
        if (node.init && node.init.type === 'ObjectExpression') {
          locals[node.id.name] = node.init;
          /* A whole record written as one literal, the way loadDemoData does. */
          const keys = node.init.properties.filter((q) => q.type === 'Property' && !q.computed).map((q) => q.key.name || q.key.value);
          if (keys.includes('entries') && (keys.includes('proto') || keys.includes('profile'))) {
            noteLiteral('', node.init, fnName, line(node), 0);
          }
        } else delete locals[node.id.name];
      }

      const literalOf = (n) => !n ? null : n.type === 'ObjectExpression' ? n
        : (n.type === 'Identifier' && locals[n.name]) ? locals[n.name] : null;

      /* The outermost member chain only, so d.proto.meds is recorded once. */
      if (node.type === 'MemberExpression' && !(parent && parent.type === 'MemberExpression' && parent.object === node)) {
        /* d.entries.filter(...) is a read of d.entries, not of a field named filter. */
        const called = parent && parent.type === 'CallExpression' && parent.callee === node;
        const lengthOf = !node.computed && node.property.name === 'length';
        const target = (called || lengthOf) ? node.object : node;
        const p = pathOf(target, dataVars);
        if (p) {
          let kind = 'read';
          if (!called && !lengthOf) {
            if (parent && parent.type === 'AssignmentExpression' && parent.left === node) {
              kind = 'write';
              const lit = literalOf(parent.right);
              if (lit) noteLiteral(p, lit, fnName, line(node), 1);
            } else if (parent && parent.type === 'UpdateExpression') kind = 'write';
            else if (parent && parent.type === 'UnaryExpression' && parent.operator === 'delete') kind = 'write';
          } else if (called && MUTATORS.has(node.property.name)) {
            kind = 'write';
            if (node.property.name === 'push' || node.property.name === 'unshift') {
              parent.arguments.forEach((a) => {
                const lit = literalOf(a);
                if (lit && p !== 'entries') noteLiteral(p + '[]', lit, fnName, line(node), 1);
              });
            }
          }
          note(main, p, kind, fnName, line(node));
        }
      }

      /* An entry being built. */
      if (node.type === 'ObjectExpression') {
        const keys = node.properties.filter((p) => p.type === 'Property' && !p.computed)
          .map((p) => p.key.name || p.key.value);
        const typeProp = node.properties.find((p) => p.type === 'Property' && !p.computed &&
          (p.key.name || p.key.value) === 'type' && p.value.type === 'Literal' && typeof p.value.value === 'string');
        if (typeProp && keys.includes('ts')) {
          (entries[typeProp.value.value] = entries[typeProp.value.value] || [])
            .push({ fn: fnName, line: line(node), fields: keys });
        }
      }

      /* localStorage / sessionStorage */
      if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed &&
          node.callee.object.type === 'Identifier' && STORES.has(node.callee.object.name)) {
        const op = node.callee.property.name;
        const kind = { getItem: 'get', setItem: 'set', removeItem: 'remove', clear: 'clear', key: 'enumerate' }[op];
        if (kind) {
          const store = (web[node.callee.object.name] = web[node.callee.object.name] || {});
          const keys = kind === 'clear' || kind === 'enumerate' ? ['<all keys>'] : keyTexts(node.arguments[0], b.code);
          keys.forEach((key) => note(store, key, kind, fnName, line(node)));
        }
      }

      /* IndexedDB */
      if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed) {
        const op = node.callee.property.name;
        const obj = node.callee.object;
        if (obj.type === 'Identifier' && obj.name === 'indexedDB' && (op === 'open' || op === 'deleteDatabase')) {
          idb.push({ op, name: keyText(node.arguments[0], b.code), fn: fnName, line: line(node) });
        }
        if (op === 'createObjectStore') {
          idb.push({ op, name: keyText(node.arguments[0], b.code), fn: fnName, line: line(node) });
        }
      }

      for (const k in node) {
        if (k === 'type' || k === 'start' || k === 'end') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => walk(c, node, fnName, dataVars, owner, locals));
        else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, node, fnName, dataVars, owner, locals);
      }
    })(b.ast, null, '<top level>', new Set(), null, {});
  }

  /* A path the app indexes by a run-time key (d.reminderTimes[med.name]) is a
     map keyed by user data. When a literal fills one in — the demo record
     does — its keys are compound names, not fields, so they are folded into
     the "[]" row rather than listed as if they were schema. */
  for (const key of Object.keys(main)) {
    const dot = key.lastIndexOf('.');
    if (dot < 0) continue;
    const parentPath = key.slice(0, dot);
    if (!main[parentPath + '[]'] || key.slice(dot + 1).includes('[]')) continue;
    for (const kind of Object.keys(main[key])) {
      for (const fn of Object.keys(main[key][kind])) main[key][kind][fn].forEach((ln) => note(main, parentPath + '[]', kind, fn, ln));
    }
    delete main[key];
  }

  return { main, entries, web, idb, constants };
}

/* ---- output ------------------------------------------------------------ */

const fnList = (by) => Object.keys(by || {}).sort()
  .map((fn) => fn + ':' + [...new Set(by[fn])].join(',')).join('  ');

function print(inv) {
  const out = [];
  out.push('MAIN RECORD  (localStorage "' + inv.constants.DB_KEY + '", mirrored to IndexedDB)');
  out.push('');
  for (const key of Object.keys(inv.main).sort()) {
    out.push('  ' + key);
    if (inv.main[key].write) out.push('      written by  ' + fnList(inv.main[key].write));
    if (inv.main[key].read) out.push('      read by     ' + fnList(inv.main[key].read));
  }
  out.push('');
  out.push('ENTRIES  (object literals with type and ts)');
  out.push('');
  for (const type of Object.keys(inv.entries).sort()) {
    const fields = [...new Set(inv.entries[type].flatMap((e) => e.fields))];
    out.push('  ' + type + '   { ' + fields.join(', ') + ' }');
    for (const e of inv.entries[type]) out.push('      built in    ' + e.fn + ':' + e.line + '   { ' + e.fields.join(', ') + ' }');
  }
  for (const store of Object.keys(inv.web).sort()) {
    out.push('');
    out.push(store.toUpperCase());
    out.push('');
    for (const key of Object.keys(inv.web[store]).sort()) {
      out.push('  ' + key);
      for (const kind of ['set', 'get', 'remove', 'clear', 'enumerate']) {
        if (inv.web[store][key][kind]) out.push('      ' + (kind + '        ').slice(0, 10) + '  ' + fnList(inv.web[store][key][kind]));
      }
    }
  }
  out.push('');
  out.push('INDEXEDDB');
  out.push('');
  for (const i of inv.idb) out.push('  ' + (i.op + '                  ').slice(0, 18) + i.name + '   ' + i.fn + ':' + i.line);
  return out.join('\n');
}

/* Everything the document has to name. Top-level keys of the main record (the
   part before the first dot), entry types, and every resolvable web-storage
   key. A name counts as documented when it appears in backticks. */
function required(inv) {
  const names = new Set();
  Object.keys(inv.main).forEach((k) => names.add(k.split('.')[0].replace(/\[\]$/, '')));
  Object.keys(inv.entries).forEach((t) => names.add(t));
  for (const store of Object.keys(inv.web)) {
    Object.keys(inv.web[store]).forEach((k) => { if (!k.startsWith('<')) names.add(k); });
  }
  inv.idb.forEach((i) => { if (!i.name.startsWith('<')) names.add(i.name); });
  return [...names].sort();
}

function main() {
  const html = fs.readFileSync(APP, 'utf8');
  const inv = inventory(html);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ main: inv.main, entries: inv.entries, web: inv.web, idb: inv.idb }, null, 2));
    return;
  }
  if (!process.argv.includes('--check')) { console.log(print(inv)); return; }

  if (!fs.existsSync(DOC)) { console.error('docs/DATA-MODEL.md does not exist.'); process.exit(1); }
  const doc = fs.readFileSync(DOC, 'utf8');
  const ticked = new Set();
  (doc.match(/`[^`\n]+`/g) || []).forEach((t) => {
    const body = t.slice(1, -1);
    ticked.add(body);
    /* `d.proto.meds`, `proto.meds` and `entries[]` all document their first name. */
    body.split(/[^A-Za-z0-9_$-]+/).forEach((w) => { if (w) ticked.add(w); });
  });
  const need = required(inv);
  const missing = need.filter((n) => !ticked.has(n));
  if (missing.length) {
    console.error('docs/DATA-MODEL.md does not name ' + missing.length + ' thing(s) app.html stores:\n');
    missing.forEach((m) => console.error('  ' + m));
    console.error('\nRun `node scripts/inventory-data-layer.js` to see where each is read and written,');
    console.error('then document it. A key the document omits is a key a migration drops.');
    process.exit(1);
  }
  console.log('data model OK: docs/DATA-MODEL.md names all ' + need.length +
              ' stored keys, entry types and databases found in app.html');
}

if (require.main === module) main();
module.exports = { inventory, required, print };
