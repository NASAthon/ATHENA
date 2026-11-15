// Always-on live monitoring (docs/DECISIONS.md › Always-On Live Monitoring).
// A SIMULATED minute-by-minute sensor feed for each astronaut, and ATHENA's automatic evaluation of
// every reading: a state per measurement (stable, fluctuating, deteriorating, critical, no data),
// events for the alert feed, extra-check requests and a confidence level.
//
// Pure logic: no React, DOM or database, so it runs in `node --test`. Deterministic: the same
// astronaut, day and baselines always give the same feed, so a demo repeats exactly.
//
// ASSUMPTIONS (simulated, design choices, not NASA values): the band widths, persistence times,
// day/night pattern, exercise effect and the scripted demo day below.

import { checkReading } from "../engine/redLimits.js";
import { DEMO_SEED, NAKAMURA_EVENT_DAY, SIMULATED_CREW, simulateAstronaut } from "../sim/simulator.js";

/** Minutes in a mission day. */
export const DAY_MINUTES = 1440;

/** The live measurements, in display order, with the record fields each one carries. */
export const LIVE_MEASURES = Object.freeze([
  Object.freeze({ id: "heartRate", name: "Heart rate", unit: "bpm", fields: Object.freeze(["heartRate"]), sensor: "smart shirt" }),
  Object.freeze({ id: "bloodPressure", name: "Blood pressure", unit: "mmHg", fields: Object.freeze(["bpSystolic", "bpDiastolic"]), sensor: "smart shirt" }),
  Object.freeze({ id: "spo2", name: "SpO₂", unit: "%", fields: Object.freeze(["spo2"]), sensor: "smart shirt" }),
  Object.freeze({ id: "breathing", name: "Breathing rate", unit: "/min", fields: Object.freeze(["breathing"]), sensor: "smart shirt" }),
  Object.freeze({ id: "skinTemp", name: "Skin temperature", unit: "°C", fields: Object.freeze(["skinTemp"]), sensor: "smart shirt" }),
]);

/**
 * Each field's "own normal": the centre comes from the astronaut's stored in-flight baseline where
 * there is one; `half` is the half-width of the band a single reading may move within. Minute
 * readings vary far more than daily averages, so the band is wider than the daily drift rule
 * (ASSUMPTION). Breathing and skin temperature have no stored baseline, so they use typical
 * simulated values.
 */
const DEFAULT_NORMALS = Object.freeze({
  heartRate: { mean: 64, half: 12 },
  bpSystolic: { mean: 118, half: 15 },
  bpDiastolic: { mean: 76, half: 10 },
  spo2: { mean: 98, half: 2 },
  breathing: { mean: 14, half: 4 },
  skinTemp: { mean: 34, half: 0.8 },
});

/** Persistence rules (ASSUMPTION, see DECISIONS): minutes. */
export const RULES = Object.freeze({
  averageWindow: 15, // the rolling average that decides "deteriorating"
  deteriorateAfter: 20, // average outside the band this long → deteriorating
  recoverAfter: 15, // average back inside this long → back to stable
  exerciseRecovery: 15, // after a logged session, readings are still exercise context this long
  spikeMinutes: 2, // a reading must stay outside at least this long to count (one reading is a sensor artefact)
  fluctuateMemory: 10, // a recovered excursion is still "fluctuating" for this long
  criticalMemory: 60, // a red limit keeps the state critical this long
  noSignalAfter: 5, // no reading this long → "no data"
  confidenceWindow: 60, // minutes of wear time that decide confidence
});

/** The demo day the script below plays on (the demo mission's "today"). */
export const SCRIPTED_DAY = NAKAMURA_EVENT_DAY;

const hm = (h, m) => h * 60 + m;

/**
 * The scripted demo day (simulated). `at` is the minute it starts; `presenter` is the line shown in
 * the presenter's "coming up" list.
 */
