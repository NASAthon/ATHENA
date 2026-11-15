# ATHENA

Autonomous Telecommunications and Health Evaluation Network for Astronauts

**Live demo: [https://nasathon.github.io/ATHENA/](https://nasathon.github.io/ATHENA/)**

Built in 48 hours by team **NASAthon** at HackAthlone (Athlone, Ireland) for the
2026 NASA International Space Apps Challenge, healthcare challenge
*"Create Health Monitoring Software for Astronauts on Space Missions"*
(challenge author: the Brazilian Space Agency, AEB).

## Team

- Chidozie Onyejelem
- Isaac Adeniji
- Mercy Olasehinde
- Izabela Heczková

---

## Overview

ATHENA is an offline health monitoring and decision-support app for astronauts on
long-duration missions. It helps each astronaut understand their own health, spot slow
changes early, and know what to do in an emergency, even when Earth is too far away to
answer in time.

**What makes ATHENA different:**

1. **It catches the slow decline that one-size-fits-all thresholds miss.** Each astronaut is
   compared with their own fixed baseline, not with population ranges.
2. **It's built for astronauts who aren't doctors.** Plain English, one step at a time, and
   no medicines or diagnoses: it tells the crew what to do and when to involve the flight surgeon.
3. **It works fully offline.** Everything runs on the laptop, with no server and no internet.

### Why it matters

Messages between Mars and Earth can take up to 20 minutes each way, so a reply can take
about 40 minutes ([NASA HRP: Distance from Earth](https://www.nasa.gov/hrp/hazard-distance-from-earth/)).
Crews must be able to assess their own health and respond without waiting for the ground.

NASA's current tools ([Tempus Pro](https://www.nasa.gov/reference/tempus-pro/),
[ARCHeR](https://www.nasa.gov/reference/archer/),
[Spaceflight Standard Measures](https://www.nasa.gov/reference/standard-measures/)) mostly
collect data for researchers and the ground, or support a trained crew medical officer.
ATHENA complements them by giving every astronaut a plain-English view of their own health:
what is changing, why it matters in space, and what to do next.

The same approach could support healthcare in remote communities on Earth with limited
access to doctors.

---

## Features

| Screen | What it does |
|---|---|
| **Today** | Health score (0–100), today's values, alerts with a "Why this alert?" explanation, the likely NASA hazard behind a drift, and measurement reminders |
| **Live Monitor** | Simulated always-on sensor feed (heart rate, blood pressure, SpO₂, breathing, temperature) with bedside-monitor style waveforms and live rules; readings are always labelled simulated |
| **Reaction test** | A daily reaction-time test (median, lapses, false starts) to spot fatigue and sleep loss, compared with the astronaut's own baseline |
| **Trends** | Charts of each indicator against the astronaut's own normal band, with drifting periods highlighted and a comparison with general ranges |
| **Body** | A 2D body map linking 8 regions to all 17 NASA risks and 5 hazards, coloured by the astronaut's current status |
| **Calendar** | Which periodic exams are due on each mission day |
| **Summary** | A one-page flight-surgeon report, a simulated "Send to Earth" with the real Earth-link delay, and an incident timeline |
| **Emergency** | Step-by-step first-response guides (13 guides, e.g. chest pain, collapse and CPR, stroke, hypoxia), usable for a crewmate, with vitals recording and read-aloud; steps adapt to the Earth delay (on Mars, no step waits for mission control) |
| **Scenario Lab** | Inject radiation, fatigue, sleep loss or hypoxia and watch the alerts react |
| **Crew** | All three crew at a glance, plus demo controls, data backup and restore |

Across the app:

- **Measurement guides** for every indicator: how to take it, why it matters in space, and what to do if it's abnormal.
- **Adaptive search** that handles typos, everyday words and symptoms ("hart rate", "pulse" and "can't breathe" all find the right guide).
- **Mission modes:** ISS, Lunar Gateway and Mars Transit change the Earth-link delay, hazard emphasis and advice.
- **Inclusive design:** status is shown with colour, icon *and* label (colour-blind safe), large glove-friendly
  tap targets, high contrast, keyboard and screen-reader support, and reduced motion.

### The demo crew (simulated)

| Astronaut | Story |
|---|---|
| Commander Rivera | Slow decline in sleep, reaction time and mood from about week 12: caught by drift detection |
| Pilot Singh | Stays healthy: shows ATHENA doesn't raise false alarms |
| Engineer Nakamura | A sudden event: red-limit alert and crewmate emergency guidance |

---

## How it works

### Personal baselines and drift detection

Each astronaut has two fixed baselines: pre-flight, and in-flight (mission days 21–35, after
early adaptation). Each day, ATHENA compares the last 7 days' average of each indicator with
the in-flight baseline:

    z = (7-day average − baseline mean) ÷ (s × √(1/n + 1/m))

where `n` is the number of readings in the last 7 days (at least 4), `m` the number in the
baseline, and `s` the baseline's day-to-day spread (never below a minimum set per indicator).
An indicator is **drifting when z ≥ 3.5** in its worrying direction. One drifting indicator
is a note, two or more is an alert, and no recovery after 14 more days means telling the
crew and the ground.

**The 3.5 cut-off is our design choice, not a clinical standard.** We chose it by simulation:
100 healthy 180-day missions gave 1 false alert, while all 100 slowly declining missions were
caught (median alert on day 101, decline starting day 75). Real data is noisier, so real
false-alarm rates would be higher. Details: [`docs/DECISIONS.md`](docs/DECISIONS.md) › Drift Cut-off.

### Red limits

Separately from drift, every new reading is checked against fixed red limits (general clinical
reference ranges from the CDC, ADA and AHA). A dangerous reading raises an alert straight away
and opens the matching emergency guide.

---

## NASA and partner data

### NASA data and resources

| Resource | How ATHENA uses it |
|---|---|
| [NASA HRP: 5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) (and the 5 hazard pages) | The hazards behind every alert, emergency guide and body region |
| [NASA HRP: Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/) (all 17 risk pages) | Mapped to 8 body regions and the indicators that track them ([`docs/BODY_MAP.md`](docs/BODY_MAP.md)); facts such as bone loss of 1–1.5% a month and the exercise countermeasure |
| [NASA HRP: Distance from Earth](https://www.nasa.gov/hrp/hazard-distance-from-earth/) | Mars Transit Earth-link delay (up to 20 minutes each way), which shapes the emergency steps |
| [NASA: Data Rate Increase on the ISS](https://www.nasa.gov/feature/goddard/2019/data-rate-increase-on-the-international-space-station-supports-future-exploration) | ISS Earth-link delay (under 1 second) |
| [NASA/TM-20250003885: Communication Delay Research](https://ntrs.nasa.gov/citations/20250003885) | Lunar Gateway Earth-link delay (3–14 s one way) |
| [Tempus Pro](https://www.nasa.gov/reference/tempus-pro/), [ARCHeR](https://www.nasa.gov/reference/archer/), [Spaceflight Standard Measures](https://www.nasa.gov/reference/standard-measures/) | Existing NASA tools, used to define the gap ATHENA fills |

### Space agency partners

| Resource | How ATHENA uses it |
|---|---|
| [Challenge video](https://www.youtube.com/watch?v=RERG3gEmdC8) (Brazilian Space Agency, AEB) | Challenge requirements: emergency guidance for a crewmate, a measurement guide for every indicator, reminders |
| [CSA: Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp) | Context for radiation dose monitoring |

### Clinical references

The NASA pages are qualitative and give no numeric thresholds, so numbers come from general
clinical reference ranges (CDC, American Diabetes Association) and emergency steps from CDC and
American Heart Association guidance, written in our own words and cited per indicator in
[`docs/SOURCES.md`](docs/SOURCES.md). They are **not NASA flight standards**.

All astronaut data and the live sensor feed are **simulated** and labelled as such in the app.

---

## Technology

- **App:** Next.js 16 (JavaScript, static export), Tailwind CSS, shadcn/ui, Lucide icons
- **Database:** SQLite in the browser (sql.js), saved to IndexedDB; validated backup and restore
- **Search:** MiniSearch (offline fuzzy search)
- **Logic:** a deterministic rules engine in plain JavaScript (`src/lib/engine/`) that reads every
  threshold from `src/data/`; covered by 173 automated tests
- **Charts and body map:** plain SVG, no chart library

No backend server and no internet connection at runtime. ATHENA itself contains no AI.

### Project layout

| Path | Contents |
|---|---|
| `src/app/` | Pages (one folder per screen) |
| `src/components/` | Shared UI and providers |
| `src/lib/engine/` | All health logic (baselines, drift, alerts, red limits, health score, search), with tests |
| `src/lib/sim/`, `src/lib/live/` | Seeded mission simulator and the simulated live sensor feed |
| `src/lib/db/` | sql.js database and IndexedDB persistence |
| `src/data/` | All health content: hazards, risks, regions, indicators, emergencies, symptoms, exams, sources |
| `docs/` | Decisions, sources, body map and AI usage log |

---

## Try it

Open **[https://nasathon.github.io/ATHENA/](https://nasathon.github.io/ATHENA/)** in a desktop
browser. No login or install is needed. The demo mission loads automatically; **Crew › Load demo
mission** restarts it. Simulated mission data is stored only in your browser.

On a spacecraft, the same static build runs from the crew laptop with no internet connection.

---

## Limits

- ATHENA is a hackathon prototype and **not medical advice** or a diagnostic tool.
- All crew data is simulated; the live waveforms are illustrative, not real ECGs.
- Thresholds are general clinical reference ranges and the drift cut-off is a design choice;
  both would need validation by flight surgeons before any real use.
- Lunar surface base mode is out of scope.

---

## Sources, licences and AI use

- **Sources:** every NASA, partner and clinical source is listed in [`docs/SOURCES.md`](docs/SOURCES.md).
  The app itself shows no web links, because astronauts can't open web pages in flight.
- **Licences:** all packages are open source; full texts in [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md).
  No NASA logos are used, and no NASA endorsement is implied.
- **Use of AI (SI):** the ATHENA concept is the team's own; AI did not generate the idea.
  AI coding assistants (Claude Code by Anthropic, OpenAI Codex and other AI chat assistants) helped
  write, test and review the code, check the NASA and clinical pages we cite, test the drift
  cut-off on simulated data, and edit the documentation and plain-English health text. Every
  AI-assisted change was reviewed by the team, and every health fact is traced to a cited source.
  ATHENA itself contains no AI or machine learning. No AI-generated images, video or audio are
  included in this repository or the app. The dated, per-file log is in
  [`docs/AI_USAGE.md`](docs/AI_USAGE.md).
- **Design decisions:** [`docs/DECISIONS.md`](docs/DECISIONS.md) records every choice and why.
