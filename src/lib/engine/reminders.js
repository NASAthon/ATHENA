// Reminder scheduler.
// Pure logic: no React, DOM, database or Node-only APIs.

import { INDICATORS } from "../../data/index.js";
import { RECORD_FIELDS, SYMPTOMS_FIELD, readingOrNull } from "./indicators.js";

/**
 * Fields that must be filled for a measurement to count as done. Blood pressure needs
 * both numbers; the reaction test is done once its median is recorded.
 */
const REQUIRED_PARTS = Object.freeze({ bloodPressure: ["systolic", "diastolic"], reaction: ["median"] });

/**
 * Measurements the crew is reminded to take, built from src/data/indicators.js: every
 * indicator that isn't `optional` (so SpO₂ and radiation dose aren't reminded), plus the
 * daily symptom check. ASSUMPTION: each is due once per mission day; the team hasn't set
 * another schedule.
 *
 * @type {ReadonlyArray<Readonly<{ id: string, fields: ReadonlyArray<string>, everyDays: number }>>}
 */
export const MEASUREMENT_SCHEDULE = Object.freeze([
  ...INDICATORS.filter((i) => !i.optional && RECORD_FIELDS[i.id]).map((i) => {
    const parts = REQUIRED_PARTS[i.id] ?? Object.keys(RECORD_FIELDS[i.id]);
    return Object.freeze({ id: i.id, fields: Object.freeze(parts.map((p) => RECORD_FIELDS[i.id][p])), everyDays: 1 });
  }),
  Object.freeze({ id: "symptoms", fields: Object.freeze([SYMPTOMS_FIELD]), everyDays: 1 }),
]);

/**
 * True if a field holds a recorded value. Symptoms are a list, and an EMPTY list counts
 * as recorded ("no symptoms today" is an answer). Everything else must be a finite number.
 *
 * @param {string} field
 * @param {unknown} value
 * @returns {boolean}
 */
function isRecorded(field, value) {
  if (field === SYMPTOMS_FIELD) return Array.isArray(value);
  return readingOrNull(value) !== null;
}

/**
 * Reminder scheduler: which measurements are due today.
 *
 * Returns the scheduled measurements that today's record doesn't have yet, in schedule
 * order (content indicator ids, plus "symptoms"). With no record at all, everything due
 * today is returned. A measurement with `everyDays` > 1 is due on mission days where
 * (day − 1) is a multiple of it; nothing is due before day 1.
 *
 * @param {Object<string, unknown> | null | undefined} todayRecord The record for `day`, if any.
 * @param {number} day Mission day (integer).
 * @param {typeof MEASUREMENT_SCHEDULE} [schedule=MEASUREMENT_SCHEDULE]
 * @returns {ReadonlyArray<string>} Ids still due, e.g. ["glucose", "mood"].
 * @throws {TypeError} If `day` isn't an integer.
 */
export function dueMeasurements(todayRecord, day, schedule = MEASUREMENT_SCHEDULE) {
  if (!Number.isInteger(day)) throw new TypeError("dueMeasurements: day must be an integer.");
  if (day < 1) return Object.freeze([]);

  const record = todayRecord !== null && typeof todayRecord === "object" ? todayRecord : {};
  const due = schedule
    .filter((m) => (day - 1) % m.everyDays === 0)
    .filter((m) => !m.fields.every((field) => isRecorded(field, record[field])))
    .map((m) => m.id);
  return Object.freeze(due);
}
