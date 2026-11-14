// Tests the IndexedDB adapter against a tiny in-memory stand-in for the browser API
// (only the calls persistence.js uses), since Node has no IndexedDB.
import { test } from "node:test";
import assert from "node:assert/strict";
import { indexedDbPersistence, memoryPersistence } from "./persistence.js";

function fakeIndexedDB() {
  const databases = new Map();
  const later = (fn) => setTimeout(fn, 0);
  return {
    open(name) {
      const request = {};
      later(() => {
        let stores = databases.get(name);
        const isNew = !stores;
        if (isNew) databases.set(name, (stores = new Map()));
        const db = {
          objectStoreNames: { contains: (s) => stores.has(s) },
          createObjectStore: (s) => stores.set(s, new Map()),
          close() {},
          transaction(storeName) {
            const tx = {};
            const store = stores.get(storeName);
            const op = (fn) => {
              const req = {};
              later(() => {
                req.result = fn();
                req.onsuccess?.();
                later(() => tx.oncomplete?.());
              });
              return req;
            };
            tx.objectStore = () => ({
              get: (k) => op(() => store.get(k)),
              put: (v, k) => op(() => void store.set(k, v)),
              delete: (k) => op(() => void store.delete(k)),
            });
            return tx;
          },
        };
        request.result = db;
        if (isNew) request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
}

test("IndexedDB adapter: nothing saved yet, then save, reload (new session) and clear", async () => {
  const idb = fakeIndexedDB();
  const first = indexedDbPersistence({ indexedDB: idb });
  assert.equal(await first.load(), null);
  await first.save(new Uint8Array([1, 2, 3]));
  const nextSession = indexedDbPersistence({ indexedDB: idb });
  assert.deepEqual([...(await nextSession.load())], [1, 2, 3]);
  await nextSession.clear();
  assert.equal(await nextSession.load(), null);
});

test("memory persistence keeps a copy, not the caller's array", async () => {
  const p = memoryPersistence();
  const bytes = new Uint8Array([9, 9]);
  await p.save(bytes);
  bytes[0] = 0;
  assert.deepEqual([...(await p.load())], [9, 9]);
  assert.equal(p.saves, 1);
});