export const SCRIPT = Object.freeze([
  { at: hm(11, 50), astronautId: "rivera", presenter: "Rivera: SpO₂ starts sliding" },
  { at: hm(12, 58), astronautId: "nakamura", presenter: "Nakamura: one sensor spike (ATHENA ignores it)" },
  { at: hm(13, 8), astronautId: "rivera", presenter: "Rivera: short SpO₂ dip that recovers" },
  { at: hm(13, 10), astronautId: "singh", presenter: "Singh: exercise session on the treadmill" },
  { at: hm(14, 5), astronautId: "singh", presenter: "Singh: takes the shirt off (no data)" },
  { at: hm(14, 30), astronautId: "nakamura", presenter: "Nakamura: blood pressure starts rising" },
  { at: hm(14, 49), astronautId: "nakamura", presenter: "Nakamura: reports chest pain" },
  { at: hm(16, 5), astronautId: "singh", presenter: "Singh: shirt back on, data resumes" },
  { at: hm(18, 30), astronautId: null, presenter: "Whole crew: simulated solar particle event begins" },
].map((e) => Object.freeze(e)));

/** Exercise session start (minute) per astronaut on an ordinary day (simulated). */
const EXERCISE_START = Object.freeze({ rivera: hm(7, 30), singh: hm(13, 10), nakamura: hm(10, 0) });

/** Deterministic noise in [-1, 1] (FNV-1a hash). */
function noise(...parts) {
  let h = 0x811c9dc5;
  const text = parts.join("|");
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h / 0xffffffff) * 2 - 1;
}

const ramp = (minute, from, to) => Math.max(0, Math.min(1, (minute - from) / (to - from)));
const round = (v, step) => Math.round(v / step) * step;

/**
 * Each field's own normal, from stored baselines (`{ inflight: { indicators: { heartRate: { mean } } } }`).
 *
 * @param {Object | null} baselines db.loadMissionBaselines(astronautId)
 * @returns {Object<string, { mean: number, half: number }>}
 */
export function liveNormals(baselines) {
  const fromBaseline = baselines?.inflight?.indicators ?? {};
  const normals = {};
  for (const [field, def] of Object.entries(DEFAULT_NORMALS)) {
    const mean = fromBaseline[field]?.mean;
    normals[field] = { mean: Number.isFinite(mean) ? mean : def.mean, half: def.half };
  }
  return Object.freeze(normals);
}

function simulatedDay(astronautId, day, seed) {
  if (!SIMULATED_CREW.includes(astronautId)) return null;
  return simulateAstronaut(astronautId, { seed, fromDay: day, toDay: day })[0] ?? null;
}

/**
 * The simulated feed for one astronaut and day: one reading per minute. A reading has
 * `worn: false` (and no values) while the shirt is off.
 *
 * @param {string} astronautId
 * @param {number} day Mission day.
 * @param {Object<string, { mean: number }>} normals liveNormals(baselines)
 * @param {{ seed?: number }} [options]
 * @returns {ReadonlyArray<Object>} DAY_MINUTES readings.
 */
