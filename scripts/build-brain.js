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

/* The narrative layer for lab markers. app.html's MARKER_REGISTRY is a parsing
   layer — LOINC codes, aliases, unit conversions — and LAB_REF adds ranges.
   Neither says what a value means, which is the actual question. Authored
   separately because it is written content on a different revision cadence
   from the app's code. */
const MARKER_GUIDE = require(path.join(ROOT, 'assets', 'brain', 'markers.js'));

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
/* Words that must never become a term on their own.
 *
 * terms() explodes an entry's title into single words so that "prolactin"
 * reaches "High prolactin". That works while titles are noun phrases, and
 * breaks the moment a title reads like a sentence — the rehab entries added
 * titles such as "Load management and getting back to training", which put the
 * bare word "back" into the index. "bloods came back bad" then matched a low
 * back pain entry, scoring 130 and answering confidently, because "back" is a
 * real word in both sentences and a lexical matcher cannot tell the senses
 * apart.
 *
 * The multi-word title stays a term, which is specific and safe. Only the
 * generic single words are dropped. A word belongs here when it carries no
 * topic by itself — note that "back" is still reachable through the explicit
 * multi-word synonyms 'back pain', 'low back pain' and 'lower back'. */
const STOP = new Set(['high', 'low', 'the', 'and', 'for', 'with', 'signs', 'early',
  'rising', 'crashed', 'effects', 'reaction', 'reactions', 'site', 'recovery', 'a', 'of',
  'back', 'getting', 'around', 'management', 'to', 'training', 'protocols', 'sore',
  'loading', 'strain', 'or', 'that',
  /* Second wave, from the nutrition titles. "Meal timing and fasting: what
     matters" put the bare word "what" into the index, and "what" matches almost
     any question — it answered "I'm 16 and I want to start my first cycle" with
     a meal-timing entry, and pulled a PSA question away from its marker.
     Three separate content additions have now each shipped this same bug, which
     says the fault is the pattern rather than any one title: an authored entry
     titled like a sentence leaks its connective words into the term list. The
     explicit synonym lists are what these kinds should be reached by. */
  'what', 'matters', 'actually', 'buys', 'helps', 'making', 'plan', 'much',
  'works', 'short', 'list', 'limit', 'stick', 'rates', 'realistic', 'size',
  'breaks', 'rate', 'eating', 'prep', 'meal']);

/* Abbreviations that belong to a lab ANALYTE first and a drug second.

   "TSH is 3.8 with a normal free T4" was grounding the Levothyroxine monograph,
   and the eval showed the cost: handed a thyroid-drug monograph as supporting
   material, the model steered toward starting thyroid medication for a value
   inside the reference range. The mechanism is that no marker carries the bare
   form — they are all qualified ("free t4", "total t4", "t4, total") — while
   compound:t4 carries "t4" from both its id and its aka list. So the one token
   the question and the drug share is a token no marker competes for, and the
   drug wins it uncontested.

   Someone who means the medicine types levothyroxine, Synthroid or LT4, and all
   three stay terms. Someone who types a bare "T4" means the lab value.

   This is a list rather than a rule because the collision is not general: DHEA
   (compound) against DHEA-S (marker) is the same SHAPE and must NOT be
   collapsed — they are different molecules and "dhea" should reach the
   compound. Only add an entry here when the bare form genuinely names the
   analyte in ordinary use. */
const ANALYTE_ABBREV = new Set(['t3', 't4']);

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
  /* Drop shrapnel from splitting chemical names. Fisetin's title carries its
     IUPAC form, which split into the terms "3", "7" and "3'" — a bare number
     is exactly the "16 8" bug that once answered "I'm 16 and want to start my
     first cycle" with an intermittent-fasting card. The matcher's numericOnly
     guard already refuses to match these, so this is the same rule enforced one
     layer earlier: junk that cannot match should not be in the index at all,
     because the only thing standing between it and a bad match is that one
     guard continuing to exist.

     The test is a SINGLE token carrying no letter. It has to be that precise:
     a first attempt at this required two letters anywhere in the term and
     silently deleted every term of the 16:8 fasting entry ("16 8", "168"),
     which is a real protocol name people type. The probe caught it. A
     multi-token numeric term like "16 8" is a name; a lone "3" is debris. */
  return [...out].filter((t) => /[a-z]/.test(t) || /\s/.test(t));
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

function markerText(key, reg, ref, playbook, guide) {
  const p = [];
  const label = (reg && reg.label) || (ref && ref.name) || key;
  p.push(`${label} — lab marker`);
  /* The authored guide first: it is what actually answers the question. The
     registry's ranges and assay notes follow as supporting detail. */
  if (guide) {
    if (guide.what) p.push(guide.what);
    if (guide.why) p.push('Why it matters here: ' + guide.why);
    if (guide.read) p.push('How to read it: ' + guide.read);
    if (guide.high) p.push('When it is high: ' + guide.high);
    if (guide.low) p.push('When it is low: ' + guide.low);
    if (guide.pitfall) p.push('What invalidates the result: ' + guide.pitfall);
  }
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
  /* The evidence note carries the uncertainty language — "no trial has ever",
     "unlicensed for this purpose". Those are exactly the phrases someone types
     when they are trying to find out whether a practice is actually supported,
     so it belongs in the searchable text and not only on screen. */
  if (s.ev) p.push('What the evidence says: ' + s.ev);
  return p.join('\n\n');
}

