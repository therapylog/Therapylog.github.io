/**
 * NRCA Brain — retrieval: heading detection, chunking, BM25 search, page text.
 *
 * Pure functions only. No DOM, no IndexedDB, no imports — must run unchanged
 * under Node for testing and in the browser as an ES module.
 *
 * Data shapes (see CONTRACT):
 *   pages:  [ { p: 1, text: "…", method: "text"|"ocr-tesseract"|"ocr-claude"|"empty" } ]
 *   toc:    [ { title: "…", page: 12, level: 1 } ]
 *   chunks: [ { id: 0, p: [firstPage, lastPage], section: "…", text: "…" } ]
 */

// ---------------------------------------------------------------------------
// Heading detection
// ---------------------------------------------------------------------------

const SMALL_TITLE_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for",
  "with", "at", "by", "from", "as", "vs",
]);

const NUMBERED_HEADING_RE = /^(\d+(?:\.\d+)*)[.)]?\s+(\S.*)$/;

function isAllCapsHeading(line) {
  if (line.length < 4 || line.length > 90) return false;
  if (/[a-z]/.test(line)) return false;
  const letters = line.match(/[A-Z]/g);
  return !!letters && letters.length >= 4;
}

function numberedHeading(line) {
  const m = NUMBERED_HEADING_RE.exec(line);
  if (!m) return null;
  if (!/[A-Za-z]/.test(m[2])) return null; // "12 34" is not a heading
  if (m[2].length > 90) return null;
  return { numbering: m[1], rest: m[2] };
}

function isTitleCaseHeading(line) {
  if (line.length > 60) return false;
  if (/[.;:!?,]$/.test(line)) return false; // reads like a sentence fragment
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 10) return false;
  let capitalized = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/^[("'[]+|[)"'\],]+$/g, "");
    if (!w) return false;
    if (/^[A-Z][A-Za-z0-9'-]*$/.test(w)) {
      capitalized++;
      continue;
    }
    // interior small words ("Flashing of the Base") and bare numbers are fine
    if (i > 0 && SMALL_TITLE_WORDS.has(w.toLowerCase())) continue;
    if (/^\d[\d.-]*$/.test(w)) continue;
    return false;
  }
  return capitalized >= 2;
}

/**
 * detectHeadings(pages) → toc array [{title, page, level}] in document order.
 * Heuristics: ALL-CAPS lines (>=4 letter chars), numbered "2.1.3 Title" lines
 * (level = numbering depth), and Title Case lines <=60 chars followed by body
 * text. Duplicate titles (case/whitespace-insensitive) are kept once.
 */
export function detectHeadings(pages) {
  const toc = [];
  const seen = new Set();
  const sorted = [...(pages || [])].sort((a, b) => a.p - b.p);

  for (const page of sorted) {
    const text = page && typeof page.text === "string" ? page.text : "";
    if (!text) continue;
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let level = 0;
      const numbered = numberedHeading(line);
      if (numbered) {
        level = Math.min(numbered.numbering.split(".").length, 6);
      } else if (isAllCapsHeading(line)) {
        level = 1;
      } else if (isTitleCaseHeading(line)) {
        // must be followed by body text (a non-empty, non-heading line)
        let next = "";
        for (let j = i + 1; j < lines.length; j++) {
          const t = lines[j].trim();
          if (t) { next = t; break; }
        }
        if (!next) continue;
        if (isAllCapsHeading(next) || numberedHeading(next)) continue;
        level = 2;
      } else {
        continue;
      }

      const key = line.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) continue;
      seen.add(key);
      toc.push({ title: line, page: page.p, level });
    }
  }
  return toc;
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

const CHUNK_TARGET = 1400; // chars
const CHUNK_OVERLAP = 200; // chars
const CHUNK_MIN = 400; // don't cut before this many chars
const SENTENCE_HARD_MAX = 2000; // force-split monster "sentences"

const CLOSERS = "\"')]";

