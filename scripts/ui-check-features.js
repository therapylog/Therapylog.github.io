#!/usr/bin/env node
/*
 * Smoke check for the features added in the Pro/entitlement work. OPTIONAL —
 * not in CI (needs Chromium).
 *
 *     npm install playwright-core && node scripts/ui-check-features.js [-v]
 *
 * These all shipped without ever having been opened in a browser: the PCT
 * builder, the steady-state PK panel, the clinical analysis behind the report,
 * the scheduling engine, and the fifteen entitlement gates. A function that
 * exists, parses and is referenced can still throw the moment it renders, and
 * nothing else here would notice.
 *
 * Selectors key off ids and onclick handlers, never button copy. The older
 * checks matched the disclaimer button by its text, the text changed when the
 * age gate went in, and they spent a release silently skipping onboarding.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) { console.error("ui-check-features: playwright-core is not installed — skipping."); process.exit(0); }

/* Defaults to this repo's app.html. Point it at the generated native shell to
   check the same features survived the build:
     TL_APP_ROOT=../therapylog-app TL_APP_PAGE=www/index.html node scripts/ui-check-features.js */
const ROOT = path.resolve(__dirname, "..", process.env.TL_APP_ROOT || ".");
const PAGE = process.env.TL_APP_PAGE || "app.html";
const EXE = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
             "/opt/pw-browsers/chromium/chrome-linux/chrome",
             process.env.CHROMIUM_PATH].filter(Boolean).find((p) => fs.existsSync(p));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ server, port: server.address().port })));
}

const results = [];
const t = (name, ok, extra = "") => results.push([ok ? "PASS" : "FAIL", name, ok ? "" : String(extra).slice(0, 300)]);

async function openApp(browser, port, { pro } = {}) {
  const page = await browser.newPage({ viewport: { width: 414, height: 900 } });

  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  /* Only script errors. Resource-load failures here are the harness's own
     doing (off-origin requests are aborted below) and /_vercel/insights,
     which exists only on a Vercel deploy. */
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const s = m.text();
    if (/Failed to load resource|_vercel\/insights|ERR_FAILED/.test(s)) return;
    /* /sw.js and /_vercel/insights exist only on the deployed site; the
       service worker reports its own 404 with this wording. */
    if (/bad HTTP response code \(404\) was received when fetching the script/.test(s)) return;
    errors.push("console: " + s);
  });

  /* loadDemoData() asks for confirmation and headless dismisses dialogs by
     default, so without this the demo record silently never loads and every
     assertion about it passes against an empty store. */
  page.on("dialog", (d) => d.accept().catch(() => {}));

  /* Nothing off-origin. The Google Fonts stylesheet has no route out of this
     sandbox, and waiting for it to time out is most of the run. */
  

  /* A verified Pro entitlement, written the only way TLTier accepts one. */
  if (pro) {
    await page.addInitScript(() => {
      localStorage.setItem("tl_ent", JSON.stringify({
        tier: "pro", status: "active", source: "license", lifetime: true,
        plan: "lifetime", key: "TL-TEST", verifiedAt: Date.now(), expires: null }));
    });
  }
  await page.goto(`http://127.0.0.1:${port}/${PAGE}`);
  await page.waitForTimeout(900);

  const disc = page.locator('button[onclick="acceptDisclaimer()"]').first();
  if (await disc.count() && await disc.isVisible().catch(() => false)) {
    await disc.click();
    await page.waitForTimeout(250);
    const skip = page.locator('button:has-text("Skip setup, explore first")').first();
    if (await skip.count() && await skip.isVisible().catch(() => false)) {
      await skip.click(); await page.waitForTimeout(400);
    }
  }
  return { page, errors };
}

/* Tools is a section inside the "reference" hub, not a top-level nav item —
   the nav switches hubs (showHub) and the hub switches sections
   (switchHubSection). Drive both the way the buttons do. */
const gotoTools = async (page) => {
  await page.evaluate(() => window.showHub("reference", document.getElementById("nav-reference")));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.switchHubSection("reference", "tools", null));
  await page.waitForTimeout(350);
};
const toolTab = async (page, tab) => {
  await page.evaluate((x) => {
    const b = document.querySelector(`#page-tools .seg-btn[onclick*="'${x}'"]`);
    if (b) b.click();
  }, tab);
  await page.waitForTimeout(450);
};