/* Rehab entries carry their protocol numbers and their pain rule, and both are
   what someone is actually searching for ("how many sets", "how much pain is
   too much"). The `avoid` field earns its place in the indexed text too: on
   these three topics the most useful sentence is often what NOT to do, and it
   is where the strongest evidence sits — placebo-controlled surgery trials and
   the one experimental test of ACWR. */
function rehabText(r) {
  const p = [`${r.t} — ${r.what || ''}`];
  if (r.signs) p.push('What it looks like: ' + r.signs);
  if (lines(r.prot).length) p.push('Protocols and parameters:\n' + r.prot.map((x) => `• ${x}`).join('\n'));
  if (r.rule) p.push('How to judge progression: ' + r.rule);
  if (r.avoid) p.push('What not to do: ' + r.avoid);
  if (r.esc) p.push('Escalate / seek care: ' + r.esc);
  if (r.ev) p.push('What the evidence says: ' + r.ev);
  return p.join('\n\n');
}

/* Nutrition entries carry the numbers people are actually hunting for — g/kg,
   percent per week, kcal deficits — so the protocol list and the rule belong in
   the searchable text. `avoid` matters as much here as in rehab: on this topic
   the most useful sentence is often "this popular thing does nothing". */
function nutritionText(n) {
  const p = [`${n.t} — ${n.what || ''}`];
  if (n.signs) p.push('Usually asked as: ' + n.signs);
  if (lines(n.prot).length) p.push('What the trials found:\n' + n.prot.map((x) => `• ${x}`).join('\n'));
  if (lines(n.howto).length) p.push('How to actually do it:\n' + n.howto.map((x) => `• ${x}`).join('\n'));
  if (n.rule) p.push('The rule of thumb: ' + n.rule);
  if (n.avoid) p.push('What not to do: ' + n.avoid);
  if (n.ev) p.push('What the evidence says: ' + n.ev);
  return p.join('\n\n');
}

/* Nutrition questions arrive in plain language and in numbers — "how much
   protein", "how fast should I cut", "is creatine worth it", "16:8". The
   synonym lists carry both, plus the branded shorthand people actually type. */
const NUTRITION_SYNONYMS = {
  'Protein: how much actually helps': ['protein', 'how much protein', 'protein intake',
    'grams of protein', 'g/kg', 'protein per day', 'protein per meal', 'whey', 'casein',
    'protein powder', 'protein shake', 'macros', 'macro split'],
  'Cutting: rate, deficit and what breaks': ['cut', 'cutting', 'deficit', 'calorie deficit',
    'fat loss', 'losing fat', 'lose fat', 'how fast should i cut', 'weight loss rate',
    'losing muscle', 'muscle loss', 'red-s', 'reds', 'low energy availability', 'diet down',
    'shredding', 'getting lean'],
  'Bulking: surplus size and realistic gain rates': ['bulk', 'bulking', 'surplus',
    'calorie surplus', 'gaining', 'mass gain', 'lean bulk', 'dirty bulk', 'how fast can i gain',
    'muscle gain rate', 'gaining weight', 'offseason'],
  'Eating on a GLP-1': ['glp1', 'glp-1', 'semaglutide', 'ozempic', 'wegovy', 'tirzepatide',
    'mounjaro', 'zepbound', 'retatrutide', 'losing muscle on glp1', 'muscle loss glp1',
    'nausea', 'what to eat on semaglutide', 'protein on glp1'],
  'Meal timing and fasting: what matters': ['meal timing', 'anabolic window', 'timing',
    'intermittent fasting', 'fasting', '16:8', 'time restricted', 'omad', 'breakfast',
    'pre workout meal', 'post workout meal', 'fasted cardio', 'fasted training',
    'training fasted', 'cardio fasted', 'carbs before training', 'carb timing',
    'carbs around training', 'carbs after training', 'when to eat carbs', 'meal frequency',
    'how many meals'],
  'What to limit, and what it actually buys': ['what to avoid', 'foods to avoid', 'avoid',
    'sodium', 'salt', 'alcohol', 'drinking', 'saturated fat', 'fiber', 'fibre', 'processed food',
    'ultra processed', 'dash diet', 'diet for cholesterol', 'diet for blood pressure',
    'lower my cholesterol', 'lower my blood pressure', 'eating on trt', 'diet on trt',
    'change how i eat', 'change my diet', 'diet on cycle', 'eat differently'],
  'Supplements: the short list that works': ['supplement', 'supplements', 'creatine', 'caffeine',
    'beta alanine', 'citrulline', 'hmb', 'bcaa', 'bcaas', 'eaa', 'eaas', 'leucine', 'preworkout',
    'pre workout', 'is creatine worth it', 'what supplements should i take', 'contamination',
    'tainted supplement'],
  'How to count macros': ['count macros', 'counting macros', 'macros', 'macro targets',
    'how many calories', 'calorie target', 'tdee', 'maintenance calories', 'set my macros',
    'tracking food', 'track my food', 'food scale', 'weighing food', 'raw or cooked',
    'how many grams of protein should i eat', 'calorie deficit calculator'],
  'Building a meal plan, and what to eat for a cut or a bulk': ['meal plan', 'build a meal plan',
    'what should i eat', 'what to eat', 'food choices', 'cutting foods', 'bulking foods',
    'foods for cutting', 'foods for bulking', 'high volume foods', 'volume eating',
    'calorie dense', 'what do i eat on a cut', 'what do i eat to bulk', 'portion size',
    'how much chicken', 'how much rice', 'chicken', 'chicken breast', 'rice', 'oats',
    'grocery list', 'shopping list', 'per meal', 'protein portion'],
  'Meal prep and making a plan stick': ['meal prep', 'meal prepping', 'meal plan', 'meal planning',
    'what should i eat', 'diet plan', 'food prep', 'adherence', 'falling off', 'cheat meal',
    'refeed', 'diet break', 'energy density', 'satiety', 'staying full', 'hungry all the time']
};

