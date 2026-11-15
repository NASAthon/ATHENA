// Region mapper.
// Pure logic: no React, DOM, database or Node-only APIs.
//
// The indicator-to-region table is the `indicators` list of each region in
// src/data/regions.js (from docs/BODY_MAP.md); it isn't repeated here.

import { REGIONS } from "../../data/index.js";

/** Region statuses, most to least severe. */
export const REGION_STATUSES = Object.freeze(["red_limit", "drifting", "expected_adaptation", "steady", "no_data"]);

/**
 * Region mapper: indicator-to-body-region table and worst-status function.
 *
 * Worst status among a region's indicators: a red limit on today's reading beats
 * drifting, which beats expected adaptation, then steady. A region with no data, or
 * with no numeric indicators (e.g. eyes), is "no_data".
 *
 * @param {string} regionId Region id from src/data/regions.js, e.g. "heart".
 * @param {ReadonlyArray<{ group: string, status: string }>} groups From groupStatuses()
 *   (groups are content indicator ids).
 * @param {ReadonlyArray<{ indicatorId: string, redLimit: boolean }>} [limitBreaches] From checkReading().
 * @returns {"red_limit" | "drifting" | "expected_adaptation" | "steady" | "no_data"}
 * @throws {RangeError} If the region id is unknown.
 */
export function regionStatus(regionId, groups, limitBreaches = []) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) throw new RangeError(`regionStatus: unknown region "${regionId}".`);

  const found = new Set();
  for (const indicatorId of region.indicators) {
    if (limitBreaches.some((b) => b.indicatorId === indicatorId && b.redLimit)) found.add("red_limit");
    const status = groups.find((g) => g.group === indicatorId)?.status;
    if (status) found.add(status);
  }
  return /** @type {any} */ (REGION_STATUSES.find((s) => found.has(s)) ?? "no_data");
}

/**
 * Status of every region, in src/data order (for colouring the body figure).
 *
 * @param {Parameters<typeof regionStatus>[1]} groups
 * @param {Parameters<typeof regionStatus>[2]} [limitBreaches]
 * @returns {ReadonlyArray<{ regionId: string, status: string }>}
 */
export function allRegionStatuses(groups, limitBreaches = []) {
  return Object.freeze(
    REGIONS.map((r) => Object.freeze({ regionId: r.id, status: regionStatus(r.id, groups, limitBreaches) })),
  );
}

/**
 * Which regions show a content indicator (for linking an alert to the body figure).
 *
 * @param {string} indicatorId e.g. "exercise".
 * @returns {ReadonlyArray<string>} Region ids.
 */
export function regionsForIndicator(indicatorId) {
  return Object.freeze(REGIONS.filter((r) => r.indicators.includes(indicatorId)).map((r) => r.id));
}
