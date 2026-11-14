// Body-map region status for the UI (Mercy, PR #9).
// Each region shows the WORST status among the readings and recent symptoms linked to it
// in src/data/regions.js, judged against the astronaut's OWN baseline (docs/DECISIONS.md › Baselines).
//
// Status names match the logic engine (src/lib/engine/regions.js, PR #10): red_limit, drifting,
// expected_adaptation, steady, no_data. This adds one extra layer the engine doesn't have:
// "symptom" (a recently reported symptom linked to the region).
// The Body page feeds it the engine's evaluation of stored data (regionInputFromEvaluation).

import { REGIONS } from "@/data";
import { REGION_STATUSES } from "@/lib/engine/regions";
import { SYMPTOMS_FIELD } from "@/lib/engine/indicators";
import { latestRecordWith, readingFor } from "@/lib/readings";

// Ranking: the engine's REGION_STATUSES order (worst first) is the single source; "symptom" is
// slotted in right after "drifting". This file only adds the UI's labels, icons and colours.
const ORDER = [...REGION_STATUSES];
ORDER.splice(ORDER.indexOf("drifting") + 1, 0, "symptom");
const rankOf = (status) => ORDER.length - 1 - ORDER.indexOf(status);

// colour = a status token from globals.css; icon = a lucide-react icon name.
const STATUS_DISPLAY = {
  red_limit: { label: "Red limit", icon: "OctagonAlert", colour: "var(--status-red)",
    meaning: "A reading crossed a clinical red limit. Open the emergency guide." },
  drifting: { label: "Drifting", icon: "TrendingDown", colour: "var(--status-amber)",
    meaning: "Outside your own normal range for several days." },
  symptom: { label: "Symptom", icon: "MessageCircleWarning", colour: "var(--status-amber)",
    meaning: "You reported a related symptom recently." },
  expected_adaptation: { label: "Adapted", icon: "Info", colour: "var(--status-adapted)",
    meaning: "Changed since launch in a way that's expected in space." },
  steady: { label: "Steady", icon: "CircleCheck", colour: "var(--status-steady)",
    meaning: "Inside your own normal range." },
  no_data: { label: "No recent data", icon: "CircleMinus", colour: "var(--status-nodata)",
    meaning: "Nothing measured recently. Not a clean bill of health." },
};

export const STATUSES = Object.fromEntries(
  ORDER.map((status) => [status, { rank: rankOf(status), ...STATUS_DISPLAY[status] }]),
);

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

/**
 * Builds regionStatus() input from the logic engine's evaluation of STORED data
 * (useTodayEvaluation), so the body map shows the same statuses as Today.
 * - Status per indicator: "red_limit" if today's reading crossed a red limit, otherwise the
 *   engine's group status (drifting, expected_adaptation, steady, no_data).
 * - Value: the latest reading on or before today; normal: the in-flight baseline mean.
 * - Symptoms: ticked in stored records in the last SYMPTOM_DAYS days.
 *
 * @param {{ evaluation: Object, records: ReadonlyArray<Object>, baselines: Object | null, today: number }} input
 */
export function regionInputFromEvaluation({ evaluation, records, baselines, today }) {
  const indicators = {};
  const ids = new Set(REGIONS.flatMap((r) => r.indicators));
  for (const id of ids) {
    const red = evaluation.limitBreaches.some((b) => b.indicatorId === id && b.redLimit);
    const group = evaluation.groups.find((g) => g.group === id);
    const latest = latestRecordWith(id, records, today);
    const { value, normal } = readingFor(id, latest, baselines);
    const status = red ? "red_limit" : (group?.status ?? (latest ? "steady" : "no_data"));
    indicators[id] = { status, value, normal, lastDay: latest?.missionDay ?? null };
  }
  // Radiation is a running total with no drift status: it only counts as "checked".
  if (indicators.radiation && indicators.radiation.status !== "red_limit") {
    indicators.radiation.status = indicators.radiation.lastDay != null ? "steady" : "no_data";
  }

  const symptoms = [];
  for (const r of records) {
    if (!Number.isInteger(r.missionDay) || r.missionDay > today || today - r.missionDay >= SYMPTOM_DAYS) continue;
    for (const id of r[SYMPTOMS_FIELD] ?? []) symptoms.push({ id, day: r.missionDay });
  }
  return { today, indicators, symptoms };
}