/* Rehab questions arrive in gym language, not clinical language — "tennis
   elbow", "golfers elbow", "back exercises without biceps", "deload". Without
   this the three rehab entries are unreachable for exactly the people who need
   them. */
const REHAB_SYNONYMS = {
  'Tendon loading protocols': ['tendon', 'tendinitis', 'tendonitis', 'tendinopathy',
    'patellar', 'jumpers knee', 'achilles', 'tennis elbow', 'golfers elbow',
    'lateral epicondylitis', 'eccentric', 'eccentrics', 'heavy slow resistance', 'hsr',
    'isometric', 'isometrics', 'knee pain squat', 'tendon pain', 'rehab tendon'],
  'Training around a sore elbow or shoulder': ['elbow', 'shoulder', 'bicep', 'biceps',
    'distal bicep', 'bicep tendinitis', 'elbow pain', 'shoulder pain', 'shoulder impingement',
    'impingement', 'rotator cuff', 'back exercises', 'back without biceps', 'pull ups grip',
    'lat pulldown', 'straps', 'lifting straps', 'fat grips', 'subacromial', 'decompression',
    'curl grip', 'pulling exercises', 'row', 'rows'],
  'Load management and getting back to training': ['deload', 'load management', 'acwr',
    'acute chronic workload', 'return to training', 'return to sport', 'return to running',
    'back pain', 'low back pain', 'lower back', 'lumbar', 'overtraining', 'training through pain',
    'how much pain is ok', 'train through', 'train through it', 'should i stop training',
    'push through', 'rest or train', 'niggle', 'niggles', 'tendon rupture', 'rupture risk', 'bpc',
    'bpc-157', 'bpc157', 'ibuprofen', 'nsaid', 'nsaids', 'painkillers gains']
};

/* How people actually phrase these. The playbook titles are clinical ("High
   prolactin", "HPTA suppression & recovery") and nobody types those — they
   type "gyno", "crashed my e2", "balls shrunk". Without this layer the twelve
   playbooks are unreachable from a question, which is most of why these
   questions were going to the paid assistant in the first place.
   Hand-written rather than derived: there are twelve, and a fuzzy match that
   sends a prolactin question to the estradiol protocol is worse than no
   match at all. */
/* Community short names, keyed by compound id.
 *
 * A compound is indexed from terms(dr.name, dr.aka, dr.id), so a short name is
 * reachable only when it happens to BE the internal id. That is why "tirz",
 * "sema", "mt2" and "ipa" resolve and "reta" does not — and "reta" appears in
 * four of the eleven real questions collected from the audience. "tren" and
 * "trenbolone" reached nothing either: the only reason "tren cough" ever worked
 * was that "tren a" collapsed to ["tren"] under the term-word length filter,
 * which is the same fragment bug that served the C-Peptide lab card to "what
 * peptide for hot flashes". Closing that hole correctly meant these names had to
 * become real terms rather than accidents.
 *
 * Also here: forms the audience writes that the canonical name does not cover —
 * the Arabic-numeral "melanotan 2" against the indexed Roman "Melanotan II", and
 * "ghcku", a transposition common enough to appear in this small sample. */
const COMPOUND_SYNONYMS = {
  retatrutide: ['reta'],
  trenace: ['tren', 'trenbolone', 'tren ace'],
  trenenan: ['tren', 'trenbolone', 'tren enth'],
  mt2: ['melanotan 2', 'melanotan2'],
  ghkcu: ['ghcku', 'ghk cu'],
  nad: ['nad plus'],
  /* The title is "Levothyroxine (T4)", so the bare drug name was never a term:
     the parenthesised form and the brand names were, and "levothyroxine" alone
     reached nothing. Same shape for the T3 entry. */
  t4: ['levothyroxine'],
  t3: ['liothyronine']
};

/* Storage is the highest-frequency question class in the audience and had zero
   entries in a 327-entry index, so "I accidentally left my peptides out
   overnight, are they garbage now?" reached the model with nothing attached —
   and before the category-term fix, was answered on-device with four unrelated
   compounds.
   The answer already existed in TL_STORAGE, which the app renders in its own
   storage panel. These entries are GENERATED from it rather than written again,
   for the same reason the brain index is generated from app.html: a second copy
   of a storage rule is a second thing to get wrong, and a stale one reads as
   authoritative. Only the terms are authored, because the words people use for
   this ("garbage", "hot car", "left it out") appear nowhere in the rules. */
/* The words people use when they are in one of these situations, which are not
   the words in the titles. Someone who has had cancer writes "I had thyroid
   cancer" or "since my treatment", never "growth signalling". */
