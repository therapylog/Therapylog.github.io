/**
 * NRCA Brain — IndexedDB storage wrapper.
 *
 * Database: "nrca-brain" v1
 * Object stores:
 *   - "index"      (out-of-line string keys)  — the processed manual index, key "current"
 *   - "checkpoint" (out-of-line string keys)  — processor resume state, key "current"
 *   - "chats"      (keyPath: "id")            — saved chat threads
 *
 * All functions open the database lazily and never throw on missing keys
 * (they resolve to null instead).
 */

const DB_NAME = "nrca-brain";
const DB_VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("index")) {
        db.createObjectStore("index");
      }
      if (!db.objectStoreNames.contains("checkpoint")) {
        db.createObjectStore("checkpoint");
      }
      if (!db.objectStoreNames.contains("chats")) {
        db.createObjectStore("chats", { keyPath: "id" });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // If another tab upgrades the DB, drop our cached connection so the
      // next call reopens cleanly.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      db.onclose = () => {
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error || new Error("Failed to open IndexedDB " + DB_NAME));
    };
    req.onblocked = () => {
      // Another tab holds an old connection; the open will complete once it
      // closes. Nothing to do — just don't reject.
    };
  });
  return dbPromise;
}

/** Run `fn(store)` in a transaction on one store; resolves with the request result. */
async function withStore(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(storeName, mode);
    } catch (err) {
      // Connection may have gone stale (e.g. after versionchange close).
      dbPromise = null;
      reject(err);
      return;
    }
    const store = tx.objectStore(storeName);
    let result;
    try {
      const req = fn(store);
      if (req && typeof req.onsuccess !== "undefined") {
        req.onsuccess = () => {
          result = req.result;
        };
      }
    } catch (err) {
      reject(err);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
  });
}

async function getByKey(storeName, key) {
  const value = await withStore(storeName, "readonly", (store) => store.get(key));
  return value === undefined ? null : value;
}

// ---------------------------------------------------------------------------
// index store
// ---------------------------------------------------------------------------

export async function saveIndex(indexObj) {
  await withStore("index", "readwrite", (store) => store.put(indexObj, "current"));
}

export async function loadIndex() {
  return getByKey("index", "current");
}

export async function clearIndex() {
  await withStore("index", "readwrite", (store) => store.delete("current"));
}

// ---------------------------------------------------------------------------
// checkpoint store
// ---------------------------------------------------------------------------

export async function saveCheckpoint(cp) {
  await withStore("checkpoint", "readwrite", (store) => store.put(cp, "current"));
}

export async function loadCheckpoint() {
  return getByKey("checkpoint", "current");
}

export async function clearCheckpoint() {
  await withStore("checkpoint", "readwrite", (store) => store.delete("current"));
}

// ---------------------------------------------------------------------------
// chats store
// ---------------------------------------------------------------------------

export async function saveChat(chat) {
  // chat = { id, title, createdAt, updatedAt, messages }
  await withStore("chats", "readwrite", (store) => store.put(chat));
}

export async function loadChat(id) {
  return getByKey("chats", id);
}

export async function listChats() {
  // Cursor rather than getAll(): chats carry base64 photo attachments, and
  // materializing every one of them just to read three fields stalls the UI
  // once a phone has months of field history.
  const db = await openDB();
  const chats = await new Promise((resolve, reject) => {
    const out = [];
    const tx = db.transaction("chats", "readonly");
    const req = tx.objectStore("chats").openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return resolve(out);
      const c = cur.value || {};
      out.push({ id: c.id, title: c.title, updatedAt: c.updatedAt });
      cur.continue();
    };
    req.onerror = () => reject(req.error);
    tx.onabort = () => reject(tx.error);
  }).catch(() => []);
  return chats.sort((a, b) => {
    const ta = Date.parse(a.updatedAt) || 0;
    const tb = Date.parse(b.updatedAt) || 0;
    return tb - ta;
  });
}

export async function deleteChat(id) {
  await withStore("chats", "readwrite", (store) => store.delete(id));
}
