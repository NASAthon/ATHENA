// Seven-day average.
// Pure logic: no React, DOM, database or Node-only APIs.

import { DAY_KEY, readingOrNull } from "./indicators.js";

/** Days in the recent window (DECISIONS › Drift Cut-off: "the last 7 days"). */
export const RECENT_WINDOW_DAYS = 7;

/** Fewest readings for a usable recent average (DECISIONS › Drift Cut-off: "at least 4"). */
export const RECENT_MIN_READINGS = 4;

/**
 * @typedef {Object} RecentAverage
 * @property {"ok" | "insufficient_data"} status `insufficient_data` when fewer than 4 readings.
 * @property {number | null} mean Average of the readings, or null when insufficient.
 * @property {number} n           Readings used (the drift formula's `n`).
 * @property {number} fromDay     First day of the window (inclusive).
 * @property {number} toDay       Last day of the window (inclusive): the day being evaluated.
 */

/**
 * Seven-day average per indicator.
 *
 * Averages one indicator over the 7 mission days ending on `day` (day − 6 … day).
 * Missing days and invalid values are skipped, never filled in. With fewer than 4
 * readings the result is `insufficient_data` with a null mean, so a gap in the data
 * can never produce a drift alert. If a day appears more than once, every reading
 * for it counts (the database allows one row per astronaut per day, so this should
 * not happen).
 *
 * Deterministic: values are sorted before summing, so record order can't change the result.
 *
 * @param {ReadonlyArray<Object<string, unknown>>} records Daily records for ONE astronaut.
 * @param {string} indicator Field name, e.g. "sleepHours".
 * @param {number} day       Mission day being evaluated (integer).
 * @returns {Readonly<RecentAverage>}
 * @throws {TypeError} If `records` isn't an array or `day` isn't an integer.
 */
export function sevenDayAverage(records, indicator, day) {
  if (!Array.isArray(records)) throw new TypeError("sevenDayAverage: records must be an array.");
  if (!Number.isInteger(day)) throw new TypeError("sevenDayAverage: day must be an integer.");

  const fromDay = day - (RECENT_WINDOW_DAYS - 1);
  const values = [];
  for (const record of records) {
    if (record === null || typeof record !== "object") continue;
    const recordDay = record[DAY_KEY];
    if (!Number.isInteger(recordDay) || recordDay < fromDay || recordDay > day) continue;
    const value = readingOrNull(record[indicator]);
    if (value !== null) values.push(value);
  }

  const n = values.length;
  if (n < RECENT_MIN_READINGS) {
    return Object.freeze({ status: "insufficient_data", mean: null, n, fromDay, toDay: day });
  }
  values.sort((a, b) => a - b);
  let sum = 0;
  for (const value of values) sum += value;
  return Object.freeze({ status: "ok", mean: sum / n, n, fromDay, toDay: day });
}
