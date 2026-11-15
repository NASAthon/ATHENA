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
