// Mission mode (docs/CHECKLIST.md › 2. Logic, S item "Mission mode changes which hazards
// and advice are shown").
// Pure logic: no React, DOM, database or Node-only APIs. Modes, delays, emphasis and
// advice all come from src/data/missionModes.js; hazards from src/data/hazards.js.

import { DEFAULT_MISSION_MODE, HAZARDS, MISSION_MODES, SOURCES } from "../../data/index.js";

/**
 * The mission mode for an id, or the default mode (Mars Transit) if the id is unknown.
 *
 * @param {string} [modeId]
 * @returns {Object} An entry from MISSION_MODES.
 */
export function getMissionMode(modeId) {
  return (
    MISSION_MODES.find((m) => m.id === modeId) ??
    MISSION_MODES.find((m) => m.id === DEFAULT_MISSION_MODE) ??
    MISSION_MODES[0]
  );
}

/**
 * @typedef {Object} EarthLink
 * @property {string} modeId
 * @property {string} text               Delay as shown to the crew, e.g. "Up to 20 min one way".
 * @property {number} oneWayMaxSeconds    Longest one-way delay.
 * @property {number} roundTripMaxSeconds Longest wait for a reply (2 × one way).
 * @property {string} replyText          Plain-English reply time, e.g. "up to 40 minutes".
 * @property {boolean} inferred          True if the figure is applied from a related source
 *                                       (Gateway uses NASA's lunar-mission estimate).
 * @property {{ title: string, url: string } | null} source
 */

/**
 * The Earth-link delay for a mission mode (CHECKLIST §3 "Earth Link", and the
 * flight-surgeon summary's "reply expected in about N minutes").
 *
 * @param {string} [modeId]
 * @returns {Readonly<EarthLink> | null} Null if the mode has no sourced delay.
 */
export function earthLink(modeId) {
  const mode = getMissionMode(modeId);
  const delay = mode.earthDelay;
  if (!delay || !(delay.oneWaySeconds?.max > 0)) return null;
  const oneWayMaxSeconds = delay.oneWaySeconds.max;
  const roundTripMaxSeconds = oneWayMaxSeconds * 2;
  const source = SOURCES[delay.sourceId];
  return Object.freeze({
    modeId: mode.id,
    text: delay.text,
    oneWayMaxSeconds,
    roundTripMaxSeconds,
    replyText: formatWait(roundTripMaxSeconds, delay.oneWaySeconds.min),
    inferred: Boolean(delay.inferred),
    source: source ? Object.freeze({ title: source.title, url: source.url }) : null,
  });
}

/**
 * Plain-English longest wait for a reply.
 *
 * @param {number} roundTripMaxSeconds
 * @param {number | null} oneWayMinSeconds
 * @returns {string}
 */
function formatWait(roundTripMaxSeconds, oneWayMinSeconds) {
  if (roundTripMaxSeconds < 5) return "almost immediately (a second or two)";
  if (roundTripMaxSeconds < 120) {
    const min = typeof oneWayMinSeconds === "number" && oneWayMinSeconds > 0 ? oneWayMinSeconds * 2 : null;
    return min ? `about ${min}–${roundTripMaxSeconds} seconds` : `up to ${roundTripMaxSeconds} seconds`;
  }
  return `up to ${Math.ceil(roundTripMaxSeconds / 60)} minutes`;
}

/**
 * CHECKLIST §2 (S): "Mission mode changes which hazards … are shown".
 *
 * All 5 hazards, with the mode's emphasised ones first (in the mode's order) and marked
 * `emphasised: true`; the rest follow in src/data order. Nothing is hidden, so no hazard
 * information is ever lost by switching mode.
 *
 * @param {string} [modeId]
 * @returns {ReadonlyArray<Readonly<{ id: string, name: string, emphasised: boolean }>>}
 */
export function hazardsForMode(modeId) {
  const emphasis = getMissionMode(modeId).emphasis?.hazards ?? [];
  const first = emphasis.map((id) => HAZARDS.find((h) => h.id === id)).filter(Boolean);
  const rest = HAZARDS.filter((h) => !emphasis.includes(h.id));
  return Object.freeze([
    ...first.map((h) => Object.freeze({ id: h.id, name: h.name, emphasised: true })),
    ...rest.map((h) => Object.freeze({ id: h.id, name: h.name, emphasised: false })),
  ]);
}

/**
 * CHECKLIST §2 (S): "Mission mode changes which … advice is shown".
 *
 * The mode's advice (how to work with Earth given the delay), plus the Earth link it is
 * based on. Advice is an ATHENA design choice and says so.
 *
 * @param {string} [modeId]
 * @returns {Readonly<{ modeId: string, glance: string, basisLabel: string, earthLink: Readonly<EarthLink> | null }>}
 */
export function adviceForMode(modeId) {
  const mode = getMissionMode(modeId);
  return Object.freeze({
    modeId: mode.id,
    glance: mode.advice?.glance ?? "",
    basisLabel: "ATHENA design choice (not a clinical standard)",
    earthLink: earthLink(mode.id),
  });
}
