# ATHENA

Autonomous Telecommunications and Health Evaluation Network for Astronauts

## Overview

ATHENA is a health monitoring and decision-support platform
designed for astronauts on long-duration space missions.

The system enables astronauts to monitor health metrics,
detect emerging risks, understand long-term trends,
and receive guidance even when communication with Earth
is delayed.

---

## Why ATHENA?

Future missions to Mars may experience communication
delays of up to 40 minutes.

Astronauts must therefore be capable of evaluating
their own health and responding to issues without
immediate support from Earth.

ATHENA provides:

- Continuous health monitoring
- Personalized baselines
- Explainable alerts
- Treatment recommendations
- Mission-specific health guidance

---

## Features

### Personal Health Baselines

Each astronaut is evaluated against their own
historical health data rather than generic thresholds.

### Trend Detection

Detects:

- Sleep deficits
- Vital sign drift
- Radiation exposure trends

### Explainable Alerts

Every alert includes:

- Trigger reason
- Contributing factors
- Recommended actions

### Mission Modes

ISS

Lunar Gateway

Mars Transit

### Earth Link

Visualizes communication delays between astronaut crews
and Earth-based mission control.

### Scenario Lab

Simulate:

- Radiation exposure
- Fatigue
- Sleep deprivation
- Hypoxia
- Multi-factor health events

### "Why this alert?" Explanations

Rule-based answers, available offline, to questions such as:

"What caused this warning?"

"Am I fit for EVA tomorrow?"

"What factors are affecting my health score?"

Every answer cites its NASA source.

### Works Offline

ATHENA is an offline-first Progressive Web App. After the first load it runs
with no internet connection, as it would onboard a spacecraft.

---

## Technology

App:
- Next.js (JavaScript, static export) as an offline-first PWA
- TailwindCSS
- ShadCN

Database:
- SQLite in the browser (sql.js), saved to IndexedDB

Analytics:
- Rules engine with cited sources
- Personal rolling baselines and z-score trend detection

No backend server and no internet connection needed at runtime.

---

## NASA Data and Credits

ATHENA's link from each hazard to its risks, body systems and indicators is built
from the NASA Human Research Program's official resources, including the
[5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) and
[Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/). Partner context
comes from the [Canadian Space Agency](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp).
The full list is in [`docs/SOURCES.md`](docs/SOURCES.md).

Numeric thresholds are general clinical reference ranges, not NASA flight
standards. Astronaut data in the app is simulated.

---

## Disclaimer

ATHENA is a hackathon prototype and **not medical advice**. Thresholds are
illustrative and would need validation by flight surgeons before any real use.

---

## AI Usage Disclosure

AI-generated code was used to speed up the development process.

---

## For contributors and AI agents

Start with [`context.md`](context.md) (the official event brief) and [`judging.md`](judging.md) (the submission and judging guide), then follow the workflow in [`AGENTS.md`](AGENTS.md).
