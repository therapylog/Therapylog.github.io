#!/usr/bin/env node
/*
 * Drive the generated /tools/ pages in a real browser. OPTIONAL — needs
 * playwright-core, and skips with exit 0 without it, like the other
 * ui-check-* scripts here.
 *
 *     npm install playwright-core && node scripts/ui-check-tools.js
 *
 * Why this exists on top of validate-public-pages.js: that script compares every
 * inlined function against app.html and runs them against a DOM stub, and it
 * still could not see that the syringe-planner page had interpolated the widget
 * OBJECT instead of its HTML — the script was present and correct, the markup
 * was simply absent. A browser notices. So this loads each page, watches for
 * page errors and 4xx requests, and works the widgets the way a visitor would.
 *
 * Run: node scripts/ui-check-tools.js
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright-core")); }
catch (e) { console.error("ui-check-tools: playwright-core not installed — skipping."); process.exit(0); }

const ROOT = path.join(__dirname, "..");
const EXE = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
             "/opt/pw-browsers/chromium/chrome-linux/chrome",
             process.env.CHROMIUM_PATH].filter(Boolean).find((p) => fs.existsSync(p));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml",
  ".txt": "text/plain", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

/* /_vercel/insights/script.js 404s off Vercel and every page loads it on
   purpose — ui-check-site.js asserts it is there. Not a broken link. */
const EXPECTED_404 = /\/_vercel\/insights\//;

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel === "/app") rel = "/app.html";
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

const results = [];
const t = (name, pass, detail) => {
  results.push(!!pass);
  if (!pass) console.log(`FAIL  ${name}${detail ? "  — " + detail : ""}`);
};
const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;

