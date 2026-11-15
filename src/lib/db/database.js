// ATHENA's on-device database (docs/DECISIONS.md › Database, LOCKED):
// SQLite in the browser via sql.js, saved to IndexedDB after EVERY write, so data
// survives closing the app and nothing needs a network.
//
// Saves and loads the two fixed baselines (calculated once, then stored) and the daily records.
//
// Plain JavaScript, no React. sql.js and the persistence layer are passed in, so the same
// code runs in the browser (IndexedDB) and in `node --test` (memory).

import { calculateMissionBaselines, IN_FLIGHT_WINDOW, PRE_FLIGHT_WINDOW } from "../engine/baseline.js";
import { DAY_KEY, DRIFT_INDICATOR_KEYS } from "../engine/indicators.js";

/** Bump when the tables change; older saved databases are migrated by `migrate()`. */
export const SCHEMA_VERSION = 2;

const REQUIRED_BACKUP_COLUMNS = Object.freeze({
  meta: Object.freeze(["key", "value"]),
  daily_record: Object.freeze(["astronaut_id", "mission_day", "record", "updated_at"]),
  baseline: Object.freeze(["astronaut_id", "kind", "indicator", "status", "mean", "sd", "n", "skipped", "from_day", "to_day", "computed_at"]),
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- One row per astronaut per mission day. The record itself is JSON so its fields can
-- change without a migration.
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
-- Immutable snapshots sent through the simulated Earth link. Status is derived from
-- the persisted simulated clock and these phase durations, so it cannot become stale
-- while the Summary page is closed.
CREATE TABLE IF NOT EXISTS communication_message (
  id                  TEXT PRIMARY KEY,
  astronaut_id        TEXT    NOT NULL,
  mission_mode_id     TEXT    NOT NULL,
  mission_day         INTEGER NOT NULL,
  report_json         TEXT    NOT NULL,
  response_json       TEXT    NOT NULL,
  sent_at             TEXT    NOT NULL,
  sent_sim_ms         INTEGER NOT NULL,
  one_way_delay_ms    INTEGER NOT NULL,
  queue_delay_ms      INTEGER NOT NULL,
  delivery_hold_ms    INTEGER NOT NULL,
  earth_processing_ms INTEGER NOT NULL
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
  let recoveryNotice = null;
  if (saved && saved.length > 0) {
    try {
      db = new SQL.Database(saved);
      db.exec("SELECT count(*) FROM sqlite_master"); // sql.js only notices a damaged file on first use
    } catch {
      // A damaged saved copy must not lock the crew out of the app: start a fresh one.
      db?.close();
      db = null;
      recoveryNotice = "The saved database was damaged, so ATHENA opened a fresh database. Restore a known-good backup or load the demo mission.";
    }
  }
  db ??= new SQL.Database();
  const athena = new AthenaDatabase(db, persistence, now);
  athena.recoveryNotice = recoveryNotice;
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
    // All writes export the whole SQLite file. Keep them strictly ordered so a slower
    // IndexedDB save can never finish after a newer one and restore stale bytes.
    this.writeTail = Promise.resolve();
    this.recoveryNotice = null;
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

  /** Returns a standalone SQLite backup without changing the live database. */
  exportBackup() {
    return new Uint8Array(this.db.export());
  }

  /**
   * Validates and restores an ATHENA SQLite backup atomically. The live database is
   * replaced only after the candidate has passed integrity/schema checks and persisted.
   */
  importBackup(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) {
      return Promise.reject(new TypeError("importBackup: choose a non-empty ATHENA SQLite backup."));
    }
    const operation = this.writeTail.then(() => this.#performImport(bytes));
    this.writeTail = operation.catch(() => {});
    return operation;
  }

  async #performImport(bytes) {
    const Database = this.db.constructor;
    let candidate;
    try {
      candidate = new Database(bytes);
      const integrity = candidate.exec("PRAGMA integrity_check");
      if (integrity[0]?.values?.[0]?.[0] !== "ok") throw new Error("SQLite integrity check failed.");
      const tables = new Set(
        (candidate.exec("SELECT name FROM sqlite_master WHERE type = 'table'")[0]?.values ?? []).map((row) => row[0]),
      );
      for (const required of ["meta", "daily_record", "baseline"]) {
        if (!tables.has(required)) throw new Error(`Missing ATHENA table: ${required}.`);
      }
      const versionResult = candidate.exec("SELECT value FROM meta WHERE key = 'schema_version'");
      const version = Number(versionResult[0]?.values?.[0]?.[0] ?? 0);
      if (!Number.isInteger(version) || version < 1 || version > SCHEMA_VERSION) {
        throw new Error(`Unsupported ATHENA backup schema version: ${version || "unknown"}.`);
      }
      if (candidate.exec("SELECT name FROM sqlite_master WHERE type IN ('trigger', 'view')")[0]?.values?.length > 0) {
        throw new Error("ATHENA backups cannot contain triggers or views.");
      }
      for (const [table, requiredColumns] of Object.entries(REQUIRED_BACKUP_COLUMNS)) {
        const columns = new Set((candidate.exec(`PRAGMA table_info(${table})`)[0]?.values ?? []).map((row) => row[1]));
        for (const column of requiredColumns) {
          if (!columns.has(column)) throw new Error(`Table ${table} is missing column ${column}.`);
        }
      }
      if (version >= 2 && !tables.has("communication_message")) {
        throw new Error("Missing ATHENA table: communication_message.");
      }
      candidate.exec(SCHEMA);
      candidate.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)", [String(SCHEMA_VERSION)]);
      await this.persistence.save(candidate.export());
    } catch (error) {
      candidate?.close();
      throw new Error(`This backup could not be restored: ${error instanceof Error ? error.message : String(error)}`);
    }
    const previous = this.db;
    this.db = candidate;
    this.recoveryNotice = null;
    previous.close();
  }

  /**
   * Runs `fn` inside a transaction and saves once afterwards. If `fn` throws, nothing is
   * written and nothing is saved.
   *
   * @template T
   * @param {() => T} fn
   * @returns {Promise<T>}
   */
  write(fn) {
    if (typeof fn !== "function") return Promise.reject(new TypeError("write: fn must be a function."));
    const operation = this.writeTail.then(() => this.#performWrite(fn));
    // A failed write must not poison the queue: later writes still get their turn.
    this.writeTail = operation.catch(() => {});
    return operation;
  }

  async #performWrite(fn) {
    // sql.js must commit before it can export. Keep a byte-for-byte snapshot so a failed
    // persistence save also restores the in-memory database to its previous state.
    const before = this.db.export();
    const Database = this.db.constructor;
    this.db.exec("BEGIN");
    let result;
    try {
      result = fn();
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    try {
      await this.save();
      return result;
    } catch (error) {
      this.db.close();
      this.db = new Database(before);
      throw error;
    }
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

  // ---- Mission communications ------------------------------------------------------

  /**
   * Stores one immutable simulated Earth-link message. Reusing an id fails rather than
   * replacing the original report snapshot.
   *
   * @param {Object} message Shape created by src/lib/communications.js.
   */
  async saveCommunication(message, { clock = null } = {}) {
    assertCommunication(message);
    await this.write(() => {
      this.db.run(
        `INSERT INTO communication_message
         (id, astronaut_id, mission_mode_id, mission_day, report_json, response_json,
          sent_at, sent_sim_ms, one_way_delay_ms, queue_delay_ms, delivery_hold_ms, earth_processing_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.astronautId,
          message.missionModeId,
          message.missionDay,
          JSON.stringify(message.report),
          JSON.stringify(message.response),
          message.sentAt,
          message.sentSimMs,
          message.oneWayDelayMs,
          message.queueDelayMs,
          message.deliveryHoldMs,
          message.earthProcessingMs,
        ],
      );
      if (clock !== null) {
        this.db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('communications_clock', ?)", [String(clock)]);
      }
    });
  }

  /** @param {string} astronautId @returns {Array<Object>} Newest first. */
  loadCommunications(astronautId) {
    assertId(astronautId);
    return this.query(
      "SELECT * FROM communication_message WHERE astronaut_id = ? ORDER BY sent_sim_ms DESC, id DESC",
      [astronautId],
    ).map((row) => ({
      id: row.id,
      astronautId: row.astronaut_id,
      missionModeId: row.mission_mode_id,
      missionDay: row.mission_day,
      report: JSON.parse(row.report_json),
      response: JSON.parse(row.response_json),
      sentAt: row.sent_at,
      sentSimMs: row.sent_sim_ms,
      oneWayDelayMs: row.one_way_delay_ms,
      queueDelayMs: row.queue_delay_ms,
      deliveryHoldMs: row.delivery_hold_ms,
      earthProcessingMs: row.earth_processing_ms,
    }));
  }

  /**
   * Pre-flight baseline and in-flight baseline … both calculated once and
   * stored. Calculates each baseline from the stored records the first time its window
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

  /** Reset data: removes every record and baseline, then saves. */
  async resetAll() {
    await this.write(() => {
      this.db.run("DELETE FROM daily_record");
      this.db.run("DELETE FROM baseline");
      this.db.run("DELETE FROM communication_message");
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

function assertCommunication(message) {
  if (!message || typeof message !== "object") throw new TypeError("saveCommunication: message is required.");
  for (const key of ["id", "astronautId", "missionModeId", "sentAt"]) {
    if (typeof message[key] !== "string" || message[key].length === 0) {
      throw new TypeError(`saveCommunication: ${key} must be a non-empty string.`);
    }
  }
  for (const key of ["missionDay", "sentSimMs", "oneWayDelayMs", "queueDelayMs", "deliveryHoldMs", "earthProcessingMs"]) {
    if (!Number.isInteger(message[key]) || message[key] < 0) {
      throw new TypeError(`saveCommunication: ${key} must be a non-negative whole number.`);
    }
  }
  if (!message.report || typeof message.report !== "object" || !message.response || typeof message.response !== "object") {
    throw new TypeError("saveCommunication: report and response snapshots are required.");
  }
}
