"use client";

// Body map: a 2D SVG figure with the 8 regions from docs/BODY_MAP.md,
// plus a list of the same regions beside it.
//
// Props:
//   statuses   array from getRegionStatuses() (src/lib/regionStatus.js)
//   selectedId id of the selected region, or null
//   onSelect   called with a region id when a region is clicked or chosen
//
// Accessibility (docs/DECISIONS.md > Inclusive Design):
//   - The list is the keyboard and screen-reader way in: real buttons, each with
//     an icon, a text label and colour, so colour is never the only signal.
//   - The figure is clickable with a mouse or finger, and has one text summary
//     for screen readers, so the same regions are not announced twice.

import {
  CircleCheck,
  CircleMinus,
  Info,
  MessageCircleWarning,
  OctagonAlert,
  TrendingDown,
} from "lucide-react";

const ICONS = { CircleCheck, CircleMinus, Info, MessageCircleWarning, OctagonAlert, TrendingDown };

// Shapes for each region, drawn back to front (later shapes sit on top).
// viewBox is 240 x 520. The figure faces the viewer, so the body's left is on the right.
// mode "fill": shapes filled with the status colour; "stroke": drawn as lines.
const BODY_OUTLINE =
  "M110 84 C106.3 86.3 111 94.7 108 98 C105 101.3 97.7 102 92 104 C86.3 106 78.8 107.3 74 110 C69.2 112.7 65.8 115.3 63 120 C60.2 124.7 58.3 130.5 57 138 C55.7 145.5 56 154.7 55 165 C54 175.3 52.3 188.8 51 200 C49.7 211.2 48.3 222 47 232 C45.7 242 43.8 252 43 260 C42.2 268 41.3 274.5 42 280 C42.7 285.5 44.8 291.2 47 293 C49.2 294.8 53.2 294.5 55 291 C56.8 287.5 56.8 280.5 58 272 C59.2 263.5 60.7 251.2 62 240 C63.3 228.8 64.7 216.3 66 205 C67.3 193.7 68.7 180.8 70 172 C71.3 163.2 72.8 150.7 74 152 C75.2 153.3 75.7 170.7 77 180 C78.3 189.3 80.8 200.3 82 208 C83.2 215.7 84.2 219.3 84 226 C83.8 232.7 82 240.3 81 248 C80 255.7 78 260 78 272 C78 284 79.8 302 81 320 C82.2 338 84.2 363.3 85 380 C85.8 396.7 85.5 406.3 86 420 C86.5 433.7 88.3 450.3 88 462 C87.7 473.7 84 483.2 84 490 C84 496.8 83.7 500.8 88 503 C92.3 505.2 106.3 505.5 110 503 C113.7 500.5 109.7 498.5 110 488 C110.3 477.5 111.3 457.7 112 440 C112.7 422.3 113.3 400.3 114 382 C114.7 363.7 115 344 116 330 C117 316 118.7 298 120 298 C121.3 298 123 316 124 330 C125 344 125.3 363.7 126 382 C126.7 400.3 127.3 422.3 128 440 C128.7 457.7 129.7 477.5 130 488 C130.3 498.5 126.3 500.5 130 503 C133.7 505.5 147.7 505.2 152 503 C156.3 500.8 156 496.8 156 490 C156 483.2 152.3 473.7 152 462 C151.7 450.3 153.5 433.7 154 420 C154.5 406.3 154.2 396.7 155 380 C155.8 363.3 157.8 338 159 320 C160.2 302 162 284 162 272 C162 260 160 255.7 159 248 C158 240.3 156.2 232.7 156 226 C155.8 219.3 156.8 215.7 158 208 C159.2 200.3 161.7 189.3 163 180 C164.3 170.7 164.8 153.3 166 152 C167.2 150.7 168.7 163.2 170 172 C171.3 180.8 172.7 193.7 174 205 C175.3 216.3 176.7 228.8 178 240 C179.3 251.2 180.8 263.5 182 272 C183.2 280.5 183.2 287.5 185 291 C186.8 294.5 190.8 294.8 193 293 C195.2 291.2 197.3 285.5 198 280 C198.7 274.5 197.8 268 197 260 C196.2 252 194.3 242 193 232 C191.7 222 190.3 211.2 189 200 C187.7 188.8 186 175.3 185 165 C184 154.7 184.3 145.5 183 138 C181.7 130.5 179.8 124.7 177 120 C174.2 115.3 170.8 112.7 166 110 C161.2 107.3 153.7 106 148 104 C142.3 102 135 101.3 132 98 C129 94.7 133.7 86.3 130 84 C126.3 81.7 113.7 81.7 110 84 Z";

