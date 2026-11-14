# ATHENA

Autonomous Telecommunications and Health Evaluation Network for Astronauts

## Live Demo

**[https://nasathon.github.io/ATHENA/](https://nasathon.github.io/ATHENA/)**

## Team

**NASAthon**

- Chidozie Onyejelem
- Isaac Adeniji
- Mercy Olasehinde
- Izabela Heczková

## Overview

ATHENA is a health monitoring and decision-support platform
designed for astronauts on long-duration space missions.

The system enables astronauts to monitor health metrics,
detect emerging risks, understand long-term trends,
and receive guidance even when communication with Earth
is delayed.

**What makes ATHENA different:** it catches the slow decline that generic
one-size-fits-all thresholds miss, it's built for astronauts who aren't doctors, and it works
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
- Personalised baselines
- Explainable alerts
- Recommended actions (no diagnoses or medication instructions)
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

#### Drift detection: a design choice

Each day, ATHENA compares the last 7 days' average of each indicator with the
astronaut's own fixed in-flight baseline (mission days 21–35):

    z = (7-day average − baseline mean) ÷ (s × √(1/n + 1/m))

where `n` is the number of readings in the last 7 days (at least 4), `m` the number
in the baseline, and `s` the baseline's day-to-day spread (never below a minimum set
per indicator). An indicator is **drifting when z ≥ 3.5** in its worrying direction.

**The 3.5 cut-off is our design choice, not a clinical standard.** We chose it by
simulation: with our logic engine, 100 healthy 180-day missions gave 1 false alert,
while all 100 slowly declining missions were caught (median alert on day 101,
decline starting day 75). Real data is noisier, so real false-alarm rates would be
higher. Details: `docs/DECISIONS.md` › Drift Cut-off. Code: `src/lib/engine/`.

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

The Flight-Surgeon Summary can queue an immutable report snapshot, simulate its trip to Earth,
and return a clearly labelled simulated acknowledgement after the same one-way delay. A persistent
clock supports real-time, 60× and 720× demo speeds; message history remains on the device and is
kept separately for each astronaut. It shows changes since the preceding report and combines
alerts, red limits, recovery and communications in an incident timeline. No message is actually
transmitted.

Mission data can be exported and atomically restored as a validated offline SQLite backup from
the Crew page. Invalid backups leave the current database unchanged.

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

Every answer cites its source: NASA pages, or clinical guidelines for thresholds.

### Works Offline

ATHENA is an offline-first web app that runs on the laptop itself. It runs
with no internet connection, as it would onboard a spacecraft.

---

## Technology

App:
- Next.js (JavaScript, static export), run on the laptop and fully offline
- TailwindCSS
- ShadCN

Database:
- SQLite in the browser (sql.js), saved to IndexedDB

Search:
- MiniSearch (offline fuzzy search)

Analytics:
- Rules engine with cited sources
- Fixed personal baselines and z-score drift detection (z ≥ 3.5, a design choice)
- Logic engine in plain JavaScript (`src/lib/engine/`), reading all thresholds from `src/data/`; tested with `npm test`

No backend server and no internet connection needed at runtime.

---

## Sources and References

ATHENA's link from each hazard to its risks, body systems and indicators is built
from the NASA Human Research Program's official resources, including the
[5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) and
[Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/).

The complete NASA and clinical reference list is in
[`docs/SOURCES.md`](docs/SOURCES.md). Open-source package licences are recorded in
[`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md).

Numeric thresholds are general clinical reference ranges, not NASA flight
standards. Astronaut data in the app is simulated.

---

## Disclaimer

ATHENA is a hackathon prototype and **not medical advice**. Thresholds are
illustrative and would need validation by flight surgeons before any real use.

---

## AI Usage Disclosure

The ATHENA concept is the team's own. AI coding assistants were used to speed up
implementation, testing, research checks and documentation. ATHENA itself does not use AI;
health evaluations come from its deterministic rules engine. The full dated disclosure is in
[`docs/AI_USAGE.md`](docs/AI_USAGE.md).

---

## How to Run

### Hosted evaluation copy

Open the hosted evaluation copy without installing packages:

**[https://nasathon.github.io/ATHENA/](https://nasathon.github.io/ATHENA/)**

This is a convenience copy: it has no backend, and its simulated mission data stays in that
browser's IndexedDB. Internet is needed for the initial hosted page load.

### Local offline version

Requires Node.js 20 or newer (tested on Node 24).

```bash
npm install
npm run dev
```

Open http://localhost:3000. For the offline production build, run `npm run build`
(static files are written to `out/`), then serve them with e.g. `npx serve out`.
