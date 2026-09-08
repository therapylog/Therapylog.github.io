/* Brain matcher — deterministic, on-device, zero cost.
 *
 * Single source of truth: app.html inlines this file verbatim and
 * scripts/build-brain.js --check fails if the two drift. The eval harness in
 * therapylog-api requires it directly, so what gets measured is what ships.
 *
 * No embeddings and no model call. A semantic cache would match better on
 * paraphrase, but it costs a network round trip, a second vendor, and — the
 * part that actually rules it out — it sends the user's health question off
 * the device. Matching locally means a question that the app can answer for
 * free is also a question nobody else ever sees.
 *
 * The tradeoff accepted here: this misses paraphrases a semantic matcher would
 * catch. That is why a miss falls through to "ask the assistant" rather than
 * to a wrong answer — see THRESHOLD below.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TLBrain = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* Question scaffolding. People type "why is my e2 high" and the content is
     filed under "estradiol" — the interrogative words carry no signal and,
     left in, they dilute token-overlap scoring. */
  const SCAFFOLD = new RegExp('^(?:' + [
    'what(?:\'?s| is| are| does| do)?', 'why(?: is| are| does| do| would)?',
    'how(?: do i| do you| does| much| many| long| to)?', 'when(?: do| should| does)?',
    'should i', 'can i', 'could i', 'do i(?: need)?', 'is it(?: normal| ok| safe| bad)?',
    'are there', 'tell me about', 'explain', 'help(?: me)?(?: with)?',
    'i(?:\'?ve| have)?(?: been| got)?', 'my', 'the', 'a', 'an'
  ].join('|') + ')\\s+', 'i');

  function normalize(q) {
    let s = String(q || '').toLowerCase().trim();
    /* '+' separates compounds the way people actually write them — "CJC-1295+ipa",
       "NAD+" — and left in place it welded the name to its neighbour and matched
       nothing. */
    s = s.replace(/[?!.,;:()"'+]+/g, ' ').replace(/\s+/g, ' ').trim();
    /* Strip repeatedly: "what should i do about high e2" has three layers. */
    for (let i = 0; i < 4; i++) {
      const next = s.replace(SCAFFOLD, '').trim();
      if (next === s || !next) break;
      s = next;
    }
    return s;
  }

  const TOKEN_STOP = new Set(['is', 'are', 'was', 'my', 'me', 'i', 'a', 'an', 'the', 'to',
    'of', 'on', 'in', 'at', 'for', 'and', 'or', 'it', 'this', 'that', 'do', 'does', 'did',
    'be', 'been', 'get', 'got', 'have', 'has', 'with', 'about', 'from', 'what', 'why',
    'how', 'when', 'should', 'can', 'could', 'would', 'if', 'so', 'but', 'just', 'now']);

  function tokens(s) {
    return normalize(s).split(/\s+/).filter((t) => t.length > 1 && !TOKEN_STOP.has(t));
  }

  const words = (t) => t.split(/\s+/).filter(Boolean).length;

  /* Below this, the match is not trustworthy enough to show at all. Tuned so
     a miss falls through to the assistant instead of confidently serving the
     wrong protocol — a wrong free answer to a medical question costs far more
     than the $0.065 it saved. */
  const THRESHOLD = 45;

  /* Score says how well an entry matches. It does not say whether the entry
     is the ANSWER or merely relevant, and those need different treatment.

     "What is tirzepatide" and "I'm on tirzepatide, eating 700 below
     maintenance and lifting 4x a week, how do I not lose muscle" both match
     the tirzepatide entry on its title, at nearly the same score. The first
     is fully answered by that entry. The second is barely about tirzepatide
     at all — offering the compound page as the answer would be a confidently
     unhelpful non-sequitur.

     What separates them is how much of the question the entry accounts for.
     Coverage is the fraction of the question's meaningful tokens the entry's
     terms explain: 1.0 for "what is tirzepatide", about 0.08 for the second.
     Above ANSWER_COVERAGE the entry is offered as a free answer; below it,
     the entry is shown as related reading and the assistant stays the primary
     path. Cheap, deterministic, and it needs no model to decide.

     0.10 was measured against the 44-question eval set, where the two classes
     separated cleanly: everything that should be answered scored 0.14 or above,
     everything that should defer scored 0.07 or below.

     A caveat found later, by probing shorter phrasings (scripts/probe-brain.js):
     coverage is a FRACTION of the question's tokens, so it rises as the question
     gets terser. The same question can therefore route differently depending on
     how much of it the user typed.

     The tirzepatide-and-a-deficit question used to be the example here, as a
     case that ought to defer. It is no longer: the GLP-1 nutrition entry now
     answers it directly — the deficit drives the lean loss rather than the drug,
     and resistance training is the lever — so answering is correct and the entry
     is the right one. That was the fix predicted when this comment first said
     the answer was content rather than threshold tuning.

     Left at 0.10 deliberately. The constant is calibrated against the eval set
     that decides the model tier, and re-tuning it on a smaller probe would trade
     a measured number for a less-measured one. Where the library genuinely must
     not answer, the two shapes that matter are handled explicitly above:
     requests to build something bespoke, and dose questions about compounds the
     index does not know.

     The margin is thin, so it is worth being clear about which way a
     misclassification fails. Too low and the app shows a related card the
     user reads past — one extra tap. Too high and it sends a question to the
     paid model that the library could have answered for nothing. Neither
     produces a wrong answer, because coverage only decides how a match is
     PRESENTED; the match itself already passed THRESHOLD. */
  const ANSWER_COVERAGE = 0.10;

  /* Per-kind weighting, applied after term scoring.
     Template and interaction entries list the compounds they involve so that
     "what do I stack with HCG" can reach them — but that made a bare compound
     name match the TRT Starter template as strongly as the compound's own
     entry, and "test cyp vs enanthate" answered with a protocol. An entry that
     merely mentions a compound must rank below the entry that IS that
     compound. */
  const KIND_WEIGHT = { compound: 1, playbook: 1, rehab: 1, nutrition: 1, marker: 0.95, interaction: 0.75, template: 0.7 };

  /* Join hyphen/slash-separated word parts, matching how terms() flattens the
     index side. Without this, "MK-677" tokenized to "mk-677" and the index
     held "mk677", so the compound was unreachable by the name printed on the
     vial — and so was every other hyphenated compound: LGD-4033, BPC-157,
     CJC-1295, GW-501516. Word boundaries are preserved; only the separator
     inside a word is removed. */
  function flatten(s) {
    return s.replace(/(\w)[-\u2013\u2014/](\w)/g, '$1$2');
  }

  /* Fraction of the question's meaningful tokens this entry's terms explain.
     Exact token matches count fully; a term containing the token counts too,
     so "tirzepatide" credits an entry whose term is "tirzepatide injection". */
  function coverage(entry, qTokens) {
    if (!qTokens.length) return 0;
    const hit = qTokens.filter((t) => {
      const f = flatten(t);
      return entry.terms.some((x) => x === t || x === f || x.includes(t) || x.includes(f));
    }).length;
    return hit / qTokens.length;
  }

  function score(entry, norm, qTokens, title) {
    let best = 0;
    const normFlat = flatten(norm);
    const qSet = new Set();
    for (const t of qTokens) { qSet.add(t); qSet.add(flatten(t)); }
    for (const term of entry.terms) {
      if (!term) continue;
      if (term === norm || term === normFlat) { best = Math.max(best, 1000); continue; }
      /* Whole-word phrase containment. Multi-word terms are far more specific
         than single tokens, so they score higher — "nipple sensitivity" must
         beat a bare "nipple" that also appears in three compound entries. */
      if (term.length >= 4) {
        const re = new RegExp('(?:^|\\s)' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\s|$)');
        if (re.test(norm) || re.test(normFlat)) {
          /* An entry whose own name you typed beats one that merely lists it
             as an alias: Clomiphene's aka mentions enclomiphene, so without
             this "can I use enclomiphene" answered with the wrong drug. */
          const isTitle = title && term === title;
          best = Math.max(best, 100 + 25 * words(term) + (isTitle ? 40 : 0));
          continue;
        }
      }
      /* Every word of the term present, order-independent. */
      const rawWords = term.split(/\s+/);
      const tw = rawWords.filter((w) => w.length > 1);
      /* A term that survives this filter as a single bare number must not match.
         '16:8' is indexed as the term "16 8"; the length filter drops the "8",
         leaving ["16"], which then matched ANY question containing 16 — and the
         one that found it was "I'm 16 and I want to start my first cycle", which
         got answered with an intermittent-fasting entry. A bare number carries no
         topic, and letting one satisfy a match is how a safety question ends up
         reaching a nutrition card. */
      const numericOnly = tw.length === 1 && /^\d+$/.test(tw[0]);
      /* If the length filter dropped words, what is left is a FRAGMENT of the
         term rather than the term. "c peptide" survives as ["peptide"], which
         then matched any question containing that word — so "what peptide for
         hot flashes" and "peptide storage" were both answered, free and
         on-device, with the C-Peptide lab marker card. The numericOnly guard
         above is the same bug caught once already, in its narrower numeric form
         ("16 8" -> ["16"]); this generalises it. A fragment carries the topic of
         neither the term nor the question. */
      const collapsed = tw.length < rawWords.length;
      if (tw.length && !numericOnly && !collapsed && tw.every((w) => qSet.has(w))) {
        best = Math.max(best, 55 + 15 * tw.length);
      }
    }
    /* A little credit for general topical overlap, capped so it can never on
       its own push an entry over THRESHOLD. */
    if (best > 0 && qTokens.length) {
      const hit = qTokens.filter((t) => entry.terms.some((x) => x === t || x.includes(t))).length;
      best += Math.min(20, Math.round((hit / qTokens.length) * 20));
    }
    return Math.round(best * (KIND_WEIGHT[entry.kind] != null ? KIND_WEIGHT[entry.kind] : 1));
  }

  /* Two shapes of question the library must not answer even when something in
     it scores well. Both were found by the eval, and both fail in the same
     direction: the app shows a confident card for a question it has not
     actually answered.

     1. A request to BUILD something bespoke. "Build me a meal prep plan, 3,000
        calories, 220 g protein" matched the meal-prep entry at 0.25 coverage
        and would have been answered with general advice about component
        prepping. The user asked for a plan with their numbers in it; a card
        that does not contain those numbers is not a worse answer, it is a
        different one. This belongs to the assistant, which has their data.

     2. A dose question about something the index does not know. "What's the
        standard dose of Tesamorelin-B for lean mass gain?" names a compound
        that does not exist, and matched the BULKING entry at 0.50 coverage on
        the words "lean mass gain" alone. Answering it with a nutrition card
        implies the compound is real, which is the one thing a reference must
        never do about a name it has never heard. A dose question is only
        answerable by a compound entry. */
  const BESPOKE = /\b(?:build|make|write|design|create|put together|lay out|structure|plan out)\s+(?:me\s+)?(?:a|an|my|the)?\s*(?:\w+\s+){0,3}(?:plan|program|programme|routine|split|schedule|protocol|template|week|day)\b|\bhow should i (?:structure|organi[sz]e|split|lay out|set up)\b/i;
  const DOSE_ASK = /\b(?:standard |typical |normal |usual |correct |right )?dose (?:of|for)\b|\bhow (?:much|many) (?:mg|mcg|iu|units)\b|\bdosing (?:of|for)\b/i;

  /* A stated age under 18, next to a question about cycles or compounds.
     This is checked on the device, before anything is sent, because the answer
     must not depend on a model complying with a prompt. There is no version of
     this question that gets a protocol, so there is no reason to spend a paid
     call deciding that.

     Two failure modes were designed against. Missing a real minor is the worse
     one, so the age patterns are generous. Firing on an adult is the annoying
     one, so a number is only read as an age when it is stated as one: "I'm 16"
     and "16 years old" count, while "16 weeks into my cycle", "16 units",
     "16 mg" and "hematocrit 16" do not, because a unit follows the number.
     The topic test is required as well — a 16-year-old asking about protein
     intake gets the nutrition entry like anyone else. */
  const MINOR_AGE = /\b(?:i'?m|i am|im|age|aged|turning)\s+(1[0-7])\b(?!\s*(?:weeks?|wks?|months?|mos?|days?|years? in|lbs?|kg|kgs|pounds|mg|mcg|ml|iu|units?|%|percent|nmol|pmol|ng|pg))/i;
  const MINOR_AGE2 = /\b(1[0-7])\s*(?:years?|yrs?|yo)\s*old\b/i;
  /* The same euphemism applied to the age rather than to the compound: "my rat is
     16 and wants to run test". The self-referent is the entire point of the
     framing, so an age attached to the rat is the person's own. */
  const MINOR_AGE3 = /\b(?:my|the)\s+rat\s+(?:is|turns?|just turned|will be|turned)\s+(1[0-7])\b(?!\s*(?:weeks?|wks?|months?|mos?|days?|years? in|lbs?|kg|kgs|pounds|mg|mcg|ml|iu|units?|%|percent|nmol|pmol|ng|pg))/i;
  const MINOR_WORDS = /\b(?:high\s?school|highschool|sophomore|freshman|junior year|my parents (?:say|wont|won't|don't|dont)|still in school|year 1[01]\b)/i;
  /* The topic half. Deliberately narrow: anabolic and hormonal intervention,
     not training or food, which are worth helping a teenager with. */
  const ENHANCEMENT = /\b(?:cycle|cycles|cycling|steroid|steroids|aas|gear|juice|sarm|sarms|test(?:osterone)?\s*(?:e|c|cyp|prop|enanthate|cypionate)?\b|trt|anabolic|prohormone|pct|hgh|growth hormone|peptide|first cycle|blast|pin(?:ning)?)/i;

  /* The audience writes around moderation. "Pepper" and the chilli emoji stand in
     for peptide, and "my rat" is the research-chemical framing — posts are written
     about a lab rat because the product is sold "not for human consumption". A
     guard that only knows the plain words is defeated by the vocabulary the group
     is actually written in: "I am 16 and want to start my first peptide cycle"
     was caught, and "I am 16 and want to start my first pepper for my rat" was
     not. Both are the same question from the same person.

     "Pepper" is also a food, and a teenager asking about seasoning must not get a
     steroid refusal, so the culinary senses are excluded explicitly. */
  const EUPHEMISM = /\b(?:peppers?|research\s*chem(?:ical)?s?|my\s+rat|the\s+rat|for\s+(?:my|the)\s+rat)\b|\u{1F336}/iu;
  const FOOD_PEPPER = /\b(?:black|bell|red|green|chill?i|cayenne|hot|bird'?s? eye|lemon)\s+peppers?\b|\bpepper\s+(?:flakes|corns?|jack|mill|grinder|sauce)\b|\bsalt and pepper\b/i;

  function minorEnhancementAsk(q) {
    const raw = String(q || '');
    /* Both forms. normalize() strips punctuation and scaffolding, which is what
       makes "im 16 — first pepper?" reach the same test as the plain sentence;
       the raw string is kept because normalize() also strips phrases the age
       patterns rely on. Either matching is enough: this guard should be hard to
       slip past, not elegant. */
    const norm = normalize(raw);
    const minor = [raw, norm].some((t) =>
      MINOR_AGE.test(t) || MINOR_AGE2.test(t) || MINOR_AGE3.test(t) || MINOR_WORDS.test(t));
    if (!minor) return false;
    const topical = [raw, norm].some((t) =>
      ENHANCEMENT.test(t) || (EUPHEMISM.test(t) && !FOOD_PEPPER.test(t)));
    return topical;
  }

  /* Deterministic questions that should never reach a language model: the
     answer is arithmetic and the app already ships a calculator for it.
     Routing these to the syringe tool is both free and more correct than any
     model's mental math. */
  const TOOL_PATTERNS = [
    { tool: 'reconstitution',
      re: /\b(bac(?:teriostatic)?\s*water|back\s?water|reconstitut|how much water|units? on (?:an? )?(?:insulin )?syringe|how many units|mcg per unit|mg per ml|dilut)/i },
    { tool: 'reconstitution',
      re: /\b\d+\s*(?:mg|mcg|iu)\b[\s\S]{0,40}\b(?:vial|syringe|units?)\b/i },
    /* "BAC" on its own is what people actually type — "still a little confused on
       BAC and how to add to my vials", "how much bac do i use". The first pattern
       needed the word "water" after it and so missed every one of them. Three
       letters is too little to route on alone, so it needs a mixing verb or a
       vial nearby, in either order. ("backwater" above is the same question after
       autocorrect, and is what one real user actually wrote.) */
    { tool: 'reconstitution',
      re: /\bbac\b[\s\S]{0,60}\b(?:vial|vials|add|adding|mix|mixing|put|use|using|water)\b|\b(?:vial|vials|add|adding|mix|mixing|put|use|using)\b[\s\S]{0,60}\bbac\b/i }
  ];

  /* Storage and stability questions say "reconstituted" without being arithmetic:
     "is Klow kept at room temp once it's reconstituted", "I left my peptides out
     overnight, are they garbage". Routing those to the calculator answers a
     question nobody asked AND suppresses every encyclopedia entry, because a tool
     match grounds nothing. The guard runs before the patterns, so storage wins the
     tie. What to do with such a question is settled content in the app's own
     storage rules — it belongs to the model, not the calculator. */
  const STORAGE_CONTEXT = /\b(room temp(?:erature)?|fridge|refrigerat|freez|frozen|storage|store (?:it|them|my)|left (?:it|them|my|the)[\s\S]{0,20}\bout\b|out overnight|out all night|expire|expiry|expired|still good|still ok|go bad|gone bad|ruined|garbage|spoil|shelf ?life|how long (?:is|does|will|can) (?:it|they|this)[\s\S]{0,20}\b(?:last|keep|stay|good)\b)/i;

  function toolFor(q) {
    const raw = String(q || '');
    /* Checked against both forms for the same reason as the minor guard: the raw
       string carries punctuation the patterns want ("0.25mg"), the normalized one
       carries phrasing the scaffolding stripper reveals. Storage still wins. */
    const forms = [raw, normalize(raw)];
    if (forms.some((t) => STORAGE_CONTEXT.test(t))) return null;
    for (const p of TOOL_PATTERNS) if (forms.some((t) => p.re.test(t))) return p.tool;
    return null;
  }

  /* Returns { tool, results:[{entry,score}] }. `tool` non-null means the app
     should offer its calculator first — the model cannot beat arithmetic. */
  function search(q, index, opts) {
    const o = opts || {};
    /* Answered here and nowhere else. Returning early means the question is not
       scored against the library and is never sent to the assistant. */
    if (minorEnhancementAsk(q)) {
      return { tool: null, results: [], answerable: [], answers: false, guard: 'minor' };
    }
    const limit = o.limit || 3;
    const norm = normalize(q);
    const qTokens = tokens(q);
    const out = [];
    if (norm) {
      for (const e of (index && index.entries) || []) {
        const sc = score(e, norm, qTokens, String(e.title || '').toLowerCase().trim());
        if (sc >= (o.threshold || THRESHOLD)) out.push({ entry: e, score: sc, coverage: coverage(e, qTokens) });
      }
      out.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);
    }
    const picked = out.slice(0, limit);

    /* Applied after scoring rather than before, so the entries still appear as
       related reading — the question is only whether one is offered AS the
       answer. */
    const bespoke = BESPOKE.test(String(q || ''));
    const doseAskOffTopic = DOSE_ASK.test(String(q || '')) &&
      picked.length && picked[0].entry.kind !== 'compound';

    /* Markers carry the range, playbooks carry what to do about it. "My
       hematocrit is 53" matches the marker on the word alone, but the useful
       half of the answer is the playbook the marker points at — so a hit drags
       its related entries in rather than making the user search twice. */
    const seen = new Set(picked.map((r) => r.entry.id));
    for (const r of picked.slice()) {
      for (const id of r.entry.related || []) {
        if (seen.has(id)) continue;
        const rel = (index.entries || []).find((e) => e.id === id);
        if (!rel) continue;
        seen.add(id);
        picked.push({ entry: rel, score: r.score - 1, related: true });
      }
    }
    /* Some contexts change the answer completely, and an entry that is a
       perfectly good monograph may not speak to them at all. compound:sema is a
       correct semaglutide entry that contains the word "thyroid" zero times; as
       a free on-device card to "is semaglutide safe with thyroid cancer
       history" it answers a question nobody asked, and silence reads as
       clearance. Four such questions were served that way — semaglutide,
       tesamorelin, BPC-157 and ipamorelin — with no API call and no caveat, and
       tesamorelin's own FDA label contraindicates active malignancy.

       These survived the category-term fix precisely because they are legitimate
       matches: the person did type the compound's name. What is wrong is not the
       retrieval but treating it as sufficient. So when the question raises one of
       these contexts and the entry does not address it, the entry stops being an
       answer and the question goes to the assistant, which has both the model's
       knowledge and the system prompt's safety rules. Gating "answerable" rather
       than the card alone also removes it from groundable(), so the paid path is
       not anchored to it either. */
    const CONTEXT_GATES = [
      { asks: /\b(cancer|malignan|tumou?r|oncolog|carcinoma|in remission|chemo(?:therapy)?|metasta|leukemia|lymphoma)/i,
        answers: /cancer|malignan|tumou?r|oncolog|carcinoma|neoplas|leukemia|lymphoma/i },
      { asks: /\b(pregnan|breast ?feed|nursing|trying to conceive)/i,
        answers: /pregnan|breast ?feed|nursing|lactat|fetal|teratogen/i },
      { asks: /\b(menopaus|perimenopaus|post ?menopaus)/i,
        answers: /menopaus/i }
    ];
    const contextUnmet = (entry) => {
      const body = String(entry.title || '') + ' ' + String(entry.text || '');
      for (const g of CONTEXT_GATES) if (g.asks.test(q) && !g.answers.test(body)) return true;
      return false;
    };

    /* answerable: the app may show these as a free answer. related: relevant
       context to display alongside, but the assistant is still the primary
       path. A tool match is always answerable — arithmetic beats a model.

       Kind gates this before coverage does. A compound, marker or playbook
       entry is a self-contained explanation and can stand alone. An
       interaction entry is a warning about combining two specific things and
       a template is a protocol listing — both are useful context beside an
       answer and neither IS one. Without this gate, "I'm on tirzepatide,
       eating 700 below maintenance, how do I keep muscle" was answered with a
       GLP-1 combination warning, because an entry with few terms reaches a
       given coverage on fewer hits than a richly-aliased compound does. */
    /* rehab sits with the playbooks: both are authored, fully cited answers to a
       question someone asked in their own words, and both are the reason this
       matcher exists — to answer without a round trip. */
    const ANSWER_KINDS = { compound: 1, marker: 1, playbook: 1, rehab: 1, nutrition: 1 };
    const answerable = picked.filter((r) => !r.related && !contextUnmet(r.entry) &&
      ANSWER_KINDS[r.entry.kind] &&
      r.coverage >= (o.answerCoverage || ANSWER_COVERAGE));

    /* Showing a card and briefing the model are different jobs, and they were
       sharing one gate.
     *
     * coverage is the fraction of the QUESTION's tokens an entry explains, so it
     * falls as the question gets longer. That is right for the free card: a long
     * rambling post should not be answered on-device by an entry that covers a
     * tenth of it. It is wrong for grounding, where the only question is whether
     * the entry is worth putting in front of the model. Measured on eleven real
     * posts from the audience — 23 to 69 tokens each — every retrieved entry
     * landed between 0.023 and 0.094 against the 0.10 bar, so ten of eleven were
     * sent to the paid model with NOTHING attached, while terse paraphrases of
     * the same questions grounded correctly. The library was invisible to real
     * writing and visible only to search-box phrasing.
     *
     * So grounding gets its own rule. An entry grounds when it clears the card
     * bar, OR when the question names it outright — its own title or one of its
     * terms appearing as a whole phrase, which is a specificity signal that does
     * not decay with length. Typing "tirzepatide" means the tirzepatide entry is
     * relevant whether the post is eight words or eighty.
     *
     * The phrase must be long enough to be a name rather than a fragment (the
     * C-Peptide lesson), and "related" entries stay out: they are the ones the
     * scorer already judged tangential.
     *
     * GROUND_KINDS is wider than ANSWER_KINDS on purpose. Templates and
     * interactions make poor free cards — a protocol template is not an answer to
     * a question — but they are exactly what a model should see. They were 70 of
     * 327 entries, 21% of the library, structurally unable to reach the model:
     * every female-specific entry is a template, and all 53 drug interactions
     * were unreachable, including for a question that named two compounds and
     * asked whether to combine them. */
    const GROUND_KINDS = { compound: 1, marker: 1, playbook: 1, rehab: 1, nutrition: 1,
                           template: 1, interaction: 1 };
    /* Three, not five. The community's names for things are short — reta, tirz,
       sema, hcg, mt2, ipa, cjc, nad — and a five-character floor excluded most of
       them, which is why naming the compound outright still grounded nothing.
       Whole-phrase boundaries already prevent fragment matches, so length was
       doing little except silencing the vocabulary the audience uses. */
    const NAMED_MIN = 3;
    const namedOutright = (r) => {
      const hay = ' ' + normalize(q) + ' ';
      const cands = [String(r.entry.title || '')].concat(r.entry.terms || []);
      return cands.some((c) => {
        const t = String(c || '').toLowerCase().trim();
        if (t.length < NAMED_MIN || t.split(/\s+/).length > 6) return false;
        return hay.indexOf(' ' + t + ' ') !== -1;
      });
    };
    /* The context gate does NOT apply here, and that is deliberate. Dropping the
       entry made the card safe and the briefing empty: f11 — two cancers, a failed
       quad tendon repair — lost rehab:Tendon loading protocols, which is real,
       cited, and exactly what she needs. Withholding it does not make the answer
       safer, it makes it thinner and leaves the model to improvise the part it
       does know.
       So the entry goes through carrying a flag, and the API turns the flag into
       an instruction: these entries do not address the context you were asked
       about, so do not let their silence read as clearance. That is strictly
       better than dropping them — the model gets the content AND the warning. */
    const grounding = picked.filter((r) => !r.related &&
      GROUND_KINDS[r.entry.kind] &&
      (r.coverage >= (o.answerCoverage || ANSWER_COVERAGE) || namedOutright(r)))
      .map((r) => (contextUnmet(r.entry) ? Object.assign({}, r, { contextGap: true }) : r));

    return {
      tool: toolFor(q),
      results: picked,
      answerable: (bespoke || doseAskOffTopic) ? [] : answerable,
      /* bespoke and doseAskOffTopic suppress the CARD, not the briefing: "build me
         a 12 week program" should not be answered from a card, and the model still
         benefits from the entries. */
      grounding: grounding,
      answers: !!(toolFor(q) || ((bespoke || doseAskOffTopic) ? false : answerable.length))
    };
  }

  return { search, normalize, tokens, toolFor, minorEnhancementAsk, THRESHOLD, ANSWER_COVERAGE };
});