const REFERRAL_SYNONYMS = {
  'A cancer history, and anything that pushes growth signalling': [
    /* Plurals and the way people actually write it. One real post says "I had 2
       cancers. Thyroid and endometrial" — whole-phrase matching means "cancer"
       does not reach "cancers", and that one word was the whole difference
       between reaching this entry and not. */
    'cancer', 'cancers', 'had cancer', 'had cancers', 'two cancers', 'had 2 cancers',
    'cancer history', 'history of cancer', 'in remission', 'remission', 'post cancer',
    'after cancer', 'cancer treatment', 'cancer treatments', 'had treatment',
    'survivor', 'chemo', 'chemotherapy', 'radiation', 'tumor', 'tumour', 'oncologist',
    'oncology', 'malignancy', 'thyroid cancer', 'breast cancer', 'prostate cancer',
    'endometrial cancer', 'melanoma', 'lymphoma', 'leukemia', 'is it safe after cancer',
    'safe with cancer history', 'growth hormone and cancer', 'igf-1 and cancer',
    'peptides after cancer', 'bpc after cancer', 'hgh cancer'],
  'A change to a medication someone else prescribed': [
    /* Deliberately NOT bare "prescription" or "prescribed". Those matched "can I
       just use my wife's testosterone prescription instead of getting my own",
       which is a different question with a different hazard — someone else's dose,
       no indication, no monitoring — and a generic change-your-medication card is
       a weak answer to it. The terms here name the ACTION of adding, stopping or
       changing your own. */
    'my prescription', 'should i add', 'should i stop',
    'should i increase', 'change my dose', 'my doctor prescribed', 'my prescriber',
    'lisinopril', 'telmisartan', 'amlodipine', 'losartan', 'statin', 'blood pressure medication',
    'bp meds', 'thyroid medication', 'levothyroxine dose', 'add a medication',
    'stop taking my', 'come off my'],
  'Several conditions, several compounds, and a question that needs all of them': [
    'multiple conditions', 'several compounds', 'stack with my medication',
    'autoimmune', 'hashimotos', 'hashimoto', 'lupus', 'crohns', 'too many variables',
    'interacts with my', 'is this safe with my condition', 'my conditions']
};

/* Settled first, then why the rest is out of reach, then what to bring. The
   order is the point: a referral that leads with "see your doctor" is the answer
   people already had. */
function referralText(r) {
  const p = [];
  p.push(`${r.t} \u2014 when the honest answer needs someone who can examine you.`);
  if (r.when) p.push('', 'When this applies:', r.when);
  if (r.settled) p.push('', 'What is settled, and worth having first:', r.settled);
  if (r.why) p.push('', 'What puts the rest out of a chat\u2019s reach:', r.why);
  if (r.bring) p.push('', 'What to bring:', r.bring);
  if (r.ask) p.push('', 'What to ask:', r.ask);
  if (r.ev) p.push('', 'Evidence:', r.ev);
  return p.join('\n');
}

const STORAGE_SYNONYMS = {
  aq: ['peptide storage', 'store peptides', 'storing peptides', 'lyophilized', 'lyophilised',
    'powder vial', 'reconstituted storage', 'how long does a mixed vial last', 'mixed vial',
    'bacteriostatic water storage', '28 days', 'fridge', 'refrigerate', 'freezer', 'kit of vials',
    /* Explicit rather than inherited from the label, which is no longer split into
       words. These are the words the questions actually use. */
    'reconstituted', 'reconstitute', 'room temp', 'room temperature', 'can i freeze',
    'freeze a vial', 'freeze it', 'keep it cold', 'how cold'],
  oil: ['oil storage', 'testosterone storage', 'store testosterone', 'oil vial cloudy',
    'crystals in vial', 'crystals', 'crystallized', 'crystallised', 'cloudy vial', 'cloudy',
    'refrigerate testosterone', 'cold oil', 'oil went cloudy'],
  oral: ['tablet storage', 'capsule storage', 'store pills', 'desiccant', 'bathroom cabinet',
    'humidity pills', 'tablets', 'capsules', 'where do i keep my tablets', 'keep my pills',
    'store my tablets', 'store my capsules'],
  susp: ['suspension storage', 'settled vial', 'shake the vial', 'resuspend', 'clumped'],
  topical: ['cream storage', 'gel storage', 'store cream', 'beyond use date', 'airless pump'],
  excursion: ['left out', 'left it out', 'left them out', 'out overnight', 'overnight',
    'room temp overnight', 'is it ruined', 'are they ruined', 'garbage', 'still good',
    'still ok', 'go bad', 'gone bad', 'spoiled', 'wasted', 'hot car', 'left in the car',
    'mailbox', 'porch', 'shipping heat', 'melted', 'thawed', 'accidentally froze',
    'froze my peptides', 'forgot to refrigerate', 'not refrigerated', 'unrefrigerated',
    'did i ruin', 'wasted my vial', 'throw it away', 'discard']
};

/* One paragraph per field, in the order someone actually needs them. The class
   rules read before/after/avoid; the excursion entry reads fork first, because
   which vial you have changes every line under it. */
function storageText(key, c, caveat) {
  const p = [];
  p.push(c.fork
    ? `${c.label} — whether a vial that was stored wrong is still usable.`
    : `${c.label} — how to store it, and what ruins it.`);
  if (c.fork) {
    p.push('', 'Which vial is it?', c.fork);
    if (c.powder) p.push('', 'If it was still sealed powder:', c.powder);
    if (c.mixed) p.push('', 'If it was already mixed:', c.mixed);
    if (c.frozen) p.push('', 'If it froze:', c.frozen);
    if (c.inspect) p.push('', 'What to look for:', c.inspect);
    if (c.honest) p.push('', 'What cannot be known from here:', c.honest);
  } else {
    if (c.before) p.push('', 'Before opening or mixing:', c.before);
    if (c.after) p.push('', 'After opening or mixing:', c.after);
    if (c.premixed) p.push('', 'If it came ready-mixed:', c.premixed);
    if (c.avoid) p.push('', 'What ruins it:', c.avoid);
  }
  p.push('', caveat);
  return p.join('\n');
}

