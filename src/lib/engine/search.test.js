// Search over the real content in src/data (DECISIONS › Search edge cases).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildContentSearchIndex, buildSearchIndex, contentDocuments, normaliseQuery, search } from "./search.js";

const index = buildContentSearchIndex();
const ids = (q) => search(index, q).results.map((r) => r.id);
const top = (q) => ids(q)[0];

test("indexes every item in src/data with a unique id", () => {
  const docs = contentDocuments();
  assert.equal(new Set(docs.map((d) => d.id)).size, docs.length);
  assert.ok(docs.length > 70);
});

test("typos and misspellings", () => {
  assert.equal(top("hart rate"), "indicator:heartRate");
  assert.equal(top("temprature"), "indicator:temperature");
  assert.ok(ids("glucos").slice(0, 3).includes("indicator:glucose"));
});

test("partial words while typing", () => {
  assert.ok(ids("oxy").slice(0, 5).includes("indicator:spo2"));
});

test("synonyms and plain English", () => {
  assert.ok(ids("pulse").slice(0, 3).includes("indicator:heartRate"));
  assert.ok(ids("sugar").slice(0, 3).includes("indicator:glucose"));
  assert.ok(ids("bp").slice(0, 3).includes("indicator:bloodPressure"));
});

test("symptoms put the emergency guide first", () => {
  const chest = search(index, "chest pain");
  assert.equal(chest.symptomLike, true);
  assert.equal(chest.results[0].id, "emergency:chest-pain");
  assert.equal(top("can't breathe"), "emergency:hypoxia");
  assert.equal(search(index, "dizzy").results[0].type, "emergency");
});

test("case, punctuation, extra spaces and word order don't matter", () => {
  assert.equal(normaliseQuery("  Heart,   RATE!! "), "heart rate");
  assert.deepEqual(ids("RATE heart"), ids("heart rate"));
});

test("no match gives 'did you mean' and the emergency shortcut, never a dead end", () => {
  const r = search(index, "zzqx");
  assert.deepEqual([...r.results], []);
  assert.equal(r.emergencyShortcut, true);
  assert.equal(search(index, "   ").emergencyShortcut, true);
});

test("rejects duplicate ids", () => {
  assert.throws(() => buildSearchIndex([{ id: "a", type: "indicator", title: "A" }, { id: "a", type: "indicator", title: "B" }]), TypeError);
});