export function generateDay(astronautId, day, normals, { seed = DEMO_SEED } = {}) {
  const record = simulatedDay(astronautId, day, seed);
  const scripted = day === SCRIPTED_DAY;
  const exStart = EXERCISE_START[astronautId] ?? hm(9, 0);
  const exMinutes = Math.min(45, Math.max(20, Math.round((record?.exerciseMinutes ?? 40) / 3)));
  const exEnd = scripted && astronautId === "singh" ? hm(13, 40) : exStart + exMinutes;
  const out = [];
  for (let m = 0; m < DAY_MINUTES; m += 1) {
    const asleep = m < hm(7, 0) || m >= hm(23, 0);
    const exercise = m >= exStart && m < exEnd + RULES.exerciseRecovery; // session + recovery
    const exLevel = exercise ? Math.min(1, (m - exStart) / 6) : m >= exEnd && m < exEnd + 8 ? 1 - (m - exEnd) / 8 : 0;
    const n = (field, amp) => noise(astronautId, day, m, field, seed) * amp;
    let hr = normals.heartRate.mean + (asleep ? -8 : 0) + exLevel * 62 + n("hr", 3);
    let sys = normals.bpSystolic.mean + (asleep ? -6 : 0) + exLevel * 18 + n("sys", 4);
    let dia = normals.bpDiastolic.mean + (asleep ? -4 : 0) + exLevel * 4 + n("dia", 3);
    let spo2 = normals.spo2.mean + n("spo2", 0.7);
    let breathing = normals.breathing.mean + (asleep ? -2 : 0) + exLevel * 12 + n("br", 1);
    let skin = normals.skinTemp.mean + (asleep ? 0.3 : 0) + exLevel * 0.4 + n("skin", 0.15);
    let worn = true;

    if (scripted) {
      if (astronautId === "rivera") {
        spo2 -= 3.5 * ramp(m, hm(11, 50), hm(14, 50));
        if (m >= hm(13, 8) && m < hm(13, 12)) spo2 -= 3;
        hr += 17 * ramp(m, hm(12, 0), hm(14, 30));
      }
      if (astronautId === "nakamura") {
        if (m === hm(12, 58)) hr += 40; // one isolated spike: a sensor artefact
        const rise = ramp(m, hm(14, 30), hm(14, 51));
        sys += (186 - normals.bpSystolic.mean) * rise;
        dia += (118 - normals.bpDiastolic.mean) * rise;
        if (m >= hm(14, 51) && m < hm(16, 0)) {
          sys = 186 + n("sys", 2);
          dia = 118 + n("dia", 1.5);
        }
        hr += 44 * ramp(m, hm(14, 35), hm(14, 55));
        breathing += 8 * ramp(m, hm(14, 45), hm(14, 55));
      }
      if (astronautId === "singh" && m >= hm(14, 5) && m < hm(16, 5)) worn = false;
    }

    out.push(
      Object.freeze(
        worn
          ? {
              minute: m,
              worn,
              exercise,
              heartRate: round(hr, 1),
              bpSystolic: round(sys, 1),
              bpDiastolic: round(dia, 1),
              spo2: Math.min(100, round(spo2, 1)),
              breathing: round(breathing, 1),
              skinTemp: round(skin, 0.1),
            }
          : { minute: m, worn, exercise: false },
      ),
    );
  }
  return Object.freeze(out);
}

/** States from least to most serious (no data is shown separately). */
export const LIVE_STATES = Object.freeze(["stable", "fluctuating", "deteriorating", "critical"]);
const rank = (s) => LIVE_STATES.indexOf(s);

const outside = (reading, field, normals) => Math.abs(reading[field] - normals[field].mean) > normals[field].half;

/**
 * ATHENA's automatic evaluation of one astronaut's day, minute by minute.
 *
 * @param {ReadonlyArray<Object>} readings generateDay()
 * @param {Object<string, { mean: number, half: number }>} normals
 * @returns {{ states: Object<string, string[]>, averages: Object<string, Array<number | null>>, red: boolean[] }}
 *   `states[measureId][minute]` is "stable" | "fluctuating" | "deteriorating" | "critical" | "no_data";
 *   `red[minute]` is true when that minute's reading is in a red limit (engine's checkReading).
 */
