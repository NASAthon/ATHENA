import { test } from "node:test";
import assert from "node:assert/strict";
import { alertLevelOnDay, countDriftingGroups, groupStatuses } from "./alerts.js";

const s = (key, group, status, worryingZ = null) => ({ key, group, status, worryingZ });

test("linked indicators count once", () => {
  const groups = groupStatuses([
    s("bpSystolic", "bloodPressure", "drifting", 4),
    s("bpDiastolic", "bloodPressure", "drifting", 5),
    s("reactionMedianMs", "reaction", "steady", 1),
    s("reactionLapses", "reaction", "drifting", 3.6),
  ]);
  assert.equal(groups.length, 2);
  assert.equal(countDriftingGroups(groups), 2);
  assert.equal(groups[0].worryingZ, 5);
  assert.deepEqual([...groups[0].drifting], ["bpSystolic", "bpDiastolic"]);
});

test("a day where every group has no data is null, not zero", () => {
  assert.equal(countDriftingGroups(groupStatuses([s("mood", "mood", "no_data")])), null);
});

test("1 group = note, 2 or more = alert", () => {
  assert.equal(alertLevelOnDay([{ day: 1, driftingGroups: 0 }], 1).level, "none");
  assert.equal(alertLevelOnDay([{ day: 1, driftingGroups: 1 }], 1).level, "note");
  assert.equal(alertLevelOnDay([{ day: 1, driftingGroups: 2 }], 1).level, "alert");
});

test("escalates after 14 more days without recovery", () => {
  const history = [{ day: 99, driftingGroups: 0 }];
  for (let day = 100; day <= 114; day += 1) history.push({ day, driftingGroups: 2 });
  assert.equal(alertLevelOnDay(history, 113).level, "alert");
  const at114 = alertLevelOnDay(history, 114);
  assert.equal(at114.level, "escalated");
  assert.equal(at114.alertSince, 100);
});

test("a recovery day resets the clock; a no-data day does not", () => {
  const withRecovery = [];
  const withGap = [];
  for (let day = 100; day <= 120; day += 1) {
    withRecovery.push({ day, driftingGroups: day === 110 ? 1 : 2 });
    withGap.push({ day, driftingGroups: day === 110 ? null : 2 });
  }
  assert.equal(alertLevelOnDay(withRecovery, 120).level, "alert");
  assert.equal(alertLevelOnDay(withRecovery, 120).alertSince, 111);
  assert.equal(alertLevelOnDay(withGap, 120).level, "escalated");
  assert.equal(alertLevelOnDay(withGap, 110).level, "none"); // no data today: no alert shown
});
