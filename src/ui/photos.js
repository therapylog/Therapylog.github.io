/*
 * Health -> Photos (6d): progress photos by pose, the first and latest side
 * by side, and every photo.
 *
 * The images stay on this device, in their own IndexedDB database
 * (TherapyLogPhotos), compressed to JPEG on the way in. They are not in the
 * record and not in the backup file (docs/DATA-MODEL.md); "Export photos"
 * writes a zip of them (tlZip, src/logic/photos.js), and the screen says
 * both. "Delete all data" deletes this database with the others.
 *
 * Taking and keeping photos is capture, and free. Comparing them is the paid
 * part (progress_photos), as the design's Pro tag says. The written
 * check-ins the old Photos page kept are one row away (#/health/checkins).
 */

var TL_PHOTO_DB = 'TherapyLogPhotos';
var TL_PHOTO_EDGE = 1600, TL_PHOTO_Q = 0.82;     /* the photo: long edge, JPEG quality */
var TL_THUMB_EDGE = 360, TL_THUMB_Q = 0.7;       /* its thumbnail */
var tlPhState = { pose: 'front' };
var tlPhUrls = [];                              /* object URLs to revoke on the next draw */

/* ---- the store ----------------------------------------------------------- */

function tlPhotoOpen() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) { reject(new Error('This browser cannot keep photos.')); return; }
    var req = indexedDB.open(TL_PHOTO_DB, 1);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

/* Run `fn(store)` in one transaction; resolves with what fn's request gave,
   once the transaction has committed. */
function tlPhotoTx(mode, fn) {
  return tlPhotoOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction('photos', mode), out;
      var req = fn(tx.objectStore('photos'));
      if (req) req.onsuccess = function () { out = req.result; };
      tx.oncomplete = function () { db.close(); resolve(out); };
      tx.onerror = tx.onabort = function () { db.close(); reject(tx.error); };
    });
  });
}

/* Every photo, oldest first. */
function tlPhotoAll() {
  return tlPhotoTx('readonly', function (s) { return s.getAll(); }).then(function (list) {
    return (list || []).slice().sort(function (a, b) { return new Date(a.ts) - new Date(b.ts); });
  });
}
function tlPhotoPut(rec) { return tlPhotoTx('readwrite', function (s) { return s.put(rec); }); }
function tlPhotoDelete(id) { return tlPhotoTx('readwrite', function (s) { return s['delete'](id); }); }

/* An image file, scaled so its long edge is at most `edge`, as a JPEG. */
function tlPhotoShrink(file, edge, quality) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, edge / Math.max(w, h, 1));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) { if (b) resolve({ blob: b, w: c.width, h: c.height }); else reject(new Error('encode')); }, 'image/jpeg', quality);
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

/* Keep each file as a photo of `pose`. A photo taken now is dated now; an
   imported one keeps the date the file carries, when that is a plausible
   one, so the first and latest are the real first and latest. Resolves to
   how many were kept. */
function tlPhotoKeep(files, pose, taken) {
  var now = Date.now(), kept = 0;
  var one = function (file) {
    return Promise.all([tlPhotoShrink(file, TL_PHOTO_EDGE, TL_PHOTO_Q), tlPhotoShrink(file, TL_THUMB_EDGE, TL_THUMB_Q)]).then(function (r) {
      var when = !taken && file.lastModified > Date.UTC(2000, 0, 1) && file.lastModified <= now ? file.lastModified : Date.now();
      kept++;
      return tlPhotoPut({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), ts: new Date(when).toISOString(),
        pose: pose, w: r[0].w, h: r[0].h, blob: r[0].blob, thumb: r[1].blob });
    });
  };
  /* One at a time: a phone's memory holds one full-size decode at once. */
  return Array.prototype.reduce.call(files || [], function (p, f) {
    return p.then(function () { return one(f).catch(function () { return null; }); });
  }, Promise.resolve()).then(function () {
    /* Ask the browser not to clear this site's storage under pressure. */
    if (kept && navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }
    return kept;
  });
}

/* ---- export -------------------------------------------------------------- */

