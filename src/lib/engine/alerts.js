// Alert level.
// Pure logic: no React, DOM, database or Node-only APIs.
//
// DECISIONS › Drift Cut-off:
// - 1 group drifting = "note", 2 or more = "alert".
// - No recovery after 14 more days = "escalated" (tell crew and ground).
// - Linked indicators count once: reaction median + lapses are one group, systolic +
//   diastolic are one group (see `group` in indicators.js).

/** Days an alert must last without recovery before it escalates. */
export const ESCALATION_DAYS = 14;

/** Status ranking used to pick a group's worst member. */
const STATUS_RANK = Object.freeze({ no_data: 0, steady: 1, expected_adaptation: 2, drifting: 3 });

/**
 * @typedef {Object} GroupStatus
 * @property {string} group
 * @property {"no_data" | "steady" | "expected_adaptation" | "drifting"} status Worst member status.
 * @property {number | null} worryingZ Highest in-flight worrying z among drifting members, else
 *   the highest available, else null.
 * @property {ReadonlyArray<string>} drifting Member keys that are drifting.
 */

/**
 * Collapses per-indicator statuses into one status per linked group, so blood pressure
 * and reaction each count once.
 *
 * @param {ReadonlyArray<{ key: string, group: string, status: string, worryingZ: number | null }>} statuses
 *   From allIndicatorStatuses().
 * @returns {ReadonlyArray<Readonly<GroupStatus>>} In first-seen order.
 */
export function groupStatuses(statuses) {
  /** @type {Map<string, { group: string, status: string, worryingZ: number | null, drifting: string[] }>} */
  const groups = new Map();
  for (const item of statuses) {
    let entry = groups.get(item.group);
    if (!entry) {
      entry = { group: item.group, status: "no_data", worryingZ: null, drifting: [] };
      groups.set(item.group, entry);
    }
    if (STATUS_RANK[item.status] > STATUS_RANK[entry.status]) entry.status = item.status;
    if (item.status === "drifting") entry.drifting.push(item.key);
    if (item.worryingZ !== null && (entry.worryingZ === null || item.worryingZ > entry.worryingZ)) {
      entry.worryingZ = item.worryingZ;
    }
  }
  return Object.freeze(
    [...groups.values()].map((g) =>
      Object.freeze({ ...g, drifting: Object.freeze(g.drifting) }),
    ),
  );
}

/**
 * Number of drifting groups on a day, or null if no group had data (a day without
 * data is not evidence of recovery, so it must not reset an alert).
 *
 * @param {ReadonlyArray<{ status: string }>} groups From groupStatuses().
 * @returns {number | null}
 */
export function countDriftingGroups(groups) {
  if (groups.every((g) => g.status === "no_data")) return null;
  return groups.filter((g) => g.status === "drifting").length;
}

/**
 * @typedef {"none" | "note" | "alert" | "escalated"} AlertLevel
 */

/**
 * @typedef {Object} AlertResult
 * @property {AlertLevel} level
 * @property {number | null} driftingGroups Groups drifting on `day` (null = no data).
 * @property {number | null} alertSince First day of the current unbroken alert, or null.
 */

/**
 * Alert level: 1 drifting = note, 2 or more = alert, no recovery after
 * 14 more days = tell crew and ground (linked indicators count once).
 *
 * `history` holds the drifting-group count for each evaluated day (null = no data).
 * An alert starts on the first day with 2 or more drifting groups and only ends on a
 * day WITH data that has fewer than 2. Days with no data, or missing from the history,
 * neither end it nor start it. It escalates once `day − alertSince ≥ 14`.
 *
 * @param {ReadonlyArray<{ day: number, driftingGroups: number | null }>} history
 *   Any order; entries after `day` are ignored.
 * @param {number} day
 * @returns {Readonly<AlertResult>}
 */
export function alertLevelOnDay(history, day) {
  const upToDay = history.filter((h) => h.day <= day).sort((a, b) => a.day - b.day);
  const today = upToDay.find((h) => h.day === day);
  const driftingGroups = today ? today.driftingGroups : null;

  if (driftingGroups === null) {
    return Object.freeze({ level: "none", driftingGroups: null, alertSince: null });
  }
  if (driftingGroups < 2) {
    return Object.freeze({
      level: driftingGroups === 1 ? "note" : "none",
      driftingGroups,
      alertSince: null,
    });
  }

  // Walk back to the start of this unbroken alert.
  let alertSince = day;
  for (let i = upToDay.length - 1; i >= 0; i -= 1) {
    const entry = upToDay[i];
    if (entry.driftingGroups === null) continue; // no data: not a recovery
    if (entry.driftingGroups < 2) break; // recovered on this day
    alertSince = entry.day;
  }

  const level = day - alertSince >= ESCALATION_DAYS ? "escalated" : "alert";
  return Object.freeze({ level, driftingGroups, alertSince });
}
