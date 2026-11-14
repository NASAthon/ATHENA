import { test } from "node:test";
import assert from "node:assert/strict";
import { START_MINUTE, advanceClock, nextScripted, restoreClock, serialiseClock } from "./clock.js";
import { SCRIPTED_DAY } from "./stream.js";

test("a fresh clock starts at 08:00 in real time; a saved one for today carries on", () => {
  assert.deepEqual(restoreClock(null, 129), { day: 129, minute: START_MINUTE, speed: 1, paused: false });
  const saved = serialiseClock({ day: 129, minute: 900, speed: 60, paused: true });
  assert.deepEqual(restoreClock(saved, 129), { day: 129, minute: 900, speed: 60, paused: true });
  assert.equal(restoreClock(saved, 130).minute, START_MINUTE, "a clock for another day is not reused");
  assert.equal(restoreClock("not json", 129).minute, START_MINUTE);
});

test("speed sets how fast simulated time runs; pause stops it", () => {
  const c = { day: 129, minute: 600, speed: 60, paused: false };
  assert.equal(advanceClock(c, 1000).clock.minute, 601);
  assert.equal(advanceClock({ ...c, speed: 1 }, 60000).clock.minute, 601);
  assert.equal(advanceClock({ ...c, paused: true }, 60000).clock.minute, 600);
});

test("crossing midnight rolls over to the next mission day", () => {
  const r = advanceClock({ day: 129, minute: 1439.5, speed: 60, paused: false }, 1000);
  assert.equal(r.rolledOver, true);
  assert.equal(r.clock.day, 130);
  assert.ok(r.clock.minute < 1);
});

test("the last mission day stops at 23:59 instead of rolling over", () => {
  const r = advanceClock({ day: 180, minute: 1439.5, speed: 60, paused: false }, 1000);
  assert.equal(r.rolledOver, false);
  assert.equal(r.clock.paused, true);
});

test("jump to next event finds the next scripted moment on the demo day only", () => {
  assert.ok(nextScripted({ day: SCRIPTED_DAY, minute: 480 }).at > 480);
  assert.equal(nextScripted({ day: SCRIPTED_DAY + 1, minute: 0 }), null);
});
