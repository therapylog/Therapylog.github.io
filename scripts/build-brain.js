#!/usr/bin/env node
/* Build the brain index from the content app.html already ships.
 *
 * The app has 131 compounds, 100 lab markers, 12 side-effect playbooks, 53
 * interaction warnings and 17 protocol templates hard-coded into it. All of
 * that is written, reviewed content that cost real effort — and until now the
 * only way to reach any of it was to already know the compound's name, because
 * searchCompounds() matches drug.name/aka/cls and nothing else. Someone typing
 * "why is my e2 high" got "No compounds found" and their next stop was the
 * assistant, at roughly $0.065 a question, for an answer we wrote and shipped.
 *
 * This emits a flat, versioned index so that question can be answered on the
 * device for nothing.
 *
 * Two properties matter more than anything else about the format:
 *
 *   1. It is an INDEX, not a query service. The app fetches the whole thing
 *      once and matches locally. There is deliberately no "POST a question,
 *      get an answer" endpoint, because that would put every user's health
 *      question in a server log — the same class of problem as sending the
 *      full health profile without consent. The query never leaves the device.
 *
 *   2. It is a build artifact, never hand-edited. app.html stays the single
 *      source of truth for content, the way vendor/app.html is for the native
 *      shell. --check fails CI when the committed index drifts from app.html.
 *
 * Parsed with acorn rather than brace-matched, for the reason documented in
 * therapylog-app/scripts/build-shell.js: a hand-rolled scanner mis-terminates
 * on apostrophes in comments and on regex literals, and hands back spans tens
 * of kilobytes long without erroring.
 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app.html');
const OUT = path.join(ROOT, 'assets', 'brain', 'index.json');

function scriptBlocks(html) {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || '';
    if (/type\s*=\s*["'](?!text\/javascript|module|application\/javascript)/.test(attrs)) continue;
    const at = m.index + m[0].indexOf(m[2]);
    out.push({ code: m[2], start: at, end: at + m[2].length });
  }
  return out;
}

/* Top-level const/let/var initialisers by name, evaluated. These are all
   plain data literals; anything referencing app state would throw here, which
   is the intended failure — the index must be static. */
function declarations(html, names) {
  const want = new Set(names);
  const found = {};
  for (const b of scriptBlocks(html)) {
    let ast;
    try {
      ast = acorn.parse(b.code, { ecmaVersion: 'latest' });
    } catch (e) {
      throw new Error(`app.html has a script block that does not parse: ${e.message}`);
    }
    for (const node of ast.body) {
      if (node.type !== 'VariableDeclaration') continue;
      for (const d of node.declarations) {
        if (d.id.type !== 'Identifier' || !want.has(d.id.name) || !d.init) continue;
        const src = b.code.slice(d.init.start, d.init.end);
        try {
          found[d.id.name] = eval('(' + src + ')');
        } catch (e) {
          throw new Error(`could not evaluate ${d.id.name}: ${e.message}`);
        }
      }
    }
  }
  const missing = names.filter((n) => !(n in found));
  if (missing.length) throw new Error(`app.html no longer declares: ${missing.join(', ')}`);
  return found;
}

/* Matchable tokens. Lower-cased, de-duplicated, punctuation flattened so
   "LGD-4033", "lgd 4033" and "lgd4033" all land on the same entry. */
/* Words too common to identify anything. Splitting "High prolactin" into its
   words is what lets "prolactin" find the playbook, but it also produced a
   bare "high" term that matched a third of the index. */
const STOP = new Set(['high', 'low', 'the', 'and', 'for', 'with', 'signs', 'early',
  'rising', 'crashed', 'effects', 'reaction', 'reactions', 'site', 'recovery', 'a', 'of']);

function terms(...bits) {
  const out = new Set();
  for (const b of bits.flat()) {
    if (!b) continue;
    const s = String(b).toLowerCase().trim();
    if (!s || STOP.has(s)) continue;
    out.add(s);
    const flat = s.replace(/[^a-z0-9]+/g, '');
    if (flat && flat !== s) out.add(flat);
    const spaced = s.replace(/[^a-z0-9]+/g, ' ').trim();
    if (spaced && spaced !== s) out.add(spaced);
  }
  return [...out];
}

const lines = (a) => (a || []).filter(Boolean);

