// Live events that change the day's stored record (docs/DECISIONS.md › Always-On Live Monitoring).
// Some live events carry a `record` payload: e.g. a red-limit blood-pressure reading, or a symptom the
// crew member reports. Once the clock has passed such an event, its values belong in today's daily
// record, so the engine (Today, Crew, the alert banner, Summary) sees the same thing the Live Monitor
// does. Pure logic: no React or database. Idempotent: nothing is returned once the record has it.

/**
 * The fields still to save into today's record for the events that have already happened.
 *
 * @param {ReadonlyArray<{ record?: Object }>} events One astronaut's live events up to now.
 * @param {Object | null} stored That astronaut's stored record for the same day, if any.
 * @returns {Object | null} Fields for saveCheckIn(), or null if the record is already up to date.
 *   A symptoms list is the union of the stored symptoms and the reported ones.
 */
export function pendingRecordFields(events, stored) {
  const fields = {};
  const symptoms = new Set(stored?.symptoms ?? []);
  let newSymptom = false;
  for (const event of events) {
    if (!event.record) continue;
    for (const [key, value] of Object.entries(event.record)) {
      if (key === "symptoms") {
        for (const s of value) {
          if (!symptoms.has(s)) {
            symptoms.add(s);
            newSymptom = true;
          }
        }
      } else if (stored?.[key] !== value) {
        fields[key] = value;
      }
    }
  }
  if (newSymptom) fields.symptoms = [...symptoms];
  return Object.keys(fields).length > 0 ? fields : null;
}

// Record fields that the live feed's running average fills in for today (docs/DECISIONS.md ›
// Always-On Live Monitoring › Live roll-up). Each is [record field, live measure, field in the measure].
const LIVE_DAILY_FIELDS = Object.freeze([
  ["heartRate", "heartRate", "heartRate"],
  ["bpSystolic", "bloodPressure", "bpSystolic"],
  ["bpDiastolic", "bloodPressure", "bpDiastolic"],
  ["spo2", "spo2", "spo2"],
]);

/**
 * Today's record as every screen should see it right now: the sensor vitals are the live feed's
 * average so far, so Today, Body, Trends, Summary and Crew move with the Live Monitor. Values a live
 * event has written into the record (e.g. a red-limit reading) are kept, and so is anything the
 * feed can't supply (shirt not worn all day). Nothing is saved: this is a view of the record.
 *
 * @param {Object | null} stored Today's stored record.
 * @param {Object | null} snapshot liveSnapshot() for the same astronaut and day.
 * @returns {Object | null}
 */
export function liveTodayRecord(stored, snapshot) {
  if (!stored || !snapshot) return stored;
  const fromEvents = new Set(snapshot.events.flatMap((e) => Object.keys(e.record ?? {})));
  const record = { ...stored };
  for (const [key, measureId, field] of LIVE_DAILY_FIELDS) {
    const avg = snapshot.measures[measureId]?.averageSoFar?.[field];
    if (fromEvents.has(key) || !Number.isFinite(avg)) continue;
    record[key] = Math.round(avg);
  }
  return record;
}

/** A short, stable key for the live overlay, so screens only re-evaluate when a value changes. */
export function liveTodayKey(snapshot) {
  if (!snapshot) return "";
  return LIVE_DAILY_FIELDS.map(([, measureId, field]) => {
    const v = snapshot.measures[measureId]?.averageSoFar?.[field];
    return Number.isFinite(v) ? Math.round(v) : "-";
  }).join(",") + `|${snapshot.events.filter((e) => e.record).length}`;
}
