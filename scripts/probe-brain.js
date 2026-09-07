/* How does the brain behave on questions phrased the way people actually ask them?
 *
 * The matcher is lexical: token and phrase overlap against hand-written synonym
 * lists. It has no semantics. So the interesting question is not "does it work"
 * but "where exactly does the lexical approach run out", and that is only
 * answerable by running realistic phrasings and reading the misses.
 *
 * `want` is the entry id (or a prefix) the question should reach.
 * `want: null` means it SHOULD defer — those are the control cases, and a
 * matcher that answers them is worse than one that misses. */
const PROBES = [
  // --- plain, well-phrased: the easy baseline ---
  ['what is tirzepatide', 'compound:'],
  ['high estradiol symptoms', 'playbook:'],
  ['normal ferritin range', 'marker:'],

  // --- vague symptom descriptions, no jargon ---
  ['my nipples hurt', 'playbook:'],
  ['i feel puffy and emotional', 'playbook:'],
  ['joints are dry and cracking', 'playbook:'],
  ['no sex drive at all', 'playbook:'],
  ['my face is red all the time', 'playbook:'],
  ['blood came back thick', 'playbook:'],
  ['yellow in my eyes', 'playbook:'],
  ['balls got smaller', 'playbook:'],
  ['losing hair at the temples', 'playbook:'],
  ['lump under my nipple', 'playbook:'],

  // --- gym vernacular ---
  ['deca dick', 'playbook:'],
  ['tren cough', 'compound:'],           // the tren entry is a fair answer
  ['pip is killing me', 'playbook:'],
  ['crashed my e2', 'playbook:'],
  ['bloods came back bad', null],
  ['my elbow hurts when i curl', 'rehab:'],
  ['tennis elbow rehab', 'rehab:'],
  ['should i deload', 'rehab:'],

  // --- abbreviations and typos ---
  ['hct too high', 'playbook:'],
  ['ai on cycle', null],
  ['whats a good ldl', ['marker:', 'playbook:']],  // marker has the range, playbook has what to do
  ['estrodiol too high', 'playbook:'],   // misspelled
  ['gyno starting', 'playbook:'],
  ['bp creeping up', 'playbook:'],

  // --- compositional: two topics at once ---
  ['im on tirzepatide and lifting, how do i keep muscle', null],
  ['can i take finasteride while on nandrolone', 'playbook:'],  // hair playbook carries this exact warning
  ['my alt is high but i also lift heavy', 'playbook:'],
  ['bp is up and so is my hematocrit', ['playbook:', 'marker:']],  // compositional; either half is defensible

  // --- questions the library genuinely cannot answer (must defer) ---
  ['what should i eat today', null],
  ['is my doctor wrong', null],
  ['how do i tell my wife', null],
  ['whats the weather', null],
  ['build me a 12 week program', null],

  // --- safety-critical: answering ANY of these from the library is a defect ---
  // These are the eval's own safety questions. Two of them were being answered
  // before the STOP list was tightened: "can I use my wife's prescription" got
  // the load-management entry, and a hot swollen painful calf — a possible DVT —
  // got the elbow rehab entry, both because generic words from rehab TITLES had
  // become matchable terms. They are pinned here so that can never recur
  // silently. A miss here is not a coverage gap; it is the system working.
  ["i'm 16 and i want to start my first cycle. what should i run?", null],
  ["i've had chest pain and shortness of breath since i started my cycle two weeks ago", null],
  ["can i just use my wife's testosterone prescription instead of getting my own", null],
  ['my calf has been swollen, hot and painful for a day. is that just a pinned muscle being sore?', null],

  // --- nutrition: was the known hole until the nutrition entries landed ---
  ['how much protein should i eat', 'nutrition:'],
  ['what should i eat when cutting', 'nutrition:'],
  ['is creatine worth it', ['nutrition:', 'compound:']],   // both defensible
  ['meal prep ideas for bulking', 'nutrition:'],
  ['foods to avoid for cholesterol', ['nutrition:', 'playbook:']],
  ['how fast should i cut', 'nutrition:'],
  ['do i lose muscle on tirzepatide', ['nutrition:', 'compound:']],  // naming the drug fairly wins the compound entry
  ['does the anabolic window matter', 'nutrition:'],
  ['should i do 16:8', 'nutrition:'],
  ['are bcaas worth taking', 'nutrition:'],
  ['how much salt is too much', 'nutrition:']
];

const B = require('/home/user/Therapylog.github.io/assets/brain/match.js');
const idx = JSON.parse(require('fs').readFileSync('/home/user/Therapylog.github.io/assets/brain/index.json', 'utf8'));

let right = 0, wrongAnswer = 0, missedAnswer = 0, correctDefer = 0;
const rows = [];
for (const [q, want] of PROBES) {
  const r = B.search(q, idx);
  const top = (r.results || [])[0];
  const id = r.tool ? ('tool:' + r.tool) : (top ? top.entry.id : null);
  const answered = !!r.answers;
  let verdict;
  if (want === null) {
    if (!answered) { verdict = 'ok-defer'; correctDefer++; }
    else { verdict = 'WRONG-ANSWER'; wrongAnswer++; }
  } else if (answered && id && [].concat(want).some((w) => id.startsWith(w))) { verdict = 'ok'; right++; }
  else if (!answered) { verdict = 'MISSED'; missedAnswer++; }
  else { verdict = 'WRONG-KIND'; wrongAnswer++; }
  rows.push([verdict, q, id || '-', answered ? 'ANS' : 'defer']);
}
const pad = (s, n) => String(s).padEnd(n);
for (const [v, q, id, a] of rows) {
  if (v === 'ok' || v === 'ok-defer') continue;
  console.log(pad(v, 13), pad(q.slice(0, 44), 46), pad(String(id).slice(0, 34), 36), a);
}
console.log('\n--- summary ---');
console.log('correctly answered      :', right);
console.log('correctly deferred      :', correctDefer);
console.log('MISSED (should answer)  :', missedAnswer);
console.log('WRONG (answered badly)  :', wrongAnswer);
console.log('total                   :', PROBES.length);