/* A page plus its error watchers. Set once the server and browser are up. */
let BROWSER = null;
let BASE = null;
async function open(url, viewport) {
  const page = await BROWSER.newPage({ viewport: viewport || { width: 1000, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push("js: " + String(e.message || e).slice(0, 160)));
  page.on("response", (r) => {
    if (r.status() >= 400 && !EXPECTED_404.test(r.url())) errs.push(r.status() + " " + r.url());
  });
  const resp = await page.goto(BASE + url, { waitUntil: "load" });
  await page.waitForTimeout(200);
  return { page, errs, status: resp && resp.status() };
}

(async () => {
  const datesFile = path.join(ROOT, "scripts", "page-dates.json");
  if (!fs.existsSync(datesFile)) {
    console.error("ui-check-tools: scripts/page-dates.json is missing — run node scripts/build-pages.js first.");
    process.exit(1);
  }
  const urls = Object.keys(JSON.parse(fs.readFileSync(datesFile, "utf8"))).sort();

  const { server, base } = await serve();
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  BROWSER = browser;
  BASE = base;

  /* ---- 1. every page loads clean, on desktop and on a phone ------------ */
  for (const url of urls) {
    const { page, errs, status } = await open(url);
    t(`${url} returns 200`, status === 200, String(status));
    t(`${url} loads with no page errors or broken requests`, errs.length === 0,
      errs.slice(0, 2).join(" | "));
    const shape = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      /* the widget markup has to be in the DOM, not just its script */
      widgets: document.querySelectorAll(".widget").length,
      objectLeak: document.body.innerText.indexOf("[object Object]") >= 0,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1
    }));
    t(`${url} has exactly one h1`, shape.h1 === 1, String(shape.h1));
    t(`${url} leaks no "[object Object]" into the page`, !shape.objectLeak);
    t(`${url} does not scroll sideways`, !shape.overflow);
    await page.close();
  }

  /* Widget-bearing pages must actually contain their widget. */
  for (const url of ["/tools/peptide-reconstitution-calculator/", "/tools/syringe-builder/",
                     "/tools/stack-checker/", "/tools/half-life-calculator/",
                     "/tools/free-testosterone-calculator/", "/tools/trt-dose-calculator/",
                     "/tools/insulin-syringe-units-calculator/"]) {
    const { page } = await open(url);
    const n = await page.evaluate(() =>
      document.querySelectorAll(".widget input, .widget select, #syr-rows select").length);
    t(`${url} renders an interactive widget`, n > 0, n + " controls found");
    await page.close();
  }

  /* ---- 2. reconstitution, through the app's own calcUnified() ---------- */
  {
    const { page, errs } = await open("/tools/peptide-reconstitution-calculator/");
    const r = await page.evaluate(() => {
      document.getElementById("uc-vial").value = "5";
      document.getElementById("uc-water").value = "2";
      document.getElementById("uc-dose").value = "250";
      document.getElementById("uc-unit").value = "mcg";
      document.getElementById("uc-syringe").value = "100";
      calcUnified();
      return { units: document.getElementById("uc-units").textContent.trim(),
               conc: document.getElementById("uc-conc-val").textContent.trim(),
               shown: document.getElementById("uc-s2").style.display,
               diagram: document.getElementById("uc-syringe-diagram").innerHTML.length,
               solved: tlReconSolve(5, 250, 100, 10) };
    });
    t("recon: 5 mg in 2 ml reads 2,500 mcg/ml", /2,?500/.test(r.conc), r.conc);
    t("recon: 250 mcg is 10 units", near(parseFloat(r.units), 10, 0.001), r.units);
    t("recon: the result block is revealed", r.shown !== "none", r.shown);
    t("recon: the syringe diagram draws", r.diagram > 50, String(r.diagram));
    t("recon: the reverse solver returns 2 ml", near(r.solved && r.solved.bacMl, 2, 1e-9),
      JSON.stringify(r.solved));
    const rev = await page.evaluate(() => {
      tlReconToggle();
      document.getElementById("uc-solve-dose").value = "250";
      tlReconRender();
      return { open: document.getElementById("uc-solve-panel").style.display,
               out: document.getElementById("uc-solve-out").innerText.trim().length };
    });
    t("recon: the reverse panel opens and lists options", rev.open !== "none" && rev.out > 20,
      JSON.stringify(rev));
    t("recon: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 3. insulin units ------------------------------------------------ */
  {
    const { page, errs } = await open("/tools/insulin-syringe-units-calculator/");
    const r = await page.evaluate(() => {
      document.getElementById("isu-conc").value = "2500";
      document.getElementById("isu-dose").value = "250";
      isuCalc();
      document.getElementById("isu-ml").value = "0.25"; isuMlToUnits();
      document.getElementById("isu-units").value = "30"; isuUnitsToMl();
      return { out: document.getElementById("isu-out").innerText,
               ml: document.getElementById("isu-ml-out").textContent.trim(),
               u: document.getElementById("isu-units-out").textContent.trim() };
    });
    t("insulin: 250 mcg at 2,500 mcg/ml is 10 units", /\b10\b/.test(r.out),
      r.out.replace(/\n/g, " ").slice(0, 110));
    t("insulin: 0.25 ml is 25 units", r.ml === "25 units", r.ml);
    t("insulin: 30 units is 0.300 ml", r.u === "0.300 ml", r.u);
    t("insulin: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 4. testosterone dose ------------------------------------------- */
  {
    const { page, errs } = await open("/tools/trt-dose-calculator/");
    const r = await page.evaluate(() => {
      document.getElementById("trt-weekly").value = "120";
      document.getElementById("trt-conc").value = "200";
      document.getElementById("trt-freq").value = "2";
      document.getElementById("trt-ester").value = "tc";
      trtCalc();
      const f = pkCurve(TRT_PK.tc.hl, TRT_PK.tc.tmax);
      return { out: document.getElementById("trt-out").innerText, ss: steadyState(f, TRT_PK.tc.hl, 84) };
    });
    t("TRT: 120 mg twice weekly is 60 mg per shot", /\b60\b/.test(r.out),
      r.out.replace(/\n/g, " ").slice(0, 140));
    t("TRT: 0.300 ml and 30 units", /0\.300 ml/.test(r.out) && /30 units/.test(r.out),
      r.out.replace(/\n/g, " ").slice(0, 180));
    t("TRT: twice-weekly cypionate is a 1.21x swing", r.ss && r.ss.ratio === 1.21,
      JSON.stringify(r.ss));
    t("TRT: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 5. free testosterone ------------------------------------------- */
  {
    const { page, errs } = await open("/tools/free-testosterone-calculator/");
    const r = await page.evaluate(() => {
      const a = tlVermeulen(600, 30, 4.3);
      document.getElementById("ft-total").value = "20.8";
      document.getElementById("ft-total-unit").value = "nmol/L";
      document.getElementById("ft-shbg").value = "30";
      document.getElementById("ft-alb").value = "4.3";
      ftCalc();
      return { a, nmol: document.getElementById("ft-out").innerText };
    });
    t("free-T: 600/30/4.3 gives about 134 pg/mL", near(r.a && r.a.freePgMl, 134, 4),
      r.a && String(r.a.freePgMl));
    t("free-T: the free fraction is about 2.2%", near(r.a && r.a.freePct, 2.23, 0.2),
      r.a && String(r.a.freePct));
    t("free-T: bioavailable is about 325 ng/dL", near(r.a && r.a.bioNgDl, 325, 15),
      r.a && String(r.a.bioNgDl));
    t("free-T: nmol/L input gives the same answer as ng/dL",
      /13[0-9]\.\d|12[5-9]\.\d/.test(r.nmol), r.nmol.replace(/\n/g, " ").slice(0, 140));
    t("free-T: the optimal band is labelled non-diagnostic",
      /non-diagnostic/i.test(r.nmol), r.nmol.replace(/\n/g, " ").slice(0, 200));
    t("free-T: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 6. the combined draw planner ---------------------------------- */
  {
    const { page, errs } = await open("/tools/syringe-builder/");
    const r = await page.evaluate(() => {
      const rows = document.querySelectorAll("#syr-rows select").length;
      syrField(0, "name", "Testosterone Cypionate");
      syrField(0, "dose", "60");
      syrField(0, "conc", "200");
      syrAddRow();
      syrField(1, "name", "BPC-157");
      syrField(1, "dose", "0.25");
      syrField(1, "conc", "2.5");
      syrRecalc();
      const blocked = document.getElementById("syr-result").innerText;
      /* two aqueous peptides should co-draw and total correctly */
      syrField(0, "name", "CJC-1295");
      syrField(0, "dose", "0.1");
      syrField(0, "conc", "1");
      syrRecalc();
      return { rows, blocked, ok: document.getElementById("syr-result").innerText,
               inj: syrInjectables().length };
    });
    t("planner: a row renders on load", r.rows > 0, String(r.rows));
    t("planner: the injectables list is populated", r.inj > 40, String(r.inj));
    t("planner: oil plus water is blocked", /cannot share a syringe/i.test(r.blocked),
      r.blocked.replace(/\n/g, " ").slice(0, 160));
    t("planner: two aqueous peptides co-draw", !/cannot share a syringe/i.test(r.ok),
      r.ok.replace(/\n/g, " ").slice(0, 160));
    t("planner: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 7. the half-life calculator, with Chart.js from /vendor -------- */
  {
    const { page, errs } = await open("/tools/half-life-calculator/");
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({
      chart: typeof Chart !== "undefined",
      instance: !!window.hlChart,
      out: document.getElementById("hl-out").innerText,
      options: document.querySelectorAll("#hl-compound option").length
    }));
    t("half-life: Chart.js loads from /vendor", r.chart);
    t("half-life: a chart instance is created", r.instance);
    t("half-life: the fact rows render", /half-life/i.test(r.out),
      r.out.replace(/\n/g, " ").slice(0, 140));
    t("half-life: the compound list is populated", r.options >= 45, String(r.options));
    /* a short-acting compound at a long interval must not report a peak:trough */
    const cleared = await page.evaluate(() => {
      document.getElementById("hl-compound").value = "cjc";
      document.getElementById("hl-freq").value = "7";
      hlCalc();
      return document.getElementById("hl-out").innerText;
    });
    t("half-life: a compound that clears between doses reports no peak:trough ratio",
      /not meaningful/i.test(cleared) && !/\d{6,}/.test(cleared),
      cleared.replace(/\n/g, " ").slice(0, 200));
    t("half-life: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 8. the combination checker ------------------------------------- */
  {
    const { page, errs } = await open("/tools/stack-checker/");
    const r = await page.evaluate(() => {
      document.getElementById("ix-d1").value = "Semaglutide";
      document.getElementById("ix-d2").value = "Tirzepatide";
      checkInteractions();
      const hit = document.getElementById("ix-result").innerText;
      document.getElementById("ix-d2").value = "Ipamorelin";
      checkInteractions();
      return { hit, miss: document.getElementById("ix-result").innerText,
               pairs: INTERACTIONS.length,
               options: document.querySelectorAll("#ix-d1 option").length };
    });
    t("checker: a documented danger pair is found", /GLP-1|Never Combine/i.test(r.hit),
      r.hit.replace(/\n/g, " ").slice(0, 140));
    t("checker: an empty result still says it is not a clearance",
      /not a complete list/i.test(r.miss) && /not a safety clearance/i.test(r.miss),
      r.miss.replace(/\n/g, " ").slice(0, 200));
    t("checker: pairs are inlined", r.pairs > 30, String(r.pairs));
    t("checker: the pickers are populated", r.options > 20, String(r.options));
    t("checker: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 9. the share card renders, and its text is not mangled --------- */
  {
    const { page, errs } = await open(
      "/tools/half-life/testosterone-cypionate/?og=1", { width: 1200, height: 630 });
    const r = await page.evaluate(() => {
      const c = document.querySelector(".og");
      return c ? { h2: c.querySelector("h2").textContent, p: c.querySelector("p").textContent } : null;
    });
    t("share card: renders at ?og=1", !!r);
    t("share card: carries the page's own heading",
      r && /Testosterone Cypionate half-life/.test(r.h2), r && r.h2);
    /* the escape-loss bug turned "6 days ... a dose" into "6 day ... a do e" */
    t("share card: the subtitle text is intact",
      r && /\bdays\b/.test(r.p) && /\bdose\b/.test(r.p) && /\blasts\b/.test(r.p),
      r && r.p);
    t("share card: no errors", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  /* ---- 10. a phone-width pass over the widget pages ------------------- */
  for (const url of ["/tools/", "/tools/peptide-reconstitution-calculator/",
                     "/tools/half-life/testosterone-cypionate/", "/tools/stack-checker/"]) {
    const { page, errs } = await open(url, { width: 390, height: 844 });
    const wide = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 1);
    t(`${url} does not scroll sideways at 390px`, !wide);
    t(`${url} has no errors at 390px`, errs.length === 0, errs.slice(0, 2).join(" | "));
    await page.close();
  }

  await browser.close();
  server.close();

  const failed = results.filter((x) => !x).length;
  console.log(`\nui-check-tools: ${results.length - failed}/${results.length} checks passed ` +
              `across ${urls.length} generated pages`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("ui-check-tools:", (e && e.message) || e); process.exit(1); });
