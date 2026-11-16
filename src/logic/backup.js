/* Backup state, and the log as a spreadsheet.
 *
 * Two different things, kept apart on purpose. A BACKUP is the JSON file
 * exportData() writes: the whole record, restorable. The CSV here is the log
 * laid out for a person to read, in a spreadsheet or at an appointment. It
 * cannot be restored from and does not count as a backup.
 */

var TL_BACKUP_STALE_DAYS = 7;

/* Where the user's backup stands.
 *
 *   lastExportMs   when a backup was last written (localStorage tl-last-export),
 *                  or null if never
 *   linked         whether a backup file is linked for the weekly rewrite
 *   hasData        whether there is anything to lose
 *
 * `stale` is what turns the Settings row amber: seven days or more since the
 * last backup, or no backup at all once there is something to back up. */
function tlBackupState(lastExportMs, nowMs, linked, hasData) {
  var never = !(lastExportMs > 0);
  var days = never ? null : Math.max(0, Math.floor((nowMs - lastExportMs) / 864e5));
  var stale = never ? !!hasData : days >= TL_BACKUP_STALE_DAYS;
  var line = '';
  if (stale) {
    line = never ? 'No backup yet. Weekly is the recommendation.'
      : 'Last backup was ' + days + (days === 1 ? ' day' : ' days') + ' ago. Weekly is the recommendation.';
  }
  return { never: never, lastAt: never ? null : lastExportMs, days: days, stale: stale, weekly: !!linked, line: line };
}

/* ---- CSV ----------------------------------------------------------------- */

/* One cell. Quoted when it holds a comma, a quote or a line break. A text cell
   that begins with = + - or @ gets a leading apostrophe: a spreadsheet would
   otherwise run a note like "=HYPERLINK(...)" as a formula. Numbers are left
   as numbers, so a negative value is not touched. */
function tlCsvCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return isFinite(v) ? String(v) : '';
  var s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function tlCsv(rows) {
  return rows.map(function (r) { return r.map(tlCsvCell).join(','); }).join('\r\n') + '\r\n';
}

/* The record as rows: Date, Time, Type, Item, Value, Unit, Notes. One row per
   logged thing, a lab panel and a set of measurements one row per value.
   Oldest first, the way a log is read. Dates and times are local. `label` may
   turn a lab marker's key into its name; without it the key is shown. */
function tlLogRows(d, label) {
  var rows = [], name = label || function (k) { return k; };
  var stamp = function (ts) {
    var x = new Date(ts);
    if (isNaN(x)) return ['', ''];
    return [tlDayKey(x), tlMinToTime(x.getHours() * 60 + x.getMinutes())];
  };
  var join = function (parts) { return parts.filter(function (p) { return p !== null && p !== undefined && p !== ''; }).join('; '); };
  var add = function (ts, type, item, value, unit, notes, day) {
    var s = stamp(ts);
    rows.push({ at: new Date(ts).getTime() || 0, row: [day || s[0], day ? '' : s[1], type, item, value, unit, notes || ''] });
  };

  ((d && d.entries) || []).forEach(function (e) {
    if (!e) return;
    if (e.type === 'weight') {
      var extra = join([
        e.energy ? 'energy ' + e.energy + '/10' : '', e.sleep ? 'sleep ' + e.sleep + ' h' : '',
        e.hrv ? 'HRV ' + e.hrv + ' ms' : '', e.steps ? 'steps ' + e.steps : '',
        e.stress ? 'stress ' + e.stress + '/10' : '', e.alcohol ? 'alcohol ' + e.alcohol : '',
        e.mood && e.mood.l ? 'mood ' + e.mood.l : '', e.notes
      ]);
      if (e.weight > 0) add(e.ts, 'Weight', 'Weight', e.weight, 'lb', extra);
      else if (extra) add(e.ts, 'Daily', 'Daily log', '', '', extra);
    } else if (e.type === 'medication') {
      add(e.ts, 'Dose', e.medication || '', e.dose || '', '', join([e.site ? 'site ' + e.site : '', e.notes]));
    } else if (e.type === 'bloodpressure') {
      add(e.ts, 'Blood pressure', 'Systolic/diastolic', e.sys + '/' + e.dia, 'mmHg',
        join([e.hr ? 'pulse ' + e.hr : '', e.device, e.conditions, e.notes]));
    } else if (e.type === 'symptom') {
      add(e.ts, 'Symptom', e.category || 'Symptom', e.severity || '', e.severity ? '/10' : '', join([e.description, e.related, e.notes]));
    } else if (e.type === 'body') {
      Object.keys(e.measurements || {}).forEach(function (k) {
        add(e.ts, 'Measurement', k, e.measurements[k], k === 'bf' ? '%' : 'in', e.notes);
      });
    } else if (e.type === 'bloodwork') {
      Object.keys(e.labs || {}).forEach(function (k) {
        var meta = (e.labMeta && e.labMeta[k]) || {};
        add(e.ts, 'Lab', name(k), e.labs[k], meta.unit || '', join([meta.method, e.notes]), e.labDate || null);
      });
    }
  });
  ((d && d.bodyComp) || []).forEach(function (b) {
    if (!b) return;
    add(b.ts, 'Body composition', 'Weight', b.weight, 'lb', '');
    add(b.ts, 'Body composition', 'Body fat', b.bf, '%', '');
    add(b.ts, 'Body composition', 'Lean mass (estimate)', b.lean, 'lb', '');
  });
  ((d && d.photos) || []).forEach(function (p) {
    if (!p) return;
    add(p.ts, 'Check-in', p.week || 'Check-in', '', '', join([p.notice, p.conditions, p.notes]), p.date || null);
  });
  ((d && d.doseChanges) || []).forEach(function (c) {
    if (!c) return;
    add(c.ts, 'Dose change', c.name || '', (c.from || '') + ' to ' + (c.to || ''), '', '');
  });

  rows.sort(function (a, b) { return a.row[0] < b.row[0] ? -1 : a.row[0] > b.row[0] ? 1 : a.at - b.at; });
  return [['Date', 'Time', 'Type', 'Item', 'Value', 'Unit', 'Notes']].concat(rows.map(function (r) { return r.row; }));
}

function tlLogCsv(d, label) { return tlCsv(tlLogRows(d, label)); }

/* ---- theme --------------------------------------------------------------- */

/* The theme to start in: the one the user chose, or failing that the device's
   own preference. The same rule initTheme() has always applied. */
function tlThemeFrom(saved, prefersDark) {
  if (saved === 'dark' || saved === 'light') return saved;
  return prefersDark ? 'dark' : 'light';
}
