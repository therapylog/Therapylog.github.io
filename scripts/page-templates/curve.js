/* Inline SVG serum-level curves, pre-rendered at build time.
 *
 * Pre-rendered rather than drawn by Chart.js on load, because a compound page's
 * whole point is the shape of that curve and a crawler that does not execute
 * the chart script should still see it. The interactive chart is an
 * enhancement on the calculator page, not the substance of a compound page.
 *
 * The curve function is app.html's own pkCurve(), lifted and run here in Node,
 * so a page's picture and the app's chart come from the same code.
 *
 * Deterministic: fixed decimal places, no clock, no randomness. */

const round = (n, p) => Number(n.toFixed(p));

/* Superposition of repeated doses of the same size — what "steady state"
   actually means. n doses at `interval` hours, sampled at t. */
function repeated(curve, interval, n) {
  return (t) => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const dt = t - i * interval;
      if (dt > 0) sum += curve(dt);
    }
    return sum;
  };
}

/* Peak and trough of the last dosing interval at steady state, and the ratio
   between them — the number that tells you whether a cadence is smooth. */
function steadyState(curve, hl, interval) {
  const doses = Math.max(12, Math.ceil((7 * hl) / interval) + 4);
  const f = repeated(curve, interval, doses);
  const start = (doses - 1) * interval;
  let peak = 0, trough = Infinity;
  const step = Math.max(interval / 400, 0.01);
  for (let t = start + step; t <= start + interval + 1e-9; t += step) {
    const v = f(t);
    if (v > peak) peak = v;
    if (v < trough) trough = v;
  }
  /* When the interval is many half-lives long the trough is indistinguishable
     from zero, and peak ÷ trough is then a meaningless number with a lot of
     digits — an earlier version of this page reported a peak-to-trough ratio of
     188,571,048,347,090× for CJC-1295 dosed daily against a 30-minute
     half-life. `ratio` is null in that case and every caller has to say
     "not meaningful" rather than print it. */
  const cleared = trough < peak * 0.01;
  return {
    peak: round(peak, 3),
    trough: round(trough, 4),
    ratio: cleared ? null : round(peak / trough, 2),
    cleared,
    accumulation: round(1 / (1 - Math.pow(2, -interval / hl)), 2),
    doses
  };
}

const fmtHours = (h) => {
  if (h < 1) return round(h * 60, 0) + ' min';
  if (h < 48) return round(h, h % 1 === 0 ? 0 : 1) + ' h';
  const d = h / 24;
  return round(d, d % 1 === 0 ? 0 : 1) + ' days';
};

/* A line chart. Everything is computed to fixed precision so two runs of the
   generator produce identical bytes. */