function compoundText(d, cls) {
  const p = [];
  p.push(`${d.name}${d.aka ? ` (${d.aka})` : ''} — ${d.cls || cls.name}`);
  if (d.summary) p.push(d.summary);
  if (lines(d.pros).length) p.push('Reported benefits:\n' + d.pros.map((x) => `• ${x}`).join('\n'));
  if (lines(d.cons).length) p.push('Risks and trade-offs:\n' + d.cons.map((x) => `• ${x}`).join('\n'));
  if (lines(d.doses).length) {
    p.push('Dosing discussed in the literature:\n' + d.doses
      .map((x) => `• ${x.l}: ${x.d}${x.f ? ` — ${x.f}` : ''}${x.c ? ` (${x.c})` : ''}`).join('\n'));
  }
  if (d.prog) p.push('Progression: ' + d.prog);
  if (lines(d.stacks).length) {
    p.push('Common protocols:\n' + d.stacks
      .map((s) => `• ${s.g}: ${(s.d || []).join(', ')}`).join('\n'));
  }
  if (d.mon) p.push('Monitoring: ' + d.mon);
  if (d.approval) p.push('Regulatory status: ' + d.approval);
  return p.join('\n\n');
}

function markerText(key, reg, ref, playbook) {
  const p = [];
  const label = (reg && reg.label) || (ref && ref.name) || key;
  p.push(`${label} — lab marker`);
  if (ref) {
    const unit = ref.unit || (reg && reg.canonicalUnit) || '';
    const bits = [];
    if (ref.lo != null && ref.hi != null) bits.push(`typical reference range ${ref.lo}–${ref.hi} ${unit}`.trim());
    if (ref.olo != null && ref.ohi != null) bits.push(`commonly cited optimal band ${ref.olo}–${ref.ohi} ${unit}`.trim());
    if (bits.length) p.push(bits.join('; ') + '.');
  }
  if (reg && reg.units && Object.keys(reg.units).length > 1) {
    p.push('Units seen on lab reports: ' + Object.keys(reg.units).join(', ') +
           `. Canonical unit is ${reg.canonicalUnit}.`);
  }
  if (reg && reg.assay && reg.assay.note) p.push('Assay caveat: ' + reg.assay.note);
  if (playbook) p.push(`Related playbook: ${playbook}.`);
  p.push('Reference ranges vary by lab. A single value out of range is a prompt to look closer, not a diagnosis.');
  return p.join('\n\n');
}

function playbookText(s) {
  const p = [`${s.t} — what it is and what to do`];
  if (s.causes) p.push('Usual causes: ' + s.causes);
  if (s.signs) p.push('Signs: ' + s.signs);
  if (s.labs) p.push('Labs: ' + s.labs);
  if (lines(s.resp).length) p.push('Commonly discussed responses:\n' + s.resp.map((x) => `• ${x}`).join('\n'));
  if (s.esc) p.push('Escalate / seek care: ' + s.esc);
  return p.join('\n\n');
}

/* How people actually phrase these. The playbook titles are clinical ("High
   prolactin", "HPTA suppression & recovery") and nobody types those — they
   type "gyno", "crashed my e2", "balls shrunk". Without this layer the twelve
   playbooks are unreachable from a question, which is most of why these
   questions were going to the paid assistant in the first place.
   Hand-written rather than derived: there are twelve, and a fuzzy match that
   sends a prolactin question to the estradiol protocol is worse than no
   match at all. */
