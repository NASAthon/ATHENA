// SIMULATED sample statuses for the 3 crew (docs/DECISIONS.md › Crew), until the mission
// simulator and logic engine produce real ones. Always labelled "simulated" in the UI.
// Each value is compared with that astronaut's OWN normal (personal baseline), not a fixed standard.
// Ids match src/data (indicators, symptoms).

export const SAMPLE_DAY = 129;

export const SAMPLE_CREW_STATUS = {
  // Commander Rivera: slow decline in sleep and reaction from about week 12 (drift alert).
  rivera: {
    today: SAMPLE_DAY,
    indicators: {
      sleep: { status: "drifting", value: 5.8, normal: 6.8, lastDay: 129 },
      reaction: { status: "drifting", value: 307, normal: 274, lastDay: 129 },
      mood: { status: "steady", value: 3.8, normal: 4.2, lastDay: 129 },
      heartRate: { status: "steady", value: 64, normal: 63, lastDay: 129 },
      bloodPressure: { status: "steady", value: "110/70", normal: "110/70", lastDay: 129 },
      glucose: { status: "steady", value: 91, normal: 90, lastDay: 128 },
      temperature: { status: "expected_adaptation", value: 37.0, normal: 36.8, lastDay: 129 },
      exercise: { status: "steady", value: 95, normal: 105, lastDay: 129 },
      spo2: { status: "no_data" },
      radiation: { status: "no_data" },
    },
    symptoms: [{ id: "headache", day: 128 }],
  },

  // Pilot Singh: stays healthy (no false alarms).
  singh: {
    today: SAMPLE_DAY,
    indicators: {
      sleep: { status: "steady", value: 7.4, normal: 7.3, lastDay: 129 },
      reaction: { status: "steady", value: 262, normal: 265, lastDay: 129 },
      mood: { status: "steady", value: 4.1, normal: 4.0, lastDay: 129 },
      heartRate: { status: "steady", value: 58, normal: 57, lastDay: 129 },
      bloodPressure: { status: "steady", value: "114/72", normal: "115/73", lastDay: 129 },
      glucose: { status: "steady", value: 88, normal: 89, lastDay: 129 },
      temperature: { status: "steady", value: 36.7, normal: 36.7, lastDay: 129 },
      exercise: { status: "steady", value: 100, normal: 98, lastDay: 129 },
      spo2: { status: "steady", value: 98, normal: 98, lastDay: 129 },
      radiation: { status: "no_data" },
    },
    symptoms: [],
  },

  // Engineer Nakamura: sudden event (red limit plus chest pain → emergency guide).
  nakamura: {
    today: SAMPLE_DAY,
    indicators: {
      sleep: { status: "steady", value: 6.9, normal: 7.0, lastDay: 129 },
      reaction: { status: "steady", value: 281, normal: 279, lastDay: 129 },
      mood: { status: "steady", value: 3.9, normal: 4.0, lastDay: 129 },
      heartRate: { status: "drifting", value: 104, normal: 66, lastDay: 129 },
      bloodPressure: { status: "red_limit", value: "186/118", normal: "118/76", lastDay: 129 },
      glucose: { status: "steady", value: 94, normal: 92, lastDay: 129 },
      temperature: { status: "steady", value: 36.9, normal: 36.8, lastDay: 129 },
      exercise: { status: "steady", value: 90, normal: 95, lastDay: 128 },
      spo2: { status: "no_data" },
      radiation: { status: "no_data" },
    },
    symptoms: [{ id: "chest-pain", day: 129 }],
  },
};