function tlPhotoExport() {
  return tlPhotoAll().then(function (list) {
    if (!list.length) return 0;
    var names = tlPhotoFileNames(list);
    return Promise.all(list.map(function (p) { return new Response(p.blob).arrayBuffer(); })).then(function (bufs) {
      var zip = tlZip(list.map(function (p, i) { return { name: names[i], bytes: new Uint8Array(bufs[i]), date: new Date(p.ts) }; }));
      var name = 'TherapyLog photos ' + tlDayKey(new Date()) + '.zip';
      var blob = new Blob([zip], { type: 'application/zip' });
      var file = typeof File === 'function' ? new File([blob], name, { type: 'application/zip' }) : null;
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (touch && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: name }).then(function () { return list.length; }, function () { return 0; });
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 30000);
      return list.length;
    });
  });
}

/* ---- the screen ---------------------------------------------------------- */

function tlPhUrl(blob) { var u = URL.createObjectURL(blob); tlPhUrls.push(u); return u; }

function tlPhFrame(photo, start, label) {
  if (!photo) return '<figure class="tl-photo-frame tl-photo-frame-empty"><span class="tl-photo-empty">' + tlIcon('image') + '<span>' + label + '</span></span></figure>';
  return '<figure class="tl-photo-frame"><img src="' + tlPhUrl(photo.thumb || photo.blob) + '" alt="' + tlEsc(label + ': ' + tlPhotoCaption(photo, start) + ', ' + tlShortDate(new Date(photo.ts).getTime())) + '">' +
    '<figcaption><span>' + tlEsc(tlShortDate(new Date(photo.ts).getTime())) + '</span><span>' + tlEsc(tlPhotoCaption(photo, start)) + '</span></figcaption></figure>';
}

function tlPhCompare(list, start, paid) {
  var pose = tlPhState.pose, pair = tlPhotoPair(list, pose), label = tlPoseLabel(pose);
  if (!paid) {
    return '<section class="ds-card tl-photo-lock" aria-label="Compare">' + tlHex('lock-simple') +
      '<div><p class="tl-photo-lock-t">Your first and latest ' + label.toLowerCase() + ' photo, side by side.</p>' +
      '<button type="button" class="ds-btn ds-btn-primary" data-photo="compare">' + tlIcon('lock-simple') + '<span>Compare with Pro</span></button></div></section>';
  }
  return '<section class="tl-photo-compare" aria-label="First and latest ' + tlEsc(label) + ' photo">' +
    tlPhFrame(pair.first, start, 'First') + tlPhFrame(pair.latest, start, 'Latest') + '</section>';
}

function tlPhGrid(list, start) {
  if (!list.length) return '<p class="tl-photo-none">No photos yet. Take one, or import one from your library.</p>';
  return '<div class="tl-photo-grid">' + list.slice().reverse().map(function (p) {
    var when = tlShortDate(new Date(p.ts).getTime());
    return '<button type="button" class="tl-photo-thumb" data-photo-open="' + tlEsc(p.id) + '" aria-label="' + tlEsc(tlPhotoCaption(p, start) + ', ' + when + '. Open') + '">' +
      '<img src="' + tlPhUrl(p.thumb || p.blob) + '" alt=""><span>' + tlEsc(when) + '</span></button>';
  }).join('') + '</div>';
}

function tlPhView(photo, start, redraw) {
  var url = tlPhUrl(photo.blob);
  var sheet = tlOpenSheet('<div class="tl-photo-view"><img src="' + url + '" alt="' + tlEsc(tlPhotoCaption(photo, start)) + '">' +
    '<p class="tl-photo-view-t">' + tlEsc(tlShortDate(new Date(photo.ts).getTime()) + ' · ' + tlPhotoCaption(photo, start)) + '</p>' +
    '<div class="tl-photo-view-b"><button type="button" class="ds-btn ds-btn-secondary tl-photo-del" data-photo="delete">' + tlIcon('trash') + '<span>Delete photo</span></button>' +
    '<button type="button" class="ds-btn ds-btn-primary" data-photo="close">Close</button></div></div>', { label: 'Photo', cls: 'tl-photo-sheet' });
  sheet.el.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-photo]') : null;
    if (!b) return;
    if (b.getAttribute('data-photo') === 'close') { sheet.close(); return; }
    if (b.getAttribute('data-photo') === 'delete') {
      tlConfirm({ kind: 'photo', title: 'Delete this photo?', tone: 'danger', action: 'Delete photo',
        body: 'It is removed from this phone. Photos are not in your backup file, so it cannot be brought back unless you exported it.' })
        .then(function (r) {
          if (r !== 'action') return;
          tlPhotoDelete(photo.id).then(function () { sheet.close(); redraw(); if (typeof tlToast === 'function') tlToast('Photo deleted'); });
        });
    }
  });
}