export function evaluateFeed(readings, normals) {
  const states = {};
  const averages = {};
  const red = readings.map((r) => r.worn && checkReading({ bpSystolic: r.bpSystolic, bpDiastolic: r.bpDiastolic }).some((b) => b.redLimit));

  for (const measure of LIVE_MEASURES) {
    const st = [];
    const avgs = [];
    let outRun = 0; // consecutive minutes the reading is outside
    let avgOutRun = 0; // consecutive minutes the rolling average is outside
    let avgInRun = 0;
    let lastExcursion = -Infinity;
    let lastRed = -Infinity;
    let lastWorn = -Infinity;
    let deteriorating = false;
    for (let m = 0; m < readings.length; m += 1) {
      const r = readings[m];
      if (r.worn) lastWorn = m;
      // Rolling average of the worn readings in the window, leaving out exercise and its recovery:
      // a heart rate that is high because of a logged workout is never counted as decline.
      const win = readings.slice(Math.max(0, m - RULES.averageWindow + 1), m + 1).filter((x) => x.worn && !x.exercise);
      const avg = Object.fromEntries(measure.fields.map((f) => [f, win.length ? win.reduce((s, x) => s + x[f], 0) / win.length : null]));
      avgs.push(win.length ? avg[measure.fields[0]] : null);
      const avgOut = win.length >= 5 && measure.fields.some((f) => Math.abs(avg[f] - normals[f].mean) > normals[f].half);
      if (!r.exercise) {
        avgOutRun = avgOut ? avgOutRun + 1 : 0;
        avgInRun = avgOut ? 0 : avgInRun + 1;
      }
      if (avgOutRun >= RULES.deteriorateAfter) deteriorating = true;
      if (deteriorating && avgInRun >= RULES.recoverAfter) deteriorating = false;

      if (!r.worn) {
        outRun = 0;
        st.push(m - lastWorn >= RULES.noSignalAfter ? "no_data" : (st.at(-1) ?? "stable"));
        continue;
      }
      const isOut = measure.fields.some((f) => outside(r, f, normals));
      outRun = isOut ? outRun + 1 : 0;
      if (outRun >= RULES.spikeMinutes && !r.exercise) lastExcursion = m;
      if (measure.id === "bloodPressure" && red[m]) lastRed = m;

      let state = "stable";
      if (m - lastRed < RULES.criticalMemory) state = "critical";
      else if (deteriorating && !r.exercise) state = "deteriorating";
      else if ((r.exercise && isOut) || m - lastExcursion < RULES.fluctuateMemory) state = "fluctuating";
      st.push(state);
    }
    states[measure.id] = st;
    averages[measure.id] = avgs;
  }
  return { states, averages, red };
}

/** The most serious of an astronaut's measurement states at a minute ("no data" doesn't count). */
export function overallState(statesAtMinute) {
  const known = Object.values(statesAtMinute).filter((s) => s !== "no_data");
  if (known.length === 0) return "no_data";
  return known.reduce((a, b) => (rank(b) > rank(a) ? b : a), "stable");
}

/**
 * Confidence at a minute: the share of the last hour the sensors were worn, times the quality of
 * a validated wearable (0.8), shown as High (0.8), Medium (0.5 or more) or Low (ASSUMPTION; see
 * docs/DECISIONS.md › Always-On Live Monitoring).
 */
export function confidenceAt(readings, minute) {
  const from = Math.max(0, minute - RULES.confidenceWindow + 1);
  const span = readings.slice(from, minute + 1);
  const coverage = span.length ? span.filter((r) => r.worn).length / span.length : 0;
  const value = coverage * 0.8;
  return { value, level: value >= 0.8 ? "High" : value >= 0.5 ? "Medium" : "Low" };
}

const timeText = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export { timeText };

const measureById = Object.fromEntries(LIVE_MEASURES.map((m) => [m.id, m]));

function valueText(measureId, r) {
  if (!r?.worn) return "no data";
  const unit = measureById[measureId].unit;
  if (measureId === "bloodPressure") return `${Math.round(r.bpSystolic)}/${Math.round(r.bpDiastolic)} ${unit}`;
  const v = r[measureById[measureId].fields[0]];
  return `${measureId === "skinTemp" ? v.toFixed(1) : Math.round(v)} ${unit}`;
}

/**
 * The alert-feed events for one astronaut's day: every change of a measurement's state, sensor
 * on/off, ignored single spikes, exercise, the scripted symptom report and extra-check requests.
 *
 * @returns {Array<{ minute: number, astronautId: string, measureId: string | null, state: string, text: string, why: string, request?: string, emergencyId?: string }>}
 */
