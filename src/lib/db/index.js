// ATHENA storage: one import for the app.
//
//   import { getDatabase } from "@/lib/db";
//   const db = await getDatabase();
//   await db.saveDailyRecord("rivera", record);
//   const baselines = await db.ensureMissionBaselines("rivera", today);
//
// docs/DECISIONS.md › Database: sql.js served locally from /sql-wasm.js and /sql-wasm.wasm
// (copied by scripts/copy-sqljs-wasm.mjs, never a CDN), saved to IndexedDB after every write.

import { openDatabase } from "./database.js";
import { indexedDbPersistence, memoryPersistence } from "./persistence.js";
import { publicAssetPath } from "../basePath.js";

export { AthenaDatabase, openDatabase, SCHEMA_VERSION } from "./database.js";
export { indexedDbPersistence, memoryPersistence } from "./persistence.js";

/**
 * Loads the sql.js engine from the app's own files (works offline): adds
 * /sql-wasm.js as a script once, then starts it with /sql-wasm.wasm. Browser only.
 *
 * @param {{ scriptPath?: string, wasmPath?: string }} [options]
 * @returns {Promise<Object>} The initialised sql.js module.
 */
export function loadSqlJs({ scriptPath = publicAssetPath("sql-wasm.js"), wasmPath = publicAssetPath("sql-wasm.wasm") } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("loadSqlJs only runs in the browser."));
  }
  const start = () => window.initSqlJs({ locateFile: () => wasmPath });
  if (typeof window.initSqlJs === "function") return start();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptPath;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Couldn't load ${scriptPath}. Run npm install to copy sql.js into public/.`));
    document.head.appendChild(script);
  }).then(start);
}

let shared = null;

/**
 * The app's single database, opened on first use and shared after that. Uses IndexedDB
 * when the browser has it; otherwise memory (data then lasts only until reload).
 * Browser only: call it from client components or effects, not during server rendering.
 *
 * @returns {Promise<import("./database.js").AthenaDatabase>}
 */
export function getDatabase() {
  if (!shared) {
    shared = (async () => {
      const SQL = await loadSqlJs();
      const persistence = globalThis.indexedDB ? indexedDbPersistence() : memoryPersistence();
      return openDatabase({ SQL, persistence });
    })().catch((error) => {
      shared = null; // let the next call try again
      throw error;
    });
  }
  return shared;
}
