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
    s = s.replace(/[?!.,;:()"']+/g, ' ').replace(/\s+/g, ' ').trim();
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

  /* Below this, the match is not trustworthy enough to show as an answer.
     Tuned so a miss falls through to the assistant instead of confidently
     serving the wrong protocol — a wrong free answer to a medical question
     costs far more than the $0.065 it saved. */
  const THRESHOLD = 45;

  /* Per-kind weighting, applied after term scoring.
     Template and interaction entries list the compounds they involve so that
     "what do I stack with HCG" can reach them — but that made a bare compound
     name match the TRT Starter template as strongly as the compound's own
     entry, and "test cyp vs enanthate" answered with a protocol. An entry that
     merely mentions a compound must rank below the entry that IS that
     compound. */
  const KIND_WEIGHT = { compound: 1, playbook: 1, marker: 0.95, interaction: 0.75, template: 0.7 };

  /* Join hyphen/slash-separated word parts, matching how terms() flattens the
     index side. Without this, "MK-677" tokenized to "mk-677" and the index
     held "mk677", so the compound was unreachable by the name printed on the
     vial — and so was every other hyphenated compound: LGD-4033, BPC-157,
     CJC-1295, GW-501516. Word boundaries are preserved; only the separator
     inside a word is removed. */
  function flatten(s) {
    return s.replace(/(\w)[-\u2013\u2014/](\w)/g, '$1$2');
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
      const tw = term.split(/\s+/).filter((w) => w.length > 1);
      if (tw.length && tw.every((w) => qSet.has(w))) {
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

  /* Deterministic questions that should never reach a language model: the
     answer is arithmetic and the app already ships a calculator for it.
     Routing these to the syringe tool is both free and more correct than any
     model's mental math. */
  const TOOL_PATTERNS = [
    { tool: 'reconstitution',
      re: /\b(bac(?:teriostatic)?\s*water|reconstitut|how much water|units? on (?:an? )?(?:insulin )?syringe|how many units|mcg per unit|mg per ml|dilut)/i },
    { tool: 'reconstitution',
      re: /\b\d+\s*(?:mg|mcg|iu)\b[\s\S]{0,40}\b(?:vial|syringe|units?)\b/i }
  ];

  function toolFor(q) {
    const s = String(q || '');
    for (const p of TOOL_PATTERNS) if (p.re.test(s)) return p.tool;
    return null;
  }

  /* Returns { tool, results:[{entry,score}] }. `tool` non-null means the app
     should offer its calculator first — the model cannot beat arithmetic. */
  function search(q, index, opts) {
    const o = opts || {};
    const limit = o.limit || 3;
    const norm = normalize(q);
    const qTokens = tokens(q);
    const out = [];
    if (norm) {
      for (const e of (index && index.entries) || []) {
        const sc = score(e, norm, qTokens, String(e.title || '').toLowerCase().trim());
        if (sc >= (o.threshold || THRESHOLD)) out.push({ entry: e, score: sc });
      }
      out.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);
    }
    const picked = out.slice(0, limit);

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
    return { tool: toolFor(q), results: picked };
  }

  return { search, normalize, tokens, toolFor, THRESHOLD };
});
