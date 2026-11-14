// Day and mission evaluation: runs the logic items together.
// Pure logic: no React, DOM, database or Node-only APIs.
//
// CHECKLIST §2 item 12, "Handles missing days without crashing or false alerts", is
// met here and in every step below: missing days and values are skipped, fewer than
// 4 readings in 7 days gives "no_data" (never "drifting"), and a day without data
// neither starts nor ends an alert. Covered by evaluate.test.js.

import { alertLevelOnDay, countDriftingGroups, groupStatuses } from "./alerts.js";
import { healthScore, scoreChange } from "./healthScore.js";
import { DAY_KEY } from "./indicators.js";
import { checkReading } from "./redLimits.js";
import { allIndicatorStatuses } from "./status.js";

/**
 * @typedef {Object} DayEvaluation
 * @property {number} day
 * @property {ReadonlyArray<Object>} indicators  Per-indicator statuses (status.js).
 * @property {ReadonlyArray<Object>} groups      Per-group statuses (alerts.js).
 * @property {ReadonlyArray<Object>} limitBreaches Today's reading vs the bands in src/data (redLimits.js).
 * @property {{ level: string, driftingGroups: number | null, alertSince: number | null }} alert
 * @property {Object} health Health score (healthScore.js).
 * @property {{ sinceYesterday: number | null, over7Days: number | null }} change
 */

/**
 * Evaluates every day from `fromDay` to `toDay` for ONE astronaut, in order, so the
 * alert history and score changes are available. Days with no data still get an entry
 * (with no_data statuses and a null score).
 *
 * Baselines are passed in, not recalculated: they are fixed (DECISIONS › Baselines).
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records Daily records for ONE astronaut.
 * @param {Parameters<typeof allIndicatorStatuses>[1]} baselines From calculateMissionBaselines().
 * @param {number} fromDay First day to evaluate (integer).
 * @param {number} toDay   Last day to evaluate (integer, ≥ fromDay).
 * @returns {ReadonlyArray<Readonly<DayEvaluation>>}
 * @throws {TypeError | RangeError} On invalid arguments.
 */
export function evaluateMission(records, baselines, fromDay, toDay) {
  if (!Array.isArray(records)) throw new TypeError("evaluateMission: records must be an array.");
  if (!Number.isInteger(fromDay) || !Number.isInteger(toDay)) {
    throw new TypeError("evaluateMission: fromDay and toDay must be integers.");
  }
  if (fromDay > toDay) throw new RangeError("evaluateMission: fromDay must not be after toDay.");

  const byDay = new Map();
  for (const record of records) {
    if (record !== null && typeof record === "object" && Number.isInteger(record[DAY_KEY])) {
      byDay.set(record[DAY_KEY], record);
    }
  }

  const history = [];
  const scores = [];
  const results = [];
  for (let day = fromDay; day <= toDay; day += 1) {
    const indicators = allIndicatorStatuses(records, baselines, day);
    const groups = groupStatuses(indicators);
    history.push({ day, driftingGroups: countDriftingGroups(groups) });
    const alert = alertLevelOnDay(history, day);
    const limitBreaches = checkReading(byDay.get(day), records);
    const health = healthScore({ groups, limitBreaches, alertLevel: alert.level });
    scores.push({ day, score: health.score });
    results.push(
      Object.freeze({ day, indicators, groups, limitBreaches, alert, health, change: scoreChange(scores, day) }),
    );
  }
  return Object.freeze(results);
}

/**
 * Evaluates a single day. Alert escalation needs history, so this evaluates from the
 * first in-flight day (1) up to `day` and returns the last entry. For many days at once,
 * use evaluateMission() instead.
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records
 * @param {Parameters<typeof allIndicatorStatuses>[1]} baselines
 * @param {number} day
 * @returns {Readonly<DayEvaluation>}
 */
export function evaluateDay(records, baselines, day) {
  const results = evaluateMission(records, baselines, Math.min(1, day), day);
  return results[results.length - 1];
}
