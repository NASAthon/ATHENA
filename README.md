# ATHENA

Autonomous Telecommunications and Health Evaluation Network for Astronauts

## Overview

ATHENA is a health monitoring and decision-support platform
designed for astronauts on long-duration space missions.

The system enables astronauts to monitor health metrics,
detect emerging risks, understand long-term trends,
and receive guidance even when communication with Earth
is delayed.

**What makes ATHENA different:** it catches the slow decline that fixed
thresholds miss, it's built for astronauts who aren't doctors, and it works
fully offline.

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
- Emergency guidance, including for a crewmate
- Plain-language measurement guides (astronauts are not doctors)
- Mission-specific health guidance

Beyond space, the same approach could support healthcare in remote communities
with limited access to health services.

---

## Features

### Health Score

Each astronaut has a health score from 0 to 100 (100 = perfect), shown on a
dark mission dashboard with clear status icons, so drops in vitals stand out
at a glance.

### Emergency Guidance

Step-by-step offline guidance for acute events, such as a crewmate with chest
pain who collapses mid-transit. It shows when the crew can act and when to
contact flight surgeons, accounting for the Earth communication delay.

### Measurement Guides

For every indicator: how to take it in flight, why it matters (linked to the
NASA hazard or risk), and what to do if the value is abnormal.

### Personal Health Baselines

Each astronaut is evaluated against their own fixed
pre-flight and in-flight baselines rather than generic thresholds,
so slow decline over weeks is caught.

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

### Designed for Every Astronaut

Astronauts aren't doctors, and they may be tired, stressed or wearing gloves.
ATHENA is built for different levels of knowledge and different abilities:
- Plain English, with a quick summary first and full detail on tap
- Search that understands typos, everyday words and symptoms (MiniSearch, MIT licence)
- Status shown with colour **plus** icons and labels (colour-blind friendly)
- Large text and large buttons, high contrast, keyboard and screen-reader support

### Reaction Test

A quick daily reaction-time test (median, lapses and false starts) to spot
fatigue and sleep loss, compared with the astronaut's own baseline.

### Mission Calendar and Flight-Surgeon Summary

Shows which periodic exams are due, plus a one-page summary to send to flight
surgeons, with the expected reply time given the Earth communication delay.

### Adaptive Search

One search bar for everything: indicators, measurement guides, emergency
guides and body parts. It still finds the right thing when the term is
misspelt or worded differently. For example, "hart rate", "pulse" or
"heartbeat" all find Heart Rate, and "can't breathe" finds the
low-oxygen guidance. Works fully offline.

### Measurement Reminders

Prompts the crew to take scheduled measurements as part of the mission routine.

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
[Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/). The challenge was authored by the Brazilian Space Agency (AEB). Partner context
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

## Team

**NASAthon**, competing at HackAthlone (NASA Space Apps Challenge 2026)

- Chidozie Onyejelem
- Isaac Adeniji
- Mercy Olasehinde
- Izabela Heczková

---

## How to Run

Requires Node.js 20 or newer (tested on Node 24).

```bash
npm install
npm run dev
```

Open http://localhost:3000. For the offline production build, run `npm run build`
(static files are written to `out/`), then serve them with e.g. `npx serve out`.

---

## For contributors and AI agents

Start with [`AGENTS.md`](AGENTS.md) (the workflow). It points to [`context.md`](context.md) (the official event brief), [`CHECKLIST.md`](CHECKLIST.md) (what to build), [`judging.md`](judging.md) (submission and judging) and [`DECISIONS.md`](DECISIONS.md).