function tlPhotosScreen(el) {
  tlPhUrls.forEach(function (u) { URL.revokeObjectURL(u); });
  tlPhUrls = [];
  var d = gd(), start = (d.proto && d.proto.start) || null;
  var paid = !!(window.TLTier && TLTier.isStd && TLTier.isStd());
  el.innerHTML = '<div class="ds-screen tl-photo ds-under-tabbar">' +
    '<div class="tl-photo-poses">' + tlChips('Pose', TL_POSES, tlPhState.pose, true) + (paid ? '' : '<span class="ds-tag ds-tag-accent">Pro</span>') + '</div>' +
    '<div id="tl-photo-compare"></div>' +
    '<div class="tl-photo-actions">' +
      '<button type="button" class="ds-btn ds-btn-primary" data-photo="take">' + tlIcon('camera') + '<span>Take photo</span></button>' +
      '<button type="button" class="ds-btn ds-btn-secondary" data-photo="import">' + tlIcon('image') + '<span>Import</span></button>' +
      '<input type="file" id="tl-photo-take" accept="image/*" capture="environment" hidden>' +
      '<input type="file" id="tl-photo-import" accept="image/*" multiple hidden></div>' +
    '<h2 class="ds-label tl-photo-h">Every photo</h2>' +
    '<div id="tl-photo-grid" aria-busy="true"></div>' +
    tlFootnote('Photos stay on this phone with the rest of your log. They are not in your backup file: export them to keep a copy.') +
    '<div class="ds-list tl-bp-more">' +
      tlRow({ as: 'button', icon: 'export', title: 'Export photos', sub: 'Every photo, as a zip file', caret: true, attrs: 'data-photo="export"' }) +
      '<div class="ds-hr"></div>' +
      tlRow({ as: 'button', icon: 'note-pencil', title: 'Written check-ins', sub: 'Weekly notes, weight and body fat', caret: true, attrs: 'data-tl-go="health/checkins"' }) +
    '</div></div>';
  var root = el.firstChild, list = [];
  var redraw = function () { tlPhotosScreen(el); };
  var fill = function () {
    root.querySelector('#tl-photo-compare').innerHTML = tlPhCompare(list, start, paid);
    var grid = root.querySelector('#tl-photo-grid');
    grid.innerHTML = tlPhGrid(list, start);
    grid.removeAttribute('aria-busy');
  };
  tlPhotoAll().then(function (l) { list = l; fill(); }, function () {
    root.querySelector('#tl-photo-grid').innerHTML = '<p class="tl-photo-none">This browser cannot keep photos here.</p>';
  });
  var keep = function (input, taken) {
    var files = Array.prototype.slice.call(input.files || []);
    input.value = '';
    if (!files.length) return;
    var pose = tlPhState.pose;
    tlPhotoKeep(files, pose, taken).then(function (n) {
      if (typeof tlToast === 'function') tlToast(n ? (n === 1 ? 'Photo saved to ' : n + ' photos saved to ') + tlPoseLabel(pose) : 'That image could not be read');
      redraw();
    });
  };
  root.querySelector('#tl-photo-take').addEventListener('change', function (e) { keep(e.target, true); });
  root.querySelector('#tl-photo-import').addEventListener('change', function (e) { keep(e.target, false); });
  root.addEventListener('ds-change', function (e) {
    if (!e.detail || !e.target.closest('.tl-photo-poses')) return;
    tlPhState.pose = e.detail.value;
    root.querySelector('#tl-photo-compare').innerHTML = tlPhCompare(list, start, paid);
  });
  root.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var open = t.closest('[data-photo-open]');
    if (open) {
      var id = open.getAttribute('data-photo-open');
      var p = list.filter(function (x) { return x.id === id; })[0];
      if (p) tlPhView(p, start, redraw);
      return;
    }
    var b = t.closest('[data-photo]');
    if (!b) return;
    var act = b.getAttribute('data-photo');
    if (act === 'take') root.querySelector('#tl-photo-take').click();
    else if (act === 'import') root.querySelector('#tl-photo-import').click();
    else if (act === 'compare') { if (window.TLTier && TLTier.check('progress_photos')) redraw(); }
    else if (act === 'export') {
      tlPhotoExport().then(function (n) {
        if (typeof tlToast === 'function') tlToast(n ? 'Exported ' + n + (n === 1 ? ' photo' : ' photos') : 'No photos to export');
      });
    }
  });
}
