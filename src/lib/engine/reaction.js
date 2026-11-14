// Reaction-test scoring (docs/CHECKLIST.md › 2. Logic, item 11).
// Pure logic: no React, DOM, database or Node-only APIs. Timing and the test screen
// itself are CHECKLIST §3; this only scores the results.

/** A response slower than this many milliseconds is a lapse (CHECKLIST §2: "lapses over 500 ms"). */
export const LAPSE_THRESHOLD_MS = 500;

/**
 * @typedef {Object} ReactionScore
 * @property {number | null} medianMs  Median of valid responses, or null if there were none.
 * @property {number} lapses           Valid responses slower than 500 ms.
 * @property {number} falseStarts      Presses before the signal.
 * @property {number} validTrials      Responses counted.
 * @property {number} ignoredTrials    Entries that weren't a positive finite number.
 */

/**
 * CHECKLIST §2: "Reaction scoring: median, lapses over 500 ms, false starts".
 *
 * The median is used (not the mean) so one very slow or very fast press doesn't
 * swing the result. False starts are counted separately and never enter the median.
 * Invalid entries (missing, zero, negative, NaN, text) are ignored and counted.
 *
 * @param {Object} test
 * @param {ReadonlyArray<unknown>} test.trialsMs Reaction times in milliseconds, one per
 *   signal the astronaut responded to after it appeared.
 * @param {number} [test.falseStarts=0] Number of presses before the signal.
 * @returns {Readonly<ReactionScore>}
 * @throws {TypeError} If `trialsMs` isn't an array or `falseStarts` isn't a whole number ≥ 0.
 */
export function scoreReactionTest({ trialsMs, falseStarts = 0 }) {
  if (!Array.isArray(trialsMs)) throw new TypeError("scoreReactionTest: trialsMs must be an array.");
  if (!Number.isInteger(falseStarts) || falseStarts < 0) {
    throw new TypeError("scoreReactionTest: falseStarts must be a whole number of 0 or more.");
  }

  const valid = trialsMs.filter((ms) => typeof ms === "number" && Number.isFinite(ms) && ms > 0);
  const sorted = [...valid].sort((a, b) => a - b);
  const n = sorted.length;

  let medianMs = null;
  if (n > 0) {
    const mid = Math.floor(n / 2);
    medianMs = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return Object.freeze({
    medianMs,
    lapses: sorted.filter((ms) => ms > LAPSE_THRESHOLD_MS).length,
    falseStarts,
    validTrials: n,
    ignoredTrials: trialsMs.length - n,
  });
}

/**
 * The daily-record fields a reaction test fills in (field names: indicators.js).
 *
 * @param {Readonly<ReactionScore>} score From scoreReactionTest().
 * @returns {{ reactionMedianMs: number | null, reactionLapses: number, reactionFalseStarts: number }}
 */
export function reactionRecordFields(score) {
  return {
    reactionMedianMs: score.medianMs,
    reactionLapses: score.lapses,
    reactionFalseStarts: score.falseStarts,
  };
}

/** Spread around the baseline mean that counts as "your usual range" for one test (ATHENA design choice). */
export const REACTION_TYPICAL_SPREAD_SD = 1.5;

/**
 * Compares one reaction test with the astronaut's own in-flight baseline, for the result screen.
 * Informational only: alerts come from the 7-day average and drift (DECISIONS › Trends Over Single Readings).
 *
 * @param {{ medianMs: number | null }} score From scoreReactionTest().
 * @param {{ status: string, mean: number | null, sd: number | null } | null | undefined} baseline
 *   The reactionMedianMs entry of an in-flight baseline (calculateMissionBaselines().inflight.indicators).
 * @returns {{ usualMs: number, typicalLowMs: number, typicalHighMs: number, slower: boolean } | null}
 *   Null when there's no usable baseline or no median.
 */
export function compareReactionToBaseline(score, baseline) {
  if (!baseline || baseline.status !== "ok" || !Number.isFinite(baseline.mean) || !Number.isFinite(baseline.sd)) return null;
  const spread = REACTION_TYPICAL_SPREAD_SD * baseline.sd;
  const result = {
    usualMs: Math.round(baseline.mean),
    typicalLowMs: Math.round(baseline.mean - spread),
    typicalHighMs: Math.round(baseline.mean + spread),
    slower: false,
  };
  if (score?.medianMs == null) return Object.freeze({ ...result, slower: false });
  return Object.freeze({ ...result, slower: score.medianMs > baseline.mean + spread });
}