export function feedEvents(astronautId, readings, evaluation, day) {
  const events = [];
  const push = (e) => events.push(Object.freeze({ astronautId, measureId: null, ...e }));
  let requested = false;
  for (const measure of LIVE_MEASURES) {
    const st = evaluation.states[measure.id];
    for (let m = 1; m < st.length; m += 1) {
      if (st[m] === st[m - 1]) continue;
      const r = readings[m];
      const from = st[m - 1];
      const to = st[m];
      // Changes inside an exercise session are summed up by the two exercise events below.
      if (r.exercise && to !== "critical" && to !== "no_data") continue;
      if (readings[m - 1].exercise && !r.exercise && to === "stable") continue;
      if (to === "no_data") {
        if (measure.id === "heartRate") {
          push({ minute: m, state: "no_data", text: "Shirt not worn: no heart, blood-pressure, SpO₂, breathing or skin-temperature data", why: "Missing data counts as unknown, not fine. Confidence drops and no alert is cleared." });
        }
        continue;
      }
      if (from === "no_data") {
        if (measure.id === "heartRate") push({ minute: m, state: "stable", text: "Shirt back on: data resumed", why: "ATHENA picks up where it left off, checking every new reading." });
        continue;
      }
      if (to === "critical") {
        push({
          minute: m,
          measureId: measure.id,
          state: "critical",
          text: `${measure.name} ${valueText(measure.id, r)}: red limit`,
          why: "One reading in a red limit fires at once. Open the emergency guide; the summary is queued for the flight surgeon.",
          emergencyId: "severe-high-bp",
          // Written into today's daily record, so Today, Crew and the banner turn critical now too.
          record: { bpSystolic: Math.round(r.bpSystolic), bpDiastolic: Math.round(r.bpDiastolic), heartRate: Math.round(r.heartRate) },
        });
      } else if (to === "deteriorating") {
        push({ minute: m, measureId: measure.id, state: "deteriorating", text: `${measure.name} ${valueText(measure.id, r)}, outside own normal for ${RULES.deteriorateAfter}+ min`, why: `The ${RULES.averageWindow}-minute average stayed outside the personal band for ${RULES.deteriorateAfter} minutes or more.` });
        if (!requested && ["heartRate", "spo2", "bloodPressure"].includes(measure.id)) {
          requested = true;
          push({ minute: m, state: "deteriorating", text: "ATHENA requested an extra check: cuff blood pressure now", why: "A cuff reading confirms the shirt's trend before anything else is decided.", request: "cuffBp" });
        }
      } else if (to === "fluctuating" && from === "stable") {
        push({ minute: m, measureId: measure.id, state: "fluctuating", text: `${measure.name} ${valueText(measure.id, r)}: short excursion`, why: "Outside the personal band for 2 minutes or more but not sustained: noted as fluctuating, no alert yet." });
      } else if (to === "stable" && (from === "fluctuating" || from === "deteriorating")) {
        push({ minute: m, measureId: measure.id, state: "stable", text: `${measure.name} back in own normal`, why: from === "deteriorating" ? `Average back inside the personal band for ${RULES.recoverAfter} minutes.` : "Recovered within 10 minutes." });
      }
    }
  }
  // Exercise: one event when a logged session starts, one when the crew member is back in their normal.
  for (let m = 1; m < readings.length; m += 1) {
    if (readings[m].exercise && !readings[m - 1].exercise) {
      push({ minute: m, measureId: "heartRate", state: "fluctuating", text: "Exercise session: heart rate and breathing up", why: "Matches a session in the exercise equipment log, so no alert. ATHENA leaves workout readings out of its averages." });
    }
    if (!readings[m].exercise && readings[m - 1].exercise && readings[m].worn) {
      push({ minute: m, measureId: "heartRate", state: "stable", text: "Back in own normal after exercise", why: `Recovered within the ${RULES.exerciseRecovery}-minute recovery period after the session.` });
    }
  }
  // Single spikes that ATHENA ignores (heart rate): outside for one minute only.
  for (let m = 1; m < readings.length - 1; m += 1) {
    const [a, b, c] = [readings[m - 1], readings[m], readings[m + 1]];
    if (!a.worn || !b.worn || !c.worn || b.exercise) continue;
    if (Math.abs(b.heartRate - a.heartRate) > 25 && Math.abs(b.heartRate - c.heartRate) > 25) {
      push({ minute: m, measureId: "heartRate", state: "stable", text: `Single heart-rate spike of ${Math.round(b.heartRate)} bpm ignored`, why: "One reading with normal readings either side is treated as a sensor artefact." });
    }
  }
  if (day === SCRIPTED_DAY && astronautId === "nakamura") {
    push({ minute: hm(14, 49), state: "critical", text: "Chest pain reported", why: "An urgent symptom: open the emergency guide now.", emergencyId: "chest-pain", record: { symptoms: ["chest-pain"] } });
  }
  // No extra-check request once a red limit has fired: the emergency guide takes over.
  const firstCritical = Math.min(...events.filter((e) => e.state === "critical").map((e) => e.minute), Infinity);
  return events.filter((e) => !(e.request && e.minute >= firstCritical)).sort((x, y) => x.minute - y.minute);
}

