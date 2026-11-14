# ATHENA build checklist

The single list of **what to build and what to hand in**. Update it in the same PR as the work.

**Legend:**
- `- [ ]` = not started
- `- [ ] 🟡 Partial (PR #n): done…; still to do: …` = partly done, including overlap from another task
- `- [x] … (PR #n)` = done and working

Full rules: `AGENTS.md` › Before finishing a task.
Order within each section is the build order. **M** = must have, **S** = should have (cut from the bottom if time runs short).
The rules for *how* to build are in `AGENTS.md`, and the reasons behind the choices are in `docs/DECISIONS.md`.

---

## 1. Data and storage

- [ ] **M** Daily record defined: date, mission day, heart rate, blood pressure (two numbers), blood sugar, temperature, sleep hours, mood (1–5), reaction median, lapses, false starts, exercise minutes, symptoms, SpO2 (optional), radiation dose (optional) 🟡 Partial (PR #10): the engine assumes camelCase field names (`RECORD_FIELDS` in `src/lib/engine/indicators.js`); still to do: team confirms them, adds the date field and the database table
- [ ] **M** Units chosen and shown everywhere (mg/dL or mmol/L, °C) 🟡 Partial (PR #7): units chosen in `src/data/indicators.js` (bpm, mmHg, mg/dL, °C, hours, 1–5, ms, minutes, %, mSv); still to do: show them on every screen
- [ ] **M** Save and load daily records in the browser: SQLite via sql.js, saved to IndexedDB after every write, with the `.wasm` file bundled locally (`docs/DECISIONS.md` › Database) 🟡 Partial (PR #14): `saveDailyRecord`/`loadDailyRecords` in `src/lib/db/` (sql.js loaded from `public/`, IndexedDB after every write, tested); still to do: the daily check form calls it
- [x] **M** Save and load the two baselines (`saveBaseline`/`loadMissionBaselines`/`ensureMissionBaselines` in `src/lib/db/database.js`) (PR #14)
- [ ] **M** Mission simulator: 180 days for 3 crew (`docs/DECISIONS.md` › Crew):
  - **Commander Rivera:** pre-flight days, early adaptation, a settled period, then slow decline in sleep, reaction and mood from about week 12 (drift alert)
  - **Pilot Singh:** stays healthy (shows no false alarm)
  - **Engineer Nakamura:** a sudden event (red-limit screen and crewmate emergency guidance, e.g. chest pain)
- [ ] **M** Simulator adds realistic day-to-day noise and one or two harmless bad days
- [ ] **M** "Load demo mission" and "Reset data" buttons work
- [x] **M** Every indicator, guide and emergency entry has a `keywords` list (synonyms, plain-English terms, symptoms, common misspellings) for search (PR #7)
- [ ] **S** Store periodic exam results and the check-in streak

---

## 2. Logic (plain functions with no screen code)

- [x] **M** Baseline calculator: mean and standard deviation per indicator for a fixed window (`src/lib/engine/baseline.js`) (PR #10)
- [x] **M** Pre-flight baseline and in-flight baseline (for example mission days 21–35) both calculated once and stored (calculated by `calculateMissionBaselines`, PR #10; stored once by `ensureMissionBaselines`, PR #14)
- [x] **M** Seven-day average per indicator (`src/lib/engine/average.js`) (PR #10)
- [x] **M** Health score 0–100 per astronaut (100 = perfect), with the change since yesterday and over 7 days (`docs/DECISIONS.md` › Health Score) (`src/lib/engine/healthScore.js`) (PR #10)
- [x] **M** Z-score of the seven-day average against the in-flight baseline (`src/lib/engine/drift.js`) (PR #10)
- [x] **M** Status per indicator: no data, steady, drifting, expected adaptation (`src/lib/engine/status.js; "expected adaptation" defined in DECISIONS › Logic Engine Assumptions`) (PR #10)
- [x] **M** Drift cut-off of **z = 3.5** (`docs/DECISIONS.md` › Drift Cut-off) written in the README as a design choice (`README › Drift detection`) (PR #10)
- [x] **M** Alert level: 1 drifting = note, 2 or more = alert, no recovery after 14 more days = tell crew and ground (linked indicators count once; `docs/DECISIONS.md` › Drift Cut-off) (`src/lib/engine/alerts.js`) (PR #10)
- [x] **M** Red-limit check on every new reading, independent of baselines (`src/lib/engine/redLimits.js, reading the bands in src/data/indicators.js`) (PR #10)
- [x] **M** Red limits taken from a published source and cited (general clinical reference ranges, `docs/DECISIONS.md` › Thresholds) (PR #7; heart rate and SpO₂ use personal baselines by design)
- [x] **M** Reaction scoring: median, lapses over 500 ms, false starts (`src/lib/engine/reaction.js`) (PR #10)
- [x] **M** Handles missing days without crashing or false alerts (`all of src/lib/engine; tested in evaluate.test.js`) (PR #10)
- [x] **M** Search index: offline fuzzy search over all content (typos, prefixes, synonyms, symptoms; `docs/DECISIONS.md` › Search). Library: **MiniSearch** (MIT) (`src/lib/engine/search.js over everything in src/data`) (PR #10)
- [x] **M** Reminder scheduler: which measurements are due today (`src/lib/engine/reminders.js`) (PR #10)
- [x] **M** Region mapper: indicator-to-body-region table and worst-status function (table: `src/data/regions.js`; worst-status function: `src/lib/engine/regions.js`; UI version with recent-symptom layer: `src/lib/regionStatus.js`) (PR #7, PR #9, PR #10)
- [x] **S** Calendar scheduler: which periodic exams are due on a given mission day (`src/lib/engine/calendar.js, exams from src/data/exams.js`) (PR #10)
- [x] **S** Summary builder for the flight-surgeon report (`src/lib/engine/summary.js; Earth delay passed in`) (PR #10)
- [ ] **S** Mission mode changes which hazards and advice are shown (ISS, Lunar Gateway, Mars Transit; no Lunar Surface Base) 🟡 Partial (PR #8): mission mode switch and sourced Earth-link delay in the header; still to do: change hazards and advice per mode
- [ ] **S** Scenario Lab: inject radiation, fatigue, sleep loss or hypoxia into the data and watch the alerts react 🟡 Partial (PR #10): injection in `src/lib/engine/scenarios.js` (demo effect sizes); still to do: the screen (§3)

---

## 3. Frontend

### Layout

- [x] **M** Navigation: Today, Trends, Body, Calendar, Summary (PR #6)
- [ ] **M** Search bar and an **Emergency** button on every screen 🟡 Partial (PR #6): both shown on every screen; still to do: search logic and results (section 3 › Search) and the Emergency screen content
- [ ] **M** Crew switcher, with the mission day and astronaut name always visible 🟡 Partial (PR #6, PR #9): switcher for all 3 crew, shared with every page (`CrewProvider`); still to do: real mission day from the simulator
- [ ] **M** Alert banner area at the top of every screen
- [x] **M** Dark theme dashboard (`docs/DECISIONS.md` › Design) (PR #4, PR #6)
- [ ] **M** Health score (0–100) shown prominently per astronaut, with a status icon and drop indicator
- [ ] **M** One colour scheme for status, used everywhere, always colour **plus** icon **plus** text label 🟡 Partial (PR #9): status tokens `--status-*` in `globals.css`, used with icon and label on the body map; still to do: alerts, Today and Trends
- [ ] **M** Readable on a laptop and a tablet

### Inclusive design (`docs/DECISIONS.md` › Inclusive Design)

- [ ] **M** Colour-blind-safe palette, text contrast at least 4.5:1 🟡 Partial (PR #8, PR #9): palette and status colours checked (text 5.8–17:1, form borders 3.5–3.9:1); still to do: chart colours (colour-blind check)
- [ ] **M** Tap targets at least 44×44 px (usable with gloves); large text 🟡 Partial (PR #6, PR #8, PR #9): header, navigation, daily check and body page done; still to do: other screens
- [ ] **M** Full keyboard navigation and screen-reader labels (including the body figure) 🟡 Partial (PR #6, PR #8, PR #9): header, nav, crew switcher, mission mode, daily check and body figure (region list, one SVG summary) done; still to do: other screens
- [ ] **M** Respects "reduce motion"; no information shown only through animation
- [ ] **M** Health text in plain English: glance summary plus "Learn more" layer, medical terms explained in brackets 🟡 Partial (PR #8, PR #9): daily check side panel and body region cards (glance plus Learn more, sources, NASA states/interpretation tags) read from `src/data`; still to do: alerts and emergency screens (`docs/DECISIONS.md` › Content Style)

### Daily check

- [x] **M** Form for the six brief indicators, with units and sensible input limits (PR #8)
- [x] **M** "How to measure" help beside each field (how to take it, why it matters, what to do if abnormal) (PR #8)
- [x] **M** Mood as five large buttons, not a text box (PR #8)
- [x] **M** Symptom tick boxes and exercise minutes (PR #8; red-flag symptoms link to their emergency guide)
- [ ] **M** Save confirmation and today's result shown straight away 🟡 Partial (PR #8, PR #13): confirmation plus "Today's result" from the engine's red-limit check (label, action, source, emergency link); still to do: store the record (data layer)
- [ ] **M** Reminders: shows which measurements are still due today

### Reaction test

- [ ] **M** Start screen with one-line instructions
- [ ] **M** Random wait of 2–5 seconds, signal, running millisecond counter
- [ ] **M** Works with tap, click and space bar
- [ ] **M** False start handled with "too early"
- [ ] **M** Results screen: median, lapses, comparison with own baseline
- [ ] **S** Guest mode so a judge can try it without changing the crew's data

### Trends

- [ ] **M** One chart per indicator across the mission (chart library to be chosen later; must be open-licensed)
- [ ] **M** Shaded bands for pre-flight normal and in-flight normal
- [ ] **M** Drifting periods visibly marked
- [ ] **M** Side-by-side view: ATHENA status against a generic-threshold status (the "stays green" comparison)
- [ ] **M** Day slider or fast-forward to move through the mission

### Search

- [ ] **M** Results as you type; finds content despite typos, everyday words and symptoms
- [ ] **M** No match: "Did you mean…?", closest results and the emergency shortcut, never a dead end
- [ ] **M** Symptom-like queries (e.g. "chest pain") show emergency guidance first

### Alerts and guidance

- [ ] **M** Alert card: what is drifting, since when, likely hazard, what to do, when to tell the ground ("Why this alert?")
- [ ] **M** Red-limit and emergency screen: numbered first-response steps with a short "why" each, one step at a time with big controls
- [ ] **M** Emergency guidance works for **a crewmate** (pick the affected astronaut, follow steps, record vitals)
- [ ] **S** Voice reads the first-response steps aloud 🟡 Partial (PR #8): "Read these steps aloud" on the daily check; still to do: emergency steps

### Body figure (2D SVG; regions in `docs/BODY_MAP.md` and `src/data/regions.js`). Required: the brief asks for a clickable body figure

- [x] **M** Outline with the eight clickable regions from `docs/BODY_MAP.md` (PR #9)
- [ ] **M** Region colour (plus icon and label) from the region mapper 🟡 Partial (PR #9): status colour, icon and label per region, per crew member against their own baseline; still to do: real data from the logic engine instead of the simulated sample
- [x] **M** Card on click: function, status, risk, hazard, advice, "last checked" date (PR #9; text from `src/data/regions.js`)
- [x] **S** Fallback: region tiles if the drawing takes too long (PR #9: the accessible region list beside the figure)

### Calendar, summary, extras

- [ ] **S** Mission calendar listing due and completed periodic exams
- [ ] **S** One-page flight-surgeon summary, with "reply expected in about N minutes" (Earth Link delay)
- [ ] **S** Earth Link: shows the current communication delay for the mission mode 🟡 Partial (PR #8): header pill shows the sourced delay (Mars: up to 20 min one way); still to do: use it in the summary
- [x] **S** Mission mode switch: ISS, Lunar Gateway, Mars Transit (PR #8; modes in `src/data/missionModes.js`)
- [ ] **S** Check-in streak

---

## 4. Content and research

- [x] **M** Open the NASA HRP pages for **all 5 hazards and all 17 risks**; note key points with links (PR #7; `docs/BODY_MAP.md`, `src/data/risks.js`)
- [x] **M** NASA data map: hazard → risk → body system → indicator → countermeasure, each entry with its source URL (PR #7; `src/data/`)
- [x] **M** Guidance card text for each indicator, answering the brief's five questions: can it be measured in space, why it matters, how hazards affect it, when to escalate, what action helps (PR #7; `briefAnswers` in `src/data/indicators.js`)
- [x] **M** "How to measure" steps for each indicator, in plain English (PR #7)
- [x] **M** Emergency guide text in plain English (NASA steps first, otherwise AHA or CDC in our own words, each cited; `docs/DECISIONS.md` › Emergency Step Sources) covering the hazards (`docs/DECISIONS.md` › Data Map Coverage): chest pain/collapse first, then the rest (PR #7: all 13 guides ready: chest pain, collapse with CPR, stroke, low blood sugar, very high BP, hypothermia, decompression, hypoxia, radiation, head injury, severe bleeding, suspected broken bone, mental health crisis)
- [x] **M** Search keywords for every item (synonyms, symptoms, misspellings) (PR #7; checked by `npm run check:content`)
- [x] **M** Advice wording checked: modest, no diagnoses, no medication instructions (PR #7)
- [x] **M** Source list with links in `docs/SOURCES.md` (NASA HRP, NASA OSDR, Canadian Space Agency, clinical ranges, libraries) (PR #7)
- [ ] **M** Every resource used is open source, openly licensed or public domain, with no NASA logos (`docs/DECISIONS.md` › Licensing) 🟡 Partial (PR #7): all content and packages so far checked; still to do: re-check at submission
- [ ] **M** Every figure in the app or pitch traced to a source, or removed 🟡 Partial (PR #7): every number in `src/data` has a source or `basis: "design"`; still to do: the pitch and the final UI
- [x] **S** Write every region card from `docs/BODY_MAP.md` (verified 14 Nov; linked to its hazards and risks) (PR #7; `src/data/regions.js`)
- [ ] **S** List of periodic exams and how often 🟡 Partial (PR #7): 5 exams from NASA pages in `src/data/exams.js`; intervals are design choices because NASA doesn't state them
- [ ] **S** Short note on existing tools and what ATHENA adds

---

## 5. Offline

- [ ] **M** App loads and works with the network switched off
- [ ] **M** No fonts, scripts or data fetched from the internet at run time 🟡 Partial (PR #3, PR #4): system fonts only and sql.js engine served locally; still to do: re-check once all screens exist
- [ ] **M** Data survives closing and reopening the browser 🟡 Partial (PR #14): the database is saved to IndexedDB after every write and reloaded on open (tested); still to do: check in the browser once screens save data
- [ ] **S** Installable as an app (PWA) on a laptop or tablet

---

## 6. Testing

- [ ] **M** Fresh browser: load demo mission, Rivera's alert appears in the expected week
- [ ] **M** Healthy data (Singh) produces no alert and a stable, high health score 🟡 Partial (PR #10): passes on engine-level simulated missions (`evaluate.test.js`); still to do: re-run with the real mission simulator in the app
- [ ] **M** Health score drops as Rivera declines and when a red limit is hit 🟡 Partial (PR #10): passes at engine level (`evaluate.test.js`); still to do: check in the app
- [ ] **M** One bad day produces no alert 🟡 Partial (PR #10): passes at engine level (`evaluate.test.js`); still to do: check in the app
- [ ] **M** A dangerous reading (Nakamura) triggers the red-limit screen 🟡 Partial (PR #9, PR #10): red-limit check tested in `redLimits.test.js`; Nakamura's sample shows Red limit on the body map; still to do: the red-limit screen itself
- [ ] **M** Empty state (no data yet) looks sensible 🟡 Partial (PR #9, PR #10): engine returns `no_data` safely (`evaluate.test.js`) and the body map shows "No recent data"; still to do: check every screen
- [ ] **M** Reaction test run ten times in a row without breaking
- [ ] **M** Search finds the right item for misspellings ("hart rate"), synonyms ("pulse") and symptoms ("chest pain") 🟡 Partial (PR #10): passes on the real content (`search.test.js`); still to do: check in the search bar
- [ ] **M** Whole app usable by keyboard only; status readable in greyscale
- [ ] **M** Full demo rehearsed start to finish on the machine that will present it
- [ ] **M** Someone outside the team tries it without instructions

---

## 7. Demo, pitch and submission

Deadlines: **local submission closes 10:30 Sun 15 Nov**, local pitching starts **11:30** (3 min pitch + 2 min Q&A). The global portal closes 23:59. Full rules are in `docs/judging.md`.

### Demo and pitch

- [ ] **M** Live pitch demo script (the global 30-second video follows `docs/judging.md` 1D pacing instead):
  1. Hook: "Halfway to Mars, your crewmate collapses with chest pain."
  2. Problem (30 s)
  3. A judge takes the reaction test
  4. Fast-forward Rivera's mission to the drift alert, with "Why this alert?"
  5. Nakamura's red-limit response and crewmate emergency guidance
  6. Offline proof: Wi-Fi off on camera
  7. Close on the same tool for remote communities on Earth
- [ ] **M** Global demo: **30-second video** following the pacing in `docs/judging.md` 1D (intro and team, challenge, title and tagline, how it works with NASA data, future vision). Going over 30 s disqualifies the project from global judging
- [ ] **M** Local pitch: a **short presentation plus a live demo** of the app within 3 minutes (team name and members, challenge, NASA data, UI flow), with a recorded backup
- [ ] **M** Q&A prep: where thresholds and emergency steps come from, what's simulated, limits, future work
- [ ] **M** Laptop charger and screen adapter (HDMI or USB-C) for the venue

### Submission form (`docs/judging.md` Sections 1C and 1E)

- [ ] **M** Project name and high-level summary
- [ ] **M** Project description: what it does, how it works, benefits, tools and languages
- [ ] **M** NASA data section: at least one official NASA resource named
- [ ] **M** Partner data and references: all libraries, tools and partner (CSA, AEB) sources cited
- [ ] **M** AI use declared, and any AI-generated media watermarked (`docs/AI_USAGE.md`)
- [ ] **M** Limits stated: simulated data, untested thresholds, not a diagnostic tool or medical advice
- [ ] **M** Repo public with an up-to-date README, including "How to run" steps (no hosting)
- [ ] **M** Every link tested in an incognito window; the app runs from the README steps on another machine
- [ ] **M** Everything in English; no under-18 likeness anywhere
- [ ] **M** All 4 members confirmed at HackAthlone (none waitlisted)
- [ ] **M** Both confirmation boxes ticked, then **Submit for Judging**, aiming for at least one hour before the 10:30 deadline
