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
 * because this device had none. The model follows that decision and only
 * that decision, so the text and the model always describe one protocol:
 *
 *   - the device took the file's text: it takes the file's model with it, or,
 *     when the file has none, drops whatever model it had, so the model is
 *     read from the text it just took;
 *   - the device kept its own text: it keeps its own model, or lack of one;
 *   - neither has text: a device model with compounds is a protocol and is
 *     kept, and an empty one is not, so the file's model is taken.
 *
 * A model taken from the file brings the old fields with it where they could
 * disagree: reminder times for its compounds, written from its slots, and the
 * old text when the device has none, as tlStoreProtocol would write them.
 *
 * A model that cannot be read is skipped and reported, and the rest of the
 * import goes ahead: a damaged protocol in a backup must never cost the user
 * their entries.
 *
 * Returns { added, newer }, and `skipped: true` when the file's model was
 * left out: how many log rows were added, and whether the file came from a
 * newer version of the app than this one, in which case there may be keys in
 * it this build does not know to carry. */
function tlImportModel(current, imported, tookProto) {
  var out = { added: 0, newer: false };
  if (!current || !imported) return out;

  try {
    tlImportProtocol(current, imported, tookProto, out);
  } catch (e) {
    out.skipped = true;
    if (tookProto) delete current.protocol;
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

/* The protocol half of tlImportModel. Everything that can fail on a damaged
   file runs before the record is touched. */
function tlImportProtocol(current, imported, tookProto, out) {
  var model = null;
  if (imported.protocol !== undefined && imported.protocol !== null) {
    if (Array.isArray(imported.protocol.compounds)) model = tlNormalizeProtocol(imported.protocol);
    else out.skipped = true;
  }
  var legacy = model ? tlProtocolToLegacy(model) : null;
  var own = current.protocol && Array.isArray(current.protocol.compounds) ? current.protocol : null;

  var take = false;
  if (tookProto) {
    if (model) take = true;
    else delete current.protocol;
  } else if (!current.proto) {
    take = !!model && !(own && own.compounds.length);
  }
  if (!take) return;

  current.protocol = model;
  if (!current.proto && legacy.proto) current.proto = legacy.proto;
  var names = model.compounds.map(function (c) { return tlLegacyName(c.name); });
  if (!names.length) return;
  if (!tlIsObject(current.reminderTimes)) current.reminderTimes = {};
  names.forEach(function (name) {
    if (Object.prototype.hasOwnProperty.call(legacy.reminderTimes, name)) current.reminderTimes[name] = legacy.reminderTimes[name];
    else delete current.reminderTimes[name];
  });
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

/* The old protocol form saved new text. Record any dose that changed, and
   bring the model up to date with the text the user just wrote.
   `before` is tlProtocol() as it was before the save.
 *
 * With no stored model, nothing is stored: the model is read from the text,
 * as it always is.
 *
 * With a stored model, the text cannot simply replace it: the old form has no
 * field for a compound's inventory, its key (which the doses already logged
 * carry), a rule the text could only write as a pulse, the slot times, the
 * alert switches or discreet. So the model is read again from the new text,
 * and each compound paired with one of the stored model's (tlPairCompounds,
 * the same pairing the dose-change log uses) keeps its key, encyclopedia id,
 * route and inventory, and its rule too while its frequency text is
 * unchanged. A compound the text adds gets a new key, never one the stored
 * model held, so a removed compound's logged doses cannot become its. The
 * protocol keeps its slot times, alert switches and discreet. That is stored
 * as the model; `proto` and `reminderTimes` keep exactly what the user
 * typed. Changes `d`; the caller saves. */
function tlAfterLegacyProtocolSave(d, before, env, nowIso) {
  var stored = d.protocol && Array.isArray(d.protocol.compounds) ? tlNormalizeProtocol(d.protocol) : null;
  var after = tlProtocolFromLegacy(d, env);
  if (stored) {
    after = tlCarryModel(stored, after);
    d.protocol = after;
    d.v = TL_SCHEMA;
  }
  return tlRecordDoseChanges(d, before, after, nowIso);
}

/* A model read from the old text, with what the text cannot say carried over
   from the stored model it replaces. Pure. */
function tlCarryModel(stored, read) {
  var pairs = tlPairCompounds(stored, read).pairs;
  var taken = {}, fresh = [];
  stored.compounds.forEach(function (c) { taken[c.key] = true; });
  var compounds = read.compounds.map(function (c) {
    var was = null;
    pairs.forEach(function (p) { if (p.now === c) was = p.was; });
    if (!was) { fresh.push(c); return c; }
    var keepRule = tlFreqUnchanged(was, c, stored.start);
    var m = {};
    Object.keys(was).forEach(function (k) { m[k] = was[k]; });
    m.name = c.name;
    m.dose = c.dose;
    m.freqText = c.freqText;
    m.rule = keepRule ? was.rule : c.rule;
    /* A rule written as a pulse reads back with no slots; its own stand. */
    m.slots = keepRule && was.rule && !c.rule ? was.slots : c.slots;
    if (c.note) m.note = c.note; else delete m.note;
    if (c.droppedTimes) m.droppedTimes = c.droppedTimes; else delete m.droppedTimes;
    return m;
  });
  fresh.forEach(function (c) { c.key = tlCompoundKey(c.name, c.drugId, taken); });
  return tlNormalizeProtocol({
    name: read.name, start: read.start, weeks: read.weeks, pct: read.pct, created: read.created,
    compounds: compounds, slots: stored.slots, discreet: stored.discreet
  });
}
