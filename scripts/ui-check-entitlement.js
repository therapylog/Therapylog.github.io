#!/usr/bin/env node
/*
 * Browser check for the paywall. OPTIONAL — not wired into CI (needs Chromium).
 *
 *     npm install playwright-core
 *     node scripts/ui-check-entitlement.js [-v] [--headed]
 *
 * The point of this file is to keep the honour system dead. It asserts that the
 * retired bypasses stay retired (writing `tl_tier`, calling `TLTier.set`, the
 * old two-button "pick your tier" dialog), that a real license unlocks through
 * /api/verify-license, that a lapsed or expired one loses access, and that the
 * AI endpoint is never called without a license attached.
 *
 * /api/verify-license and /api/ai-research are stubbed — nothing is spent.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) {
  console.error("ui-check-entitlement: playwright-core is not installed — skipping.");
  console.error("  npm install playwright-core   (then re-run; this check is optional)");
  process.exit(0);
}

const ROOT = path.join(__dirname, "..");
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
const t = (name, ok, extra = "") => results.push([ok ? "PASS" : "FAIL", name, ok ? "" : String(extra).slice(0, 220)]);
const VALID_KEY = "TL-4RT9-K2MX-8QN3";

async function openApp(browser, port, { seed, verifyReply } = {}) {
  const page = await browser.newPage({ viewport: { width: 414, height: 900 } });

  /* No off-origin requests. The Google Fonts stylesheet cannot resolve on an
     offline or sandboxed machine, and waiting for it to time out is most of
     the run. Per-file API stubs are registered separately and still win,
     because routes registered earlier take precedence. */
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const state = { verifyCalls: [], aiCalls: [], errors: [] };
  page.on("pageerror", (e) => state.errors.push(e.message));

  await page.route("**/api/verify-license", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    state.verifyCalls.push(body);
    /* Behave like the real endpoint: only the known key verifies. */
    const reply = (verifyReply || ((b) => (b.key === VALID_KEY || b.email || b.session
      ? { ok: true, tier: "pro", status: "active", expires: null, lifetime: true,
          plan: "lifetime", key: VALID_KEY, email: "buyer@example.com" }
      : { ok: false, tier: "free", reason: "unknown-key", message: "That key isn't recognized." })))(body);
    await route.fulfill({ status: reply._status || 200, contentType: "application/json", body: JSON.stringify(reply) });
  });
  await page.route("**/api/ai-research", async (route) => {
    state.aiCalls.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ markers: {}, extras: [] }) }] }) });
  });

  if (seed) await page.addInitScript(seed);
  await page.goto(`http://127.0.0.1:${port}/app.html`);
  await page.waitForTimeout(1100);
  const understood = page.locator('button[onclick="acceptDisclaimer()"]').first();
  if (await understood.count() && await understood.isVisible().catch(() => false)) {
    await understood.click(); await page.waitForTimeout(200);
    await page.locator('button:has-text("Skip setup, explore first")').first().click();
    await page.waitForTimeout(350);
  }
  return { page, state };
}

async function tryScan(page) {
  await page.locator(".nav-btn", { hasText: "Log" }).first().click();
  await page.waitForTimeout(200);
  await page.locator("#page-log .seg-btn", { hasText: "Labs" }).click();
  await page.waitForTimeout(300);
  await page.setInputFiles("#lab-file-input", { name: "p.png", mimeType: "image/png",
    buffer: Buffer.from("89504e470d0a1a0a", "hex") }).catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scanLabImage && window.scanLabImage());
  await page.waitForTimeout(300);
  /* The C-0 remediation put a consent step in front of the upload: the report
     image carries whatever the lab printed on it, so scanLabImage asks once
     before sending. This check predates that and was stopping at the modal,
     reporting "the scan goes through with a license" as a failure when the
     scan had simply never been agreed to. Accept it the way a user does. */
  const consent = page.locator("#ai-consent-yes");
  if (await consent.count() && await consent.isVisible().catch(() => false)) {
    await consent.click();
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(400);
}

