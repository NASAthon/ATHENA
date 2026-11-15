"use client";

// Shared pieces for live monitoring screens: the state badge (always icon + text label + colour,
// docs/DECISIONS.md › Inclusive Design) and the 60-minute line chart.

import { Activity, CircleCheck, OctagonAlert, TrendingDown, WifiOff } from "lucide-react";

export const LIVE_STYLE = Object.freeze({
  stable: { label: "Stable", Icon: CircleCheck, colour: "var(--status-steady)" },
  fluctuating: { label: "Fluctuating", Icon: Activity, colour: "var(--status-adapted)" },
  deteriorating: { label: "Deteriorating", Icon: TrendingDown, colour: "var(--status-amber)" },
  critical: { label: "Critical", Icon: OctagonAlert, colour: "var(--status-red)" },
  no_data: { label: "No data", Icon: WifiOff, colour: "var(--status-nodata)" },
});

export function LiveStateBadge({ state, size = "sm" }) {
  const { label, Icon, colour } = LIVE_STYLE[state] ?? LIVE_STYLE.no_data;
  const big = size === "lg";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold ${big ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
      style={{ borderColor: colour, color: colour }}
    >
      <Icon aria-hidden="true" className={big ? "size-4" : "size-3.5"} />
      {label}
    </span>
  );
}

/**
 * The last 60 minutes as a line, over a shaded band for the astronaut's own normal. Gaps (sensor
 * not worn) break the line. Decorative: the value and state are always shown as text beside it.
 */
export function Sparkline({ series, band, colour, next = null, shift = 0 }) {
  const W = 160;
  const H = 44;
  const vals = [...series, next].filter((v) => v !== null);
  const lo = Math.min(band.low, ...vals);
  const hi = Math.max(band.high, ...vals);
  const pad = (hi - lo) * 0.1 || 1;
  const y = (v) => H - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * H;
  // The window slides left smoothly as the minute passes (`shift`); the newest point heads for
  // `next`, and anything outside the box is clipped.
  const x = (i) => ((i - shift) / (series.length - 1)) * W;
  const points = next === null ? series : [...series, next];
  const segments = [];
  let current = [];
  points.forEach((v, i) => {
    if (v === null) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  });
  if (current.length) segments.push(current);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-11 w-full overflow-hidden" aria-hidden="true">
      <rect x="0" y={y(band.high)} width={W} height={Math.max(1, y(band.low) - y(band.high))} fill="var(--status-steady)" fillOpacity="0.12" />
      {segments.map((pts, i) => (
        <polyline key={i} points={pts.join(" ")} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
