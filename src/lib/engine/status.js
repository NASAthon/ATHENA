// Status per indicator (docs/CHECKLIST.md › 2. Logic, item 6).
// Pure logic: no React, DOM, database or Node-only APIs.
//
// The four statuses (CHECKLIST §2):
// - no_data: fewer than 4 readings in the last 7 days, or no usable baseline.
// - drifting: the 7-day average has moved ≥ 3.5 z from the IN-FLIGHT baseline in
//   the worrying direction (DECISIONS › Drift Cut-off). Only possible after the
//   in-flight baseline window has ended (day 36 onwards).
// - expected_adaptation: ASSUMPTION (not defined in DECISIONS). The 7-day average
//   differs from the PRE-FLIGHT baseline by ≥ 3.5 z in the worrying direction, but is
//   not drifting against the in-flight baseline. In plain words: "different from how
//   you were on Earth, but stable in space", i.e. the body adapting to spaceflight.
//   This is also what gives the pre-flight baseline a job.
// - steady: none of the above.

import { sevenDayAverage } from "./average.js";
import { IN_FLIGHT_WINDOW } from "./baseline.js";
import { driftZ } from "./drift.js";
import { DRIFT_INDICATORS } from "./indicators.js";

/** The four indicator statuses, from least to most concerning (no_data is separate). */
export const STATUSES = Object.freeze(["no_data", "steady", "expected_adaptation", "drifting"]);

/**
 * @typedef {Object} IndicatorStatus
 * @property {string} key
 * @property {string} group
 * @property {"no_data" | "steady" | "expected_adaptation" | "drifting"} status
 * @property {number | null} z          Signed z against the in-flight baseline (null if unavailable).
 * @property {number | null} worryingZ  In-flight z in the worrying direction (null if unavailable).
 * @property {number | null} preflightWorryingZ Same against the pre-flight baseline.
 * @property {number | null} recentAverage 7-day average, or null.
 * @property {number} recentReadings Readings in the 7-day window.
 */

/**
 * CHECKLIST §2: "Status per indicator: no data, steady, drifting, expected adaptation".
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records Daily records for ONE astronaut,
 *   up to and including `day` (later records are ignored by the 7-day window anyway).
 * @param {{ preflight?: { indicators: Object }, inflight?: { indicators: Object } }} baselines
 *   From calculateMissionBaselines(). Either part may be missing.
 * @param {string} key Indicator field name from DRIFT_INDICATORS.
 * @param {number} day Mission day being evaluated.
 * @returns {Readonly<IndicatorStatus>}
 * @throws {RangeError} If `key` isn't a drift-tracked indicator.
 */
export function indicatorStatus(records, baselines, key, day) {
  const indicator = DRIFT_INDICATORS.find((i) => i.key === key);
  if (!indicator) throw new RangeError(`indicatorStatus: "${key}" is not a drift-tracked indicator.`);

  const recent = sevenDayAverage(records, key, day);
  const inflightBaseline = baselines?.inflight?.indicators?.[key];
  const preflightBaseline = baselines?.preflight?.indicators?.[key];

  // The in-flight baseline can only be used once its window is over.
  const inflight =
    day > IN_FLIGHT_WINDOW.toDay
      ? driftZ(recent, inflightBaseline, indicator.direction, indicator.sdFloor)
      : null;
  const preflight = driftZ(recent, preflightBaseline, indicator.direction, indicator.sdFloor);

  let status;
  if (recent.status !== "ok" || (inflight === null && preflight === null)) status = "no_data";
  else if (inflight?.drifting) status = "drifting";
  else if (preflight?.drifting) status = "expected_adaptation";
  else status = "steady";

  return Object.freeze({
    key,
    group: indicator.group,
    status,
    z: inflight ? inflight.z : null,
    worryingZ: inflight ? inflight.worryingZ : null,
    preflightWorryingZ: preflight ? preflight.worryingZ : null,
    recentAverage: recent.mean,
    recentReadings: recent.n,
  });
}

/**
 * Statuses for every drift-tracked indicator on one day, in display order.
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records Daily records for ONE astronaut.
 * @param {Parameters<typeof indicatorStatus>[1]} baselines
 * @param {number} day
 * @returns {ReadonlyArray<Readonly<IndicatorStatus>>}
 */
export function allIndicatorStatuses(records, baselines, day) {
  return Object.freeze(DRIFT_INDICATORS.map((i) => indicatorStatus(records, baselines, i.key, day)));
}
