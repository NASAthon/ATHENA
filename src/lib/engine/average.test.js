import { test } from "node:test";
import assert from "node:assert/strict";
import { sevenDayAverage } from "./average.js";

test("averages the 7 days ending on the given day", () => {
  const records = [1, 2, 3, 4, 5, 6, 7, 8].map((d) => ({ missionDay: d, mood: d }));
  const result = sevenDayAverage(records, "mood", 8); // days 2–8
  assert.deepEqual({ ...result }, { status: "ok", mean: 5, n: 7, fromDay: 2, toDay: 8 });
});

test("needs at least 4 readings; gaps never produce a number", () => {
  const records = [{ missionDay: 10, mood: 3 }, { missionDay: 12, mood: 3 }, { missionDay: 14, mood: null }];
  const result = sevenDayAverage(records, "mood", 14);
  assert.equal(result.status, "insufficient_data");
  assert.equal(result.mean, null);
  assert.equal(result.n, 2);
});

test("skips invalid values and broken records", () => {
  const records = [null, "x", { missionDay: 1, mood: "4" }, ...[2, 3, 4, 5].map((d) => ({ missionDay: d, mood: 4 }))];
  assert.equal(sevenDayAverage(records, "mood", 5).n, 4);
});

test("record order does not change the result", () => {
  const records = [0.1, 0.2, 0.7, 1e-9, 3.3, 9.9, 2.2].map((v, i) => ({ missionDay: i + 1, sleepHours: v }));
  assert.deepEqual(sevenDayAverage(records, "sleepHours", 7), sevenDayAverage([...records].reverse(), "sleepHours", 7));
});
