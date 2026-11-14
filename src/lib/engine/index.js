// ATHENA logic engine (docs/CHECKLIST.md › 2. Logic): one import for the app.
// import { calculateMissionBaselines, evaluateMission } from "@/lib/engine";
//
// Everything here is plain JavaScript with no React, DOM, database or network use,
// so it runs offline in the browser. Search imports MiniSearch, the only dependency.

export * from "./indicators.js";
export * from "./baseline.js";
export * from "./average.js";
export * from "./drift.js";
export * from "./status.js";
export * from "./alerts.js";
export * from "./redLimits.js";
export * from "./healthScore.js";
export * from "./reaction.js";
export * from "./reminders.js";
export * from "./evaluate.js";
export * from "./search.js";
export * from "./regions.js";
export * from "./summary.js";
export * from "./calendar.js";
export * from "./scenarios.js";
export * from "./missionMode.js";
export * from "./hazards.js";
