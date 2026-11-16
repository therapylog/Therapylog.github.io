/* The record's new keys, and getting them through import.
 *
 * The redesign adds to the main record (docs/DATA-MODEL.md):
 *
 *     v             schema version. Absent on every record written before the
 *                   redesign; 3 once a protocol has been stored as the model.
 *     protocol      the protocol model (protocol.js)
 *     doseChanges   the dose-change log (changes.js), newest first
 *     settings      display settings that belong to the person, not the
 *                   device, so that a restored backup brings them back:
 *                   { figure, units }
 *
 * importData() copied a fixed list of keys and dropped the rest, so each of
 * these would have been lost in a backup round trip. tlImportModel() is the
 * other half of that function, for the keys above, with the same manners as
 * the half it joins: an import MERGES, and whatever is already on this device
 * wins.
 */

/* Carry the redesign's keys from an imported record into the current one.
 *
 * `tookProto` says whether importData just took the file's old-style protocol
 * because this device had none. The model follows the same rule and only that
 * rule: a device that already has a protocol, in either shape, keeps it whole.
 * Taking the file's model alongside the device's old text would leave the two
 * describing different protocols.
 *
 * Returns { added, newer }: how many log rows were added, and whether the file
 * came from a newer version of the app than this one, in which case there may
 * be keys in it this build does not know to carry. */
function tlImportModel(current, imported, tookProto) {
  var out = { added: 0, newer: false };
  if (!current || !imported) return out;

  var hadProtocol = !!(current.protocol && Array.isArray(current.protocol.compounds));
  var fileHas = !!(imported.protocol && Array.isArray(imported.protocol.compounds));
  if (!hadProtocol && fileHas && (tookProto || !current.proto)) {
    current.protocol = tlNormalizeProtocol(imported.protocol);
  }

  if (Array.isArray(imported.doseChanges)) {
    var have = {};
    (current.doseChanges || []).forEach(function (c) { if (c && c.ts) have[c.ts] = true; });
    var fresh = imported.doseChanges.filter(function (c) { return c && c.ts && !have[c.ts]; });
    if (fresh.length || Array.isArray(current.doseChanges)) {
      current.doseChanges = (current.doseChanges || []).concat(fresh)
        .sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); });
    }
    out.added = fresh.length;
  }

  if (imported.settings && typeof imported.settings === 'object' && !Array.isArray(imported.settings)) {
    var merged = {}, k;
    for (k in imported.settings) if (Object.prototype.hasOwnProperty.call(imported.settings, k)) merged[k] = imported.settings[k];
    for (k in (current.settings || {})) if (Object.prototype.hasOwnProperty.call(current.settings, k)) merged[k] = current.settings[k];
    current.settings = merged;
  }

  /* The version says what shape the record is in, so it follows the protocol:
     a record holding the model is at least version 3. */
  if (current.protocol && Array.isArray(current.protocol.compounds) && !(current.v >= TL_SCHEMA)) current.v = TL_SCHEMA;
  out.newer = typeof imported.v === 'number' && imported.v > TL_SCHEMA;
  return out;
}

/* A setting kept in the record, with its default. */
function tlSetting(d, name, fallback) {
  var s = d && d.settings;
  return s && s[name] !== undefined && s[name] !== null ? s[name] : fallback;
}

function tlSetSetting(d, name, value) {
  if (!d.settings || typeof d.settings !== 'object') d.settings = {};
  d.settings[name] = value;
  return d;
}

/* The old protocol form saved new text. Record any dose that changed, and drop
   a stored model so it is read again from the text the user just wrote.
   `before` is tlProtocol() as it was before the save. */
function tlAfterLegacyProtocolSave(d, before, env, nowIso) {
  delete d.protocol;
  var after = tlProtocolFromLegacy(d, env);
  return tlRecordDoseChanges(d, before, after, nowIso);
}
