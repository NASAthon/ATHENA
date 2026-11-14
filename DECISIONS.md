# Decision Log

## Frontend

Next.js (JavaScript, static export) as an offline-first PWA, with Tailwind and ShadCN.

Reason:
Fast development. A service worker caches the app, so after the first load
it runs with no internet, as it would onboard a spacecraft.

Status:
LOCKED

---

## Backend

None. Everything runs in the browser.

Reason:
ATHENA is a single-device onboard app. The browser can store readings and run
the rules at our scale (3 astronauts). One JavaScript codebase is faster to build.

Status:
LOCKED

---

## Body Visualisation

2D SVG

Reason:
Faster than Three.js

Status:
LOCKED

---

## Data Sources

Use only the official resources listed in `context.md` Section 7.
Do not use the extra sources in Section 9 for now.
Exception: general clinical reference ranges for thresholds (see Thresholds).

Reason:
Team decision to stay within the data we were given.

Status:
ACTIVE (revisit only if the team agrees)


---

## Database

SQLite in the browser via sql.js (WASM), saved to IndexedDB.

Reason:
Must work offline. It's embedded, needs no server and survives reloads.
Seed 3 simulated astronauts on first run, with a "reset demo" button.

Status:
LOCKED

---

## AI / Analytics

- Rule-based "Why this alert?" panels and a short FAQ ("Am I fit for EVA?"),
  answered from the rules engine with source URLs. Works fully offline.
- Anomaly and trend detection: rolling personal baseline plus a z-score/drift
  check in JavaScript.

Status:
LOCKED

---

## Hosting and Demo

- **No hosting.** We won't deploy the app anywhere, so we can focus on building
  a good app. The public GitHub repo is the official "final project" link.
- The README must keep clear "How to run" steps so judges can run it locally.
- Demo on localhost: `npm run build`, serve the static output, then install as a PWA.
- 30-second video "offline moment": turn Wi-Fi off on camera, reload, and trigger
  a Scenario Lab event. The alert still fires.
- README screenshots go in `docs/screenshots/`.

Status:
LOCKED


---

## Thresholds

Numeric watch/act/contact-surgeon bands use general, widely published clinical
reference ranges, labelled "general clinical reference range" in the UI and
cited in `docs/SOURCES.md`. NASA pages give the qualitative link from each
hazard to its risks, body systems and indicators, with source URLs.

Reason:
The official NASA resources contain no numeric thresholds. This is the only
exception to "official sources only".

Status:
LOCKED

---

## Indicators

Core (official challenge text): heart rate, blood pressure, blood glucose,
body temperature, sleep hours, mood.
Extra: HRV, SpO₂, respiration rate, activity level, radiation dose.

Reason:
Judges score Relevance against the challenge text, so the core six come first.

Status:
LOCKED

---

## File Naming

The decision log is `DECISIONS.md` (renamed from the misspelt `DECISONS.md`).
`CLAUDE.md` only imports `AGENTS.md`, and all workflow rules live in `AGENTS.md`.

Status:
LOCKED
