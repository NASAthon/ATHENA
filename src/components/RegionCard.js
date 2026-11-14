// Region card (Mercy, PR #9): details for the region picked on the body map.
// All content comes from src/data (regions, risks, hazards, sources, indicators, symptoms).
// Layered, as docs/DECISIONS.md > Content Style asks:
//   Glance (always visible): name, status, the main reason, last checked.
//   Learn more (on tap): body parts, NASA risks and hazards, verified facts (sources are in docs/SOURCES.md).
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
import { REGIONS, RISKS, HAZARDS, INDICATORS, SYMPTOMS } from "@/data";
import { focusRing } from "@/lib/ui";

const ICONS = { CircleCheck, CircleMinus, Info, MessageCircleWarning, OctagonAlert, TrendingDown };

const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
const riskById = Object.fromEntries(RISKS.map((r) => [r.id, r]));
const hazardById = Object.fromEntries(HAZARDS.map((h) => [h.id, h]));
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

// "NASA states" or "ATHENA's interpretation", so inferred links are never shown as NASA claims.
function BasisTag({ basis }) {
  return basis === "stated" ? (
    <span className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">NASA states</span>
  ) : (
    <span className="rounded border border-dashed border-border px-1.5 py-0.5 text-xs text-muted-foreground">
      ATHENA&apos;s interpretation
    </span>
  );
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

      {/* Learn more */}
      <details className="group border-t pt-4">
        <summary className={`flex min-h-11 cursor-pointer items-center rounded font-medium ${focusRing}`}>
          Learn more
        </summary>

        <div className="flex flex-col gap-5 pt-3 text-sm">
          <div>
            <h3 className="mb-1 font-semibold">What this covers</h3>
            <p className="text-muted-foreground">{region.bodyParts.join(", ")}.</p>
            <p className="mt-2 text-muted-foreground">{region.learnMore}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">How spaceflight affects it (NASA health risks)</h3>
            <ul className="flex flex-col gap-3">
              {region.risks.map((id) => (
                <li key={id} className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{riskById[id].name}</span>
                    <BasisTag basis={region.riskNotes[id].basis} />
                  </span>
                  <span className="text-muted-foreground">{region.riskNotes[id].note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Spaceflight hazards behind it</h3>
            <ul className="flex flex-col gap-3">
              {region.hazards.map((h) => (
                <li key={h.id} className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{hazardById[h.id].name}</span>
                    <BasisTag basis={h.basis} />
                  </span>
                  <span className="text-muted-foreground">{h.note}</span>
                </li>
              ))}
            </ul>
          </div>

          {region.facts.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Key facts</h3>
              <ul className="flex list-disc flex-col gap-1 pl-5">
                {region.facts.map((f, i) => (
                  <li key={i}>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {region.indicatorNotes && (
            <p className="text-muted-foreground">
              {Object.entries(region.indicatorNotes).map(([id, note]) => (
                <span key={id}>
                  {indicatorById[id]?.name ?? id}: {note}{" "}
                </span>
              ))}
            </p>
          )}

          <div>
            <h3 className="mb-1 font-semibold">What ATHENA does next</h3>
            <p className="text-muted-foreground">
              If a linked reading keeps drifting for 14 more days, ATHENA asks you to tell the crew and send a summary
              to the flight surgeon. A red limit triggers the emergency guide straight away.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}