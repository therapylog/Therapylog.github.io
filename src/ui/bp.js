/*
 * Health -> Blood pressure (4c): the latest reading and its ACC/AHA category,
 * fourteen days as bars, the 7- and 14-day averages, and a new reading.
 *
 * The arithmetic and the categories are src/logic/health.js (tlBpStage,
 * tlBpValidate, tlBpDaily, tlBpAverage). A reading is stored exactly as the
 * old form stored one, so the old history, export and reports read it.
 * Device, conditions, notes, the full history and the Apple Health import
 * are the old BP section, one row away (#/health/readings).
 */

var TL_BP_LO = 60, TL_BP_HI = 150;   /* the chart's scale, mmHg */

/* "Today 07:12", "Yesterday 07:12", "Nov 11 07:12". */
function tlWhenText(iso, nowMs) {
  var day = tlDayKey(iso), today = tlDayKey(new Date(nowMs));
  var y = new Date(nowMs); y.setDate(y.getDate() - 1);
  var lead = day === today ? 'Today' : day === tlDayKey(y) ? 'Yesterday' : tlShortDate(new Date(iso).getTime());
  return lead + ' ' + tlClock(iso);
}

function tlBpPct(v) {
  return Math.max(0, Math.min(100, (v - TL_BP_LO) / (TL_BP_HI - TL_BP_LO) * 100));
}

/* "Testosterone Cypionate dose changed Nov 7". */
function tlDoseChangeCaption(c) {
  return c.name + ' dose changed ' + tlShortDate(new Date(c.ts).getTime());
}

/* Fourteen days of bars, diastolic to systolic, with dashed lines at 120 and
   80 and a dashed line where a dose changed. HTML rather than SVG so the bars
   keep their 6 px at any width. */
function tlBpChart(d, nowMs) {
  var days = tlBpDaily(d.entries || [], 14, nowMs), n = days.length;
  var last = -1;
  days.forEach(function (x, i) { if (x.sys !== null) last = i; });
  var first = tlDay(days[0].day).getTime();
  var changes = tlDoseChangesIn(d, first, nowMs);
  var x = function (i) { return ((i + 0.5) / n * 100).toFixed(3) + '%'; };
  var bars = days.map(function (b, i) {
    if (b.sys === null) return '';
    var top = 100 - tlBpPct(b.sys), bottom = tlBpPct(b.dia);
    return '<span class="tl-bp-bar' + (i === last ? ' tl-bp-bar-last' : '') + '" style="left:' + x(i) + ';top:' + top.toFixed(2) + '%;bottom:' + bottom.toFixed(2) + '%"></span>';
  }).join('');
  var marks = changes.map(function (c) {
    var i = Math.round((tlDay(tlDayKey(c.ts)).getTime() - first) / 864e5);
    return i >= 0 && i < n ? '<span class="tl-bp-change" style="left:' + x(i) + '"></span>' : '';
  }).join('');
  var label = days.filter(function (b) { return b.sys !== null; }).map(function (b) {
    return tlShortDate(tlDay(b.day).getTime()) + ' ' + b.sys + '/' + b.dia;
  }).join(', ');
  return '<div class="tl-bp-chart" role="img" aria-label="' + tlEsc('Daily blood pressure, last 14 days: ' + (label || 'no readings')) + '">' +
      '<div class="tl-bp-plot">' +
        '<span class="tl-bp-ref" style="top:' + (100 - tlBpPct(120)).toFixed(2) + '%"></span>' +
        '<span class="tl-bp-ref" style="top:' + (100 - tlBpPct(80)).toFixed(2) + '%"></span>' +
        marks + bars +
      '</div>' +
      '<span class="tl-bp-reflabel" style="top:' + (100 - tlBpPct(120)).toFixed(2) + '%">120</span>' +
      '<span class="tl-bp-reflabel" style="top:' + (100 - tlBpPct(80)).toFixed(2) + '%">80</span>' +
    '</div>' +
    '<div class="tl-bp-axis" aria-hidden="true"><span>' + tlShortDate(first) + '</span><span>Today</span></div>' +
    changes.map(function (c) {
      return '<p class="tl-bp-legend"><span class="tl-bp-legend-key" aria-hidden="true"></span>' + tlEsc(tlDoseChangeCaption(c)) + '</p>';
    }).join('');
}

function tlBpAvgCell(label, avg) {
  return '<div class="tl-bp-avg"><span class="tl-bp-avg-l">' + label + '</span>' +
    (avg ? '<span class="tl-bp-avg-v">' + avg.sys + '/' + avg.dia + '</span>' : '<span class="tl-bp-avg-v tl-bp-avg-none">No readings</span>') + '</div>';
}

