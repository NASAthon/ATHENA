import { test } from "node:test";
import assert from "node:assert/strict";
import { SCAN_SENSORS, readSensor, scanToRecordFields, sensorFault, validateScanReading } from "./sensorScan.js";
import { simulateAstronaut } from "./simulator.js";

const scanAll = (id, day, attempt = 0) => SCAN_SENSORS.map((s) => readSensor(id, day, s.id, { attempt }));

test("the scan reads the same values the simulator stores, so every screen agrees", () => {
  const stored = simulateAstronaut("nakamura", { fromDay: 129, toDay: 129 })[0];
  const fields = scanToRecordFields(scanAll("nakamura", 129));
  assert.equal(fields.bpSystolic, stored.bpSystolic);
  assert.equal(fields.bpDiastolic, stored.bpDiastolic);
  assert.equal(fields.heartRate, stored.heartRate);
  assert.equal(fields.sleepHours, stored.sleepHours);
  assert.equal(fields.bpSystolic, 186); // Nakamura's red-limit day
});

test("the scan never collects mood or symptoms: only the crew can report those", () => {
  const fields = scanToRecordFields(scanAll("singh", 50, 1));
  assert.equal(fields.mood, undefined);
  assert.equal(fields.symptoms, undefined);
});

test("is deterministic: the same astronaut, day, sensor and attempt always read the same", () => {
  assert.deepEqual(readSensor("rivera", 100, "shirt"), readSensor("rivera", 100, "shirt"));
});

test("scripted demo fault: Singh's shirt gives no signal on day 129, and a retry reads cleanly", () => {
  const first = readSensor("singh", 129, "shirt");
  assert.equal(first.ok, false);
  assert.equal(first.fault, "no-signal");
  assert.ok(first.readings.every((r) => r.status === "invalid" && r.reason));
  const retry = readSensor("singh", 129, "shirt", { attempt: 1 });
  assert.equal(retry.ok, true);
  assert.ok(retry.readings.some((r) => r.status === "valid"));
});

test("invalid readings are never saved, so they can't overwrite stored values", () => {
  const first = readSensor("singh", 129, "shirt");
  assert.deepEqual(scanToRecordFields([first]), {});
});

test("a retry never fails, so the demo can't get stuck", () => {
  for (let day = 1; day <= 180; day += 1) {
    for (const s of SCAN_SENSORS) assert.equal(sensorFault("rivera", day, s.id, 1), null);
  }
});

test("validation catches missing, impossible and back-to-front readings", () => {
  assert.equal(validateScanReading("heartRate", { value: 72 }).ok, true);
  assert.equal(validateScanReading("heartRate", { value: null }).ok, false);
  assert.equal(validateScanReading("heartRate", { value: 0 }).ok, false);
  assert.equal(validateScanReading("bloodPressure", { systolic: 120, diastolic: 80 }).ok, true);
  assert.equal(validateScanReading("bloodPressure", { systolic: 80, diastolic: 120 }).ok, false);
  assert.equal(validateScanReading("temperature", { value: 60 }).ok, false);
});

test("an indicator the simulator doesn't record is 'not measured', not an error", () => {
  // Nakamura's simulated record has no SpO₂.
  const shirt = readSensor("nakamura", 129, "shirt", { attempt: 1 });
  const spo2 = shirt.readings.find((r) => r.indicatorId === "spo2");
  assert.equal(spo2.status, "not_measured");
  assert.equal(shirt.ok, true);
});

test("an astronaut not in the simulator gets no signal rather than made-up values", () => {
  const r = readSensor("someone-else", 10, "wrist", { attempt: 1 });
  assert.equal(r.ok, false);
});
