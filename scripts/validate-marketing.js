#!/usr/bin/env node
/* Behavioural tests for marketing.html — the Marketing Suite.
 *
 * Everything network-facing is stubbed: no Anthropic, OpenAI, Gemini, GitHub or
 * Postiz call leaves the page. The stub records what would have been sent so
 * request shape (model, max_tokens, method) can be asserted too.
 *
 * Run: node scripts/validate-marketing.js
 */
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright-core');

const FILE = 'file://' + path.resolve(__dirname, '..', 'marketing.html');
const EXEC = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let pass = 0, fail = 0;
const ok  = m => { pass++; console.log('  ok   ' + m); };
const bad = m => { fail++; console.log('  FAIL ' + m); };
const eq  = (a, b, m) => (a === b ? ok(m) : bad(m + ' — got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b)));
const has = (hay, needle, m) => (String(hay).includes(needle) ? ok(m) : bad(m + ' — not found in ' + JSON.stringify(String(hay).slice(0, 200))));
const not = (hay, needle, m) => (!String(hay).includes(needle) ? ok(m) : bad(m + ' — unexpectedly present'));

/* Installed before any page script runs. Routes are matched in order. */
function installStub() {
  window.__calls = [];
  window.__routes = [];
  window.__route = (match, reply) => window.__routes.unshift({ match, reply });
  const real = window.fetch;
  window.fetch = async (url, opts) => {
    url = String(url);
    opts = opts || {};
    let body = null;
    try { body = opts.body ? JSON.parse(opts.body) : null; } catch (e) { body = opts.body; }
    window.__calls.push({ url, method: opts.method || 'GET', body });
    for (const r of window.__routes) {
      if (url.includes(r.match)) {
        const res = typeof r.reply === 'function' ? r.reply(body) : r.reply;
        return {
          ok: (res.status || 200) < 400,
          status: res.status || 200,
          json: async () => res.json,
          text: async () => JSON.stringify(res.json),
        };
      }
    }
    return { ok: false, status: 599, json: async () => ({ error: { message: 'no stub for ' + url } }), text: async () => '' };
  };
  window.__realFetch = real;
}

async function fresh(browser, seed) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => bad('uncaught page error: ' + e.message));
  await page.addInitScript(installStub);
  await page.addInitScript(s => {
    try {
      sessionStorage.setItem('tl_mkt_pin_ok', '1');
      if (s) localStorage.setItem('tl_mkt_v4', JSON.stringify(s));
    } catch (e) {}
  }, seed || null);
  await page.goto(FILE, { waitUntil: 'load' });
  await page.waitForTimeout(120);
  return { ctx, page };
}

