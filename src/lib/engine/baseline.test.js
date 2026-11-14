// Unit tests for the baseline calculator. Run with: npm test
// Uses Node's built-in test runner, so there is nothing extra to install.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateBaseline, IN_FLIGHT_WINDOW } from "./baseline.js";

/** Builds one record per day with the given heart rates, starting at `firstDay`. */
function heartRateDays(firstDay, rates) {
  return rates.map((heartRate, index) => ({ missionDay: firstDay + index, heartRate }));
}

test("known values: mean and sample standard deviation", () => {
  // 2, 4, 4, 4, 5, 5, 7, 9 → mean 5, sample SD √(32 / 7)
  const records = heartRateDays(21, [2, 4, 4, 4, 5, 5, 7, 9]);
  const { indicators } = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW);

  assert.equal(indicators.heartRate.status, "ok");
  assert.equal(indicators.heartRate.mean, 5);
  assert.equal(indicators.heartRate.sd, Math.sqrt(32 / 7));
  assert.equal(indicators.heartRate.n, 8);
  assert.equal(indicators.heartRate.skipped, 0);
});

test("only days inside the window count, and both ends are included", () => {
  const records = [
    { missionDay: 20, heartRate: 999 }, // just before
    { missionDay: 21, heartRate: 60 }, // first day
    { missionDay: 35, heartRate: 70 }, // last day
    { missionDay: 36, heartRate: 999 }, // just after
  ];
  const { indicators } = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW);

  assert.equal(indicators.heartRate.n, 2);
  assert.equal(indicators.heartRate.mean, 65);
});

test("pre-flight window with negative mission days", () => {
  const records = heartRateDays(-10, [58, 60, 62, 60, 60, 60, 60, 60, 60, 60]);
  const { indicators } = calculateBaseline(records, ["heartRate"], { fromDay: -10, toDay: -1 });

  assert.equal(indicators.heartRate.status, "ok");
  assert.equal(indicators.heartRate.n, 10);
  assert.equal(indicators.heartRate.mean, 60);
});

test("missing and invalid values are skipped and counted, never used", () => {
  const records = [
    { missionDay: 21, heartRate: 60, sleepHours: 7 },
    { missionDay: 22, heartRate: null, sleepHours: 8 },
    { missionDay: 23, sleepHours: 7.5 }, // heartRate missing
    { missionDay: 24, heartRate: Number.NaN },
    { missionDay: 25, heartRate: Number.POSITIVE_INFINITY },
    { missionDay: 26, heartRate: "64" }, // a string is not a reading
    { missionDay: 27, heartRate: 70 },
  ];
  const { indicators } = calculateBaseline(records, ["heartRate", "sleepHours"], IN_FLIGHT_WINDOW);

  assert.equal(indicators.heartRate.n, 2);
  assert.equal(indicators.heartRate.skipped, 5);
  assert.equal(indicators.heartRate.mean, 65);
  assert.equal(indicators.sleepHours.n, 3);
  assert.equal(indicators.sleepHours.skipped, 4);
});

test("broken records are ignored without crashing", () => {
  const records = [
    null,
    undefined,
    42,
    "day 21",
    { heartRate: 80 }, // no mission day
    { missionDay: "21", heartRate: 80 }, // mission day not a number
    { missionDay: 21.5, heartRate: 80 }, // not a whole day
    { missionDay: 22, heartRate: 60 },
    { missionDay: 23, heartRate: 62 },
  ];
  const { indicators } = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW);

  assert.equal(indicators.heartRate.n, 2);
  assert.equal(indicators.heartRate.mean, 61);
});

test("no data at all gives no_data with null numbers", () => {
  const { indicators } = calculateBaseline([], ["heartRate"], IN_FLIGHT_WINDOW);
  assert.deepEqual(indicators.heartRate, {
    status: "no_data",
    mean: null,
    sd: null,
    n: 0,
    skipped: 0,
  });
});

