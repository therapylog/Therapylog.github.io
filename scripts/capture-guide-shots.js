#!/usr/bin/env node
/*
 * Capture the screenshots used by guide.html. OPTIONAL — needs playwright-core.
 *
 *     npm install playwright-core && node scripts/capture-guide-shots.js
 *
 * Loads the app's own demo patient (fictional — no real health data), seeds a Pro
 * entitlement, stubs every API call, and photographs each screen the guide talks
 * about. Re-run it after a UI change so the manual never shows a stale app.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) { console.error("capture-guide-shots: playwright-core not installed — skipping."); process.exit(0); }

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "guide");
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

const AI_ANSWER = `**Short answer:** at 640 ng/dL total T with sensitive E2 at 27 pg/mL, your ratio is reasonable and I would not change your AI dose on this panel alone.

**What stands out**
- Hematocrit 52% is above the lab's range (38.3–48.6). This is the number to watch on TRT — it is the most common reason to adjust dose or donate.
- Total T is mid-range and E2 tracks it proportionally, which is usually what you want.

**Evidence tiers**
- *Established clinical use:* haematocrit monitoring on testosterone therapy is standard of care.
- *Community practice:* therapeutic phlebotomy at 52–54% is common but not a guideline threshold.

**What I would do**
1. Recheck CBC in 6–8 weeks before acting.
2. Hydrate properly before the draw — dehydration inflates haematocrit.
3. Take 52% to your prescriber rather than self-treating.

This is educational, not a diagnosis — bring the trend to your clinician.`;

(async () => {
  if (!EXE) { console.error("capture-guide-shots: no Chromium found — skipping."); process.exit(0); }
  const { server, port } = await serve();
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  /* Never touch the real API while taking pictures. */
  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    if (url.includes("ai-research")) {
      return route.fulfill({ status: 200, contentType: "application/json",
        body: JSON.stringify({ content: [{ type: "text", text: AI_ANSWER }], _tl_remaining: 43 }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.addInitScript(() => {
    /* both flags: the disclaimer gate is separate from the setup wizard */
    localStorage.setItem("tl-disclaimer-done", "1");
    localStorage.setItem("tl-ob-done", "1");
    localStorage.setItem("tl_ent", JSON.stringify({
      tier: "pro", status: "active", expires: Math.floor(Date.now() / 1000) + 25 * 86400,
      lifetime: false, willRenew: true, key: "TL-4RT9-K2MX-8QN3",
      verifiedAt: Date.now(), source: "license"
    }));
    localStorage.setItem("tl-last-export", String(Date.now() - 9 * 86400000));
  });
  page.on("dialog", (d) => d.accept());

  await page.goto(`http://127.0.0.1:${port}/app.html`);
  await page.waitForTimeout(1400);
  await page.evaluate(() => loadDemoData());
  await page.waitForTimeout(1400);

  const shots = [];
  const shoot = async (name, { nav, seg, before, clip, full } = {}) => {
    if (nav) { await page.locator(".nav-btn", { hasText: nav }).first().click(); await page.waitForTimeout(500); }
    if (seg) { await page.locator(`.seg-btn:has-text("${seg}")`).first().click(); await page.waitForTimeout(600); }
    if (before) await before();
    await page.waitForTimeout(500);
    const file = path.join(OUT, name + ".png");
    if (clip) {
      const el = page.locator(clip).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await el.screenshot({ path: file });
    } else {
      await page.screenshot({ path: file, fullPage: !!full });
    }
    shots.push(name);
  };

  await shoot("01-dashboard", { nav: "Home" });
  await shoot("02-log-dose", { nav: "Log", seg: "Meds" });
  await shoot("03-labs-form", { nav: "Log", seg: "Labs" });
  await shoot("04-labs-scan-card", { clip: ".card:has-text('Scan Lab Report')" });
  await shoot("05-bloodwork", { nav: "Health" });
  await shoot("06-ai-answer", {
    nav: "AI",
    before: async () => {
      const q = "My latest labs are in. Anything I should act on before my next injection?";
      await page.evaluate((text) => {
        const el = document.getElementById("chat-in");
        if (el) el.value = text;
      }, q);
      await page.waitForTimeout(200);
      await page.evaluate(() => { if (typeof sendChat === "function") sendChat(); });
      await page.waitForTimeout(2600);
      /* show the answer, not the question */
      await page.evaluate(() => {
        const m = document.getElementById("chat-msgs");
        if (m) m.scrollTop = m.scrollHeight;
      });
    }
  });
  /* Plan & backup lives on Settings (AI hub → Settings), not Profile */
  await shoot("07-plan-backup", {
    before: async () => {
      await page.evaluate(() => { if (typeof showPage === "function") showPage("settings"); });
      await page.waitForTimeout(600);
    },
    clip: "#tl-backup-card"
  });
  await shoot("08-activate", {
    before: async () => { await page.evaluate(() => window.TLTier.showActivation()); },
    clip: "#tl-activate-overlay > div"
  });

  await browser.close();
  server.close();
  const total = shots.reduce((a, n) => a + fs.statSync(path.join(OUT, n + ".png")).size, 0);
  console.log(`captured ${shots.length} screenshots into assets/guide (${(total / 1024 / 1024).toFixed(2)} MB)`);
  shots.forEach((n) => {
    const kb = Math.round(fs.statSync(path.join(OUT, n + ".png")).size / 1024);
    console.log(`  ${n}.png  ${kb} KB`);
  });
})();
