// Validates src/data: every id reference resolves, all 5 hazards and 17 risks exist,
// every risk is on the body map, every item has search keywords.
// Run: npm run check:content
import { SOURCES, HAZARDS, RISKS, REGIONS, INDICATORS, EMERGENCIES, SYMPTOMS, EXAMS, MISSION_MODES, DEFAULT_MISSION_MODE } from "../src/data/index.js";

const errors = [];
const ids = (list) => new Set(list.map((x) => x.id));
const hazardIds = ids(HAZARDS), riskIds = ids(RISKS), regionIds = ids(REGIONS);
const indicatorIds = ids(INDICATORS), emergencyIds = ids(EMERGENCIES), symptomIds = ids(SYMPTOMS);

const check = (cond, msg) => { if (!cond) errors.push(msg); };
const src = (id, where) => check(id === null || id === undefined || SOURCES[id], `${where}: unknown sourceId "${id}"`);
const all = (list, set, where, kind) => (list || []).forEach((id) => check(set.has(id), `${where}: unknown ${kind} "${id}"`));
const kw = (item, where) => check(Array.isArray(item.keywords) && item.keywords.length >= 3, `${where}: needs at least 3 search keywords`);

check(HAZARDS.length === 5, `expected 5 hazards, found ${HAZARDS.length}`);
check(RISKS.length === 17, `expected 17 risks, found ${RISKS.length}`);
check(REGIONS.length === 8, `expected 8 regions, found ${REGIONS.length}`);

for (const h of HAZARDS) { const w = `hazard ${h.id}`; all(h.regions, regionIds, w, "region"); h.sourceIds.forEach((s) => src(s, w)); kw(h, w); }

for (const r of RISKS) {
  const w = `risk ${r.id}`;
  all(r.regions, regionIds, w, "region");
  r.hazards.forEach((h) => { check(hazardIds.has(h.id), `${w}: unknown hazard "${h.id}"`); check(["stated", "inferred"].includes(h.basis), `${w}: bad basis "${h.basis}"`); });
  r.sourceIds.forEach((s) => src(s, w));
  check(REGIONS.some((g) => g.risks.includes(r.id)), `${w}: not shown on any body region`);
  kw(r, w);
}

for (const g of REGIONS) {
  const w = `region ${g.id}`;
  all(g.risks, riskIds, w, "risk"); all(g.indicators, indicatorIds, w, "indicator"); all(g.symptoms, symptomIds, w, "symptom"); kw(g, w);
  // Per-region detail for the body map card (PR #9).
  for (const r of g.risks) check(g.riskNotes?.[r]?.note, `${w}: risk "${r}" has no riskNotes entry`);
  for (const r of Object.keys(g.riskNotes || {})) check(g.risks.includes(r), `${w}: riskNotes has "${r}" but risks doesn't`);
  for (const n of Object.values(g.riskNotes || {})) check(["stated", "inferred"].includes(n.basis), `${w}: bad riskNotes basis "${n.basis}"`);
  check(Array.isArray(g.hazards) && g.hazards.length > 0, `${w}: needs at least one hazard`);
  for (const h of g.hazards || []) { check(hazardIds.has(h.id), `${w}: unknown hazard "${h.id}"`); check(["stated", "inferred"].includes(h.basis), `${w}: bad hazard basis "${h.basis}"`); check(h.note, `${w}: hazard "${h.id}" needs a note`); }
  for (const f of g.facts || []) { check(f.text, `${w}: fact needs text`); src(f.sourceId, `${w} fact`); check(f.sourceId, `${w}: fact needs a sourceId`); }
  for (const k of Object.keys(g.indicatorNotes || {})) check(indicatorIds.has(k), `${w}: indicatorNotes has unknown indicator "${k}"`);
}

for (const i of INDICATORS) {
  const w = `indicator ${i.id}`;
  check(regionIds.has(i.region), `${w}: unknown region "${i.region}"`);
  all(i.risks, riskIds, w, "risk");
  i.sourceIds.forEach((s) => src(s, w));
  i.howToMeasure.forEach((m, n) => src(m.sourceId, `${w} step ${n + 1}`));
  check(i.howToMeasure.length > 0 || i.pending, `${w}: no measurement steps and no "pending" note`);
  i.bands.forEach((b, n) => {
    src(b.sourceId, `${w} band ${n + 1}`);
    check(["normal", "watch", "act", "urgent"].includes(b.level), `${w} band ${n + 1}: bad level "${b.level}"`);
    check(["clinical", "design"].includes(b.basis), `${w} band ${n + 1}: bad basis "${b.basis}"`);
    check(b.basis === "design" || b.sourceId, `${w} band ${n + 1}: clinical band needs a source`);
    if (b.emergencyId) check(emergencyIds.has(b.emergencyId), `${w} band ${n + 1}: unknown emergency "${b.emergencyId}"`);
  });
  kw(i, w);
}