const PLAYBOOK_SYNONYMS = {
  'High prolactin': ['prolactin', 'prolactinoma', 'cabergoline', 'caber', 'lactation',
    'nipple discharge', 'dead libido', 'no libido', '19-nor', 'deca dick', 'tren dick'],
  'High estradiol': ['estradiol', 'e2', 'estrogen', 'high e2', 'estrogen high',
    'water retention', 'bloating', 'emotional', 'puffy', 'aromatase', 'anastrozole', 'arimidex'],
  'Crashed estradiol': ['crashed e2', 'crashed estrogen', 'low e2', 'e2 too low',
    'joint pain', 'dry joints', 'no libido low e2', 'anhedonia', 'crashed my estrogen'],
  'High hematocrit': ['hematocrit', 'hct', 'hemoglobin', 'hgb', 'thick blood', 'blood thick',
    'polycythemia', 'erythrocytosis', 'donate blood', 'phlebotomy', 'blood donation', 'rbc'],
  'Rising blood pressure': ['blood pressure', 'bp', 'hypertension', 'high blood pressure',
    'systolic', 'diastolic', 'headaches'],
  'Lipid strain': ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'trigs', 'apob', 'lipids',
    'lipid panel', 'cardiovascular', 'heart risk'],
  'Early gyno signs': ['gyno', 'gynecomastia', 'nipple', 'nipples', 'nipple sensitivity',
    'nipple pain', 'itchy nipples', 'lump behind nipple', 'puffy nipples', 'bitch tits',
    'raloxifene', 'tamoxifen', 'nolvadex'],
  'HPTA suppression & recovery': ['hpta', 'suppression', 'suppressed', 'shut down', 'shutdown',
    'testicular atrophy', 'balls shrunk', 'ball shrinkage', 'restart', 'recovery', 'pct',
    'post cycle', 'fertility', 'sperm', 'lh', 'fsh', 'hcg', 'natural production'],
  'Hair shedding': ['hair', 'hair loss', 'shedding', 'balding', 'bald', 'receding',
    'finasteride', 'dutasteride', 'minoxidil', 'dht', 'male pattern'],
  'Injection-site reactions': ['injection site', 'pip', 'post injection pain', 'lump',
    'swollen injection', 'red injection', 'abscess', 'infection', 'knot', 'sore injection'],
  'GLP-1 side effects': ['glp', 'glp-1', 'semaglutide', 'tirzepatide', 'ozempic', 'mounjaro',
    'wegovy', 'zepbound', 'nausea', 'vomiting', 'constipation', 'sulfur burps', 'appetite'],
  'GH secretagogue effects': ['gh', 'growth hormone', 'secretagogue', 'ipamorelin', 'cjc',
    'sermorelin', 'tesamorelin', 'mk-677', 'ibutamoren', 'water retention gh',
    'carpal tunnel', 'numb hands', 'tingling hands', 'igf']
};

/* Which playbook, if any, speaks to a given marker. Hand-mapped because there
   are twelve of them and a fuzzy match here would silently mis-route a lab
   question to the wrong protocol. */
const MARKER_PLAYBOOK = {
  hematocrit: 'High hematocrit', hgb: 'High hematocrit', rbc: 'High hematocrit',
  estradiol: 'High estradiol', e2: 'High estradiol',
  prolactin: 'High prolactin',
  ldl: 'Lipid strain', hdl: 'Lipid strain', trig: 'Lipid strain',
  apoB: 'Lipid strain', cholesterol: 'Lipid strain',
  lh: 'HPTA suppression & recovery', fsh: 'HPTA suppression & recovery'
};

