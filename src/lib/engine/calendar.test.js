import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAM_SCHEDULE, examsDueOn, examsOverdue } from "./calendar.js";

test("schedule comes from src/data/exams.js; pre/post-flight exams are left out", () => {
  const ids = EXAM_SCHEDULE.map((e) => e.id);
  assert.ok(ids.includes("eye-scan"));
  assert.ok(ids.includes("fitness-check"));
  assert.ok(!ids.includes("bone-scan"));
});

test("due on the first interval day and every interval after", () => {
  assert.deepEqual([...examsDueOn(14)], ["fitness-check"]);
  assert.deepEqual([...examsDueOn(30)], ["bio-samples", "eye-scan", "heart-ultrasound"]);
  assert.deepEqual([...examsDueOn(3)], []);
});

test("overdue when the latest due day has no completion; bad entries skipped", () => {
  const exams = [{ id: "weekly", firstDay: 7, everyDays: 7 }, { id: "bad" }];
  assert.deepEqual(examsOverdue([], 9, exams).map((e) => ({ ...e })), [{ id: "weekly", dueDay: 7 }]);
  assert.deepEqual([...examsOverdue([{ examId: "weekly", day: 8 }], 9, exams)], []);
});
