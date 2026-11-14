// Drift z-score (docs/CHECKLIST.md › 2. Logic, items 5 and 7).
// Pure logic: no React, DOM, database or Node-only APIs.

/**
 * CHECKLIST §2: "Drift cut-off of z = 3.5". A design choice, not a clinical standard
 * (DECISIONS › Drift Cut-off; also stated in README › Drift detection).
 */
export const DRIFT_CUTOFF = 3.5;

/**
 * @typedef {Object} DriftResult
 * @property {number} z          Signed z: positive means the recent average is higher
 *                               than the baseline.
 * @property {number} worryingZ  z in the worrying direction only: −z for "down",
 *                               z for "up", |z| for "both". Negative or 0 = no concern.
 * @property {boolean} drifting  True when worryingZ ≥ DRIFT_CUTOFF.
 * @property {number} s          Spread used: the baseline SD, raised to the floor if lower.
 * @property {boolean} floorApplied True if the floor replaced a smaller baseline SD.
 */

/**
 * CHECKLIST §2: "Z-score of the seven-day average against the in-flight baseline".
 *
 * Implements the locked formula (DECISIONS › Drift Cut-off):
 *
 *     z = (recent average − baseline mean) ÷ (s × √(1/n + 1/m))
 *
 * where s is the baseline's day-to-day SD, never below the indicator's floor.
 * The function is generic, so the status step can also compare against the
 * pre-flight baseline (for "expected adaptation").
 *
 * Returns null, never a guess, when either side lacks data: a recent average with
 * status other than "ok", or a baseline whose status isn't "ok".
 *
 * @param {{ status: string, mean: number | null, n: number }} recent  From sevenDayAverage().
 * @param {{ status: string, mean: number | null, sd: number | null, n: number }} baseline
 *   One indicator's entry from calculateBaseline().
 * @param {"down" | "up" | "both"} direction Worrying direction for this indicator.
 * @param {number} sdFloor Minimum s for this indicator (> 0).
 * @returns {Readonly<DriftResult> | null}
 */
export function driftZ(recent, baseline, direction, sdFloor) {
  if (!(sdFloor > 0)) throw new RangeError("driftZ: sdFloor must be a positive number.");
  if (!recent || recent.status !== "ok" || !baseline || baseline.status !== "ok") return null;
  if (!(recent.n > 0) || !(baseline.n > 0)) return null;

  const floorApplied = baseline.sd < sdFloor;
  const s = floorApplied ? sdFloor : baseline.sd;
  const z = (recent.mean - baseline.mean) / (s * Math.sqrt(1 / recent.n + 1 / baseline.n));

  let worryingZ;
  if (direction === "down") worryingZ = -z;
  else if (direction === "up") worryingZ = z;
  else if (direction === "both") worryingZ = Math.abs(z);
  else throw new RangeError(`driftZ: unknown direction "${direction}".`);

  // Normalise −0 so results compare equal in tests and storage.
  if (Object.is(worryingZ, -0)) worryingZ = 0;

  return Object.freeze({ z, worryingZ, drifting: worryingZ >= DRIFT_CUTOFF, s, floorApplied });
}
