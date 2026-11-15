// Likely hazard behind a drift alert, shown on the alert card.
// Pure logic: no React, DOM, database or Node-only APIs.
//
// Each indicator's measurement guide names ONE NASA hazard that affects it, in
// `briefAnswers.hazardEffect` ("<Hazard name>: <effect>") in src/data/indicators.js. This
// groups the drifting indicators by that hazard, so the alert card can say e.g.
// "Likely hazard: Isolation and Confinement (sleep, mood, reaction)". It's ATHENA's
// interpretation of the NASA pages, not a diagnosis, and the UI says so.

import { HAZARDS, INDICATORS, SOURCES } from "../../data/index.js";

/**
 * The hazard an indicator's guide names, or null.
 *
 * @param {string} indicatorId Content indicator id, e.g. "sleep".
 * @returns {Readonly<{ hazardId: string, effect: string }> | null}
 */
export function hazardForIndicator(indicatorId) {
  const text = INDICATORS.find((i) => i.id === indicatorId)?.briefAnswers?.hazardEffect;
  if (typeof text !== "string") return null;
  const cut = text.indexOf(":");
  if (cut < 0) return null;
  const name = text.slice(0, cut).trim().toLowerCase();
  const hazard = HAZARDS.find((h) => h.name.toLowerCase() === name);
  if (!hazard) return null;
  return Object.freeze({ hazardId: hazard.id, effect: text.slice(cut + 1).trim() });
}

/**
 * @typedef {Object} LikelyHazard
 * @property {string} hazardId
 * @property {string} name
 * @property {ReadonlyArray<string>} indicatorIds The drifting indicators linked to it, in input order.
 * @property {ReadonlyArray<string>} effects      The guide's effect text for each of those indicators.
 * @property {{ title: string, url: string } | null} source The NASA hazard page.
 */

/**
 * The hazards most likely behind a set of drifting indicators: most linked indicators
 * first, then in src/data hazard order. Indicators without a named hazard are skipped.
 *
 * @param {ReadonlyArray<string>} indicatorIds Content indicator ids (alert groups).
 * @returns {ReadonlyArray<Readonly<LikelyHazard>>}
 * @throws {TypeError} If `indicatorIds` isn't an array.
 */
export function likelyHazards(indicatorIds) {
  if (!Array.isArray(indicatorIds)) throw new TypeError("likelyHazards: indicatorIds must be an array.");
  const byHazard = new Map();
  for (const id of indicatorIds) {
    const link = hazardForIndicator(id);
    if (!link) continue;
    const entry = byHazard.get(link.hazardId) ?? { indicatorIds: [], effects: [] };
    if (!entry.indicatorIds.includes(id)) {
      entry.indicatorIds.push(id);
      if (!entry.effects.includes(link.effect)) entry.effects.push(link.effect);
    }
    byHazard.set(link.hazardId, entry);
  }
  const order = (hazardId) => HAZARDS.findIndex((h) => h.id === hazardId);
  return Object.freeze(
    [...byHazard.entries()]
      .sort(([a, x], [b, y]) => y.indicatorIds.length - x.indicatorIds.length || order(a) - order(b))
      .map(([hazardId, entry]) => {
        const hazard = HAZARDS.find((h) => h.id === hazardId);
        const source = SOURCES[hazard.sourceIds?.[0]];
        return Object.freeze({
          hazardId,
          name: hazard.name,
          indicatorIds: Object.freeze(entry.indicatorIds),
          effects: Object.freeze(entry.effects),
          source: source ? Object.freeze({ title: source.title, url: source.url }) : null,
        });
      }),
  );
}
