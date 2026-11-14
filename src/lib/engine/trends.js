// Trends (docs/CHECKLIST.md › 3. Trends): the numbers behind the charts.
// Pure logic: no React, DOM, database or Node-only APIs.
//
// - driftBand(): the range a 7-day average can move in before it counts as drifting, from a
//   fixed baseline and the drift formula (DECISIONS › Drift Cut-off). Leaving the band in the
//   worrying direction is exactly what the engine calls drifting, so the chart and the alerts
//   always agree. Only the worrying side has an edge (e.g. sleep can't drift by going up).
// - trendSeries(): one indicator's 7-day average and status per day, from evaluateMission().
// - driftPeriods(): the runs of days an indicator was drifting, to shade on the chart.

import { RECENT_WINDOW_DAYS } from "./average.js";
import { DRIFT_CUTOFF } from "./drift.js";
import { getIndicator } from "./indicators.js";

/** @param {string} key */
function driftIndicator(key) {
  const indicator = getIndicator(key);
  if (!indicator) throw new RangeError(`trends: "${key}" is not a drift-tracked indicator.`);
  return indicator;
}

/**
 * The band a 7-day average stays inside while NOT drifting against `baseline`.
 *
 * @param {{ status: string, mean: number | null, sd: number | null, n: number }} baseline
 *   One indicator's entry from a stored baseline (e.g. baselines.inflight.indicators.sleepHours).
 * @param {string} key Drift-tracked record field, e.g. "sleepHours".
 * @param {number} [n=RECENT_WINDOW_DAYS] Readings in the 7-day window (a full week by default).
 * @returns {Readonly<{ low: number | null, high: number | null, mean: number }> | null}
 *   `low`/`high` are null on a side that can't drift. Null if the baseline isn't usable.
 */
export function driftBand(baseline, key, n = RECENT_WINDOW_DAYS) {
  const indicator = driftIndicator(key);
  if (!baseline || baseline.status !== "ok" || !Number.isFinite(baseline.mean) || !(baseline.n > 0) || !(n > 0)) return null;
  const s = Math.max(baseline.sd ?? 0, indicator.sdFloor);
  const half = DRIFT_CUTOFF * s * Math.sqrt(1 / n + 1 / baseline.n);
  return Object.freeze({
    mean: baseline.mean,
    low: indicator.direction === "up" ? null : baseline.mean - half,
    high: indicator.direction === "down" ? null : baseline.mean + half,
  });
}

/**
 * One indicator's daily 7-day average and status.
 *
 * @param {ReadonlyArray<{ day: number, indicators: ReadonlyArray<{ key: string, status: string, recentAverage: number | null }> }>} evaluations
 *   From evaluateMission(), in day order.
 * @param {string} key Drift-tracked record field.
 * @returns {ReadonlyArray<Readonly<{ day: number, average: number | null, status: string }>>}
 */
export function trendSeries(evaluations, key) {
  if (!Array.isArray(evaluations)) throw new TypeError("trendSeries: evaluations must be an array.");
  driftIndicator(key); // throws on an unknown key
  return Object.freeze(
    evaluations.map((e) => {
      const item = e.indicators.find((i) => i.key === key);
      return Object.freeze({ day: e.day, average: item?.recentAverage ?? null, status: item?.status ?? "no_data" });
    }),
  );
}

/**
 * Runs of consecutive evaluated days with status "drifting".
 *
 * @param {ReturnType<typeof trendSeries>} series
 * @returns {ReadonlyArray<Readonly<{ fromDay: number, toDay: number }>>}
 */
export function driftPeriods(series) {
  const periods = [];
  let current = null;
  for (const point of series) {
    if (point.status === "drifting") {
      if (current && point.day === current.toDay + 1) current.toDay = point.day;
      else {
        current = { fromDay: point.day, toDay: point.day };
        periods.push(current);
      }
    } else {
      current = null;
    }
  }
  return Object.freeze(periods.map((p) => Object.freeze(p)));
}
