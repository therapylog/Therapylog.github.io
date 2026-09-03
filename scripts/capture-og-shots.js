#!/usr/bin/env node
/*
 * Capture the per-page Open Graph share cards. OPTIONAL — needs playwright-core.
 *
 *     npm install playwright-core && node scripts/capture-og-shots.js
 *
 * Every generated page renders a 1200x630 share card when loaded with ?og=1,
 * built from that page's own <h1> and lede — so the card cannot say something
 * the page does not. This screenshots each one into assets/og/<slug>.png.
 *
 * Output is committed, like every other artifact in this repo: GitHub Pages has
 * no build step and Playwright is not in CI. scripts/build-pages.js points a
 * page's og:image at its own PNG when the file exists and at the shared
 * icons/og-image.png when it does not, so this script is an upgrade rather than
 * a prerequisite — but regenerate the pages after running it, or
 * build-pages --check will (correctly) report them stale.
 *
 * Skips cleanly with exit 0 when playwright-core is absent, the way
 * capture-guide-shots.js does, so a site-only checkout is unaffected.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) { console.error("capture-og-shots: playwright-core not installed — skipping."); process.exit(0); }

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "og");
const DATES = path.join(ROOT, "scripts", "page-dates.json");
const EXE = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
             "/opt/pw-browsers/chromium/chrome-linux/chrome",
             process.env.CHROMIUM_PATH].filter(Boolean).find((p) => fs.existsSync(p));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml",
  ".txt": "text/plain", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(ROOT, rel.replace(/^\/+/, ""));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, "127.0.0.1",
    () => r({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

/* /tools/half-life/semaglutide/ -> half-life-semaglutide; /tools/ -> tools */
const slugFor = (url) => url.replace(/^\/|\/$/g, "").replace(/^tools\/?/, "").replace(/\//g, "-") || "tools";

(async () => {
  if (!fs.existsSync(DATES)) {
    console.error("capture-og-shots: scripts/page-dates.json is missing — run node scripts/build-pages.js first.");
    process.exit(1);
  }
  const urls = Object.keys(JSON.parse(fs.readFileSync(DATES, "utf8"))).sort();
  fs.mkdirSync(OUT, { recursive: true });

  const { server, base } = await serve();
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1
  });

  let written = 0;
  const problems = [];
  for (const url of urls) {
    const slug = slugFor(url);
    const file = path.join(OUT, slug + ".png");
    await page.goto(base + url + "?og=1", { waitUntil: "load" });
    /* Wait for the webfonts, or the card photographs mid-swap. */
    await page.evaluate(() => (document.fonts ? document.fonts.ready : null));
    await page.waitForTimeout(180);
    const ok = await page.evaluate(() => {
      const c = document.querySelector(".og");
      return !!c && !!c.querySelector("h2") && c.querySelector("h2").textContent.trim().length > 3;
    });
    if (!ok) { problems.push(url + " did not render an ?og=1 card"); continue; }
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    written++;
    console.log(`  ${slug}.png  <-  ${url}?og=1`);
  }

  await browser.close();
  server.close();

  problems.forEach((p) => console.error("  ! " + p));
  console.log(`\ncapture-og-shots: wrote ${written} of ${urls.length} cards to assets/og/`);
  if (written) {
    console.log("Now run: node scripts/build-pages.js   (so each page points at its own card)");
  }
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error("capture-og-shots:", e && e.message); process.exit(1); });
