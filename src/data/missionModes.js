// Mission modes for the header switch and the
// logic engine (src/lib/engine/missionMode.js).
// Delays are only what NASA sources state (docs/DECISIONS.md › Mission Modes):
// - ISS: under 1 second (NASA Goddard: "less than a one-second delay").
// - Gateway: no NASA page gives a Gateway figure. NASA's estimate for LUNAR missions
//   (3–14 seconds one way) is applied to Gateway, so it is marked `inferred: true`.
// - Mars: up to 20 minutes one way (NASA HRP Distance from Earth hazard page).
// `emphasis` (hazards shown first) and `advice` are ATHENA design choices (basis: "design").

export const MISSION_MODES = [
  {
    id: "iss",
    name: "ISS",
    environment: "Space station in low Earth orbit",
    earthDelay: { text: "Under 1 s one way", oneWaySeconds: { min: 0, max: 1 }, sourceId: "nasa-iss-comms" },
    emphasis: { hazards: ["gravity", "hostile", "isolation"], basis: "design" },
    advice: {
      glance: "Mission control can talk with you almost live. Contact the flight surgeon early.",
      basis: "design",
    },
    sourceIds: ["nasa-iss-comms", "nasa-hazard-distance"],
    keywords: ["iss", "space station", "station", "low earth orbit", "orbit"],
  },
  {
    id: "gateway",
    name: "Lunar Gateway",
    environment: "Space station orbiting the Moon",
    earthDelay: {
      text: "About 3–14 s one way (lunar estimate)",
      oneWaySeconds: { min: 3, max: 14 },
      sourceId: "nasa-tm-comm-delay",
      inferred: true,
    },
    emphasis: { hazards: ["radiation", "distance", "gravity"], basis: "design" },
    advice: {
      glance: "Replies take several seconds. Start the guide's steps while you wait, and keep messages short and clear.",
      basis: "design",
    },
    sourceIds: ["nasa-tm-comm-delay", "nasa-hazard-distance"],
    keywords: ["gateway", "lunar gateway", "moon", "lunar", "artemis"],
  },
  {
    id: "mars",
    name: "Mars Transit",
    environment: "Spacecraft travelling to Mars",
    earthDelay: { text: "Up to 20 min one way", oneWaySeconds: { min: null, max: 1200 }, sourceId: "nasa-hazard-distance" },
    emphasis: { hazards: ["distance", "radiation", "isolation"], basis: "design" },
    advice: {
      glance: "A reply can take up to 40 minutes. Follow ATHENA's guide and act now; don't wait for Earth.",
      basis: "design",
    },
    sourceIds: ["nasa-hazard-distance"],
    keywords: ["mars", "mars transit", "deep space", "transit", "interplanetary"],
  },
];

export const DEFAULT_MISSION_MODE = "mars";
