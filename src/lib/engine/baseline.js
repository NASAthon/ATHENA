// Baseline calculator and mission baselines (docs/CHECKLIST.md › 2. Logic, items 1–2).
//
// Mean and standard deviation per indicator over a FIXED window of mission days
// (docs/DECISIONS.md › Baselines: fixed, not rolling). The same function computes
// both the pre-flight and the in-flight baseline; the caller picks the window.
//
// Pure logic: no React, no DOM, no database, no Node-only APIs. It runs in the
// browser and in `node --test` unchanged.
//
// Not done here (other checklist items): storing baselines, the 7-day average,
// z-scores, the per-indicator minimum standard deviation used by the drift
// formula, and statuses.

/**
 * A daily record as the calculator reads it. Only `missionDay` (or the key given
 * in `options.dayKey`) and the indicator fields are used; anything else is ignored.
 * Pre-flight days are negative (e.g. -30 … -1).
 *
 * @typedef {Object<string, unknown>} DailyRecord
 */

/**
 * An inclusive range of mission days, e.g. { fromDay: 21, toDay: 35 }.
 *
 * @typedef {Object} BaselineWindow
 * @property {number} fromDay First mission day in the window (integer, inclusive).
 * @property {number} toDay   Last mission day in the window (integer, inclusive).
 */

/**
 * Result for one indicator.
 * - `ok`: enough readings; `mean` and `sd` are numbers.
 * - `insufficient_data`: some readings, but fewer than `minReadings`; `mean` and `sd` are null.
 * - `no_data`: no usable readings in the window; `mean` and `sd` are null.
 *
 * @typedef {Object} IndicatorBaseline
 * @property {"ok" | "insufficient_data" | "no_data"} status
 * @property {number | null} mean Arithmetic mean of the usable readings.
 * @property {number | null} sd   Sample standard deviation (divides by n − 1), i.e. the
 *                                day-to-day spread the drift formula calls `s`.
 * @property {number} n           Number of usable readings (the drift formula's `m`).
 * @property {number} skipped     Records in the window whose value for this indicator
 *                                was missing or not a finite number.
 */

/**
 * @typedef {Object} BaselineResult
 * @property {BaselineWindow} window Copy of the window used.
 * @property {Object<string, IndicatorBaseline>} indicators One entry per requested indicator.
 */

/**
 * The in-flight baseline window named in docs/DECISIONS.md › Baselines
 * ("e.g. mission days 21–35").
 *
 * @type {Readonly<BaselineWindow>}
 */
export const IN_FLIGHT_WINDOW = Object.freeze({ fromDay: 21, toDay: 35 });

/**
 * Pre-flight baseline window. ASSUMPTION: DECISIONS names a pre-flight baseline but
 * not its days; the last 30 days before launch (mission days −30 to −1) are used.
 *
 * @type {Readonly<BaselineWindow>}
 */
export const PRE_FLIGHT_WINDOW = Object.freeze({ fromDay: -30, toDay: -1 });

/**
 * Fewest readings a mission baseline needs. ASSUMPTION: the team hasn't set this;
 * 10 is two thirds of the 15-day in-flight window.
 */
export const BASELINE_MIN_READINGS = 10;

/** A standard deviation needs at least two readings. */
const ABSOLUTE_MIN_READINGS = 2;

/**
 * CHECKLIST §2: "Baseline calculator: mean and standard deviation per indicator for a
 * fixed window".
 *
 * Calculates a fixed baseline (mean and sample standard deviation) for each
 * requested indicator, using only records whose mission day falls inside the window.
 *
 * Missing data is safe:
 * - records that are null, not objects, or have no integer mission day are ignored;
 * - indicator values that are null, undefined, NaN, ±Infinity or not numbers
 *   (including numeric strings) are skipped and counted in `skipped`;
 * - an indicator with too few readings gets `insufficient_data` or `no_data`
 *   with null mean and sd, never a made-up number.
 *
 * Deterministic: the same records give bit-identical results whatever order they
 * arrive in, because values are sorted before summing. Inputs are never modified,
 * and the result is frozen.
 *
 * @param {ReadonlyArray<DailyRecord>} records Daily records for ONE astronaut.
 * @param {ReadonlyArray<string>} indicators   Field names to calculate, e.g.
 *   ["heartRate", "sleepHours"]. Must be non-empty, without duplicates.
 * @param {BaselineWindow} window              Inclusive range of mission days.
 * @param {Object} [options]
 * @param {number} [options.minReadings=2]     Fewest usable readings needed for an
 *   `ok` result. Must be an integer ≥ 2. The team hasn't set a number yet.
 * @param {string} [options.dayKey="missionDay"] Field holding the mission day.
 * @returns {Readonly<BaselineResult>}
 * @throws {TypeError}  If `records` isn't an array, or `indicators` is empty, has a
 *   non-string or duplicate entry.
 * @throws {RangeError} If the window or `minReadings` is invalid.
 *
 * @example
 * const result = calculateBaseline(records, ["heartRate", "sleepHours"], IN_FLIGHT_WINDOW);
 * result.indicators.heartRate; // { status: "ok", mean: 64.2, sd: 2.1, n: 15, skipped: 0 }
 */