(async () => {
  if (!EXE) { console.error("ui-check-features: no Chromium found — skipping."); process.exit(0); }
  const { server, port } = await serve();
  const browser = await chromium.launch({ executablePath: EXE, headless: !process.argv.includes("--headed"), args: ["--no-sandbox"] });

  /* ===== the scheduling engine, exercised in the page it ships in ===== */
  {
    const { page, errors } = await openApp(browser, port, { pro: true });
    const r = await page.evaluate(() => {
      const out = {};
      const start = "2026-01-01";
      const on = (rule, date) => window.tlDueOn(rule, date, start).length;
      /* every other day from the anchor */
      out.eod = [0, 1, 2, 3, 4].map((i) =>
        on({ compound: "x", dose: "1", every: { days: 2 } }, new Date(2026, 0, 1 + i)));
      /* the fractional case the naive modulo gets wrong: 3.5 days should land
         on days 0, 4, 7, 11, 14 (round(k*3.5)), not only every 7th */
      out.frac = [0, 3, 4, 7, 10, 11, 14].map((i) =>
        on({ compound: "x", dose: "1", every: { days: 3.5 } }, new Date(2026, 0, 1 + i)));
      /* 5 on, 2 off applies to the days the rule would otherwise fire */
      out.pattern = [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
        on({ compound: "x", dose: "1", daily: true, pattern: { on: 5, off: 2 } }, new Date(2026, 0, 1 + i)));
      /* a taper terminates itself */
      out.taper = [0, 7, 14, 21, 28].map((i) =>
        on({ compound: "x", per: "week", taper: [40, 40, 20, 20], daily: true }, new Date(2026, 0, 1 + i)));
      /* legacy freq objects still schedule */
      out.legacy = window.tlDueOn({ name: "T", dose: "100mg", freq: { type: "interval", interval: 3 } },
                                  new Date(2026, 0, 4), start).length;
      out.range = window.tlScheduleRange([{ compound: "x", dose: "1", every: { days: 7 } }],
                                         "2026-01-01", "2026-01-29", start).length;
      out.expected = window.tlExpectedDoses([{ compound: "x", dose: "1", daily: true, times: ["08:00", "20:00"] }],
                                            "2026-01-01", "2026-01-07", start);
      return out;
    });
    t("tlDueOn: every 2 days", JSON.stringify(r.eod) === JSON.stringify([1, 0, 1, 0, 1]), JSON.stringify(r.eod));
    t("tlDueOn: every 3.5 days lands twice weekly, not weekly",
      JSON.stringify(r.frac) === JSON.stringify([1, 0, 1, 1, 0, 1, 1]), JSON.stringify(r.frac));
    t("tlDueOn: 5-on/2-off cycling", JSON.stringify(r.pattern) === JSON.stringify([1, 1, 1, 1, 1, 0, 0, 1]), JSON.stringify(r.pattern));
    t("tlDueOn: a taper stops when the list runs out",
      JSON.stringify(r.taper) === JSON.stringify([1, 1, 1, 1, 0]), JSON.stringify(r.taper));
    t("tlDueOn: legacy freq objects still work", r.legacy === 1, r.legacy);
    t("tlScheduleRange: weekly over 29 days gives 5 days", r.range === 5, r.range);
    t("tlExpectedDoses: twice daily for a week is 14", r.expected === 14, r.expected);
    t("scheduling engine raises no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== the panels that had never been rendered ===== */
  {
    const { page, errors } = await openApp(browser, port, { pro: true });
    await page.evaluate(() => window.loadDemoData && window.loadDemoData());
    await page.waitForTimeout(700);

    await gotoTools(page);
    await toolTab(page, "pct");
    const pct = await page.evaluate(() => {
      const el = document.getElementById("tool-pct");
      return { shown: !!el && el.style.display !== "none",
               html: el ? el.innerHTML.length : 0, text: el ? el.textContent.trim() : "" };
    });
    t("PCT builder tab opens", pct.shown, JSON.stringify(pct));
    t("PCT builder renders a plan, not its empty state",
      pct.html > 400 && !/Log a few doses first/.test(pct.text), pct.text.slice(0, 160));

    const pctData = await page.evaluate(() => {
      const p = window.tlPctPlan({
        compounds: [{ id: "test-cyp", name: "Testosterone Cypionate", halfLifeH: 192, lastDose: "2026-01-01" }],
        includeHcg: true, cycleWeeks: 16 }, {}, {});
      return { clear: p.clearances[0], start: p.earliestStart, order: p.ordering.map((s) => s.phase),
               blood: p.bloodwork.length, note: !!p.recoveryNote };
    });
    t("tlPctPlan computes clearance from the half-life",
      pctData.clear && pctData.clear.clearDays === 40, JSON.stringify(pctData.clear));
    t("tlPctPlan dates the earliest start", pctData.start && pctData.start.date === "2026-02-10", JSON.stringify(pctData.start));
    t("tlPctPlan orders hCG before SERMs",
      JSON.stringify(pctData.order) === JSON.stringify(["hCG", "SERM", "Off"]), JSON.stringify(pctData.order));
    t("tlPctPlan returns three bloodwork points", pctData.blood === 3, pctData.blood);
    t("tlPctPlan states recovery honestly", pctData.note);

    await gotoTools(page);
    await toolTab(page, "calc");
    const pk = await page.evaluate(() => {
      /* tlPkSteadyState(halfLifeH, intervalH, tmaxH) — positional. */
      const ss = window.tlPkSteadyState(168, 84);
      return ss && { ratio: Math.round(ss.accumulation * 100) / 100,
                     keys: Object.keys(ss).length };
    });
    /* Weekly-ish dosing of a 7-day half-life: 1/(1-e^(-ln2*84/168)) = 3.41 */
    t("tlPkSteadyState computes the accumulation ratio",
      pk && Math.abs(pk.ratio - 3.41) < 0.02, JSON.stringify(pk));

    t("panels render with no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== the clinical report, which now runs the analysis ===== */
  {
    const { page, errors } = await openApp(browser, port, { pro: true });
    await page.evaluate(() => window.loadDemoData && window.loadDemoData());
    await page.waitForTimeout(700);
    const rep = await page.evaluate(() => {
      const d = window.gd();
      const fields = (typeof LAB_FIELDS !== "undefined") ? LAB_FIELDS : [];
      const a = window.tlClinicalAnalysis(d, fields, {});
      return { fields: fields.length, entries: (d.entries || []).length,
               panels: a.panels.length, markers: a.markers.length, intervals: a.intervals.length,
               coverage: a.coverage.days, adherence: a.adherence ? a.adherence.pct : null };
    });
    t("tlClinicalAnalysis reads the demo record", rep.panels > 0 && rep.markers > 0, JSON.stringify(rep));
    t("tlClinicalAnalysis builds per-interval movement", rep.intervals > 0, JSON.stringify(rep));
    t("tlClinicalAnalysis measures the record's span", rep.coverage > 0, JSON.stringify(rep));
    t("clinical analysis raises no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== every gate actually gates on the free tier ===== */
  {
    const { page, errors } = await openApp(browser, port);
    const tier = await page.evaluate(() => window.TLTier.get());
    t("a fresh install is free", tier === "free", tier);
    const gated = await page.evaluate(() => {
      const paid = ["bloodwork_trends", "clinical_reports", "blood_pressure", "symptoms", "cycle_tracker",
                    "refill_tracker", "progress_photos", "encyclopedia_advanced", "pk_advanced",
                    "protocol_templates", "correlations", "cost_tracking", "pct_builder"];
      const free = ["daily_log", "bloodwork_manual", "body_comp", "encyclopedia", "reconstitution",
                    "reminders", "interactions"];
      const leaked = paid.filter((f) => window.TLTier.check(f) === true);
      const blocked = free.filter((f) => window.TLTier.check(f) !== true);
      const unknown = window.TLTier.check("a_key_nobody_listed");
      return { leaked, blocked, unknown };
    });
    t("no paid feature is reachable on the free tier", gated.leaked.length === 0, gated.leaked.join(", "));
    t("every free feature stays free", gated.blocked.length === 0, gated.blocked.join(", "));
    t("an unlisted feature gates rather than unlocking", gated.unknown === false, gated.unknown);
    t("gating raises no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== the managed-AI quota counter ===== */
  {
    const page = await browser.newPage({ viewport: { width: 414, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    /* Reply the way the API does: the quota fields ride on the AI response. */
    let reply = { content: [{ type: "text", text: "ok" }],
                  _tl_remaining: 43, _tl_limit: 50, _tl_remaining_day: 9, _tl_limit_day: 12 };
    await page.route("**/api/ai-research", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply) }));
    await page.addInitScript(() => {
      localStorage.setItem("tl_ent", JSON.stringify({
        tier: "pro", status: "active", source: "license", lifetime: true,
        plan: "lifetime", key: "TL-TEST", verifiedAt: Date.now(), expires: null }));
      localStorage.setItem("tl_ai_ctx_ok", JSON.stringify({ v: 1, at: new Date().toISOString() }));
    });
    await page.goto(`http://127.0.0.1:${port}/${PAGE}`);
    await page.waitForTimeout(900);
    const disc = page.locator('button[onclick="acceptDisclaimer()"]').first();
    if (await disc.count() && await disc.isVisible().catch(() => false)) {
      await disc.click(); await page.waitForTimeout(250);
      const skip = page.locator('button:has-text("Skip setup, explore first")').first();
      if (await skip.count() && await skip.isVisible().catch(() => false)) { await skip.click(); await page.waitForTimeout(400); }
    }

    const before = await page.evaluate(() => {
      const el = document.getElementById("ai-quota");
      return { text: el.textContent, shown: el.style.display !== "none" };
    });
    t("the counter is hidden before anything is known", !before.shown && !before.text, JSON.stringify(before));

    /* one chat question */
    await page.evaluate(() => window.showHub("me", document.getElementById("nav-me")));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.switchHubSection("me", "ai", null));
    await page.waitForTimeout(300);
    await page.evaluate(() => { const e = document.getElementById("chat-in"); if (e) e.value = "hello"; });
    await page.evaluate(() => window.sendChat());
    await page.waitForTimeout(900);

    const after = await page.evaluate(() => {
      const el = document.getElementById("ai-quota");
      return { text: el.textContent, shown: el.style.display !== "none" };
    });
    t("the counter shows both windows after a request",
      after.shown && /9 left today/.test(after.text) && /43 this month/.test(after.text), JSON.stringify(after));

    /* the lab-tab copy reads the same store */
    const lab = await page.evaluate(() => {
      const el = document.getElementById("lab-quota");
      return el ? { text: el.textContent, shown: el.style.display !== "none" } : null;
    });
    t("the scan tab shows the same figure", lab && /9 left today/.test(lab.text), JSON.stringify(lab));

    /* it survives a reload without spending a request */
    await page.reload();
    await page.waitForTimeout(1100);
    const reloaded = await page.evaluate(() => document.getElementById("ai-quota").textContent);
    t("the figure survives a reload", /43 this month/.test(reloaded), reloaded);

    /* running out is called out, not just counted down */
    reply = { content: [{ type: "text", text: "ok" }], _tl_remaining: 0, _tl_limit: 50, _tl_remaining_day: 0, _tl_limit_day: 12 };
    await page.evaluate(() => { window._lastAISend = 0; });
    await page.evaluate(() => { const e = document.getElementById("chat-in"); if (e) e.value = "again"; });
    await page.evaluate(() => window.sendChat());
    await page.waitForTimeout(900);
    const empty = await page.evaluate(() => {
      const el = document.getElementById("ai-quota");
      return { text: el.textContent, color: el.style.color };
    });
    t("nothing left is coloured as a warning", /0 left today/.test(empty.text) && /accent3/.test(empty.color), JSON.stringify(empty));

    /* BYOK has no limit to show */
    reply = { content: [{ type: "text", text: "ok" }] };
    /* sendChat refuses inside AI_COOLDOWN_MS (8s) and returns before it ever
       reaches the endpoint, so without clearing this the send is a no-op and
       the counter keeps the previous value — which reads as a failure of the
       quota logic rather than of the test. */
    await page.evaluate(() => { window._lastAISend = 0; });
    await page.evaluate(() => { const e = document.getElementById("chat-in"); if (e) e.value = "byok"; });
    await page.evaluate(() => window.sendChat());
    await page.waitForTimeout(900);
    const byok = await page.evaluate(() => {
      const el = document.getElementById("ai-quota");
      return { text: el.textContent, shown: el.style.display !== "none" };
    });
    t("a response with no quota clears the counter", !byok.shown && !byok.text, JSON.stringify(byok));
    t("the quota counter raises no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== the service worker stays off native ===== */
  {
    const page = await browser.newPage({ viewport: { width: 414, height: 900 } });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    /* Stand in for the Capacitor runtime, which injects this before the page
       script runs. A service worker in the native WebView would cache the
       bundle and then serve the previous build's assets after an app update. */
    const tries = [];
    await page.addInitScript(() => {
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios", Plugins: {} };
      const reg = navigator.serviceWorker && navigator.serviceWorker.register;
      if (reg) {
        navigator.serviceWorker.register = function (u) {
          window.__swTried = (window.__swTried || []).concat(u);
          return Promise.reject(new Error("blocked by test"));
        };
      }
    });
    await page.goto(`http://127.0.0.1:${port}/${PAGE}`);
    await page.waitForTimeout(900);
    const tried = await page.evaluate(() => window.__swTried || []);
    t("no service worker is registered on native", tried.length === 0, JSON.stringify(tried));
    await page.close();

    const web = await browser.newPage({ viewport: { width: 414, height: 900 } });
    await web.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await web.addInitScript(() => {
      const reg = navigator.serviceWorker && navigator.serviceWorker.register;
      if (reg) {
        navigator.serviceWorker.register = function (u) {
          window.__swTried = (window.__swTried || []).concat(u);
          return Promise.reject(new Error("blocked by test"));
        };
      }
    });
    await web.goto(`http://127.0.0.1:${port}/${PAGE}`);
    await web.waitForTimeout(900);
    const webTried = await web.evaluate(() => window.__swTried || []);
    t("the web build still registers its service worker",
      webTried.length === 1 && webTried[0] === "/sw.js", JSON.stringify(webTried));
    await web.close();
  }

  /* ===== the C-0 consent overlay actually reaches the screen ===== */
  {
    const { page, errors } = await openApp(browser, port, { pro: true });
    const shown = await page.evaluate(() => {
      /* Ask for it the way scanLabImage does. */
      const opened = window.showAICtxConsent(() => {}, "scan");
      const el = document.getElementById("ai-ctx-consent");
      const r = el.getBoundingClientRect();
      const yes = document.getElementById("ai-consent-yes");
      const yr = yes.getBoundingClientRect();
      /* Walk up for a display:none ancestor — the failure mode was this
         overlay living inside #onboarding, which is hidden once onboarding is
         done. A descendant of a display:none element lays out at 0x0 whatever
         its own position and z-index say, so the modal "opened" and nothing
         appeared. */
      let hidden = null;
      for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
        if (getComputedStyle(n).display === "none") { hidden = n.id || n.tagName; break; }
      }
      return { opened, w: Math.round(r.width), h: Math.round(r.height),
               yesW: Math.round(yr.width), text: yes.textContent, hiddenAncestor: hidden };
    });
    t("showAICtxConsent reports it opened", shown.opened === true, JSON.stringify(shown));
    t("the consent overlay has no display:none ancestor",
      shown.hiddenAncestor === null, "hidden by: " + shown.hiddenAncestor);
    t("the consent overlay fills the viewport", shown.w > 300 && shown.h > 300, JSON.stringify(shown));
    t("its accept button is laid out and labelled",
      shown.yesW > 100 && shown.text.length > 0, JSON.stringify(shown));
    t("consent overlay raises no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  /* ===== discreet reminders ===== */
  {
    const { page, errors } = await openApp(browser, port, { pro: true });
    const d = await page.evaluate(() => {
      const before = window.discreetReminders();
      window.setDiscreetReminders(true);
      const after = window.discreetReminders();
      window.setDiscreetReminders(false);
      return { before, after, off: window.discreetReminders() };
    });
    t("discreet reminders default off", d.before === false, JSON.stringify(d));
    t("discreet reminders can be turned on and off", d.after === true && d.off === false, JSON.stringify(d));
    t("reminder settings raise no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  await browser.close();
  server.close();

  const fail = results.filter((r) => r[0] === "FAIL");
  const verbose = process.argv.includes("-v") || fail.length;
  for (const [st, name, extra] of results) {
    if (verbose || st === "FAIL") console.log(`${st}  ${name}${extra ? "\n        " + extra : ""}`);
  }
  console.log(`\n${results.length - fail.length}/${results.length} passed`);
  process.exit(fail.length ? 1 : 0);
})();
