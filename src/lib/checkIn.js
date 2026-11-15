// Saving from the app:
// - today's check-in (the one-minute check, extra check and Reaction test all add to the same daily record),
// - the check-in streak (worked out from the stored records),
// - periodic exam results (exams from src/data/exams.js).
//
// Pure logic on top of the shared database (@/lib/db). No React or DOM, so it runs in `node --test`.

import { EXAMS } from "../data/index.js";
import { DAY_KEY, SYMPTOMS_FIELD } from "./engine/indicators.js";
import { READING_FIELDS, emptyRecord, validateRecord } from "./dailyRecord.js";

/** Meta-table key prefix for stored exam results, one JSON list per astronaut ("exams:rivera"). */
export const EXAM_META_PREFIX = "exams:";

/** Days of history passed to the engine with today's record (enough for the 3-day streak bands). */
export const HISTORY_DAYS = 7;

const hasValue = (v) => v !== undefined && v !== null && v !== "";

/**
 * Adds today's new readings to the astronaut's stored record for `missionDay` and saves it.
 * Fields left empty keep any value already stored today (e.g. the reaction test result stays
 * when the one-minute check is saved). If `fields` includes a symptoms list, it replaces today's list.
 * The merged record is checked with validateRecord() first; nothing is saved if it fails.
 *
 * @param {import("./db/database.js").AthenaDatabase} db
 * @param {string} astronautId
 * @param {number} missionDay
 * @param {Object} fields Record fields (src/lib/dailyRecord.js), e.g. { heartRate: 64, symptoms: [] }.
 * @returns {Promise<{ ok: true, record: Object, history: Object[] } | { ok: false, errors: string[] }>}
 *   `history` = the stored records for the previous HISTORY_DAYS days (for the engine's streak bands).
 */
export async function saveCheckIn(db, astronautId, missionDay, fields) {
  const existing = db.loadDailyRecords(astronautId, { fromDay: missionDay, toDay: missionDay })[0] ?? null;
  const record = { ...emptyRecord(astronautId, missionDay), ...(existing ?? {}) };
  for (const field of READING_FIELDS) {
    if (hasValue(fields?.[field])) record[field] = fields[field];
  }
  if (Array.isArray(fields?.[SYMPTOMS_FIELD])) record[SYMPTOMS_FIELD] = [...fields[SYMPTOMS_FIELD]];
  record.astronautId = astronautId;
  record[DAY_KEY] = missionDay;

  const { ok, errors } = validateRecord(record);
  if (!ok) return { ok: false, errors };

  await db.saveDailyRecord(astronautId, record);
  const history = db.loadDailyRecords(astronautId, { fromDay: missionDay - HISTORY_DAYS, toDay: missionDay - 1 });
  return { ok: true, record, history };
}

/**
 * Check-in streak: how many days in a row, ending today (or yesterday if today isn't done yet),
 * have a check-in with at least one reading. Launch day (mission day 0) has no check, so it
 * neither counts nor breaks the streak.
 *
 * @param {ReadonlyArray<Object>} records Stored daily records for one astronaut.
 * @param {number} today Current mission day.
 * @returns {number}
 */
export function checkInStreak(records, today) {
  const checked = new Set(
    records.filter((r) => READING_FIELDS.some((f) => hasValue(r[f]))).map((r) => r[DAY_KEY]),
  );
  let day = checked.has(today) ? today : today - 1;
  let streak = 0;
  for (;;) {
    if (day === 0) {
      day -= 1; // launch day: skip over it
      continue;
    }
    if (!checked.has(day)) break;
    streak += 1;
    day -= 1;
  }
  return streak;
}

const examKey = (astronautId) => `${EXAM_META_PREFIX}${astronautId}`;

/**
 * Stored exam results for one astronaut, newest first.
 *
 * @param {import("./db/database.js").AthenaDatabase} db
 * @param {string} astronautId
 * @returns {Array<{ examId: string, missionDay: number, note: string }>}
 */
export function loadExamResults(db, astronautId) {
  try {
    const list = JSON.parse(db.getMeta(examKey(astronautId)) ?? "[]");
    return Array.isArray(list) ? [...list].sort((a, b) => b.missionDay - a.missionDay) : [];
  } catch {
    return [];
  }
}

/**
 * Records that a periodic exam (src/data/exams.js) was done on a mission day.
 * Saving the same exam on the same day again replaces it.
 *
 * @param {import("./db/database.js").AthenaDatabase} db
 * @param {string} astronautId
 * @param {string} examId e.g. "eye-scan"
 * @param {number} missionDay
 * @param {string} [note] Optional short note (plain text).
 */
export async function saveExamResult(db, astronautId, examId, missionDay, note = "") {
  if (!EXAMS.some((e) => e.id === examId)) throw new RangeError(`saveExamResult: unknown exam "${examId}".`);
  if (!Number.isInteger(missionDay)) throw new TypeError("saveExamResult: missionDay must be a whole number.");
  const list = loadExamResults(db, astronautId).filter((r) => !(r.examId === examId && r.missionDay === missionDay));
  list.push({ examId, missionDay, note: String(note).slice(0, 500) });
  await db.setMeta(examKey(astronautId), JSON.stringify(list));
}