export function calculateBaseline(records, indicators, window, options = {}) {
  const { minReadings = ABSOLUTE_MIN_READINGS, dayKey = "missionDay" } = options;

  validateArguments(records, indicators, window, minReadings, dayKey);

  const inWindow = records.filter((record) => {
    if (record === null || typeof record !== "object") return false;
    const day = record[dayKey];
    return Number.isInteger(day) && day >= window.fromDay && day <= window.toDay;
  });

  /** @type {Object<string, IndicatorBaseline>} */
  const results = {};
  for (const indicator of indicators) {
    results[indicator] = summarise(inWindow, indicator, minReadings);
  }

  return Object.freeze({
    window: Object.freeze({ fromDay: window.fromDay, toDay: window.toDay }),
    indicators: Object.freeze(results),
  });
}

/**
 * Mean and sample standard deviation for one indicator.
 *
 * @param {ReadonlyArray<DailyRecord>} records Records already inside the window.
 * @param {string} indicator
 * @param {number} minReadings
 * @returns {Readonly<IndicatorBaseline>}
 */
function summarise(records, indicator, minReadings) {
  const values = [];
  let skipped = 0;

  for (const record of records) {
    const value = record[indicator];
    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(value);
    } else {
      skipped += 1;
    }
  }

  const n = values.length;
  if (n === 0) {
    return Object.freeze({ status: "no_data", mean: null, sd: null, n, skipped });
  }
  if (n < minReadings) {
    return Object.freeze({ status: "insufficient_data", mean: null, sd: null, n, skipped });
  }

  // Sort so floating-point sums don't depend on the order records arrived in.
  values.sort((a, b) => a - b);

  // Two-pass method: more accurate than the one-pass "sum of squares" shortcut.
  let sum = 0;
  for (const value of values) sum += value;
  const mean = sum / n;

  let squaredDeviations = 0;
  for (const value of values) squaredDeviations += (value - mean) ** 2;
  const sd = Math.sqrt(squaredDeviations / (n - 1));

  return Object.freeze({ status: "ok", mean, sd, n, skipped });
}

/**
 * Throws on programmer errors (wrong argument types). Bad DATA never throws; it is
 * skipped and counted instead.
 *
 * @param {unknown} records
 * @param {unknown} indicators
 * @param {unknown} window
 * @param {unknown} minReadings
 * @param {unknown} dayKey
 */
function validateArguments(records, indicators, window, minReadings, dayKey) {
  if (!Array.isArray(records)) {
    throw new TypeError("calculateBaseline: records must be an array.");
  }
  if (!Array.isArray(indicators) || indicators.length === 0) {
    throw new TypeError("calculateBaseline: indicators must be a non-empty array of field names.");
  }
  const seen = new Set();
  for (const indicator of indicators) {
    if (typeof indicator !== "string" || indicator.length === 0) {
      throw new TypeError("calculateBaseline: each indicator must be a non-empty string.");
    }
    if (seen.has(indicator)) {
      throw new TypeError(`calculateBaseline: indicator "${indicator}" is listed twice.`);
    }
    seen.add(indicator);
  }
  if (
    window === null ||
    typeof window !== "object" ||
    !Number.isInteger(window.fromDay) ||
    !Number.isInteger(window.toDay)
  ) {
    throw new RangeError("calculateBaseline: window needs integer fromDay and toDay.");
  }
  if (window.fromDay > window.toDay) {
    throw new RangeError("calculateBaseline: window.fromDay must not be after window.toDay.");
  }
  if (!Number.isInteger(minReadings) || minReadings < ABSOLUTE_MIN_READINGS) {
    throw new RangeError(
      `calculateBaseline: minReadings must be an integer of at least ${ABSOLUTE_MIN_READINGS}.`,
    );
  }
  if (typeof dayKey !== "string" || dayKey.length === 0) {
    throw new TypeError("calculateBaseline: dayKey must be a non-empty string.");
  }
}

/**
 * @typedef {Object} MissionBaselines
 * @property {Readonly<BaselineResult>} preflight Baseline over PRE_FLIGHT_WINDOW.
 * @property {Readonly<BaselineResult>} inflight  Baseline over IN_FLIGHT_WINDOW.
 */

/**
 * CHECKLIST §2: "Pre-flight baseline and in-flight baseline (for example mission days
 * 21–35) both calculated once and stored". This function does the calculating; saving
 * the result is CHECKLIST §1 ("Save and load the two baselines"). Both baselines are
 * FIXED (DECISIONS › Baselines): call this once per astronaut, store the result, and
 * never recompute it from later days.
 *
 * The in-flight baseline only exists once its window has ended, so pass only records
 * up to the current day; before day 36 the in-flight result is `insufficient_data`.
 *
 * @param {ReadonlyArray<DailyRecord>} records Daily records for ONE astronaut.
 * @param {ReadonlyArray<string>} indicators   Field names, e.g. DRIFT_INDICATOR_KEYS.
 * @param {Object} [options]
 * @param {BaselineWindow} [options.preflightWindow=PRE_FLIGHT_WINDOW]
 * @param {BaselineWindow} [options.inflightWindow=IN_FLIGHT_WINDOW]
 * @param {number} [options.minReadings=BASELINE_MIN_READINGS]
 * @param {string} [options.dayKey="missionDay"]
 * @returns {Readonly<MissionBaselines>}
 */
export function calculateMissionBaselines(records, indicators, options = {}) {
  const {
    preflightWindow = PRE_FLIGHT_WINDOW,
    inflightWindow = IN_FLIGHT_WINDOW,
    minReadings = BASELINE_MIN_READINGS,
    dayKey = "missionDay",
  } = options;
  return Object.freeze({
    preflight: calculateBaseline(records, indicators, preflightWindow, { minReadings, dayKey }),
    inflight: calculateBaseline(records, indicators, inflightWindow, { minReadings, dayKey }),
  });
}