function chart(o) {
  const W = 720, H = 300;
  /* padT leaves room for the legend inside the plot; padB for two rows below
     the axis, tick labels then the axis title. An earlier version put the
     legend and the axis title on the same baseline and they overlapped. */
  const padL = 52, padR = 18, padT = o.series.some((x) => x.label) ? 34 : 18, padB = 48;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const yMax = o.yMax;
  const xMax = o.xMax;
  const X = (t) => round(padL + (t / xMax) * plotW, 2);
  const Y = (v) => round(padT + plotH - (v / yMax) * plotH, 2);

  const gridX = o.xTicks.map((t) =>
    `<line x1="${X(t)}" y1="${padT}" x2="${X(t)}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>` +
    `<text x="${X(t)}" y="${H - 26}" fill="#78859b" font-size="11" text-anchor="middle">${o.xTickLabel(t)}</text>`
  ).join('');

  const gridY = o.yTicks.map((v) =>
    `<line x1="${padL}" y1="${Y(v)}" x2="${padL + plotW}" y2="${Y(v)}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>` +
    `<text x="${padL - 8}" y="${round(Y(v) + 4, 2)}" fill="#78859b" font-size="11" text-anchor="end">${o.yTickLabel(v)}</text>`
  ).join('');

  const paths = o.series.map((s) => {
    const pts = s.points.map(([t, v], i) => `${i ? 'L' : 'M'}${X(t)} ${Y(v)}`).join(' ');
    const area = s.fill
      ? `<path d="${pts} L${X(s.points[s.points.length - 1][0])} ${Y(0)} L${X(s.points[0][0])} ${Y(0)} Z" fill="${s.fill}" stroke="none"/>`
      : '';
    return area + `<path d="${pts}" fill="none" stroke="${s.color}" stroke-width="2" ` +
           `stroke-linejoin="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
  }).join('');

  const marks = (o.marks || []).map((m) =>
    `<line x1="${X(m.t)}" y1="${padT}" x2="${X(m.t)}" y2="${padT + plotH}" stroke="${m.color}" ` +
    `stroke-width="1" stroke-dasharray="3 3"/>` +
    `<text x="${round(X(m.t) + 5, 2)}" y="${padT + 12}" fill="${m.color}" font-size="10.5">${m.label}</text>`
  ).join('');

  /* Legend across the top of the plot, laid out left to right from padL, so it
     never lands on the axis title. */
  const labelled = o.series.filter((s) => s.label);
  let legendX = padL;
  const legend = labelled.map((s) => {
    const x = legendX;
    /* ~5.6px per character at 11px in this stack, plus the swatch and a gap. */
    legendX += 23 + Math.round(s.label.length * 5.6) + 18;
    return `<rect x="${x}" y="${padT - 26}" width="9" height="9" rx="2" fill="${s.color}"/>` +
      `<text x="${x + 14}" y="${padT - 18}" fill="#8a95a3" font-size="11">${s.label}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.alt}" xmlns="http://www.w3.org/2000/svg">
<title>${o.alt}</title>
${gridY}${gridX}
<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
${paths}${marks}
<text x="${padL + plotW / 2}" y="${H - 8}" fill="#78859b" font-size="11" text-anchor="middle">${o.xLabel}</text>
${legend}
</svg>`;
}

/* The two pictures every compound page carries: one dose, then the cadence the
   entry's own dosing rows describe. */
function singleDose(curve, hl, tmax, name) {
  const xMax = Math.max(hl * 5, tmax * 4);
  const points = [];
  const n = 240;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * xMax;
    points.push([round(t, 3), round(curve(t), 4)]);
  }
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => round(f * xMax, 2));
  return {
    svg: chart({
      series: [{ points, color: '#3bc4ff', fill: 'rgba(59,196,255,0.10)' }],
      xMax, yMax: 1.08,
      xTicks, xTickLabel: fmtHours,
      yTicks: [0, 0.25, 0.5, 0.75, 1], yTickLabel: (v) => round(v * 100, 0) + '%',
      xLabel: 'Time after one dose',
      marks: [
        { t: tmax, label: 'peak', color: '#4ade9a' },
        { t: hl, label: 'one half-life', color: '#f59e0b' }
      ],
      alt: `Modelled serum level after a single dose of ${name}: rising to a peak at ` +
           `${fmtHours(tmax)} and falling to half the peak roughly one half-life ` +
           `(${fmtHours(hl)}) after that, shown as a percentage of the peak.`
    }),
    xMax
  };
}

function steadyStateChart(curve, hl, tmax, interval, name, intervalLabel) {
  const ss = steadyState(curve, hl, interval);
  const doses = ss.doses;
  const f = repeated(curve, interval, doses);
  const window_ = Math.min(doses * interval, Math.max(interval * 8, hl * 6));
  /* A whole number of intervals, so the final tick lands exactly on the right
     edge of the plot rather than a little past it. */
  const shown = Math.max(2, Math.round(window_ / interval));
  const xMax = shown * interval;
  const g = repeated(curve, interval, shown + 1);
  const points = [];
  const n = 360;
  let yMax = 0;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * xMax;
    const v = g(t);
    if (v > yMax) yMax = v;
    points.push([round(t, 3), round(v, 4)]);
  }
  const single = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * xMax;
    single.push([round(t, 3), round(curve(t), 4)]);
  }
  const top = Math.ceil(yMax * 1.1 * 10) / 10;
  const xTicks = [];
  for (let k = 0; k <= shown; k++) xTicks.push(round(k * interval, 2));
  return {
    svg: chart({
      series: [
        { points: single, color: '#78859b', dash: '4 4', label: 'one dose alone' },
        { points, color: '#4ade9a', fill: 'rgba(74,222,154,0.10)', label: `${intervalLabel} (accumulating)` }
      ],
      xMax, yMax: top,
      xTicks, xTickLabel: fmtHours,
      yTicks: [0, top / 4, top / 2, (top * 3) / 4, top].map((v) => round(v, 2)),
      yTickLabel: (v) => round(v, 1) + '×',
      xLabel: 'Time from the first dose',
      alt: ss.cleared
        ? `Modelled level of ${name} dosed ${intervalLabel}: each dose rises and falls back to ` +
          `zero before the next arrives, so the repeated-dosing line traces the same shape as a ` +
          `single dose rather than accumulating.`
        : `Modelled accumulation of ${name} dosed ${intervalLabel}: successive doses stack ` +
          `until the level plateaus at about ${ss.accumulation}× what one dose alone reaches, ` +
          `oscillating between a trough and a peak about ${ss.ratio} times higher.`
    }),
    ss
  };
}

module.exports = { chart, repeated, steadyState, singleDose, steadyStateChart, fmtHours, round };
