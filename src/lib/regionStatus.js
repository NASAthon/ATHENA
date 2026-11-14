// Body-map region status for the UI (Mercy, PR #9).
// Each region shows the WORST status among the readings and recent symptoms linked to it
// in src/data/regions.js, judged against the astronaut's OWN baseline (docs/DECISIONS.md › Baselines).
//
// Status names match the logic engine (src/lib/engine/regions.js, PR #10): red_limit, drifting,
// expected_adaptation, steady, no_data. This adds one extra layer the engine doesn't have:
// "symptom" (a recently reported symptom linked to the region).
// When the engine is merged, feed its per-indicator statuses in here instead of sample data.

import { REGIONS } from "@/data";

// Worst first. colour = a status token from globals.css; icon = a lucide-react icon name.
export const STATUSES = {
  red_limit: { rank: 5, label: "Red limit", icon: "OctagonAlert", colour: "var(--status-red)",
    meaning: "A reading crossed a clinical red limit. Open the emergency guide." },
  drifting: { rank: 4, label: "Drifting", icon: "TrendingDown", colour: "var(--status-amber)",
    meaning: "Outside your own normal range for several days." },
  symptom: { rank: 3, label: "Symptom", icon: "MessageCircleWarning", colour: "var(--status-amber)",
    meaning: "You reported a related symptom recently." },
  expected_adaptation: { rank: 2, label: "Adapted", icon: "Info", colour: "var(--status-adapted)",
    meaning: "Changed since launch in a way that's expected in space." },
  steady: { rank: 1, label: "Steady", icon: "CircleCheck", colour: "var(--status-steady)",
    meaning: "Inside your own normal range." },
  no_data: { rank: 0, label: "No recent data", icon: "CircleMinus", colour: "var(--status-nodata)",
    meaning: "Nothing measured recently. Not a clean bill of health." },
};

// A symptom counts as "recent" for this many days (ATHENA design choice, tunable).
export const SYMPTOM_DAYS = 3;

/**
 * Status of one region.
 * @param region  an entry from src/data/regions.js
 * @param input   { today, indicators: { [indicatorId]: { status, value, normal, lastDay } },
 *                  symptoms: [{ id, day }] }  (ids from src/data)
 */
export function regionStatus(region, { indicators = {}, symptoms = [], today }) {
  const reasons = [];
  let worst = "no_data";
  let lastChecked = null;

  const consider = (status, reason, day) => {
    if (STATUSES[status].rank > STATUSES[worst].rank) worst = status;
    if (reason) reasons.push({ status, ...reason });
    if (day != null && (lastChecked == null || day > lastChecked)) lastChecked = day;
  };

  for (const id of region.indicators) {
    const s = indicators[id];
    if (!s || s.status === "no_data") continue;
    consider(s.status, s.status === "steady" ? null : { indicator: id, value: s.value, normal: s.normal }, s.lastDay);
  }

  for (const sym of symptoms) {
    if (!region.symptoms.includes(sym.id)) continue;
    if (today != null && today - sym.day >= SYMPTOM_DAYS) continue;
    consider("symptom", { symptom: sym.id, day: sym.day }, sym.day);
  }

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

/** Status of all 8 regions, in src/data order. */
export function getRegionStatuses(input) {
  return REGIONS.map((region) => regionStatus(region, input));
}
