// Mission simulator: 180 days for 3 crew, with realistic day-to-day noise and one or two
// harmless bad days.
// Pure logic: no React, DOM, database or network. Deterministic: the same seed always
// gives exactly the same mission, so the demo is repeatable.
//
// SIMULATED DATA (docs/DECISIONS.md › Crew). Every number here is an invented demo value
// chosen to look plausible, NOT physiology or NASA data, and is always labelled
// "simulated" in the app.
// Field names follow the engine's daily record (src/lib/engine/indicators.js › RECORD_FIELDS).

import { DAY_KEY } from "../engine/indicators.js";

/** Mission days simulated: 30 pre-flight days, then 180 days in flight (day 0 = launch, not recorded). */
export const MISSION_DAYS = Object.freeze({ fromDay: -30, toDay: 180 });

/** Default seed for the demo mission. */
export const DEMO_SEED = 2026;

/**
 * Per-astronaut normals: [mean, day-to-day SD]. SpO₂ is only recorded for Singh, as in
 * the sample data (it's optional, DECISIONS › Indicators).
 */
const PROFILES = Object.freeze({
  rivera: {
    heartRate: [63, 2.5], bpSystolic: [110, 4], bpDiastolic: [70, 3], glucose: [90, 4], temperature: [36.8, 0.12],
    sleepHours: [6.8, 0.35], mood: [4.2, 0.35], reactionMedianMs: [274, 10], reactionLapses: [0.3, 0.5], exerciseMinutes: [105, 8],
  },
  singh: {
    heartRate: [57, 2.5], bpSystolic: [115, 4], bpDiastolic: [73, 3], glucose: [89, 4], temperature: [36.7, 0.12],
    sleepHours: [7.3, 0.35], mood: [4.0, 0.35], reactionMedianMs: [265, 10], reactionLapses: [0.3, 0.5], exerciseMinutes: [98, 8],
    spo2: [98, 0.6],
  },
  nakamura: {
    heartRate: [66, 2.5], bpSystolic: [118, 4], bpDiastolic: [76, 3], glucose: [92, 4], temperature: [36.8, 0.12],
    sleepHours: [7.0, 0.35], mood: [4.0, 0.35], reactionMedianMs: [279, 10], reactionLapses: [0.3, 0.5], exerciseMinutes: [95, 8],
  },
});

/** Day of Engineer Nakamura's sudden event. */
export const NAKAMURA_EVENT_DAY = 129;

/** Day Commander Rivera's slow decline starts (DECISIONS › Crew: "from about week 12"). */
export const RIVERA_DECLINE_FROM = 75;

/**
 * Story for each astronaut (DECISIONS › Crew): changes added to their normal on a day.
 * Returns { shift: { field: amount }, set: { field: value }, symptoms: [ids] }.
 *
 * @type {Readonly<Record<string, (day: number) => { shift?: Object, set?: Object, symptoms?: string[] }>>}
 */
const STORIES = Object.freeze({
  // Commander Rivera: early adaptation, a settled period, then a slow decline in sleep,
  // reaction and mood from about week 12 (drift alert). One harmless bad day on day 50.
  rivera: (day) => {
    const shift = {};
    if (day > 0) shift.temperature = 0.25 * Math.min(1, day / 10); // adapts over the first 10 days, then settles
    if (day > RIVERA_DECLINE_FROM) {
      const t = day - RIVERA_DECLINE_FROM;
      shift.sleepHours = -0.022 * t;
      shift.mood = -0.018 * t;
      shift.reactionMedianMs = 0.9 * t;
      shift.reactionLapses = 0.03 * t;
    }
    if (day === 50) Object.assign(shift, { sleepHours: -2.2, mood: -1.5 }); // one bad night
    return { shift, symptoms: day === 128 ? ["headache"] : [] };
  },
  // Pilot Singh: stays healthy (no false alarm), with one harmless bad day on day 100.
  singh: (day) => ({
    shift: day === 100 ? { sleepHours: -2.5, mood: -1.5, reactionMedianMs: 40 } : {},
    symptoms: [],
  }),
  // Engineer Nakamura: a sudden event on day 129 (red limit plus chest pain → emergency guide).
  nakamura: (day) =>
    day === NAKAMURA_EVENT_DAY
      ? { set: { bpSystolic: 186, bpDiastolic: 118, heartRate: 104 }, symptoms: ["chest-pain"] }
      : { symptoms: [] },
});

