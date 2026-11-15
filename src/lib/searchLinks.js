// Where each search result opens, plus its type label and one-line summary for the results list.
// Display mapping only: search itself (typos, synonyms, symptoms first) is in src/lib/engine/search.js.

import { EMERGENCIES, EXAMS, HAZARDS, INDICATORS, MISSION_MODES, REGIONS, RISKS, SYMPTOMS } from "@/data";

const find = (list, id) => list.find((x) => x.id === id);

// Indicators whose measurement guide opens on the Live Monitor (its "How it's measured" panel).
const LIVE_GUIDES = new Set(["sleep", "heartRate", "bloodPressure", "glucose", "temperature", "exercise", "spo2", "mood"]);

/**
 * @param {{ id: string, type: string, title: string }} hit A result from search().
 * @returns {{ href: string | null, typeLabel: string, glance: string, emergency: boolean, missionModeId?: string }}
 *   `href` is null for mission modes: choosing one switches the mode instead of opening a page.
 */
export function describeHit(hit) {
  const id = hit.id.slice(hit.id.indexOf(":") + 1);
  switch (hit.type) {
    case "emergency": {
      const e = find(EMERGENCIES, id);
      return { href: `/emergency?id=${id}`, typeLabel: "Emergency guide", glance: e?.glance ?? "", emergency: true };
    }
    case "symptom": {
      const s = find(SYMPTOMS, id);
      if (s?.emergencyId) {
        const e = find(EMERGENCIES, s.emergencyId);
        return { href: `/emergency?id=${s.emergencyId}`, typeLabel: "Symptom", glance: `Opens the guide: ${e?.name ?? s.emergencyId}`, emergency: true };
      }
      const region = find(REGIONS, s?.regions?.[0]);
      return { href: region ? `/body?region=${region.id}` : "/body", typeLabel: "Symptom", glance: region ? `Linked to: ${region.name}` : "", emergency: false };
    }
    case "indicator": {
      const i = find(INDICATORS, id);
      const href =
        id === "reaction" ? "/reaction-test" : LIVE_GUIDES.has(id) ? `/live?guide=${id}` : `/body?region=${i?.region ?? ""}`;
      return { href, typeLabel: "Measurement guide", glance: i?.glance ?? "", emergency: false };
    }
    case "bodyPart": {
      const r = find(REGIONS, id);
      return { href: `/body?region=${id}`, typeLabel: "Body region", glance: r?.glance ?? "", emergency: false };
    }
    case "risk": {
      const r = find(RISKS, id);
      return { href: `/body?region=${r?.regions?.[0] ?? ""}`, typeLabel: "NASA health risk", glance: r?.summary ?? "", emergency: false };
    }
    case "hazard": {
      const h = find(HAZARDS, id);
      return { href: `/body?region=${h?.regions?.[0] ?? ""}`, typeLabel: "NASA hazard", glance: h?.summary ?? "", emergency: false };
    }
    case "exam": {
      const x = find(EXAMS, id);
      return { href: "/calendar", typeLabel: "Periodic exam", glance: x?.why ?? "", emergency: false };
    }
    case "mission": {
      const m = find(MISSION_MODES, id);
      return { href: null, typeLabel: "Mission mode", glance: `Switch to ${m?.name ?? id}`, emergency: false, missionModeId: id };
    }
    default:
      return { href: null, typeLabel: "", glance: "", emergency: false };
  }
}