const KEYED = { anthropic: 'sk-ant-test', model: 'claude-sonnet-5' };
const say = text => ({ json: { content: [{ type: 'text', text }], stop_reason: 'end_turn' } });

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });

  /* ── 1. content accuracy in the system prompt ─────────────────────────── */
  console.log('\nsystem prompt / brand facts');
  {
    const { ctx, page } = await fresh(browser);
    const sys = await page.evaluate(() => window.BASE_SYSTEM || (typeof BASE_SYSTEM !== 'undefined' ? BASE_SYSTEM : ''));
    const src = await page.evaluate(() => document.documentElement.innerHTML);
    has(sys, '100 markers', 'system prompt states the real marker count (100)');
    not(sys, '50+ markers', 'no stale "50+ markers" claim');
    has(sys, 'retired', 'the one-time tier is marked retired, not priced');
    has(sys, '$9.99', 'Pro Managed price present');
    has(sys, '$8.99', 'BYOK subscription price present');
    has(sys, 'Never invent or round a price', 'model is told not to invent prices');
    has(sys, 'Never claim store availability', 'store prohibition present');
    /* the app has no store listing — nothing may instruct the model to say it does */
    const briefs = await page.evaluate(() => JSON.stringify(window.FEATURE_BRIEFS || FEATURE_BRIEFS));
    not(briefs, 'App Store', 'no feature brief claims an App Store listing');
    const presets = await page.evaluate(() => JSON.stringify(window.PRESETS || PRESETS));
    not(presets, 'live on the iOS App Store', 'no campaign preset claims a store launch');
    not(src.replace(/Never claim store availability[\s\S]{0,200}/, ''), 'iOS App Store',
        'no visible UI copy advertises an App Store launch');
    has(await page.evaluate(() => document.getElementById('gen-feature').innerHTML), 'Home-Screen Install',
        'feature picker offers the truthful home-screen angle');
    await ctx.close();
  }

  /* ── 2. generate(): budgets, escaping, truncation, errors ─────────────── */
  console.log('\ngenerate()');
  {
    const { ctx, page } = await fresh(browser, KEYED);
    await page.evaluate(() => window.__route('api.anthropic.com', { json: { content: [{ type: 'text', text: 'hello <b>world</b>' }], stop_reason: 'end_turn' } }));
    await page.evaluate(() => window.generate());
    await page.waitForTimeout(80);
    const out = await page.evaluate(() => document.getElementById('gen-output').innerHTML);
    has(out, '&lt;b&gt;', 'model output is HTML-escaped');
    eq(await page.evaluate(() => document.getElementById('gen-output-wrap').style.display), 'block', 'output panel opens');

    /* per-platform token budget */
    const budgetFor = async platform => {
      await page.evaluate(p => { STATE.platform = p; window.__calls.length = 0; }, platform);
      await page.evaluate(() => window.generate());
      await page.waitForTimeout(60);
      return page.evaluate(() => window.__calls.find(c => c.url.includes('anthropic')).body.max_tokens);
    };
    eq(await budgetFor('twitter'), 500, 'twitter asks for a small budget');
    eq(await budgetFor('reddit'), 3000, 'reddit gets room for a long post');
    eq(await budgetFor('newsletter'), 2500, 'newsletter gets room for a long post');

    /* truncation must be surfaced, not silent */
    await page.evaluate(() => {
      STATE.platform = 'reddit';
      window.__route('api.anthropic.com', { json: { content: [{ type: 'text', text: 'cut off here' }], stop_reason: 'max_tokens' } });
    });
    await page.evaluate(() => window.generate());
    await page.waitForTimeout(80);
    const err = await page.evaluate(() => ({ shown: document.getElementById('gen-error').style.display, text: document.getElementById('gen-error').textContent }));
    eq(err.shown, 'block', 'truncation warning is displayed');
    has(err.text, 'length cap', 'truncation warning explains itself');

    /* HTTP errors get human text */
    for (const [status, needle] of [[401, 'API key rejected'], [429, 'Rate limited'], [529, 'overloaded']]) {
      await page.evaluate(s => window.__route('api.anthropic.com', { status: s, json: { error: { message: 'x' } } }), status);
      await page.evaluate(() => window.generate());
      await page.waitForTimeout(70);
      has(await page.evaluate(() => document.getElementById('gen-error').textContent), needle, 'HTTP ' + status + ' explained to the user');
    }
    await ctx.close();
  }

  /* ── 3. variant splitting and the char counter ────────────────────────── */
  console.log('\nvariant handling');
  {
    const { ctx, page } = await fresh(browser, KEYED);
    /* one variant requested, '===' inside the body must NOT split it */
    await page.evaluate(() => {
      STATE.variants = 1; STATE.platform = 'email';
      window.__route('api.anthropic.com', { json: { content: [{ type: 'text', text: 'SUBJECT: hi\n=====\nbody text' }], stop_reason: 'end_turn' } });
    });
    await page.evaluate(() => window.generate());
    await page.waitForTimeout(80);
    let r = await page.evaluate(() => ({ cards: document.querySelectorAll('.variant-card').length, boxes: document.querySelectorAll('.output-box').length }));
    eq(r.cards, 0, 'a single-variant post is not split on "====="');
    eq(r.boxes, 1, 'single variant renders one output box');

    /* three variants requested → three cards, each with its own copy button */
    await page.evaluate(() => {
      STATE.variants = 3; STATE.platform = 'twitter';
      const long = 'x'.repeat(300);
      window.__route('api.anthropic.com', { json: { content: [{ type: 'text', text: 'aaa\n=====\nbbb\n=====\n' + long }], stop_reason: 'end_turn' } });
    });
    await page.evaluate(() => window.generate());
    await page.waitForTimeout(80);
    r = await page.evaluate(() => ({
      cards: document.querySelectorAll('.variant-card').length,
      copies: document.querySelectorAll('.variant-card button').length,
      count: document.getElementById('char-count').textContent,
      list: (STATE.variantList || []).length,
    }));
    eq(r.cards, 3, 'three variants render three cards');
    eq(r.copies, 3, 'each variant has its own copy button');
    eq(r.list, 3, 'variant list is tracked for per-variant copy');
    has(r.count, '300 / 280', 'char count measures the longest variant, not the concatenation');
    has(r.count, 'longest variant', 'char count says which variant it measured');
    await ctx.close();
  }

  /* ── 4. refine() must not fail silently ──────────────────────────────── */
  console.log('\nrefine()');
  {
    const { ctx, page } = await fresh(browser, KEYED);
    await page.evaluate(() => { window.__route('api.anthropic.com', { json: { content: [{ type: 'text', text: 'first draft' }], stop_reason: 'end_turn' } }); });
    await page.evaluate(() => window.generate());
    await page.waitForTimeout(80);
    await page.evaluate(() => window.__route('api.anthropic.com', { status: 500, json: { error: { message: 'boom' } } }));
    await page.evaluate(() => window.refine('shorter'));
    await page.waitForTimeout(80);
    const e = await page.evaluate(() => ({ shown: document.getElementById('gen-error').style.display, text: document.getElementById('gen-error').textContent }));
    eq(e.shown, 'block', 'a failed refine reports the error');
    has(e.text, 'boom', 'the API message is shown');
    eq(await page.evaluate(() => document.getElementById('gen-btn').disabled), false, 'the button is re-enabled after a failed refine');
    /* refining with nothing generated explains itself instead of no-oping */
    await page.evaluate(() => { STATE.lastOutput = ''; window.hideErr(); window.refine('shorter'); });
    await page.waitForTimeout(40);
    has(await page.evaluate(() => document.getElementById('gen-error').textContent), 'Generate something first', 'refine with no draft explains itself');
    await ctx.close();
  }

  /* ── 5. gist sync: no false "Synced ✓", no destructive pull ───────────── */
  console.log('\ngist sync');
  {
    const seed = { github: 'ghp_x', gistId: 'g1', library: [{ id: 200, platform: 'reddit', content: 'local only', date: 'x' }] };
    const { ctx, page } = await fresh(browser, seed);
    /* a failed push must not claim success */
    await page.evaluate(() => window.__route('api.github.com/gists/g1', { status: 401, json: { message: 'Bad credentials' } }));
    await page.evaluate(() => window.syncNow());
    await page.waitForTimeout(120);
    const lbl = await page.evaluate(() => document.getElementById('sync-label').textContent);
    has(lbl, 'Sync failed', 'a 401 on push reports failure instead of "Synced"');

    /* pull must union, not overwrite: the local-only item survives */
    await page.evaluate(() => window.__route('api.github.com/gists/g1', {
      json: { files: { 'tl-marketing-data.json': { content: JSON.stringify({ v: 4, library: [{ id: 100, platform: 'twitter', content: 'remote only', date: 'y' }], campaigns: [] }) } } },
    }));
    await page.evaluate(() => window.pullGist('ghp_x', 'g1'));
    await page.waitForTimeout(120);
    const lib = await page.evaluate(() => STATE.library.map(i => i.content));
    eq(lib.length, 2, 'pull merges instead of replacing');
    has(JSON.stringify(lib), 'local only', 'an item saved only on this device survives a pull');
    has(JSON.stringify(lib), 'remote only', 'the remote item is pulled in');
    eq(lib[0], 'local only', 'merged library stays newest-first');

    /* a save schedules a push on its own */
    await page.evaluate(() => {
      window.__route('api.github.com/gists/g1', { json: { files: {} } });
      window.__calls.length = 0;
      STATE.lastOutput = 'auto push me'; window.saveToLibrary();
    });
    await page.waitForTimeout(4600);
    const patched = await page.evaluate(() => window.__calls.filter(c => c.method === 'PATCH').length);
    patched >= 1 ? ok('saving schedules an automatic push to the gist') : bad('no automatic push after a save');
    await ctx.close();
  }

  /* ── 6. custom campaigns are visible and removable ───────────────────── */
  console.log('\ncampaigns');
  {
    const { ctx, page } = await fresh(browser, { campaigns: [{ id: 7, name: 'Q3 <push>', goal: 'sell more' }] });
    await page.evaluate(() => window.showView('campaigns', null));
    await page.waitForTimeout(60);
    const host = await page.evaluate(() => document.getElementById('custom-campaigns').innerHTML);
    has(host, 'Q3 &lt;push&gt;', 'a saved campaign renders, escaped');
    has(host, 'sell more', 'the campaign goal renders');
    await page.evaluate(() => { window.confirm = () => true; window.deleteCampaign('7'); });
    await page.waitForTimeout(40);
    eq(await page.evaluate(() => STATE.campaigns.length), 0, 'a campaign can be deleted');
    /* creating one lands in the list and clears the form */
    await page.evaluate(() => {
      document.getElementById('nc-name').value = 'New one';
      document.getElementById('nc-goal').value = 'a goal';
      window.createCampaign();
    });
    await page.waitForTimeout(40);
    eq(await page.evaluate(() => STATE.campaigns.length), 1, 'createCampaign stores the campaign');
    eq(await page.evaluate(() => document.getElementById('nc-name').value), '', 'the new-campaign form is cleared');
    has(await page.evaluate(() => document.getElementById('custom-campaigns').innerHTML), 'New one', 'the new campaign is visible in the list');
    await ctx.close();
  }

  /* ── 7. navigation highlight survives code-driven view changes ────────── */
  console.log('\nnavigation');
  {
    const { ctx, page } = await fresh(browser);
    await page.evaluate(() => window.showView('schedule', null));
    await page.waitForTimeout(40);
    const active = await page.evaluate(() => Array.from(document.querySelectorAll('.mob-tab.active, .nav-item.active')).map(b => b.textContent.trim()));
    active.length >= 1 ? ok('a code-driven view change still lights up its nav entry (' + active.join(', ') + ')')
                       : bad('no nav entry highlighted after showView(id, null)');
    eq(await page.evaluate(() => document.querySelectorAll('.mob-tab.active').length), 1, 'exactly one bottom tab is active');
    await ctx.close();
  }

  /* ── 8. clipboard falls back instead of dying quietly ────────────────── */
  console.log('\nclipboard');
  {
    const { ctx, page } = await fresh(browser);
    const t = await page.evaluate(() => {
      /* simulate a browser with no async clipboard (file://, http, old iOS) */
      try { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); } catch (e) {}
      let copied = false;
      document.execCommand = () => { copied = true; return true; };
      window.copyText('hello');
      return { copied, toast: document.getElementById('toast').textContent };
    });
    eq(t.copied, true, 'copy falls back to execCommand when clipboard API is missing');
    has(t.toast, 'Copied', 'the fallback still confirms to the user');
    await ctx.close();
  }

  /* ── 9. DALL-E prompt extraction keeps the whole prompt ──────────────── */
  console.log('\nimage brief');
  {
    const { ctx, page } = await fresh(browser);
    const p = await page.evaluate(() => window.dallePromptFromBrief(
      '1. DALL-E 3 Prompt: A dark clinical scene,\nwarm morning light on a phone screen,\ngreen accent glow.\n2. Midjourney Prompt: same --ar 1:1\n3. Ideogram Prompt: x\n4. Avoid: y'));
    has(p, 'A dark clinical scene', 'the prompt starts where it should');
    has(p, 'green accent glow', 'a prompt wrapped over several lines is kept whole');
    not(p, 'Midjourney', 'the next section is not swallowed');
    not(p, 'DALL-E 3 Prompt:', 'the section label is stripped');
    await ctx.close();
  }

  /* ── 10. Postiz date validation ──────────────────────────────────────── */
  console.log('\npostiz');
  {
    const { ctx, page } = await fresh(browser, { postizKey: 'pk' });
    await page.evaluate(() => window.__route('/api/posts', { json: { id: 'p1' } }));
    /* a valid schedule goes out as a real ISO instant */
    const sent = await page.evaluate(async () => {
      document.getElementById('sched-content').value = 'a post';
      document.getElementById('sched-date').value = '2027-03-04T09:30';
      window.__calls.length = 0;
      await window.sendPostiz();
      const c = window.__calls.find(x => x.url.includes('/api/posts'));
      return { date: c && c.body.date, iso: new Date('2027-03-04T09:30').toISOString(), status: document.getElementById('sched-status').textContent };
    });
    eq(sent.date, sent.iso, 'a valid datetime-local value is sent as the matching UTC instant');
    has(sent.status, 'Scheduled', 'a successful send is confirmed');
    /* Browsers without datetime-local render a plain text box, so an unparsable
       string can still reach the code — it must not surface as a network error. */
    const msg = await page.evaluate(async () => {
      const el = document.getElementById('sched-date');
      el.type = 'text'; el.value = 'next tuesday-ish';
      await window.sendPostiz();
      return document.getElementById('sched-status').textContent;
    });
    has(msg, 'not valid', 'an unparsable date is reported as a date problem, not a network problem');
    const style = await page.evaluate(() => {
      window.showSchedStatus('one', 'ok'); window.showSchedStatus('two', 'error'); window.showSchedStatus('three', 'ok');
      return document.getElementById('sched-status').getAttribute('style');
    });
    eq((style.match(/background:/g) || []).length, 1, 'the status style is replaced, not appended to');
    await ctx.close();
  }

  /* ── 11. clearData really clears ─────────────────────────────────────── */
  console.log('\nclear data');
  {
    const { ctx, page } = await fresh(browser, { anthropic: 'sk-ant-x' });
    const left = await page.evaluate(() => {
      localStorage.setItem('tl_mkt_v3', JSON.stringify({ anthropic: 'sk-ant-old' }));
      window.confirm = () => true;
      /* stub the reload so the harness keeps the page */
      const orig = location.reload; location.reload = () => {};
      window.clearData();
      location.reload = orig;
      return { v4: localStorage.getItem('tl_mkt_v4'), v3: localStorage.getItem('tl_mkt_v3') };
    });
    eq(left.v4, null, 'the current settings key is removed');
    eq(left.v3, null, 'the legacy v3 key is removed too, so a reload cannot restore old keys');
    await ctx.close();
  }

  /* ── 12. graphics studio: image reaches the phone ────────────────────── */
  console.log('\ngraphics studio');
  {
    const { ctx, page } = await fresh(browser, { gemini: 'AIza', anthropic: 'sk-ant' });
    const px = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8/x8AAwMB/6X0kAAAAABJRU5ErkJggg==';
    await page.evaluate(p => window.__route('generativelanguage.googleapis.com', {
      json: { candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: p } }] } }] },
    }), px);
    await page.evaluate(() => { document.getElementById('gs-prompt').value = 'a prompt'; });
    await page.evaluate(() => window.gsGenerate(false));
    await page.waitForTimeout(120);
    has(await page.evaluate(() => document.getElementById('gs-image').src), 'data:image/png;base64,', 'a generated image is shown');
    const blob = await page.evaluate(() => { const b = window.gsBlob(); return { type: b.type, size: b.size }; });
    eq(blob.type, 'image/png', 'the image converts to a real Blob for saving/sharing');
    blob.size > 0 ? ok('the Blob has content (' + blob.size + ' bytes)') : bad('the Blob is empty');
    /* a Gemini refusal must surface, not vanish */
    await page.evaluate(() => window.__route('generativelanguage.googleapis.com', { json: { candidates: [{ content: { parts: [{ text: 'I cannot' }] } }] } }));
    await page.evaluate(() => window.gsGenerate(false));
    await page.waitForTimeout(120);
    has(await page.evaluate(() => document.getElementById('gs-error').textContent), 'No image in the response', 'a text-only Gemini reply is reported');
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
