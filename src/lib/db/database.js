// ATHENA's on-device database (docs/DECISIONS.md › Database, LOCKED):
// SQLite in the browser via sql.js, saved to IndexedDB after EVERY write, so data
// survives closing the app and nothing needs a network.
//
// Covers CHECKLIST §1 "Save and load the two baselines" (which completes §2 "baselines
// calculated once and stored"), and the storage half of §1 "Save and load daily records".
//
// Plain JavaScript, no React. sql.js and the persistence layer are passed in, so the same
// code runs in the browser (IndexedDB) and in `node --test` (memory).

import { calculateMissionBaselines, IN_FLIGHT_WINDOW, PRE_FLIGHT_WINDOW } from "../engine/baseline.js";
import { DAY_KEY, DRIFT_INDICATOR_KEYS } from "../engine/indicators.js";

/** Bump when the tables change; older saved databases are migrated by `migrate()`. */
export const SCHEMA_VERSION = 1;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- One row per astronaut per mission day. The record itself is JSON so its fields can
-- change (CHECKLIST §1 "Daily record defined") without a migration.
CREATE TABLE IF NOT EXISTS daily_record (
  astronaut_id TEXT    NOT NULL,
  mission_day  INTEGER NOT NULL,
  record       TEXT    NOT NULL,
  updated_at   TEXT    NOT NULL,
  PRIMARY KEY (astronaut_id, mission_day)
);
-- Fixed baselines (DECISIONS › Baselines): written once per astronaut and kind, never rolled.
CREATE TABLE IF NOT EXISTS baseline (
  astronaut_id TEXT    NOT NULL,
  kind         TEXT    NOT NULL CHECK (kind IN ('preflight', 'inflight')),
  indicator    TEXT    NOT NULL,
  status       TEXT    NOT NULL,
  mean         REAL,
  sd           REAL,
  n            INTEGER NOT NULL,
  skipped      INTEGER NOT NULL,
  from_day     INTEGER NOT NULL,
  to_day       INTEGER NOT NULL,
  computed_at  TEXT    NOT NULL,
  PRIMARY KEY (astronaut_id, kind, indicator)
);
`;

/**
 * Where the database file is kept between sessions.
 *
 * @typedef {Object} Persistence
 * @property {() => Promise<Uint8Array | null>} load  Saved database bytes, or null if none.
 * @property {(bytes: Uint8Array) => Promise<void>} save
 * @property {() => Promise<void>} clear
 */

/**
 * Opens the database: loads the saved copy if there is one, otherwise starts empty, then
 * makes sure the tables exist.
 *
 * @param {Object} options
 * @param {Object} options.SQL  An initialised sql.js module (see `loadSqlJs` in index.js).
 * @param {Persistence} options.persistence Where to load from and save to.
 * @param {() => string} [options.now] Timestamp source (ISO string); injectable for tests.
 * @returns {Promise<AthenaDatabase>}
 */
export async function openDatabase({ SQL, persistence, now = () => new Date().toISOString() }) {
  if (!SQL || typeof SQL.Database !== "function") throw new TypeError("openDatabase: SQL must be an initialised sql.js module.");
  if (!persistence || typeof persistence.load !== "function" || typeof persistence.save !== "function") {
    throw new TypeError("openDatabase: persistence needs load() and save().");
  }
  const saved = await persistence.load();
  let db = null;
  if (saved && saved.length > 0) {
    try {
      db = new SQL.Database(saved);
      db.exec("SELECT count(*) FROM sqlite_master"); // sql.js only notices a damaged file on first use
    } catch {
      // A damaged saved copy must not lock the crew out of the app: start a fresh one.
      db?.close();
      db = null;
    }
  }
  db ??= new SQL.Database();
  const athena = new AthenaDatabase(db, persistence, now);
  await athena.migrate();
  return athena;
}

export class AthenaDatabase {
  /**
   * @param {Object} db sql.js Database
   * @param {Persistence} persistence
   * @param {() => string} now
   */
  constructor(db, persistence, now) {
    this.db = db;
    this.persistence = persistence;
    this.now = now;
  }

  /** Creates tables and records the schema version. Saves afterwards. */
  async migrate() {
    this.db.exec(SCHEMA);
    this.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)", [String(SCHEMA_VERSION)]);
    await this.save();
  }

  /** Writes the whole database to persistence. Called after every write (DECISIONS › Database). */
  async save() {
    await this.persistence.save(this.db.export());
  }

  /**
   * Runs `fn` inside a transaction and saves once afterwards. If `fn` throws, nothing is
   * written and nothing is saved.
   *
   * @template T
   * @param {() => T} fn
   * @returns {Promise<T>}
   */
  async write(fn) {
    this.db.exec("BEGIN");
    let result;
    try {
      result = fn();
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    await this.save();
    return result;
  }

  // ---- Meta ------------------------------------------------------------------------

  /** @param {string} key @returns {string | null} */
  getMeta(key) {
    const rows = this.query("SELECT value FROM meta WHERE key = ?", [key]);
    return rows.length > 0 ? rows[0].value : null;
  }

  /** @param {string} key @param {string} value */
  async setMeta(key, value) {
    await this.write(() => this.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", [key, String(value)]));
  }

  /**
   * Deletes every meta entry whose key starts with `prefix` (e.g. "exams:" on Reset data).
   * @param {string} prefix
   */
  async deleteMetaPrefix(prefix) {
    if (typeof prefix !== "string" || prefix.length === 0) throw new TypeError("deleteMetaPrefix: prefix must be a non-empty string.");
    await this.write(() => this.db.run("DELETE FROM meta WHERE substr(key, 1, ?) = ?", [prefix.length, prefix]));
  }

  // ---- Daily records ---------------------------------------------------------------

  /**
   * Saves (or replaces) one astronaut's record for one mission day, then saves the file.
   *
   * @param {string} astronautId e.g. "rivera"
   * @param {Object<string, unknown>} record Must include an integer `missionDay`.
   */
  async saveDailyRecord(astronautId, record) {
    await this.saveDailyRecords(astronautId, [record]);
  }

  /**
   * Saves many records in one transaction and one file save (e.g. loading a demo mission).
   *
   * @param {string} astronautId
   * @param {ReadonlyArray<Object<string, unknown>>} records
   */
  async saveDailyRecords(astronautId, records) {
    assertId(astronautId);
    if (!Array.isArray(records)) throw new TypeError("saveDailyRecords: records must be an array.");
    for (const r of records) {
      if (!r || !Number.isInteger(r[DAY_KEY])) throw new TypeError(`saveDailyRecords: every record needs an integer ${DAY_KEY}.`);
    }
    const stamp = this.now();
    await this.write(() => {
      const stmt = this.db.prepare(
        "INSERT OR REPLACE INTO daily_record (astronaut_id, mission_day, record, updated_at) VALUES (?, ?, ?, ?)",
      );
      try {
        for (const r of records) stmt.run([astronautId, r[DAY_KEY], JSON.stringify(r), stamp]);
      } finally {
        stmt.free();
      }
    });
  }

  /**
   * Loads an astronaut's records, oldest first.
   *
   * @param {string} astronautId
   * @param {{ fromDay?: number, toDay?: number }} [range] Inclusive; omit for all days.
   * @returns {Array<Object<string, unknown>>}
   */
  loadDailyRecords(astronautId, { fromDay = -100000, toDay = 100000 } = {}) {
    assertId(astronautId);
    return this.query(
      "SELECT record FROM daily_record WHERE astronaut_id = ? AND mission_day BETWEEN ? AND ? ORDER BY mission_day",
      [astronautId, fromDay, toDay],
    ).map((row) => JSON.parse(row.record));
  }

  /** @param {string} astronautId @returns {number | null} Latest mission day with a record. */
  latestDay(astronautId) {
    const rows = this.query("SELECT MAX(mission_day) AS day FROM daily_record WHERE astronaut_id = ?", [astronautId]);
    return rows[0]?.day ?? null;
  }

  // ---- Baselines -------------------------------------------------------------------

  /**
   * Stores one baseline kind for an astronaut. Baselines are FIXED: an existing one is
   * kept unless `replace` is true (only for "Reset data" / reloading a demo mission).
   *
   * @param {string} astronautId
   * @param {"preflight" | "inflight"} kind
   * @param {{ window: { fromDay: number, toDay: number }, indicators: Object<string, Object> }} baseline
   *   One part of calculateMissionBaselines() output.
   * @param {{ replace?: boolean }} [options]
   * @returns {Promise<boolean>} True if written, false if one was already stored.
   */
  async saveBaseline(astronautId, kind, baseline, { replace = false } = {}) {
    assertId(astronautId);
    if (kind !== "preflight" && kind !== "inflight") throw new RangeError(`saveBaseline: unknown kind "${kind}".`);
    if (!replace && this.hasBaseline(astronautId, kind)) return false;
    const stamp = this.now();
    await this.write(() => {
      this.db.run("DELETE FROM baseline WHERE astronaut_id = ? AND kind = ?", [astronautId, kind]);
      const stmt = this.db.prepare(
        `INSERT INTO baseline (astronaut_id, kind, indicator, status, mean, sd, n, skipped, from_day, to_day, computed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      try {
        for (const [indicator, b] of Object.entries(baseline.indicators)) {
          stmt.run([astronautId, kind, indicator, b.status, b.mean, b.sd, b.n, b.skipped,
            baseline.window.fromDay, baseline.window.toDay, stamp]);
        }
      } finally {
        stmt.free();
      }
    });
    return true;
  }

  /** @param {string} astronautId @param {"preflight" | "inflight"} kind */
  hasBaseline(astronautId, kind) {
    return this.query("SELECT 1 FROM baseline WHERE astronaut_id = ? AND kind = ? LIMIT 1", [astronautId, kind]).length > 0;
  }

  /**
   * Loads stored baselines in the same shape calculateMissionBaselines() returns, so the
   * engine (evaluateMission, indicatorStatus) can use them directly. A kind that isn't
   * stored yet is left out.
   *
   * @param {string} astronautId
   * @returns {{ preflight?: Object, inflight?: Object }}
   */
  loadMissionBaselines(astronautId) {
    assertId(astronautId);
    const result = {};
    for (const row of this.query("SELECT * FROM baseline WHERE astronaut_id = ? ORDER BY kind, indicator", [astronautId])) {
      const part = (result[row.kind] ??= { window: { fromDay: row.from_day, toDay: row.to_day }, indicators: {}, computedAt: row.computed_at });
      part.indicators[row.indicator] = { status: row.status, mean: row.mean, sd: row.sd, n: row.n, skipped: row.skipped };
    }
    return result;
  }

  /**
   * CHECKLIST §2: "Pre-flight baseline and in-flight baseline … both calculated once and
   * stored". Calculates each baseline from the stored records the first time its window
   * is complete (`currentDay` past the window's last day), stores it, and from then on
   * only loads it. Later records never change a stored baseline.
   *
   * @param {string} astronautId
   * @param {number} currentDay Today's mission day.
   * @returns {Promise<{ preflight?: Object, inflight?: Object }>} Stored baselines.
   */
  async ensureMissionBaselines(astronautId, currentDay) {
    assertId(astronautId);
    if (!Number.isInteger(currentDay)) throw new TypeError("ensureMissionBaselines: currentDay must be an integer.");
    for (const [kind, window] of [["preflight", PRE_FLIGHT_WINDOW], ["inflight", IN_FLIGHT_WINDOW]]) {
      if (this.hasBaseline(astronautId, kind) || currentDay <= window.toDay) continue;
      const records = this.loadDailyRecords(astronautId, window);
      const calculated = calculateMissionBaselines(records, DRIFT_INDICATOR_KEYS)[kind];
      // Don't freeze an empty baseline: with no usable indicator, try again next time.
      if (!Object.values(calculated.indicators).some((b) => b.status === "ok")) continue;
      await this.saveBaseline(astronautId, kind, calculated);
    }
    return this.loadMissionBaselines(astronautId);
  }

  // ---- Reset -----------------------------------------------------------------------

  /** CHECKLIST §1 "Reset data": removes every record and baseline, then saves. */
  async resetAll() {
    await this.write(() => {
      this.db.run("DELETE FROM daily_record");
      this.db.run("DELETE FROM baseline");
    });
  }

  // ---- Helpers ---------------------------------------------------------------------

  /**
   * Runs a read query and returns plain row objects.
   *
   * @param {string} sql
   * @param {Array<unknown>} [params]
   * @returns {Array<Object<string, any>>}
   */
  query(sql, params = []) {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }
}

/** @param {unknown} id */
function assertId(id) {
  if (typeof id !== "string" || id.length === 0) throw new TypeError("An astronaut id (non-empty string) is required.");
}