/** Split one page's text into sentence-ish segments (blank lines also break). */
function splitSentences(text) {
  const out = [];
  let start = 0;
  let i = 0;
  const push = (end) => {
    const seg = text.slice(start, end).trim();
    if (seg) out.push(seg);
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === "." || ch === "!" || ch === "?") {
      let j = i + 1;
      while (j < text.length && (text[j] === "." || text[j] === "!" || text[j] === "?")) j++;
      while (j < text.length && CLOSERS.includes(text[j])) j++;
      if (j >= text.length || /\s/.test(text[j])) {
        push(j);
        while (j < text.length && /\s/.test(text[j])) j++;
        start = j;
        i = j;
        continue;
      }
      i = j;
      continue;
    }
    if (ch === "\n") {
      // blank line = paragraph boundary
      let j = i + 1;
      let sawSecond = false;
      while (j < text.length && (text[j] === " " || text[j] === "\t" || text[j] === "\r" || text[j] === "\n")) {
        if (text[j] === "\n") sawSecond = true;
        j++;
      }
      if (sawSecond) {
        push(i);
        start = j;
        i = j;
        continue;
      }
    }
    i++;
  }
  push(text.length);

  // Force-split anything absurdly long at whitespace near CHUNK_TARGET.
  const result = [];
  for (const seg of out) {
    if (seg.length <= SENTENCE_HARD_MAX) {
      result.push(seg);
      continue;
    }
    let rest = seg;
    while (rest.length > SENTENCE_HARD_MAX) {
      let cut = rest.lastIndexOf(" ", CHUNK_TARGET);
      if (cut < CHUNK_MIN) cut = CHUNK_TARGET;
      result.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) result.push(rest);
  }
  return result;
}

/** Precompute heading anchors as { page, offset, title } sorted in doc order. */
function headingAnchors(pages, toc) {
  const textByPage = new Map();
  for (const pg of pages) textByPage.set(pg.p, pg.text || "");
  const anchors = [];
  for (const entry of toc || []) {
    const text = textByPage.get(entry.page) || "";
    const off = text.indexOf(entry.title);
    anchors.push({ page: entry.page, offset: off >= 0 ? off : 0, title: entry.title });
  }
  anchors.sort((a, b) => (a.page - b.page) || (a.offset - b.offset));
  return anchors;
}

/**
 * chunkPages(pages, toc) → chunks array per schema.
 * ~1,400 char target, ~200 char overlap between consecutive chunks, splits at
 * sentence boundaries when avoidable. section = nearest preceding heading
 * title ("" if none); p = [firstPage, lastPage].
 */
export function chunkPages(pages, toc) {
  const sorted = [...(pages || [])].sort((a, b) => a.p - b.p);
  const anchors = headingAnchors(sorted, toc || []);
  let anchorIdx = 0;
  let currentSection = "";

  // Build the sentence stream with page + section attribution.
  const sentences = []; // { text, page, section }
  for (const pg of sorted) {
    const text = typeof pg.text === "string" ? pg.text : "";
    if (!text.trim()) continue;
    let cursor = 0;
    for (const seg of splitSentences(text)) {
      const at = text.indexOf(seg, cursor);
      const off = at >= 0 ? at : cursor;
      if (at >= 0) cursor = at + seg.length;
      while (
        anchorIdx < anchors.length &&
        (anchors[anchorIdx].page < pg.p ||
          (anchors[anchorIdx].page === pg.p && anchors[anchorIdx].offset <= off))
      ) {
        currentSection = anchors[anchorIdx].title;
        anchorIdx++;
      }
      sentences.push({ text: seg, page: pg.p, section: currentSection });
    }
  }

  const chunks = [];
  let cur = []; // sentence objects in the current chunk
  let curLen = 0;
  let overlapCount = 0; // leading sentences of `cur` carried over from the previous chunk

  const finalize = () => {
    if (!cur.length) return;
    // section = nearest preceding heading for the chunk's first NEW sentence
    // (overlap carry-over shouldn't relabel a chunk with the prior section).
    const anchor = cur[Math.min(overlapCount, cur.length - 1)];
    chunks.push({
      id: chunks.length,
      p: [cur[0].page, cur[cur.length - 1].page],
      section: anchor.section,
      text: cur.map((s) => s.text).join(" "),
    });
  };

  const overlapTail = () => {
    // Trailing sentences totalling >= CHUNK_OVERLAP chars (but not the whole
    // chunk, and not a huge sentence — then take a word-boundary fragment).
    const tail = [];
    let len = 0;
    for (let i = cur.length - 1; i > 0 && len < CHUNK_OVERLAP; i--) {
      const s = cur[i];
      if (tail.length === 0 && s.text.length > CHUNK_OVERLAP * 2.5) {
        // single oversized sentence: overlap on a trailing word-boundary fragment
        let frag = s.text.slice(-CHUNK_OVERLAP);
        const sp = frag.indexOf(" ");
        if (sp > 0 && sp < frag.length - 1) frag = frag.slice(sp + 1);
        return [{ text: frag, page: s.page, section: s.section }];
      }
      if (len > 0 && len + s.text.length > CHUNK_OVERLAP * 2.5) break;
      tail.unshift(s);
      len += s.text.length + 1;
    }
    return tail;
  };

  for (const s of sentences) {
    const addLen = s.text.length + (curLen > 0 ? 1 : 0);
    if (curLen > 0 && curLen + addLen > CHUNK_TARGET && curLen >= CHUNK_MIN) {
      const tail = overlapTail();
      finalize();
      cur = tail.slice();
      overlapCount = cur.length;
      curLen = cur.reduce((n, t) => n + t.text.length + 1, -1);
      if (curLen < 0) curLen = 0;
    }
    cur.push(s);
    curLen += s.text.length + (curLen > 0 ? 1 : 0);
  }
  finalize();
  return chunks;
}

