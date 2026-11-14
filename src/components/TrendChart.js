// One Trends chart (CHECKLIST §3 › Trends): a plain SVG, no chart library (DECISIONS › Charts).
// Shows an indicator's 7-day average across the mission with:
// - the pre-flight and in-flight "normal" bands (driftBand in src/lib/engine/trends.js). Leaving
//   the in-flight band in the worrying direction is exactly what the engine calls drifting;
// - the in-flight baseline window (IN_FLIGHT_WINDOW), the drifting periods, and the selected day.
// Colours are theme tokens, and every coloured area also has a text label (Inclusive Design).

import { IN_FLIGHT_WINDOW } from "@/lib/engine";

const W = 720;
const H = 240;
const M = { left: 52, right: 112, top: 26, bottom: 30 };
const X_TICKS = [1, 30, 60, 90, 120, 150, 180];

export default function TrendChart({ title, series, selectedDay, lastDay, preBand, inBand, periods, format, summary }) {
  const shown = series.filter((p) => p.day <= selectedDay);
  const values = [
    ...shown.map((p) => p.average),
    ...[preBand, inBand].flatMap((b) => (b ? [b.low, b.high, b.mean] : [])),
  ].filter(Number.isFinite);
  let yMin = values.length ? Math.min(...values) : 0;
  let yMax = values.length ? Math.max(...values) : 1;
  const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.12;
  yMin -= pad;
  yMax += pad;

  const x = (day) => M.left + ((day - 1) / (lastDay - 1)) * (W - M.left - M.right);
  const y = (v) => M.top + (1 - (v - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);
  const clampY = (v) => Math.min(Math.max(v, yMin), yMax);

  // Line segments, broken where there's no 7-day average (missing data).
  const segments = [];
  let current = [];
  for (const p of shown) {
    if (Number.isFinite(p.average)) current.push(`${x(p.day).toFixed(1)},${y(p.average).toFixed(1)}`);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);

  const band = (b, colour, label, labelY) => {
    if (!b) return null;
    const top = y(clampY(b.high ?? yMax));
    const bottom = y(clampY(b.low ?? yMin));
    return (
      <g>
        <rect x={M.left} width={W - M.left - M.right} y={top} height={Math.max(0, bottom - top)} style={{ fill: colour, fillOpacity: 0.16 }} />
        {b.low !== null && <line x1={M.left} x2={W - M.right} y1={bottom} y2={bottom} strokeDasharray="5 4" style={{ stroke: colour }} />}
        {b.high !== null && <line x1={M.left} x2={W - M.right} y1={top} y2={top} strokeDasharray="5 4" style={{ stroke: colour }} />}
        <text x={W - M.right + 6} y={labelY ?? (top + bottom) / 2} fontSize="12" dominantBaseline="middle" style={{ fill: colour }}>
          {label}
        </text>
      </g>
    );
  };

  const ticks = [yMin + pad, (yMin + yMax) / 2, yMax - pad];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${summary}`} className="h-auto w-full">
      <title>{`${title}. ${summary}`}</title>
      {/* Grid and axes */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} style={{ stroke: "var(--border)" }} />
          <text x={M.left - 8} y={y(t)} fontSize="12" textAnchor="end" dominantBaseline="middle" style={{ fill: "var(--muted-foreground)" }}>
            {format(t)}
          </text>
        </g>
      ))}
      {X_TICKS.filter((d) => d <= lastDay).map((d) => (
        <text key={d} x={x(d)} y={H - 8} fontSize="12" textAnchor="middle" style={{ fill: "var(--muted-foreground)" }}>
          {d === 1 ? "day 1" : d}
        </text>
      ))}

      {band(preBand, "var(--status-adapted)", "pre-flight normal", M.top + 6)}
      {band(inBand, "var(--status-steady)", "in-flight normal")}

      {/* In-flight baseline window */}
      <rect
        x={x(IN_FLIGHT_WINDOW.fromDay)}
        width={x(IN_FLIGHT_WINDOW.toDay) - x(IN_FLIGHT_WINDOW.fromDay)}
        y={M.top}
        height={H - M.top - M.bottom}
        fill="none"
        strokeDasharray="4 3"
        style={{ stroke: "var(--status-steady)" }}
      />
      <text x={x(IN_FLIGHT_WINDOW.fromDay)} y={M.top - 8} fontSize="12" style={{ fill: "var(--status-steady)" }}>
        your normal measured, days {IN_FLIGHT_WINDOW.fromDay}–{IN_FLIGHT_WINDOW.toDay}
      </text>

      {/* Drifting periods up to the selected day */}
      {periods
        .filter((p) => p.fromDay <= selectedDay)
        .map((p) => {
          const to = Math.min(p.toDay, selectedDay);
          const x1 = x(p.fromDay) - 2;
          const width = Math.max(4, x(to) - x1 + 2);
          return (
            <g key={p.fromDay}>
              <rect x={x1} width={width} y={M.top} height={H - M.top - M.bottom} style={{ fill: "var(--status-amber)", fillOpacity: 0.2 }} />
              {/* Only label periods wide enough for the word, so labels never overlap. */}
              {width >= 52 && (
                <text x={x1 + 3} y={M.top + 14} fontSize="12" fontWeight="600" style={{ fill: "var(--status-amber)" }}>
                  drifting
                </text>
              )}
            </g>
          );
        })}

      {/* 7-day average */}
      {segments.map((pts, i) =>
        pts.length === 1 ? (
          <circle key={i} cx={pts[0].split(",")[0]} cy={pts[0].split(",")[1]} r="2" style={{ fill: "var(--foreground)" }} />
        ) : (
          <polyline key={i} points={pts.join(" ")} fill="none" strokeWidth="2" strokeLinejoin="round" style={{ stroke: "var(--foreground)" }} />
        ),
      )}

      {/* Selected day */}
      <line x1={x(selectedDay)} x2={x(selectedDay)} y1={M.top} y2={H - M.bottom} strokeDasharray="2 3" style={{ stroke: "var(--foreground)" }} />
      <text x={Math.min(x(selectedDay) + 4, W - M.right - 40)} y={H - M.bottom - 6} fontSize="12" style={{ fill: "var(--foreground)" }}>
        day {selectedDay}
      </text>
    </svg>
  );
}
