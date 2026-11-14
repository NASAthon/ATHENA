// Mission modes for the header switch (docs/CHECKLIST.md › Mission mode switch).
// Only facts our sources state are included. NASA gives "up to 20 minutes one way" for
// deep space (Distance from Earth hazard page); no allowed source gives ISS or Gateway delays,
// so those are left out (null) rather than guessed.

export const MISSION_MODES = [
  {
    id: "iss",
    name: "ISS",
    environment: "Space station in low Earth orbit",
    earthDelay: null,
    sourceIds: ["nasa-hazard-distance"],
    keywords: ["iss", "space station", "station", "low earth orbit", "orbit"],
  },
  {
    id: "gateway",
    name: "Lunar Gateway",
    environment: "Space station orbiting the Moon",
    earthDelay: null,
    sourceIds: ["nasa-hazard-distance"],
    keywords: ["gateway", "lunar gateway", "moon", "lunar", "artemis"],
  },
  {
    id: "mars",
    name: "Mars Transit",
    environment: "Spacecraft travelling to Mars",
    earthDelay: { text: "Up to 20 min one way", sourceId: "nasa-hazard-distance" },
    sourceIds: ["nasa-hazard-distance"],
    keywords: ["mars", "mars transit", "deep space", "transit", "interplanetary"],
  },
];

export const DEFAULT_MISSION_MODE = "mars";