for (const e of EMERGENCIES) {
  const w = `emergency ${e.id}`;
  src(e.signsSourceId, w); all(e.risks, riskIds, w, "risk");
  check(["ready", "partial", "needs-source"].includes(e.status), `${w}: bad status "${e.status}"`);
  check(e.status === "ready" || e.pending, `${w}: not ready but no "pending" note`);
  e.steps.forEach((s, n) => {
    src(s.sourceId, `${w} step ${n + 1}`);
    check(s.sourceId || s.adaptation, `${w} step ${n + 1}: needs a source or adaptation: true`);
    check(s.why, `${w} step ${n + 1}: needs a "why"`);
    if (s.nextEmergencyId) check(emergencyIds.has(s.nextEmergencyId), `${w} step ${n + 1}: unknown emergency "${s.nextEmergencyId}"`);
  });
  kw(e, w);
}

for (const s of SYMPTOMS) {
  const w = `symptom ${s.id}`;
  src(s.sourceId, w); all(s.regions, regionIds, w, "region"); all(s.indicators, indicatorIds, w, "indicator");
  if (s.emergencyId) check(emergencyIds.has(s.emergencyId), `${w}: unknown emergency "${s.emergencyId}"`);
  check(!s.redFlag || s.emergencyId, `${w}: red flag needs an emergencyId`);
  kw(s, w);
}

for (const x of EXAMS) { const w = `exam ${x.id}`; src(x.sourceId, w); check(riskIds.has(x.risk), `${w}: unknown risk`); check(regionIds.has(x.region), `${w}: unknown region`); kw(x, w); }

for (const m of MISSION_MODES) {
  const w = `mission mode ${m.id}`;
  m.sourceIds.forEach((s) => src(s, w)); kw(m, w);
  if (m.earthDelay) src(m.earthDelay.sourceId, `${w} earthDelay`);
}
check(MISSION_MODES.some((m) => m.id === DEFAULT_MISSION_MODE), `unknown DEFAULT_MISSION_MODE "${DEFAULT_MISSION_MODE}"`);
for (const i of INDICATORS) {
  if (i.input) check(i.input.min < i.input.max, `indicator ${i.id}: input.min must be below input.max`);
  if (i.inputs) i.inputs.forEach((f) => check(f.min < f.max, `indicator ${i.id} ${f.id}: min must be below max`));
}

// No medicines or doses (docs/DECISIONS.md > No Medicines or Diagnoses).
const textOf = (o) => JSON.stringify(o);
const dose = /\b\d+(\.\d+)?\s?(mg|mcg|µg|ml|mL)\b(?!\s?\/)|\b(ibuprofen|acetaminophen|paracetamol|aspirin|dexamethasone|nifedipine|ondansetron|glucagon|bisphosphonate|insulin)\b|\btake \d+ (tablets|pills|capsules)\b/i;
for (const [name, list] of Object.entries({ INDICATORS, EMERGENCIES, SYMPTOMS, REGIONS, RISKS, EXAMS })) {
  for (const item of list) {
    const m = textOf(item).match(dose);
    if (m) errors.push(`${name} ${item.id}: mentions a medicine or dose ("${m[0]}"); not allowed`);
  }
}

if (errors.length) { console.error(`Content check failed (${errors.length}):\n- ` + errors.join("\n- ")); process.exit(1); }
const pending = [...INDICATORS, ...EMERGENCIES].filter((x) => x.pending).map((x) => x.id);
console.log(`Content OK: ${HAZARDS.length} hazards, ${RISKS.length} risks, ${REGIONS.length} regions, ${INDICATORS.length} indicators, ${EMERGENCIES.length} emergencies, ${SYMPTOMS.length} symptoms, ${EXAMS.length} exams, ${Object.keys(SOURCES).length} sources.`);
console.log(`Pending verified content: ${pending.length ? pending.join(", ") : "none"}`);
