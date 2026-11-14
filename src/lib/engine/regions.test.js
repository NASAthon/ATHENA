import { test } from "node:test";
import assert from "node:assert/strict";
import { REGIONS } from "../../data/index.js";
import { allRegionStatuses, regionStatus, regionsForIndicator } from "./regions.js";

test("uses the 8 regions from src/data", () => {
  assert.equal(REGIONS.length, 8);
  assert.equal(allRegionStatuses([]).length, 8);
});

test("worst status wins; a red limit beats drifting", () => {
  const groups = [{ group: "heartRate", status: "steady" }, { group: "bloodPressure", status: "drifting" }];
  assert.equal(regionStatus("heart", groups), "drifting");
  assert.equal(regionStatus("heart", groups, [{ indicatorId: "bloodPressure", redLimit: true }]), "red_limit");
  assert.equal(regionStatus("heart", groups, [{ indicatorId: "bloodPressure", redLimit: false }]), "drifting");
});

test("no data, indicator links and unknown regions", () => {
  assert.equal(regionStatus("eyes", []), "no_data");
  assert.deepEqual([...regionsForIndicator("exercise")], ["heart", "muscles"]);
  assert.throws(() => regionStatus("tail", []), RangeError);
});
