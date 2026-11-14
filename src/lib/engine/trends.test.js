import { test } from "node:test";
import assert from "node:assert/strict";
import { simulateAstronaut } from "../sim/simulator.js";
import { calculateMissionBaselines } from "./baseline.js";
import { driftZ } from "./drift.js";
import { evaluateMission } from "./evaluate.js";
import { DRIFT_INDICATOR_KEYS, getIndicator } from "./indicators.js";
import { driftBand, driftPeriods, trendSeries } from "./trends.js";

const baselinesOf = (records) =>
  calculateMissionBaselines(records.filter((r) => r.missionDay <= 35), DRIFT_INDICATOR_KEYS);

test("the band edge is exactly the drift cut-off, and only on the worrying side", () => {
  const baseline = { status: "ok", mean: 7, sd: 0.4, n: 15 };
  const band = driftBand(baseline, "sleepHours");
  assert.equal(band.high, null); // sleep only drifts downwards
  const { sdFloor, direction } = getIndicator("sleepHours");
  const at = (mean) => driftZ({ status: "ok", mean, n: 7 }, baseline, direction, sdFloor);
  assert.equal(at(band.low - 1e-9).drifting, true);
  assert.equal(at(band.low + 1e-9).drifting, false);
  assert.equal(driftBand(baseline, "reactionMedianMs").low, null); // reaction only drifts upwards
  const both = driftBand(baseline, "heartRate");
  assert.ok(both.low < 7 && both.high > 7);
  assert.equal(driftBand({ status: "insufficient_data", mean: null, sd: null, n: 3 }, "sleepHours"), null);
});

test("Rivera: sleep drifts from about week 15 and the series matches the engine", () => {
  const records = simulateAstronaut("rivera").filter((r) => r.missionDay <= 129);
  const evaluations = evaluateMission(records, baselinesOf(records), 1, 129);
  const series = trendSeries(evaluations, "sleepHours");
  assert.equal(series.length, 129);
  assert.equal(series.at(-1).status, "drifting");
  const periods = driftPeriods(series);
  assert.ok(periods.length >= 1);
  assert.ok(periods.at(-1).toDay === 129 && periods.at(-1).fromDay > 75);
  assert.throws(() => trendSeries(evaluations, "nope"));
});

test("Singh: no drifting periods in sleep or reaction", () => {
  const records = simulateAstronaut("singh").filter((r) => r.missionDay <= 129);
  const evaluations = evaluateMission(records, baselinesOf(records), 1, 129);
  for (const key of ["sleepHours", "reactionMedianMs", "mood"]) {
    assert.deepEqual(driftPeriods(trendSeries(evaluations, key)), [], key);
  }
});

test("driftPeriods joins consecutive days only", () => {
  const s = (day, status) => ({ day, average: 1, status });
  assert.deepEqual(driftPeriods([s(1, "steady"), s(2, "drifting"), s(3, "drifting"), s(4, "steady"), s(5, "drifting")]), [
    { fromDay: 2, toDay: 3 },
    { fromDay: 5, toDay: 5 },
  ]);
});
