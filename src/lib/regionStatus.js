
import { REGIONS } from "./bodyRegions";

// One entry per status, worst first.
// colour: local until the theme owner adds shared status tokens to globals.css.
// icon: a lucide-react icon name.
export const STATUSES = {
  red:      { rank: 5, label: "Red limit",      icon: "OctagonAlert",  colour: "#FF7A6E", meaning: "A reading is in a dangerous range for anyone." },
  drifting: { rank: 4, label: "Drifting",       icon: "TrendingDown",  colour: "#F5B041", meaning: "Outside your own normal range for several days." },
  symptom:  { rank: 3, label: "Symptom",        icon: "MessageCircleWarning", colour: "#F5B041", meaning: "You reported a related symptom recently." },
  adapted:  { rank: 2, label: "Adapted",        icon: "Info",          colour: "#B4AEFF", meaning: "Changed since launch in a way expected in space." },
  steady:   { rank: 1, label: "Steady",         icon: "CircleCheck",   colour: "#6FB7FF", meaning: "Inside your own normal range." },
  nodata:   { rank: 0, label: "No recent data", icon: "CircleMinus",   colour: "#A3AEC2", meaning: "Nothing measured recently. Not a clean bill of health." },
};

// A symptom counts as "recent" for this many days.
export const SYMPTOM_DAYS = 3;

// Status of one region.
export function regionStatus(region, { indicators = {}, symptoms = [], today }) {
  const reasons = [];
  let worst = "nodata";
  let lastChecked = null;

  const consider = (status, reason, day) => {
    if (STATUSES[status].rank > STATUSES[worst].rank) worst = status;
    if (reason) reasons.push({ status, ...reason });
    if (day != null && (lastChecked == null || day > lastChecked)) lastChecked = day;
  };

  // Daily readings linked to this region.
  for (const id of region.indicators) {
    const s = indicators[id];
    if (!s || s.status === "nodata") continue;
    consider(s.status, s.status === "steady" ? null : { indicator: id, value: s.value, normal: s.normal }, s.lastDay);
  }

  // Recent symptoms linked to this region.
  for (const sym of symptoms) {
    if (!region.symptoms.includes(sym.id)) continue;
    if (today != null && today - sym.day >= SYMPTOM_DAYS) continue;
    consider("symptom", { symptom: sym.id, day: sym.day }, sym.day);
  }

  // Worst reasons first, so the card can show reasons[0] as the glance line.
  reasons.sort((a, b) => STATUSES[b.status].rank - STATUSES[a.status].rank);

  return {
    id: region.id,
    name: region.name,
    status: worst,
    ...STATUSES[worst],
    reasons,
    lastChecked,
    daysSinceChecked: lastChecked != null && today != null ? today - lastChecked : null,
  };
}

// Status of all 8 regions, in docs/BODY_MAP.md order.
export function getRegionStatuses(input) {
  return REGIONS.map((region) => regionStatus(region, input));
}

// SAMPLE: Commander Rivera on mission day 129 (simulated; matches the demo story).
// Replace with the logic owner's real output once it exists.
export const SAMPLE_RIVERA = {
  today: 129,
  indicators: {
    sleepHours:      { status: "drifting", value: 5.8, normal: 6.8, lastDay: 129 },
    reactionMedian:  { status: "drifting", value: 307, normal: 274, lastDay: 129 },
    lapses:          { status: "drifting", value: 2, normal: 0.5, lastDay: 129 },
    mood:            { status: "steady",   value: 3.8, normal: 4.2, lastDay: 129 },
    heartRate:       { status: "steady",   value: 64, normal: 63, lastDay: 129 },
    systolic:        { status: "steady",   value: 110, normal: 110, lastDay: 129 },
    diastolic:       { status: "steady",   value: 70, normal: 70, lastDay: 129 },
    bloodSugar:      { status: "steady",   value: 91, normal: 90, lastDay: 128 },
    temperature:     { status: "adapted",  value: 37.0, normal: 37.0, lastDay: 129 },
    exerciseMinutes: { status: "steady",   value: 95, normal: 105, lastDay: 129 },
    spo2:            { status: "nodata" },
    radiationDose:   { status: "nodata" },
  },
  symptoms: [{ id: "headache", day: 128 }],
};