"use client";

import { useMemo } from "react";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { DAY_KEY, IN_FLIGHT_WINDOW, evaluateMission } from "@/lib/engine";

/**
 * Today's evaluation for the astronaut selected in the header, from STORED data
 * (useMissionData) and the logic engine. Shared by the Today screen and the alert banner.
 *
 * Evaluates from the day after the in-flight baseline window up to today, so the alert
 * level knows when an alert started and whether it has escalated.
 *
 * @returns {{
 *   state: "loading" | "empty" | "ready",
 *   today: number | null,
 *   member: { id: string, name: string },
 *   evaluation: Object | null,   // DayEvaluation for today (src/lib/engine/evaluate.js)
 *   record: Object | null,       // today's stored record, if any
 *   baselines: Object | null,    // stored { preflight, inflight } baselines
 *   records: Object[],           // all stored daily records for this astronaut
 * }}
 */
/**
 * One astronaut's evaluation for today from STORED data (no React). Used by useTodayEvaluation and
 * by the Crew page, which shows every astronaut at once.
 *
 * @param {Object} db The opened database (useMissionData().db).
 * @param {string} crewId
 * @param {number} today Today's mission day.
 * @returns {{ state: "empty" | "ready", evaluation: Object | null, record: Object | null, baselines: Object | null, records: Object[] }}
 */
export function evaluateStored(db, crewId, today) {
  const records = db.loadDailyRecords(crewId);
  if (records.length === 0) return { state: "empty", evaluation: null, record: null, baselines: null, records: [] };
  const baselines = db.loadMissionBaselines(crewId);
  const fromDay = Math.min(IN_FLIGHT_WINDOW.toDay + 1, today);
  const evaluation = evaluateMission(records, baselines, fromDay, today).at(-1) ?? null;
  const record = records.find((r) => r[DAY_KEY] === today) ?? null;
  return { state: "ready", evaluation, record, baselines, records };
}

export function useTodayEvaluation() {
  const { crewId, member } = useCrew();
  const { db, status, today, version } = useMissionData();

  return useMemo(() => {
    const base = { today, member, evaluation: null, record: null, baselines: null, records: [] };
    if (status === "loading" || !db) return { ...base, state: "loading" };
    if (today === null) return { ...base, state: "empty" };
    return { ...base, ...evaluateStored(db, crewId, today) };
    // version changes after every save, so the evaluation is recalculated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, status, today, crewId, member, version]);
}