const PLAYBOOK_SYNONYMS = {
  /* Stack questions are the single most common shape in the bodybuilding
     communities this app is aimed at, and until this entry existed the index
     had no answer to any of them — a4/a6 in the eval retrieved per-compound
     monographs, which answer "what is trenbolone" and not "what happens if I
     run these four". Terms stay deliberately multi-word or combination-shaped:
     a bare compound name here would hijack every single-compound question. */
  'Multi-compound stack risk': ['stack', 'stacking', 'stack safe', 'is this stack safe',
    'good stack', 'stack advice', 'cycle stack', 'compound stack', 'run together',
    'running together', 'all together', 'at the same time', 'multiple compounds',
    'two 19-nors', 'two 19 nors', 'tren and npp', 'tren and deca', 'test tren anavar',
    'test tren', 'tren npp', 'npp or eq', 'eq or npp', 'eq better than npp',
    'add another compound', 'second compound', 'third compound', 'four compounds',
    'three compounds', 'multi compound', 'polypharmacy'],
  'Liver strain': ['liver', 'liver damage', 'liver values', 'liver enzymes', 'alt', 'ast',
    'alt high', 'ast high', 'ggt', 'bilirubin', 'jaundice', 'yellow eyes', 'hepatotoxic',
    'hepatotoxicity', 'liver toxic', 'liver support', 'tudca', 'nac', '17aa', '17-aa',
    'methylated', 'oral steroid liver', 'cholestasis', 'liver panel', 'lft', 'lfts'],
  'High prolactin': ['prolactin', 'prolactinoma', 'cabergoline', 'caber', 'lactation',
    'nipple discharge', 'dead libido', 'no libido', '19-nor', 'deca dick', 'tren dick',
    'sex drive', 'no sex drive', 'low sex drive', 'cant get hard', 'erectile'],
  'High estradiol': ['estradiol', 'e2', 'estrogen', 'high e2', 'estrogen high',
    'water retention', 'bloating', 'emotional', 'puffy', 'aromatase', 'anastrozole', 'arimidex'],
  'Crashed estradiol': ['crashed e2', 'crashed estrogen', 'low e2', 'e2 too low',
    'joint pain', 'dry joints', 'no libido low e2', 'anhedonia', 'crashed my estrogen'],
  'High hematocrit': ['hematocrit', 'hct', 'hemoglobin', 'hgb', 'thick blood', 'blood thick',
    'polycythemia', 'erythrocytosis', 'donate blood', 'phlebotomy', 'blood donation', 'rbc',
    'flushed', 'flushed face', 'red face', 'face is red', 'ruddy'],
  'Rising blood pressure': ['blood pressure', 'bp', 'hypertension', 'high blood pressure',
    'systolic', 'diastolic', 'headaches'],
  'Lipid strain': ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'trigs', 'apob', 'lipids',
    'lipid panel', 'cardiovascular', 'heart risk'],
  'Early gyno signs': ['gyno', 'gynecomastia', 'nipple', 'nipples', 'nipple sensitivity',
    'nipple pain', 'itchy nipples', 'lump behind nipple', 'puffy nipples', 'bitch tits',
    'raloxifene', 'tamoxifen', 'nolvadex'],
  'HPTA suppression & recovery': ['hpta', 'suppression', 'suppressed', 'shut down', 'shutdown',
    'testicular atrophy', 'balls shrunk', 'ball shrinkage', 'restart', 'recovery', 'pct',
    'post cycle', 'fertility', 'sperm', 'lh', 'fsh', 'hcg', 'natural production',
    'balls', 'nuts', 'testicles', 'testicle', 'smaller', 'shrinking', 'shrunk'],
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
  hct: 'High hematocrit', hgb: 'High hematocrit', rbc: 'High hematocrit',
  e2: 'High estradiol', estrone: 'High estradiol',
  prolactin: 'High prolactin',
  ldl: 'Lipid strain', hdl: 'Lipid strain', trig: 'Lipid strain',
  apob: 'Lipid strain', chol: 'Lipid strain', nonhdl: 'Lipid strain',
  lh: 'HPTA suppression & recovery', fsh: 'HPTA suppression & recovery',
  tott: 'HPTA suppression & recovery'
};