(async () => {
  if (!EXE) { console.error("ui-check-entitlement: no Chromium found — skipping."); process.exit(0); }
  const { server, port } = await serve();
  const browser = await chromium.launch({ executablePath: EXE, headless: !process.argv.includes("--headed"), args: ["--no-sandbox"] });

  /* ===== 1. no license: gated, and the retired bypasses stay retired ===== */
  {
    const { page, state } = await openApp(browser, port);
    t("a fresh install is on the free tier", await page.evaluate(() => window.TLTier.get()) === "free");
    await tryScan(page);
    t("the AI scanner is gated without a license", state.aiCalls.length === 0, JSON.stringify(state.aiCalls));
    t("gating shows the upgrade prompt", await page.locator("#tl-upgrade-overlay").count() > 0);

    /* the old bypass: write the tier string yourself */
    const viaString = await page.evaluate(() => {
      localStorage.setItem("tl_tier", "pro");
      return window.TLTier.get();
    });
    t("writing tl_tier no longer grants anything", viaString === "free", viaString);

    /* the other old bypass: call the setter */
    const viaSetter = await page.evaluate(() => { window.TLTier.set("pro"); return window.TLTier.get(); });
    t("TLTier.set is ignored without a verified source", viaSetter === "free", viaSetter);

    /* only Apple's receipt path may set a tier directly */
    const viaIap = await page.evaluate(() => { window.TLTier.set("pro", "ios-iap"); return window.TLTier.get(); });
    t("the iOS in-app purchase path still works", viaIap === "pro", viaIap);
    await page.close();
  }

  /* ===== 2. the activation dialog asks for a key, not a preference ===== */
  {
    const { page, state } = await openApp(browser, port);
    await page.evaluate(() => window.TLTier.showActivation());
    await page.waitForTimeout(300);
    const overlay = page.locator("#tl-activate-overlay");
    t("activation dialog opens", await overlay.count() > 0);
    t("it asks for a license key", await page.locator("#tl-key-input").count() > 0);
    const text = await overlay.textContent();
    t("no self-serve tier buttons remain",
      !/One-Time APK|Pro — Subscription \(/.test(text), text.slice(0, 160));
    t("it offers the email fallback", /purchase email/i.test(text));
    t("it can resend a lost key", /Email me my key/i.test(text));

    /* a bad key is refused and changes nothing */
    await page.fill("#tl-key-input", "not-a-key");
    await page.locator("#tl-key-go").click();
    await page.waitForTimeout(300);
    t("a malformed key is refused client-side", await page.evaluate(() => window.TLTier.get()) === "free");

    /* the real thing */
    await page.fill("#tl-key-input", VALID_KEY);
    await page.locator("#tl-key-go").click();
    await page.waitForTimeout(900);
    t("verify-license was called with the key",
      state.verifyCalls.some((c) => c.key === VALID_KEY), JSON.stringify(state.verifyCalls));
    const ent = await page.evaluate(() => JSON.parse(localStorage.getItem("tl_ent") || "null"));
    t("a verified license is cached with its source", ent && ent.tier === "pro" && ent.source === "license", JSON.stringify(ent));
    t("the cache records when it was verified", ent && typeof ent.verifiedAt === "number");
    await page.close();
  }

  /* ===== 3. a verified license unlocks the AI, and the call carries it ===== */
  {
    const seed = () => {
      localStorage.setItem("tl_ent", JSON.stringify({ tier: "pro", status: "active", expires: null,
        lifetime: true, key: "TL-4RT9-K2MX-8QN3", verifiedAt: Date.now(), source: "license" }));
    };
    const { page, state } = await openApp(browser, port, { seed });
    t("a cached license reads as pro", await page.evaluate(() => window.TLTier.get()) === "pro");
    await tryScan(page);
    t("the scan goes through with a license", state.aiCalls.length === 1, JSON.stringify(state.aiCalls.length));
    t("the AI request carries the license key",
      state.aiCalls[0] && state.aiCalls[0].license === VALID_KEY, JSON.stringify(state.aiCalls[0] && Object.keys(state.aiCalls[0])));
    await page.close();
  }

  /* ===== 4. expiry, lapse, and outages ===== */
  {
    /* an expired subscription, cached: past the grace window it is free */
    const expired = () => {
      const past = Math.floor(Date.now() / 1000) - 30 * 86400;
      localStorage.setItem("tl_ent", JSON.stringify({ tier: "pro", status: "active", expires: past,
        lifetime: false, key: "TL-4RT9-K2MX-8QN3", verifiedAt: Date.now(), source: "license" }));
    };
    let { page } = await openApp(browser, port, { seed: expired });
    t("an expired plan reads as free even while cached",
      await page.evaluate(() => window.TLTier.get()) === "free");
    await page.close();

    /* stale cache we cannot re-verify: trust runs out after the grace */
    const stale = () => {
      localStorage.setItem("tl_ent", JSON.stringify({ tier: "pro", status: "active", expires: null,
        lifetime: true, key: "TL-4RT9-K2MX-8QN3",
        verifiedAt: Date.now() - 30 * 86400000, source: "license" }));
    };
    /* Stale AND unreachable: past the grace, an outage no longer covers it.
       (A stale cache that CAN be re-verified is fine — that's the next case.) */
    ({ page } = await openApp(browser, port, {
      seed: stale,
      verifyReply: () => ({ _status: 503, error: "service unavailable" })
    }));
    await page.waitForTimeout(600);
    t("a cache older than the offline grace stops counting",
      await page.evaluate(() => window.TLTier.get()) === "free");
    await page.close();

    /* ...and a stale cache that re-verifies cleanly comes back to life */
    ({ page } = await openApp(browser, port, { seed: stale }));
    await page.waitForTimeout(900);
    t("a stale cache that re-verifies is restored",
      await page.evaluate(() => window.TLTier.get()) === "pro");
    await page.close();

    /* Stripe says no: the daily refresh downgrades */
    const fresh = () => {
      localStorage.setItem("tl_ent", JSON.stringify({ tier: "pro", status: "active", expires: null,
        lifetime: false, key: "TL-4RT9-K2MX-8QN3",
        verifiedAt: Date.now() - 2 * 86400000, source: "license" }));
    };
    ({ page } = await openApp(browser, port, {
      seed: fresh,
      verifyReply: () => ({ ok: false, tier: "free", reason: "no-active-plan", message: "no plan" })
    }));
    await page.waitForTimeout(900);
    t("a lapsed license is dropped on the daily re-check",
      await page.evaluate(() => localStorage.getItem("tl_ent")) === null);
    await page.close();

    /* our outage must NOT punish a paying customer */
    ({ page } = await openApp(browser, port, {
      seed: fresh,
      verifyReply: () => ({ _status: 503, error: "service unavailable" })
    }));
    await page.waitForTimeout(900);
    const kept = await page.evaluate(() => window.TLTier.get());
    t("a license service outage keeps the cached plan", kept === "pro", kept);
    await page.close();
  }

  /* ===== 5. post-checkout auto-activation ===== */
  {
    const page = (await browser.newPage({ viewport: { width: 414, height: 900 } }));
    const calls = [];
    await page.route("**/api/verify-license", async (route) => {
      calls.push(JSON.parse(route.request().postData() || "{}"));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        ok: true, tier: "pro", status: "active", expires: null, lifetime: false,
        plan: "pro_monthly", key: VALID_KEY, email: "buyer@example.com" }) });
    });
    await page.goto(`http://127.0.0.1:${port}/app.html?tl_activated=pro&session_id=cs_test_123`);
    await page.waitForTimeout(1300);
    const u = page.locator('button[onclick="acceptDisclaimer()"]').first();
    if (await u.count() && await u.isVisible().catch(() => false)) { await u.click(); await page.waitForTimeout(600); }
    t("returning from checkout verifies by session id",
      calls.some((c) => c.session === "cs_test_123"), JSON.stringify(calls));
    t("checkout activation unlocks without waiting for the email",
      await page.evaluate(() => window.TLTier.get()) === "pro");
    await page.close();
  }

  /* ===== 6. the app tells people about backups and its own version ===== */
  {
    const { page } = await openApp(browser, port);
    await page.locator(".nav-btn", { hasText: "Health" }).first().click();
    await page.waitForTimeout(300);
    const profileBtn = page.locator('.nav-btn', { hasText: 'Health' });
    await page.evaluate(() => { if (typeof showPage === 'function') showPage('profile'); });
    await page.waitForTimeout(200);
    const card = await page.evaluate(() => {
      if (typeof renderBackupCard === 'function') renderBackupCard();
      const el = document.getElementById('tl-backup-card');
      return el ? el.textContent : '';
    });
    t("the profile shows a plan & backup card", /Plan & backup/i.test(card), card.slice(0, 100));
    t("it names the free plan when unlicensed", /Free plan/.test(card));
    t("it warns when there is no backup yet", /never backed up/i.test(card), card.slice(0, 200));
    t("it states data does not sync between devices", /does not sync/i.test(card));
    t("it recommends weekly backups", /weekly/i.test(card));
    t("it stamps the app version", /v\d{4}\.\d{2}\.\d{2}/.test(card), card.slice(-40));
    await page.close();
  }

  await browser.close();
  server.close();
  const bad = results.filter((r) => r[0] !== "PASS");
  if (process.argv.includes("-v") || bad.length) {
    const pad = Math.max(...results.map((r) => r[1].length));
    results.forEach(([s, n, e]) => console.log(`${s === "PASS" ? "✓" : "✗"} ${n.padEnd(pad)} ${e}`));
  }
  if (bad.length) {
    console.error(`ENTITLEMENT UI CHECK FAILED — ${bad.length} of ${results.length}`);
    process.exit(1);
  }
  console.log(`entitlement UI OK: ${results.length} checks — the honour-system bypasses are dead, `
    + "licenses verify, expiry and lapse downgrade, outages don't, and backups are surfaced");
  process.exit(0);
})().catch((e) => {
  const pad = results.length ? Math.max(...results.map((r) => r[1].length)) : 10;
  results.forEach(([s, n, x]) => console.log(`${s === "PASS" ? "✓" : "✗"} ${n.padEnd(pad)} ${x}`));
  console.error("ENTITLEMENT UI CHECK FAILED — " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
