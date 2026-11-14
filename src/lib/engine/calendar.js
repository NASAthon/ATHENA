// Calendar scheduler (docs/CHECKLIST.md › 2. Logic, S item "Calendar scheduler").
// Pure logic: no React, DOM, database or Node-only APIs.
//
// The exams and their intervals come from src/data/exams.js. Exams without an
// in-flight interval (e.g. the bone scan, done before and after flight) aren't scheduled.

import { EXAMS } from "../../data/index.js";

/**
 * @typedef {Object} PeriodicExam
 * @property {string} id
 * @property {number} firstDay   First mission day it's due (integer).
 * @property {number} everyDays  Repeat interval in days (integer ≥ 1).
 */

/**
 * In-flight schedule built from src/data/exams.js. ASSUMPTION: an exam repeating every
 * N days is first due on mission day N (e.g. day 30, 60, 90 …); the data gives only the
 * interval.
 *
 * @type {ReadonlyArray<Readonly<PeriodicExam>>}
 */
export const EXAM_SCHEDULE = Object.freeze(
  EXAMS.filter((e) => Number.isInteger(e.interval?.everyDays) && e.interval.everyDays >= 1).map((e) =>
    Object.freeze({ id: e.id, firstDay: e.interval.everyDays, everyDays: e.interval.everyDays }),
  ),
);

/**
 * CHECKLIST §2 (S): "Calendar scheduler: which periodic exams are due on a given mission day".
 *
 * An exam is due on `firstDay`, then every `everyDays` after it. Invalid entries are
 * skipped rather than crashing the calendar.
 *
 * @param {number} day Mission day (integer).
 * @param {ReadonlyArray<PeriodicExam>} [exams=EXAM_SCHEDULE]
 * @returns {ReadonlyArray<string>} Ids of exams due that day, sorted.
 * @throws {TypeError} If `day` isn't an integer or `exams` isn't an array.
 */
export function examsDueOn(day, exams = EXAM_SCHEDULE) {
  if (!Array.isArray(exams)) throw new TypeError("examsDueOn: exams must be an array.");
  if (!Number.isInteger(day)) throw new TypeError("examsDueOn: day must be an integer.");
  return Object.freeze(
    exams
      .filter(isValidExam)
      .filter((e) => day >= e.firstDay && (day - e.firstDay) % e.everyDays === 0)
      .map((e) => e.id)
      .sort(),
  );
}

/**
 * Exams whose most recent due day (before `day`) has no completion recorded.
 *
 * @param {ReadonlyArray<{ examId: string, day: number }>} completed Completions so far.
 * @param {number} day
 * @param {ReadonlyArray<PeriodicExam>} [exams=EXAM_SCHEDULE]
 * @returns {ReadonlyArray<{ id: string, dueDay: number }>} Sorted by id.
 */
export function examsOverdue(completed, day, exams = EXAM_SCHEDULE) {
  if (!Array.isArray(exams) || !Array.isArray(completed)) {
    throw new TypeError("examsOverdue: exams and completed must be arrays.");
  }
  if (!Number.isInteger(day)) throw new TypeError("examsOverdue: day must be an integer.");
  const result = [];
  for (const exam of exams.filter(isValidExam)) {
    if (day < exam.firstDay) continue;
    const dueDay = exam.firstDay + Math.floor((day - exam.firstDay) / exam.everyDays) * exam.everyDays;
    const done = completed.some((c) => c && c.examId === exam.id && Number.isInteger(c.day) && c.day >= dueDay);
    if (!done && dueDay < day) result.push(Object.freeze({ id: exam.id, dueDay }));
  }
  return Object.freeze(result.sort((a, b) => a.id.localeCompare(b.id)));
}

/** @param {unknown} e */
function isValidExam(e) {
  return (
    e !== null &&
    typeof e === "object" &&
    typeof e.id === "string" &&
    Number.isInteger(e.firstDay) &&
    Number.isInteger(e.everyDays) &&
    e.everyDays >= 1
  );
}