function build() {
  const html = fs.readFileSync(APP, 'utf8');
  const d = declarations(html, [
    'DB', 'MARKER_REGISTRY', 'LAB_REF', 'SIDEFX', 'REHAB', 'NUTRITION', 'REFERRAL',
    'INTERACTIONS', 'NEW_INTERACTIONS', 'CLINIC_INTERACTIONS',
    'TEMPLATES', 'NEW_TEMPLATES', 'FEMALE_TEMPLATES', 'TL_STORAGE'
  ]);

  const entries = [];

  for (const cls of d.DB.classes) {
    for (const dr of cls.drugs) {
      entries.push({
        id: `compound:${dr.id}`,
        kind: 'compound',
        title: dr.name,
        subtitle: dr.aka || cls.name,
        /* Name, alias and id — NOT dr.cls or cls.name. The app's own encyclopedia
           search matches on class because browsing by class is useful: "show me
           the peptides" should list them. Answering by class is not. Every
           compound in a class carried its class name as a search term, so the
           bare word "peptides" was a term on 23 entries, and "I accidentally left
           my peptides out overnight, are they garbage now?" retrieved four
           arbitrary compounds — cjc, kpv, ll37, ss31 — cleared the coverage bar
           on the strength of that one word, and was shown to the user as a free
           on-device answer. A term that names a category cannot discriminate
           between its members; it can only pick some at random. */
        /* ANALYTE_ABBREV is applied to COMPOUNDS only. The bare abbreviation
           is dropped from the drug so the lab marker is the entry a lab
           question reaches; a marker that ever wants the bare form is free to
           carry it. */
        terms: terms(dr.name, (dr.aka || '').split(/[,/]/), dr.id, COMPOUND_SYNONYMS[dr.id] || [])
          .filter((t) => !ANALYTE_ABBREV.has(t)),
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
  /* Same guard the playbooks get: a renamed or removed compound id would leave
     its synonyms silently pointing at nothing, and the short name the audience
     actually types would go quiet again with no test failing. */
  {
    const ids = new Set();
    for (const cls of d.DB.classes) for (const dr of cls.drugs) ids.add(dr.id);
    const gone = Object.keys(COMPOUND_SYNONYMS).filter((k) => !ids.has(k));
    if (gone.length) {
      throw new Error(`COMPOUND_SYNONYMS names compound ids that no longer exist: ${gone.join(', ')}`);
    }
  }

  const orphaned = Object.keys(PLAYBOOK_SYNONYMS).filter((t) => !playbookByTitle[t]);
  if (orphaned.length) {
    throw new Error(`PLAYBOOK_SYNONYMS names playbooks app.html no longer has: ${orphaned.join(', ')}`);
  }
  /* Every citation on a playbook must resolve to a record that was actually
     retrieved and checked. The research files are the checked set: every PMID
     in claims.json was confirmed against PubMed with get_article_metadata, and
     every setid in labels.json came back from the DailyMed retrieval.

     This exists because a plausible-looking identifier is the easiest thing in
     the world to write and the hardest to notice — one was typed into this very
     file during authoring and only a check like this caught it. A citation that
     does not resolve is worse than no citation: it borrows authority it has not
     earned. */
  {
    const research = path.join(ROOT, 'assets', 'brain', 'research');
    const claims = JSON.parse(fs.readFileSync(path.join(research, 'claims.json'), 'utf8')).claims;
    const labels = JSON.parse(fs.readFileSync(path.join(research, 'labels.json'), 'utf8')).labels;
    /* Nutrition arrived as its own research pass and lives in its own file. Both
       are equally the checked set — a citation is publishable when it appears in
       research that was actually retrieved and verified, whichever pass ran it. */
    const nutrition = JSON.parse(fs.readFileSync(path.join(research, 'nutrition.json'), 'utf8')).claims;
    const pmids = new Set([...claims, ...nutrition].map((c) => String(c.pmid || '').trim()));
    const setids = new Set(labels.map((l) => String(l.dailymedUrl || '').split('setid=')[1]).filter(Boolean));
    const bad = [];
    for (const s of [...d.SIDEFX, ...d.REHAB, ...d.NUTRITION, ...(d.REFERRAL || [])]) {
      for (const row of (s.src || [])) {
        if (!Array.isArray(row) || row.length !== 2 || !row[0] || !row[1]) {
          bad.push(`${s.t}: malformed src row ${JSON.stringify(row)} — expected [identifier, what it shows]`);
          continue;
        }
        const [id] = row;
        if (String(id).indexOf('label:') === 0) {
          if (!setids.has(String(id).slice(6))) bad.push(`${s.t}: DailyMed setid ${String(id).slice(6)} is not in labels.json`);
        } else if (!pmids.has(String(id))) {
          bad.push(`${s.t}: PMID ${id} is in no research file — it was never retrieved or checked`);
        }
      }
      /* An evidence note makes a claim about what the literature shows, so it
         must cite. A `howto` is craft — how to weigh food, how to lay out a
         plan — and there is no paper to cite for it, nor should there be.
         Kept as separate fields precisely so the distinction is visible to the
         reader rather than blurred into one voice. */
      if (s.ev && !(s.src || []).length) bad.push(`${s.t}: has an evidence note but cites nothing`);
    }
    if (bad.length) {
      throw new Error('playbook citations do not resolve to retrieved research:\n  ' + bad.join('\n  '));
    }
  }

  const unmappedNutrition = d.NUTRITION.map((n) => n.t).filter((t) => !NUTRITION_SYNONYMS[t]);
  if (unmappedNutrition.length) {
    throw new Error(`nutrition entries with no synonyms — add them to NUTRITION_SYNONYMS: ${unmappedNutrition.join(', ')}`);
  }
  const unmappedRehab = d.REHAB.map((r) => r.t).filter((t) => !REHAB_SYNONYMS[t]);
  if (unmappedRehab.length) {
    throw new Error(`rehab entries with no synonyms — add them to REHAB_SYNONYMS: ${unmappedRehab.join(', ')}`);
  }
  const unmapped = d.SIDEFX.map((s) => s.t).filter((t) => !PLAYBOOK_SYNONYMS[t]);
  if (unmapped.length) {
    throw new Error(`playbooks with no synonyms — add them to PLAYBOOK_SYNONYMS: ${unmapped.join(', ')}`);
  }

  /* Every marker must have a guide entry. A marker added to app.html without
     one would silently ship as a bare reference range again — which is the
     exact gap this file was written to close, and nothing else would catch it. */
  const missingGuide = Object.keys(d.MARKER_REGISTRY).filter((k) => !MARKER_GUIDE[k]);
  if (missingGuide.length) {
    throw new Error(`markers with no guide entry — add them to assets/brain/markers.js: ${missingGuide.join(', ')}`);
  }
  /* A mistyped key here fails silently — the playbook link simply never
     appears, and the marker ships without the half of the answer that says
     what to do. Both sides of the map get checked. */
  const badMarkerKey = Object.keys(MARKER_PLAYBOOK).filter((k) => !d.MARKER_REGISTRY[k]);
  if (badMarkerKey.length) {
    throw new Error(`MARKER_PLAYBOOK names markers that do not exist: ${badMarkerKey.join(', ')}`);
  }
  const badPlaybookName = Object.values(MARKER_PLAYBOOK).filter((t) => !playbookByTitle[t]);
  if (badPlaybookName.length) {
    throw new Error(`MARKER_PLAYBOOK points at playbooks that do not exist: ${[...new Set(badPlaybookName)].join(', ')}`);
  }

  const staleGuide = Object.keys(MARKER_GUIDE).filter((k) => !d.MARKER_REGISTRY[k]);
  if (staleGuide.length) {
    throw new Error(`markers.js describes markers app.html no longer has: ${staleGuide.join(', ')}`);
  }

  for (const key of Object.keys(d.MARKER_REGISTRY)) {
    const reg = d.MARKER_REGISTRY[key];
    const ref = d.LAB_REF[key];
    const pb = MARKER_PLAYBOOK[key];
    const guide = MARKER_GUIDE[key];
    /* Cross-marker links are as much of the answer as the marker itself: a
       raised ALT means something different next to a raised GGT than next to a
       raised CK, and creatinine means something different next to cystatin C. */
    const rel = (guide.related || []).filter((r) => d.MARKER_REGISTRY[r]).map((r) => `marker:${r}`);
    if (pb && playbookByTitle[pb]) rel.unshift(`playbook:${pb}`);
    entries.push({
      id: `marker:${key}`,
      kind: 'marker',
      title: reg.label || key,
      subtitle: reg.group || 'lab marker',
      terms: terms(reg.label, reg.aliases || [], key, ref && ref.name),
      text: markerText(key, reg, ref, pb && playbookByTitle[pb] ? pb : null, guide),
      related: rel,
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
      /* Carried into the index so the free in-app answer can show its sources.
         Without this the app would state findings with nothing behind them,
         which is the opposite of the point. */
      src: s.src || [],
      route: { view: 'sidefx', item: s.t }
    });
  }

  for (const r of d.REHAB) {
    entries.push({
      id: `rehab:${r.t}`,
      kind: 'rehab',
      title: r.t,
      subtitle: 'rehab and load guidance',
      terms: terms(r.t, (r.t || '').split(/\s+/), REHAB_SYNONYMS[r.t] || []),
      text: rehabText(r),
      src: r.src || [],
      route: { view: 'rehab', item: r.t }
    });
  }

  for (const n of d.NUTRITION) {
    entries.push({
      id: `nutrition:${n.t}`,
      kind: 'nutrition',
      title: n.t,
      subtitle: 'nutrition guidance',
      terms: terms(n.t, (n.t || '').split(/\s+/), NUTRITION_SYNONYMS[n.t] || []),
      text: nutritionText(n),
      src: n.src || [],
      route: { view: 'nutrition', item: n.t }
    });
  }

  for (const r of (d.REFERRAL || [])) {
    if (!REFERRAL_SYNONYMS[r.t]) {
      throw new Error(`REFERRAL entry "${r.t}" has no REFERRAL_SYNONYMS list — its title ` +
        'is not how anyone describes their own situation, so without terms it is unreachable.');
    }
    entries.push({
      id: `referral:${r.t}`,
      kind: 'referral',
      title: r.t,
      subtitle: 'when to involve a clinician',
      terms: terms(r.t, REFERRAL_SYNONYMS[r.t] || []),
      text: referralText(r),
      src: r.src || [],
      route: { view: 'referral', item: r.t }
    });
  }

  /* Storage, generated from TL_STORAGE so the brain and the app's own storage
     panel cannot disagree. Overrides are skipped: insulin and larazotide are
     answered by their compound entries, and a second card saying almost the
     same thing is how a user ends up comparing two of our own answers. */
  {
    const st = d.TL_STORAGE || {};
    const cls = Object.assign({}, st.classes || {});
    if (st.excursion) cls.excursion = st.excursion;
    const unmappedStorage = Object.keys(cls).filter((k) => !STORAGE_SYNONYMS[k]);
    if (unmappedStorage.length) {
      throw new Error('TL_STORAGE has formulations with no STORAGE_SYNONYMS entry: ' +
        unmappedStorage.join(', ') + ' — without terms they are unreachable, which is the ' +
        'state this content was added to fix.');
    }
    for (const [key, c] of Object.entries(cls)) {
      entries.push({
        id: `storage:${key}`,
        kind: 'storage',
        title: c.label,
        subtitle: 'storage and handling',
        /* The label is NOT split into words here, unlike the playbook and nutrition
           entries whose titles are topical. These labels are descriptive sentences —
           "Left out, too warm, or frozen by accident" — and splitting one puts "too",
           "out", "use" and "by" into the term list, where they match anything.
           Measured: it sent "estrodiol too high" to the excursion entry and "can I
           just USE my wife's prescription" to the powder entry. That is the same
           generic-word defect as sore/back/what, and it slips under the category-term
           guard because each word lands on only one or two entries rather than four.
           The synonyms carry the retrieval; the label is a heading, not an index. */
        terms: terms(c.label, STORAGE_SYNONYMS[key] || []),
        text: storageText(key, c, st.caveat || ''),
        route: { view: 'storage', item: key }
      });
    }
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
      /* The literal word "interaction" was a term on all 53 interaction entries,
         and "template"/"protocol" on all 17 templates — the kind label, not the
         identity. Same defect as the compound class names above: a term shared by
         every member of a kind can only pick one at random. The drug names are
         what make an interaction findable. */
      terms: terms(it.title, drugs, drugs.join(' ')),
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
      terms: terms(t.name, t.id, comps.map((c) => c.name)),
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

/* app.html inlines the matcher so it works offline on the first question. Two
   copies of anything drift; this makes drift a build failure rather than a
   subtle behaviour difference between what the eval measures and what ships. */
/* Re-inline the matcher into app.html. The generator owns this copy the same
   way it owns the index: hand-copying it is how the two drifted in the first
   place, and a check that only reports drift without a way to fix it invites
   someone to edit the wrong copy. */
function syncMatcherInlined() {
  const app = fs.readFileSync(APP, 'utf8');
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'brain', 'match.js'), 'utf8').trim();
  const startMark = '/* @@TL_BRAIN_MATCHER@@ start';
  const endMark = '/* @@TL_BRAIN_MATCHER@@ end */';
  const start = app.indexOf(startMark);
  const end = app.indexOf(endMark);
  if (start === -1 || end === -1) {
    throw new Error('app.html no longer inlines the brain matcher — the @@TL_BRAIN_MATCHER@@ markers are gone');
  }
  const headerEnd = app.indexOf('*/', start) + 2;
  const next = app.slice(0, headerEnd) + '\n' + src + '\n' + app.slice(end);
  if (next !== app) {
    fs.writeFileSync(APP, next);
    return true;
  }
  return false;
}

function checkMatcherInlined() {
  const app = fs.readFileSync(APP, 'utf8');
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'brain', 'match.js'), 'utf8').trim();
  const start = app.indexOf('/* @@TL_BRAIN_MATCHER@@ start');
  const end = app.indexOf('/* @@TL_BRAIN_MATCHER@@ end */');
  if (start === -1 || end === -1) {
    throw new Error('app.html no longer inlines the brain matcher — the @@TL_BRAIN_MATCHER@@ markers are gone');
  }
  const inlined = app.slice(app.indexOf('*/', start) + 2, end).trim();
  if (inlined !== src) {
    throw new Error('app.html\'s inlined matcher has drifted from assets/brain/match.js.\n' +
      'The eval harness requires assets/brain/match.js directly, so drift means the measured\n' +
      'matcher is not the shipped one. Re-copy it between the @@TL_BRAIN_MATCHER@@ markers.');
  }
}

/* A term that names a CATEGORY cannot discriminate between its members.
 *
 * This has now gone wrong five times, each time the same way and each time
 * caught only by a user-visible symptom: "sore" and "back" from rehab titles
 * sent a hot swollen calf — a possible DVT — to the elbow entry; "what" from a
 * nutrition title; "16" from "16:8" sent a 16-year-old's cycle question to an
 * intermittent-fasting entry; and the compound class names made the bare word
 * "peptides" a term on 23 entries, so "I left my peptides out overnight, are
 * they garbage now?" was answered on-device with four unrelated compounds.
 *
 * The structural tell is sharp, and it is not word frequency. A legitimate
 * shared term spans KINDS: "bpc-157" is on a compound, a rehab entry, four
 * interactions and a template, because they genuinely all concern BPC-157. A
 * category label sits on many entries of exactly ONE kind, because that is what
 * a category is. So the rule is: a term on four or more entries that are all
 * the same kind is a label, not an identity.
 *
 * ALLOW exists for the case where a genuine identity really is confined to one
 * kind and shared widely. Add to it deliberately, with the reason, rather than
 * loosening the threshold. */
const CATEGORY_TERM_ALLOW = new Set([]);

function checkNoCategoryTerms(entries) {
  const byTerm = new Map();
  for (const e of entries) {
    for (const t of e.terms || []) {
      if (!byTerm.has(t)) byTerm.set(t, []);
      byTerm.get(t).push(e);
    }
  }
  const bad = [];
  for (const [term, hits] of byTerm) {
    if (hits.length < 4 || CATEGORY_TERM_ALLOW.has(term)) continue;
    const kinds = new Set(hits.map((e) => e.kind));
    if (kinds.size === 1) {
      bad.push(`  "${term}" is a term on ${hits.length} entries, all of kind ` +
        `"${[...kinds][0]}" — e.g. ${hits.slice(0, 3).map((e) => e.id).join(', ')}`);
    }
  }
  if (bad.length) {
    throw new Error(
      'category labels leaked into the search terms:\n' + bad.join('\n') +
      '\n\nA term shared by that many entries of a single kind names the category, not\n' +
      'any one member, so it can only retrieve some of them at random — and a\n' +
      'question that matches only on it will be answered with whichever won.\n' +
      'Drop it from the terms for that kind, or add it to CATEGORY_TERM_ALLOW with\n' +
      'a reason if the identity really is that broad.');
  }
}

function main() {
  const check = process.argv.includes('--check');
  if (check) checkMatcherInlined();
  else if (syncMatcherInlined()) console.log('re-inlined assets/brain/match.js into app.html');
  const out = build();
  /* Before either branch, so --check enforces it in CI and not only a local build. */
  checkNoCategoryTerms(JSON.parse(out).entries);
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