const REGION_ART = {
  // Immune system, skin and blood: the skin, i.e. the whole outline.
  immune: {
    mode: "fill",
    shapes: (
      <>
        <ellipse cx="120" cy="50" rx="29" ry="35" />
        <path d={BODY_OUTLINE} />
      </>
    ),
  },
  // Muscles and bones: the skeleton.
  musculoskeletal: {
    mode: "stroke",
    shapes: (
      <>
        <path d="M120 98 L120 280" strokeDasharray="7 3" />
        <path d="M86 108 L112 103 M154 108 L128 103" />
        <path d="M66 122 L59 200 M174 122 L181 200" />
        <path d="M58 207 L50 272 M182 207 L190 272" />
        <path d="M92 268 C96 286 110 292 120 287 C130 292 144 286 148 268" fill="none" />
        <path d="M100 296 L102 382 M140 296 L138 382" />
        <path d="M102 392 L100 478 M138 392 L140 478" />
      </>
    ),
  },
  // Gut, kidneys and nutrition: kidneys, stomach and intestines.
  gut: {
    mode: "fill",
    shapes: (
      <>
        <ellipse cx="99" cy="214" rx="6" ry="10" />
        <ellipse cx="141" cy="214" rx="6" ry="10" />
        <path d="M124 198 C140 192 150 204 146 214 C142 224 128 224 122 218 C117 212 117 202 124 198 Z" />
        <rect x="95" y="226" width="50" height="40" rx="15" />
        <path d="M104 236 C112 230 118 244 126 236 C132 230 138 244 136 250 C130 258 118 248 110 256" fill="none" strokeWidth="2" />
      </>
    ),
  },
  // Breathing and oxygen: two lungs; the body's left lung is smaller, to make room for the heart.
  breathing: {
    mode: "fill",
    shapes: (
      <>
        <path d="M114 116 C100 114 88 126 86 148 C84 170 88 188 96 194 C104 199 112 195 114 185 Z" />
        <path d="M126 116 C140 114 152 126 154 148 C156 170 152 188 144 194 C138 198 132 196 130 188 L128 172 C134 170 136 160 128 156 Z" />
      </>
    ),
  },
  // Heart and blood vessels: heart, slightly to the body's left.
  heart: {
    mode: "fill",
    shapes: (
      <path d="M118 152 C118 144 128 142 131 150 C134 142 144 144 144 152 C144 162 132 170 131 176 C130 170 118 162 118 152 Z" />
    ),
  },
  // Brain and nerves: the brain inside the head.
  brain: {
    mode: "fill",
    shapes: (
      <>
        <path d="M96 42 C94 26 108 18 120 20 C132 18 146 26 144 42 C146 50 138 54 130 52 L110 52 C102 54 94 50 96 42 Z" />
        <path d="M120 22 L120 50" fill="none" strokeWidth="1.5" />
      </>
    ),
  },
  // Eyes.
  eyes: {
    mode: "fill",
    shapes: (
      <>
        <path d="M100 62 C104 57 112 57 116 62 C112 67 104 67 100 62 Z" />
        <path d="M124 62 C128 57 136 57 140 62 C136 67 128 67 124 62 Z" />
      </>
    ),
  },
  // Mind and sleep: a dashed halo around the head, because it has no single place in the body.
  mind: {
    mode: "stroke",
    shapes: <ellipse cx="120" cy="50" rx="42" ry="46" strokeDasharray="10 6" />,
  },
};

// Order to draw them in.
const DRAW_ORDER = ["immune", "musculoskeletal", "gut", "breathing", "heart", "brain", "eyes", "mind"];

export default function BodyMap({ statuses, selectedId, onSelect }) {
  const byId = Object.fromEntries(statuses.map((s) => [s.id, s]));

  const summary = statuses.map((s) => `${s.name}: ${s.label}`).join(". ");

  return (
    <div className="flex flex-wrap items-start gap-6">
      {/* The figure */}
      <svg
        viewBox="0 0 240 520"
        role="img"
        aria-label={`Body figure. ${summary}.`}
        className="w-full max-w-[280px] flex-none"
      >
        {DRAW_ORDER.map((id) => {
          const s = byId[id];
          if (!s) return null;
          const art = REGION_ART[id];
          const selected = id === selectedId;
          const isStroke = art.mode === "stroke";
          return (
            <g
              key={id}
              onClick={() => onSelect?.(id)}
              className="cursor-pointer"
              fill={isStroke ? "none" : s.colour}
              fillOpacity={id === "immune" ? 0.1 : 0.55}
              stroke={selected && !isStroke ? "#FFFFFF" : s.colour}
              strokeWidth={isStroke ? 4 : selected ? 2.5 : 1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={selected ? { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" } : undefined}
            >
              <title>{`${s.name}: ${s.label}`}</title>
              {art.shapes}
            </g>
          );
        })}
      </svg>

      {/* The same regions as a list: keyboard and screen-reader access, and the fallback tiles */}
      <ul className="flex min-w-[260px] flex-1 flex-col gap-2" aria-label="Body regions">
        {statuses.map((s) => {
          const Icon = ICONS[s.icon];
          const selected = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect?.(s.id)}
                aria-pressed={selected}
                className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  selected ? "bg-accent" : "bg-card hover:bg-accent/60"
                }`}
                style={{ borderColor: selected ? s.colour : undefined }}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{s.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {s.daysSinceChecked == null
                      ? "Not checked yet"
                      : s.daysSinceChecked === 0
                        ? "Checked today"
                        : `Last checked ${s.daysSinceChecked} day${s.daysSinceChecked === 1 ? "" : "s"} ago`}
                  </span>
                </span>
                <span
                  className="flex flex-none items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                  style={{ borderColor: s.colour, color: s.colour }}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}