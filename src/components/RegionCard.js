// Region card (Mercy, PR #9): details for the region picked on the body map.
// All content comes from src/data. Quick reference only (docs/DECISIONS.md › Quick Reference Only):
// name, status, the main reason and last checked; no Learn more layer.
//
// Props:
//   status  one entry from getRegionStatuses() (src/lib/regionStatus.js)

import {
  CircleCheck,
  CircleMinus,
  Info,
  MessageCircleWarning,
  OctagonAlert,
  TrendingDown,
} from "lucide-react";
import { REGIONS, INDICATORS, SYMPTOMS } from "@/data";

const ICONS = { CircleCheck, CircleMinus, Info, MessageCircleWarning, OctagonAlert, TrendingDown };

const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
const indicatorById = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const symptomById = Object.fromEntries(SYMPTOMS.map((s) => [s.id, s]));

// One reason as a plain-English line, e.g. "Sleep 5.8 h (your normal 6.8 h)".
function describeReason(reason) {
  if (reason.symptom) {
    return `${symptomById[reason.symptom]?.name ?? reason.symptom} reported on day ${reason.day}`;
  }
  const info = indicatorById[reason.indicator] ?? { name: reason.indicator, unit: "" };
  const value = reason.value != null ? ` ${reason.value} ${info.unit}` : "";
  const normal = reason.normal != null ? ` (your normal ${reason.normal} ${info.unit})` : "";
  return `${info.name}${value}${normal}`;
}

export default function RegionCard({ status }) {
  if (!status) {
    return (
      <section className="rounded-xl border bg-card p-6 text-muted-foreground">
        Select a body region to see its details.
      </section>
    );
  }

  const region = regionById[status.id];
  const Icon = ICONS[status.icon];
  const main = status.reasons[0];

  return (
    <section aria-labelledby="region-card-title" className="flex flex-col gap-4 rounded-xl border bg-card p-6">
      {/* Glance */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="region-card-title" className="text-2xl font-semibold">
          {status.name}
        </h2>
        <span
          className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold"
          style={{ borderColor: status.colour, color: status.colour }}
        >
          <Icon aria-hidden="true" className="size-4" />
          {status.label}
        </span>
      </div>

      <p className="text-base">{main ? describeReason(main) : status.meaning}</p>

      {status.reasons.length > 1 && (
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {status.reasons.slice(1).map((r, i) => (
            <li key={i}>{describeReason(r)}</li>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">
        {status.daysSinceChecked == null
          ? "Not checked yet."
          : status.daysSinceChecked === 0
            ? "Last checked today."
            : `Last checked ${status.daysSinceChecked} day${status.daysSinceChecked === 1 ? "" : "s"} ago.`}{" "}
        {status.status === "steady" && "Steady means the linked readings are inside your own normal range. It is not a full medical check."}
      </p>
    </section>
  );
}