/** A few days each astronaut didn't log (real crews miss days; the engine must cope). */
const MISSED_DAYS = Object.freeze({ rivera: [23, 141], singh: [67], nakamura: [88, 152] });

/** How each field is rounded and kept possible, as it would be entered (src/data input limits). */
const FORMAT = Object.freeze({
  heartRate: (v) => Math.round(v),
  bpSystolic: (v) => Math.round(v),
  bpDiastolic: (v) => Math.round(v),
  glucose: (v) => Math.round(v),
  temperature: (v) => Math.round(v * 10) / 10,
  sleepHours: (v) => Math.max(0, Math.round(v * 4) / 4),
  mood: (v) => Math.min(5, Math.max(1, Math.round(v))),
  reactionMedianMs: (v) => Math.round(v),
  reactionLapses: (v) => Math.max(0, Math.round(v)),
  exerciseMinutes: (v) => Math.max(0, Math.round(v / 5) * 5),
  spo2: (v) => Math.min(100, Math.round(v)),
});

/** IDs of the simulated crew, in display order (src/lib/crew.js). */
export const SIMULATED_CREW = Object.freeze(Object.keys(PROFILES));

/**
 * Mission simulator: 180 days for 3 crew.
 *
 * Simulates one astronaut's daily records from day −30 to day 180 (no record on launch
 * day 0, and a few missed days). Each record has `missionDay`, every profile field, and
 * `symptoms` (a list of symptom ids from src/data/symptoms.js, usually empty).
 *
 * @param {string} astronautId "rivera" | "singh" | "nakamura"
 * @param {{ seed?: number, fromDay?: number, toDay?: number }} [options]
 * @returns {ReadonlyArray<Readonly<Object<string, unknown>>>} Records, oldest first.
 * @throws {RangeError} If the astronaut isn't one of the simulated crew.
 */
export function simulateAstronaut(astronautId, { seed = DEMO_SEED, fromDay = MISSION_DAYS.fromDay, toDay = MISSION_DAYS.toDay } = {}) {
  const profile = PROFILES[astronautId];
  if (!profile) throw new RangeError(`simulateAstronaut: unknown astronaut "${astronautId}".`);
  const story = STORIES[astronautId];
  const noise = gaussian(seededRandom(seed + hash(astronautId)));
  const missed = MISSED_DAYS[astronautId] ?? [];

  const records = [];
  for (let day = MISSION_DAYS.fromDay; day <= toDay; day += 1) {
    // Draw noise for every simulated day, even skipped ones, so a different range
    // (fromDay/toDay) gives the same values on the days it shares.
    const draws = Object.keys(profile).map(() => noise());
    if (day < fromDay || day === 0 || missed.includes(day)) continue;

    const { shift = {}, set = {}, symptoms = [] } = story(day);
    const record = { [DAY_KEY]: day };
    Object.entries(profile).forEach(([field, [mean, sd]], i) => {
      const raw = field in set ? set[field] : mean + (shift[field] ?? 0) + sd * draws[i];
      record[field] = FORMAT[field] ? FORMAT[field](raw) : raw;
    });
    record.symptoms = [...symptoms];
    records.push(Object.freeze(record));
  }
  return Object.freeze(records);
}

/**
 * The whole simulated crew: { rivera: [...], singh: [...], nakamura: [...] }.
 *
 * @param {{ seed?: number, toDay?: number }} [options]
 * @returns {Readonly<Record<string, ReadonlyArray<Object>>>}
 */
export function simulateCrew(options = {}) {
  return Object.freeze(Object.fromEntries(SIMULATED_CREW.map((id) => [id, simulateAstronaut(id, options)])));
}

/**
 * Mulberry32: tiny seeded pseudo-random generator (public-domain algorithm).
 * @param {number} seed
 * @returns {() => number} Uniform numbers in [0, 1).
 */
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal noise (Box–Muller) from a seeded generator. */
function gaussian(random) {
  return () => {
    const u = Math.max(random(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  };
}

/** Small stable hash so each astronaut gets their own noise stream. */
function hash(text) {
  let h = 0;
  for (const ch of text) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return h >>> 0;
}
