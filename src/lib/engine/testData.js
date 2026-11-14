// Test helpers only (imported by *.test.js, never by the app).
// Seeded random numbers so every test run sees exactly the same data.

/**
 * Mulberry32: tiny seeded pseudo-random generator (public domain algorithm).
 * @param {number} seed
 * @returns {() => number} Uniform numbers in [0, 1).
 */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Normal noise from a seeded generator (Box–Muller).
 * @param {() => number} random
 * @returns {() => number}
 */
export function gaussian(random) {
  return () => {
    const u = Math.max(random(), 1e-12);
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

/** Typical healthy values and day-to-day noise for test data (not real physiology). */
export const HEALTHY = Object.freeze({
  heartRate: [62, 3],
  bpSystolic: [116, 4],
  bpDiastolic: [74, 3],
  glucose: [88, 5],
  temperature: [36.7, 0.15],
  sleepHours: [7.4, 0.45],
  mood: [4, 0.4],
  reactionMedianMs: [300, 15],
  reactionLapses: [0.4, 0.6],
  exerciseMinutes: [90, 10],
});

/**
 * Builds daily records from day `fromDay` to `toDay`.
 * @param {Object} options
 * @param {number} options.seed
 * @param {number} [options.fromDay=-30]
 * @param {number} [options.toDay=180]
 * @param {(day: number) => Object<string, number>} [options.shift] Added to the healthy
 *   mean for each field on a day (use for declines and events).
 * @param {ReadonlyArray<number>} [options.missingDays] Days with no record at all.
 * @returns {Array<Object<string, unknown>>}
 */
export function makeMission({ seed, fromDay = -30, toDay = 180, shift = () => ({}), missingDays = [] }) {
  const noise = gaussian(seededRandom(seed));
  const records = [];
  for (let day = fromDay; day <= toDay; day += 1) {
    if (day === 0 || missingDays.includes(day)) continue; // day 0 = launch day, not recorded
    const extra = shift(day);
    const record = { missionDay: day };
    for (const [field, [mean, sd]] of Object.entries(HEALTHY)) {
      let value = mean + (extra[field] ?? 0) + sd * noise();
      if (field === "mood") value = Math.min(5, Math.max(1, Math.round(value)));
      if (field === "reactionLapses") value = Math.max(0, Math.round(value));
      record[field] = value;
    }
    records.push(record);
  }
  return records;
}