// ---------------------------------------------------------------------------
// BM25 search index
// ---------------------------------------------------------------------------

const BM25_K1 = 1.2;
const BM25_B = 0.75;

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "for",
  "with", "as", "at", "by", "from", "is", "are", "was", "were", "be",
  "been", "it", "its", "this", "that", "these", "those", "which",
  "there", "their", "then", "than", "such", "if", "when", "where",
  "has", "have", "had", "do", "does", "did", "will", "would", "should",
  "can", "may", "into", "also",
]);

const TOKEN_RE = /[a-z0-9]+(?:-[a-z0-9]+)*/g;

function keepTerm(term) {
  if (STOPWORDS.has(term)) return false;
  if (term.length === 1 && !/^[0-9]$/.test(term)) return false;
  return true;
}

/**
 * Tokenizer: lowercase, split on non-alphanumerics, but hyphenated runs also
 * index the joined form — "R-value" → ["r-value", "value"] ("r" is dropped as
 * a 1-char non-numeric term). Numbers are kept.
 */
export function tokenize(text) {
  const tokens = [];
  const lower = String(text).toLowerCase();
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(lower)) !== null) {
    const tok = m[0];
    if (tok.includes("-")) {
      if (keepTerm(tok)) tokens.push(tok);
      for (const part of tok.split("-")) {
        if (part && keepTerm(part)) tokens.push(part);
      }
    } else if (keepTerm(tok)) {
      tokens.push(tok);
    }
  }
  return tokens;
}

/**
 * buildSearchIndex(chunks) → SearchIndex with
 *   search(query, k=8) → [{ chunk, score }] sorted by score desc.
 * BM25, k1=1.2, b=0.75. Handles thousands of chunks well under a second.
 */
export function buildSearchIndex(chunks) {
  const docs = chunks || [];
  const N = docs.length;
  const postings = new Map(); // term → [docIdx, tf, docIdx, tf, …] (flat)
  const docLens = new Float64Array(N);
  let totalLen = 0;

  for (let d = 0; d < N; d++) {
    const chunk = docs[d];
    const tokens = tokenize((chunk.section ? chunk.section + " " : "") + chunk.text);
    docLens[d] = tokens.length;
    totalLen += tokens.length;
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    for (const [term, count] of tf) {
      let list = postings.get(term);
      if (!list) {
        list = [];
        postings.set(term, list);
      }
      list.push(d, count);
    }
  }
  const avgdl = N > 0 ? totalLen / N : 0;

  return {
    size: N,
    search(query, k = 8) {
      if (!N) return [];
      const qTerms = [...new Set(tokenize(query))];
      const scores = new Float64Array(N);
      let any = false;
      for (const term of qTerms) {
        const list = postings.get(term);
        if (!list) continue;
        any = true;
        const df = list.length / 2;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        for (let i = 0; i < list.length; i += 2) {
          const d = list[i];
          const tf = list[i + 1];
          const denom = tf + BM25_K1 * (1 - BM25_B + (BM25_B * docLens[d]) / (avgdl || 1));
          scores[d] += idf * ((tf * (BM25_K1 + 1)) / denom);
        }
      }
      if (!any) return [];
      const ranked = [];
      for (let d = 0; d < N; d++) {
        if (scores[d] > 0) ranked.push(d);
      }
      ranked.sort((a, b) => scores[b] - scores[a]);
      return ranked.slice(0, Math.max(1, k | 0)).map((d) => ({
        chunk: docs[d],
        score: scores[d],
      }));
    },
  };
}

// ---------------------------------------------------------------------------
// Page text
// ---------------------------------------------------------------------------

/**
 * getPageText(pages, startPage, endPage) →
 *   "=== Page N ===\n<text>\n\n=== Page N+1 ===\n<text>…"
 * Missing pages in the range are skipped; a reversed range is normalized.
 */
export function getPageText(pages, startPage, endPage) {
  let start = Math.max(1, Math.floor(startPage) || 1);
  let end = Math.max(1, Math.floor(endPage) || start);
  if (end < start) [start, end] = [end, start];

  const byPage = new Map();
  for (const pg of pages || []) byPage.set(pg.p, pg);

  const blocks = [];
  for (let n = start; n <= end; n++) {
    const pg = byPage.get(n);
    if (!pg) continue;
    const text = (pg.text || "").trim();
    blocks.push("=== Page " + n + " ===\n" + (text || "[blank page]"));
  }
  return blocks.join("\n\n");
}