function build() {
  const html = fs.readFileSync(APP, 'utf8');
  const d = declarations(html, [
    'DB', 'MARKER_REGISTRY', 'LAB_REF', 'SIDEFX',
    'INTERACTIONS', 'NEW_INTERACTIONS', 'CLINIC_INTERACTIONS',
    'TEMPLATES', 'NEW_TEMPLATES', 'FEMALE_TEMPLATES'
  ]);

  const entries = [];

  for (const cls of d.DB.classes) {
    for (const dr of cls.drugs) {
      entries.push({
        id: `compound:${dr.id}`,
        kind: 'compound',
        title: dr.name,
        subtitle: dr.aka || cls.name,
        terms: terms(dr.name, (dr.aka || '').split(/[,/]/), dr.cls, cls.name, dr.id),
        text: compoundText(dr, cls),
        route: { view: 'encyclopedia', cls: cls.id, drug: dr.id }
      });
    }
  }

  const playbookByTitle = {};
  for (const s of d.SIDEFX) playbookByTitle[s.t] = s;

  /* A renamed playbook in app.html would silently orphan its synonym list and
     quietly make that whole topic unreachable again — the exact failure this
     layer exists to fix, and one no output check would notice. */
  const orphaned = Object.keys(PLAYBOOK_SYNONYMS).filter((t) => !playbookByTitle[t]);
  if (orphaned.length) {
    throw new Error(`PLAYBOOK_SYNONYMS names playbooks app.html no longer has: ${orphaned.join(', ')}`);
  }
  const unmapped = d.SIDEFX.map((s) => s.t).filter((t) => !PLAYBOOK_SYNONYMS[t]);
  if (unmapped.length) {
    throw new Error(`playbooks with no synonyms — add them to PLAYBOOK_SYNONYMS: ${unmapped.join(', ')}`);
  }

  for (const key of Object.keys(d.MARKER_REGISTRY)) {
    const reg = d.MARKER_REGISTRY[key];
    const ref = d.LAB_REF[key];
    const pb = MARKER_PLAYBOOK[key];
    entries.push({
      id: `marker:${key}`,
      kind: 'marker',
      title: reg.label || key,
      subtitle: reg.group || 'lab marker',
      terms: terms(reg.label, reg.aliases || [], key, ref && ref.name),
      text: markerText(key, reg, ref, pb && playbookByTitle[pb] ? pb : null),
      related: pb && playbookByTitle[pb] ? [`playbook:${pb}`] : [],
      route: { view: 'bloodwork', marker: key }
    });
  }

  for (const s of d.SIDEFX) {
    entries.push({
      id: `playbook:${s.t}`,
      kind: 'playbook',
      title: s.t,
      subtitle: 'side-effect playbook',
      terms: terms(s.t, (s.t || '').split(/\s+/), PLAYBOOK_SYNONYMS[s.t] || []),
      text: playbookText(s),
      route: { view: 'sidefx', item: s.t }
    });
  }

  const allInteractions = [...d.INTERACTIONS, ...d.NEW_INTERACTIONS, ...d.CLINIC_INTERACTIONS];
  allInteractions.forEach((it, i) => {
    const drugs = it.drugs || [];
    const sev = { danger: 'Do not combine', warn: 'Use caution', info: 'Worth knowing' }[it.severity] || it.severity;
    const body = [
      `${it.title}${sev ? ` — ${sev}` : ''}`,
      drugs.length ? `Compounds: ${drugs.join(' + ')}` : '',
      it.desc || '',
      it.monitor ? `Monitoring: ${it.monitor}` : ''
    ].filter(Boolean).join('\n\n');
    entries.push({
      id: `interaction:${i}`,
      kind: 'interaction',
      title: it.title || drugs.join(' + ') || 'Interaction',
      subtitle: drugs.join(' + ') || 'interaction warning',
      severity: it.severity || null,
      terms: terms(it.title, drugs, drugs.join(' '), 'interaction'),
      text: body,
      route: { view: 'interactions' }
    });
  });

  const allTemplates = [...d.TEMPLATES, ...d.NEW_TEMPLATES, ...d.FEMALE_TEMPLATES];
  allTemplates.forEach((t) => {
    const comps = t.compounds || [];
    const body = [
      `${t.name}${t.level ? ` — ${t.level}` : ''}${t.duration ? `, ${t.duration}` : ''}`,
      t.desc || '',
      comps.length ? 'Compounds:\n' + comps.map((c) =>
        `• ${c.name}: ${c.dose}${c.freq ? ` — ${c.freq}` : ''}${c.notes ? ` (${c.notes})` : ''}`).join('\n') : '',
      t.pct ? `PCT: ${t.pct}` : '',
      t.bloodwork ? `Bloodwork: ${t.bloodwork}` : '',
      t.notes ? `Notes: ${t.notes}` : ''
    ].filter(Boolean).join('\n\n');
    entries.push({
      id: `template:${t.id}`,
      kind: 'template',
      title: t.name,
      subtitle: [t.level, t.duration].filter(Boolean).join(' · ') || 'protocol template',
      /* The compounds a protocol uses are matchable too: someone asking about
         "first TRT protocol" and someone asking "what do I stack with HCG"
         should both be able to land here. */
      terms: terms(t.name, t.id, comps.map((c) => c.name), 'protocol', 'template'),
      text: body,
      route: { view: 'protocol', template: t.id }
    });
  });

  const index = {
    version: 1,
    /* Content hash, not a timestamp: a rebuild that changes nothing must
       produce a byte-identical file or --check can never pass. */
    generated: null,
    counts: entries.reduce((a, e) => ((a[e.kind] = (a[e.kind] || 0) + 1), a), {}),
    entries
  };
  const body = JSON.stringify(index, null, 1);
  index.generated = require('crypto').createHash('sha256').update(body).digest('hex').slice(0, 16);
  return JSON.stringify(index, null, 1) + '\n';
}

function main() {
  const check = process.argv.includes('--check');
  const out = build();
  if (check) {
    if (!fs.existsSync(OUT)) {
      console.error(`missing ${path.relative(ROOT, OUT)} — run: node scripts/build-brain.js`);
      process.exit(1);
    }
    if (fs.readFileSync(OUT, 'utf8') !== out) {
      console.error(`${path.relative(ROOT, OUT)} is stale — app.html changed. Run: node scripts/build-brain.js`);
      process.exit(1);
    }
    const n = JSON.parse(out).entries.length;
    console.log(`brain index up to date (${n} entries)`);
    return;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out);
  const idx = JSON.parse(out);
  console.log(`wrote ${path.relative(ROOT, OUT)} — ${idx.entries.length} entries`, idx.counts);
  console.log(`size: ${(Buffer.byteLength(out) / 1024).toFixed(0)}KB`);
}

main();