/** Crew-wide scripted events (no single astronaut). */
export function crewEvents(day) {
  if (day !== SCRIPTED_DAY) return [];
  return [Object.freeze({ minute: hm(18, 30), astronautId: null, measureId: null, state: "deteriorating", text: "Whole crew: radiation dose rate rising (simulated solar particle event)", why: "Shown once for the whole crew instead of three separate alerts. Follow the mission's radiation procedure." })];
}

/**
 * Everything ATHENA knows about one astronaut's day, computed once (the feed is deterministic).
 */
export function liveDay(astronautId, day, baselines, options) {
  const normals = liveNormals(baselines);
  const readings = generateDay(astronautId, day, normals, options);
  const evaluation = evaluateFeed(readings, normals);
  const events = feedEvents(astronautId, readings, evaluation, day);
  return Object.freeze({ astronautId, day, normals, readings, evaluation, events });
}

/**
 * The live picture of one astronaut at a minute: each measurement's current reading, state,
 * the last 60 minutes for the chart and today's average so far; the overall state, confidence,
 * sensor status, the pending extra check and this astronaut's events so far.
 */
export function liveSnapshot(dayData, minute) {
  const m = Math.max(0, Math.min(DAY_MINUTES - 1, Math.floor(minute)));
  const { readings, evaluation, normals } = dayData;
  const now = readings[m];
  const measures = {};
  for (const measure of LIVE_MEASURES) {
    const field = measure.fields[0];
    const sofar = readings.slice(0, m + 1).filter((r) => r.worn);
    measures[measure.id] = {
      state: evaluation.states[measure.id][m],
      reading: now.worn ? Object.fromEntries(measure.fields.map((f) => [f, now[f]])) : null,
      text: valueText(measure.id, now),
      averageSoFar: sofar.length ? Object.fromEntries(measure.fields.map((f) => [f, sofar.reduce((s, r) => s + r[f], 0) / sofar.length])) : null,
      series: readings.slice(Math.max(0, m - 59), m + 1).map((r) => (r.worn ? r[field] : null)),
      band: { low: normals[field].mean - normals[field].half, high: normals[field].mean + normals[field].half },
    };
  }
  const events = dayData.events.filter((e) => e.minute <= m);
  const lastWorn = [...readings.slice(0, m + 1)].reverse().find((r) => r.worn);
  const request = events.filter((e) => e.request).at(-1) ?? null;
  return Object.freeze({
    minute: m,
    measures,
    overall: overallState(Object.fromEntries(Object.entries(measures).map(([id, x]) => [id, x.state]))),
    confidence: confidenceAt(readings, m),
    sensor: now.worn ? "All sensors worn" : `Shirt not worn since ${lastWorn ? timeText(lastWorn.minute + 1) : "midnight"}`,
    exercise: Boolean(now.exercise),
    request,
    events,
  });
}

/** Scripted moments still to come after `minute` on `day`, for the presenter's list. */
export function upcomingScript(day, minute) {
  return day === SCRIPTED_DAY ? SCRIPT.filter((e) => e.at > minute) : [];
}