test("one reading is not enough for a standard deviation", () => {
  const { indicators } = calculateBaseline(
    [{ missionDay: 21, heartRate: 60 }],
    ["heartRate"],
    IN_FLIGHT_WINDOW,
  );
  assert.equal(indicators.heartRate.status, "insufficient_data");
  assert.equal(indicators.heartRate.mean, null);
  assert.equal(indicators.heartRate.sd, null);
  assert.equal(indicators.heartRate.n, 1);
});

test("minReadings raises the bar for an ok result", () => {
  const records = heartRateDays(21, [60, 61, 62]);
  const strict = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW, { minReadings: 4 });
  const loose = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW, { minReadings: 3 });

  assert.equal(strict.indicators.heartRate.status, "insufficient_data");
  assert.equal(loose.indicators.heartRate.status, "ok");
});

test("identical readings give a standard deviation of exactly 0", () => {
  const { indicators } = calculateBaseline(
    heartRateDays(21, [64, 64, 64, 64]),
    ["heartRate"],
    IN_FLIGHT_WINDOW,
  );
  assert.equal(indicators.heartRate.sd, 0);
});

test("deterministic: record order does not change the result, even in the last bit", () => {
  const values = [0.1, 0.2, 0.3, 1e-9, 7.7, 3.3, 9.9, 0.7, 5.5, 2.2, 6.6, 4.4, 8.8, 1.1, 0.05];
  const records = values.map((sleepHours, index) => ({ missionDay: 21 + index, sleepHours }));
  const reversed = [...records].reverse();
  const shuffled = [records[7], ...records.slice(0, 7), ...records.slice(8)].reverse();

  const a = calculateBaseline(records, ["sleepHours"], IN_FLIGHT_WINDOW);
  const b = calculateBaseline(reversed, ["sleepHours"], IN_FLIGHT_WINDOW);
  const c = calculateBaseline(shuffled, ["sleepHours"], IN_FLIGHT_WINDOW);

  assert.deepEqual(a, b);
  assert.deepEqual(a, c);
  assert.deepEqual(a, calculateBaseline(records, ["sleepHours"], IN_FLIGHT_WINDOW));
});

test("inputs are not modified and the result is read-only", () => {
  const records = heartRateDays(21, [60, 65, 70]);
  const snapshot = structuredClone(records);
  const result = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW);

  assert.deepEqual(records, snapshot);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.indicators));
  assert.ok(Object.isFrozen(result.indicators.heartRate));
});

test("a custom day field name can be used", () => {
  const records = [
    { mission_day: 21, heartRate: 60 },
    { mission_day: 22, heartRate: 62 },
  ];
  const { indicators } = calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW, {
    dayKey: "mission_day",
  });
  assert.equal(indicators.heartRate.n, 2);
});

test("wrong arguments throw clear errors", () => {
  const records = heartRateDays(21, [60, 61]);

  assert.throws(() => calculateBaseline(null, ["heartRate"], IN_FLIGHT_WINDOW), TypeError);
  assert.throws(() => calculateBaseline(records, [], IN_FLIGHT_WINDOW), TypeError);
  assert.throws(() => calculateBaseline(records, ["heartRate", "heartRate"], IN_FLIGHT_WINDOW), TypeError);
  assert.throws(() => calculateBaseline(records, [""], IN_FLIGHT_WINDOW), TypeError);
  assert.throws(() => calculateBaseline(records, ["heartRate"], { fromDay: 35, toDay: 21 }), RangeError);
  assert.throws(() => calculateBaseline(records, ["heartRate"], { fromDay: 21 }), RangeError);
  assert.throws(() => calculateBaseline(records, ["heartRate"], null), RangeError);
  assert.throws(
    () => calculateBaseline(records, ["heartRate"], IN_FLIGHT_WINDOW, { minReadings: 1 }),
    RangeError,
  );
});

test("IN_FLIGHT_WINDOW matches DECISIONS.md (days 21–35) and cannot be changed", () => {
  assert.deepEqual({ ...IN_FLIGHT_WINDOW }, { fromDay: 21, toDay: 35 });
  assert.ok(Object.isFrozen(IN_FLIGHT_WINDOW));
});
