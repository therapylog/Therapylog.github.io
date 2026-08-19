#!/usr/bin/env node
/*
 * Public-page smoke check. OPTIONAL — not in CI (needs Chromium).
 *
 *     npm install playwright-core && node scripts/ui-check-site.js [-v]
 *
 * Loads every public page, fails on a JS error, and asserts the things that
 * would quietly cost money or trust if they regressed: the dead Google Drive
 * APK link stays gone, the split Mailchimp list stays gone, checkout buttons
 * reach the API with attribution attached, and the install instructions cover
 * iPhone as well as Android. Stripe and the API are stubbed.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) {
  console.error("ui-check-site: playwright-core is not installed — skipping.");
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
    let rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    let file = path.join(ROOT, rel);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file + "") && fs.existsSync(file + ".html")) file = file + ".html";
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r({ server, port: server.address().port })));
}

const results = [];
const t = (name, ok, extra = "") => results.push([ok ? "PASS" : "FAIL", name, ok ? "" : String(extra).slice(0, 200)]);

(async () => {
  if (!EXE) { console.error("ui-check-site: no Chromium found — skipping."); process.exit(0); }
  const { server, port } = await serve();
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ["--no-sandbox"] });
  const base = `http://127.0.0.1:${port}`;

  /* ---- every page loads clean ---- */
  for (const page of ["index.html", "download.html", "pro.html", "support.html", "privacy.html", "terms.html", "partnership.html"]) {
    const p = await browser.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const resp = await p.goto(`${base}/${page}`, { waitUntil: "load" });
    await p.waitForTimeout(400);
    t(`${page} loads`, resp && resp.status() === 200, resp && resp.status());
    t(`${page} has no JS errors`, errors.length === 0, JSON.stringify(errors));
    t(`${page} declares analytics`, await p.evaluate(() => !!document.querySelector('script[src*="_vercel/insights"]')));
    await p.close();
  }

  /* ---- the retired delivery path stays retired ---- */
  {
    const p = await browser.newPage();
    await p.goto(`${base}/download.html`);
    const html = await p.content();
    t("no Google Drive APK link anywhere", !/drive\.google\.com/.test(html));
    t("no APK sideload offer", !/Download Android APK/i.test(html));
    t("iPhone install instructions present", /Safari/.test(html) && /Add to Home Screen/i.test(html));
    t("Android install instructions present", /Install app/i.test(html));
    t("compound count is current", !/148/.test(html), (html.match(/148[^<]{0,20}/) || [])[0] || "");
    t("marker count is current", !/50\+ (lab )?markers/i.test(html));

    /* checkout reaches the API with attribution */
    let sent = null;
    await p.route("**/api/create-pro-subscription", async (route) => {
      sent = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: `${base}/index.html` }) });
    });
    await p.goto(`${base}/download.html?utm_source=reddit&utm_campaign=trt_launch`);
    await p.waitForTimeout(200);
    await p.locator("#lifetime-btn").click();
    await p.waitForTimeout(600);
    t("lifetime button starts a checkout", sent && sent.plan === "lifetime", JSON.stringify(sent));
    t("the campaign rides along to Stripe", sent && sent.ref === "trt_launch", JSON.stringify(sent));
    await p.close();
  }

  /* ---- one email list, and a way to recover a key ---- */
  {
    const p = await browser.newPage();
    let notify = null, verify = null;
    await p.route("**/api/launch-notify", async (route) => {
      notify = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await p.route("**/api/verify-license", async (route) => {
      verify = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, message: "If that address has a license, we've emailed the key to it." }) });
    });
    await p.goto(`${base}/support.html`);
    const html = await p.content();
    t("support page no longer posts to Mailchimp", !/list-manage\.com/.test(html));

    await p.fill("#nl-email", "reader@example.com");
    await p.locator("#mc-subscribe-btn").click();
    await p.waitForTimeout(500);
    t("support signup goes to our own endpoint", notify && notify.email === "reader@example.com", JSON.stringify(notify));
    t("support signup is tagged with its source", notify && notify.source === "support_page");

    await p.fill("#key-email", "buyer@example.com");
    await p.locator("#key-btn").click();
    await p.waitForTimeout(500);
    t("lost-key form asks for a resend", verify && verify.action === "resend" && verify.email === "buyer@example.com", JSON.stringify(verify));
    t("lost-key form answers without confirming who bought",
      /if that address has a license/i.test(await p.locator("#key-success").textContent()));
    await p.close();
  }

  /* ---- pricing page still checks out, with stored attribution ---- */
  {
    const p = await browser.newPage();
    let sent = null;
    await p.route("**/api/create-pro-subscription", async (route) => {
      sent = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: `${base}/index.html` }) });
    });
    await p.goto(`${base}/pro.html?utm_source=reddit&utm_campaign=peptides_ad`);
    await p.waitForTimeout(300);
    const btn = p.locator('button[id$="-btn"]').first();
    if (await btn.count()) { await btn.click(); await p.waitForTimeout(600); }
    t("pro page starts a checkout", sent && !!sent.plan, JSON.stringify(sent));
    t("pro page attributes the campaign", sent && sent.ref === "peptides_ad", JSON.stringify(sent));
    await p.close();
  }

  /* ---- privacy policy matches what the code actually does ---- */
  {
    const p = await browser.newPage();
    await p.goto(`${base}/privacy.html`);
    const text = await p.evaluate(() => document.body.innerText);
    t("privacy names Stripe and the licence key", /Stripe/.test(text) && /licence key|license key/i.test(text));
    t("privacy names the analytics we now run", /Vercel Web Analytics/.test(text));
    t("privacy no longer implies a single email processor only", /Resend/.test(text));
    t("privacy states health data never reaches us", /never receive your health data|stays on your device/i.test(text));
    await p.close();
  }

  await browser.close();
  server.close();
  const bad = results.filter((r) => r[0] !== "PASS");
  if (process.argv.includes("-v") || bad.length) {
    const pad = Math.max(...results.map((r) => r[1].length));
    results.forEach(([s, n, e]) => console.log(`${s === "PASS" ? "✓" : "✗"} ${n.padEnd(pad)} ${e}`));
  }
  if (bad.length) { console.error(`SITE CHECK FAILED — ${bad.length} of ${results.length}`); process.exit(1); }
  console.log(`site OK: ${results.length} checks — pages load clean, the Drive APK and the split Mailchimp list are gone, `
    + "checkout carries attribution, key recovery works, and the privacy policy matches the code");
  process.exit(0);
})().catch((e) => {
  const pad = results.length ? Math.max(...results.map((r) => r[1].length)) : 10;
  results.forEach(([s, n, x]) => console.log(`${s === "PASS" ? "✓" : "✗"} ${n.padEnd(pad)} ${x}`));
  console.error("SITE CHECK FAILED — " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
