// Where the SQLite file lives between sessions (docs/DECISIONS.md › Database):
// IndexedDB in the browser (works offline, survives closing the app), or memory for tests.

const IDB_NAME = "athena";
const IDB_STORE = "sqlite";
const IDB_KEY = "database";

/**
 * Persistence in the browser's IndexedDB: one stored value holding the whole SQLite file.
 *
 * @param {{ indexedDB?: IDBFactory, name?: string }} [options] Defaults to the browser's
 *   `indexedDB` and database name "athena".
 * @returns {import("./database.js").Persistence}
 */
export function indexedDbPersistence({ indexedDB = globalThis.indexedDB, name = IDB_NAME } = {}) {
  if (!indexedDB) throw new Error("IndexedDB isn't available in this browser, so data can't be saved on this device.");

  /** @returns {Promise<IDBDatabase>} */
  const open = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(IDB_STORE)) request.result.createObjectStore(IDB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  /**
   * @template T
   * @param {IDBTransactionMode} mode
   * @param {(store: IDBObjectStore) => IDBRequest<T>} action
   * @returns {Promise<T>}
   */
  const run = async (mode, action) => {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, mode);
        const request = action(tx.objectStore(IDB_STORE));
        let result;
        request.onsuccess = () => {
          result = request.result;
        };
        // Resolve only when the transaction has committed, so a save is really on disk.
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  };

  return {
    async load() {
      const value = await run("readonly", (store) => store.get(IDB_KEY));
      return value ? new Uint8Array(value) : null;
    },
    async save(bytes) {
      await run("readwrite", (store) => store.put(bytes, IDB_KEY));
    },
    async clear() {
      await run("readwrite", (store) => store.delete(IDB_KEY));
    },
  };
}

/**
 * Persistence in memory only (tests, or a browser without IndexedDB). Lost on reload.
 *
 * @returns {import("./database.js").Persistence & { saves: number, bytes: Uint8Array | null }}
 */
export function memoryPersistence() {
  const state = {
    saves: 0,
    bytes: null,
    async load() {
      return state.bytes ? new Uint8Array(state.bytes) : null;
    },
    async save(bytes) {
      state.bytes = new Uint8Array(bytes);
      state.saves += 1;
    },
    async clear() {
      state.bytes = null;
    },
  };
  return state;
}