var TL_BP_ERRORS = {
  systolic: 'Systolic is between 60 and 250.',
  diastolic: 'Diastolic is between 30 and 160.',
  order: 'Systolic, the first number, is the higher one.',
  pulse: 'Pulse is between 20 and 250.'
};

function tlBpField(id, label) {
  return '<div class="ds-field"><label for="' + id + '">' + label + '</label>' +
    '<input class="ds-input" id="' + id + '" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="3" enterkeyhint="next"></div>';
}

function tlBpScreen(el) {
  var d = gd(), now = Date.now();
  var readings = tlBpReadings(d.entries || []), latest = readings[readings.length - 1] || null;
  var head;
  if (latest) {
    var stage = tlBpStage(latest.sys, latest.dia);
    var tone = stage.tone === 'accent' ? 'ds-tag-outline' : stage.tone === 'danger' ? 'ds-tag-danger' : 'ds-tag-warn';
    head = '<div class="tl-bp-head"><span class="tl-bp-big"><span class="ds-big">' + latest.sys + '<span class="tl-bp-slash">/</span>' + latest.dia + '</span>' +
        '<span class="tl-bp-mmhg">mmHg</span></span>' +
        '<span class="ds-tag ' + tone + ' tl-bp-stage">' + tlEsc(stage.label) + '</span></div>' +
      '<p class="tl-bp-meta">' + tlEsc(tlWhenText(latest.ts, now)) + (latest.hr ? ' · pulse ' + latest.hr : '') + '</p>' +
      (stage.key === 'crisis' ? '<div class="tl-bp-crisis" role="note">' + tlIcon('warning') + '<p>The American Heart Association advises waiting five minutes and measuring again; ' +
        'if it is still this high, contact your physician right away. With chest pain, shortness of breath, back pain, numbness, weakness, a change in vision or ' +
        'difficulty speaking, call emergency services.</p></div>' : '');
  } else {
    head = '<p class="tl-bp-none">No readings yet. Log your first one below.</p>';
  }
  el.innerHTML = '<div class="ds-screen tl-bp ds-under-tabbar">' +
    '<section class="ds-hero tl-bp-hero" aria-label="Latest reading">' + head + (latest ? tlBpChart(d, now) : '') + '</section>' +
    '<div class="tl-bp-avgs">' + tlBpAvgCell('7-day average', tlBpAverage(d.entries, 7, now)) + tlBpAvgCell('14-day average', tlBpAverage(d.entries, 14, now)) + '</div>' +
    '<h2 class="ds-label tl-bp-h">New reading</h2>' +
    '<form class="tl-bp-form" novalidate>' +
      '<div class="tl-bp-fields">' + tlBpField('tl-bp-sys', 'Systolic') + tlBpField('tl-bp-dia', 'Diastolic') + tlBpField('tl-bp-pulse', 'Pulse') + '</div>' +
      '<p class="tl-bp-err" id="tl-bp-err" aria-live="polite"></p>' +
      '<button type="submit" class="ds-btn ds-btn-primary ds-btn-block" id="tl-bp-save" disabled>Log reading</button>' +
    '</form>' +
    tlFootnote('Categories follow the ACC/AHA ranges. They are not a diagnosis; share readings with your physician.') +
    '<div class="ds-list tl-bp-more">' +
      tlRow({ as: 'button', icon: 'clock-counter-clockwise', title: 'All readings', sub: 'Device, notes and history, and the Apple Health import', caret: true, attrs: 'data-tl-go="health/readings"' }) +
    '</div>' +
    '</div>';
  var root = el.firstChild, form = root.querySelector('.tl-bp-form');
  var f = function (id) { return root.querySelector('#' + id); };
  var check = function () {
    var v = tlBpValidate(f('tl-bp-sys').value, f('tl-bp-dia').value, f('tl-bp-pulse').value);
    f('tl-bp-save').disabled = !v.ok;
    f('tl-bp-err').textContent = !v.ok && v.error !== 'incomplete' ? TL_BP_ERRORS[v.error] : '';
    return v;
  };
  form.addEventListener('input', check);
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    var order = ['tl-bp-sys', 'tl-bp-dia', 'tl-bp-pulse'], next = order[order.indexOf(e.target.id) + 1];
    if (next) { e.preventDefault(); f(next).focus(); }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = check();
    if (!v.ok) return;
    var rec = gd();
    var st = typeof getBPStage === 'function' ? getBPStage(v.sys, v.dia) : null;
    rec.entries.unshift({ type: 'bloodpressure', ts: new Date().toISOString(), sys: v.sys, dia: v.dia, hr: v.pulse || null,
      device: '', conditions: '', notes: '', stage: (st && st.stage) || '' });
    sd(rec);
    tlBpScreen(el);
    if (typeof tlToast === 'function') tlToast('Reading saved: ' + v.sys + '/' + v.dia);
  });
}
