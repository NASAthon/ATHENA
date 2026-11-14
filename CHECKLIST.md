# ATHENA build checklist

The single list of **what to build and what to hand in**. Tick items as they're done and push the change.
Order within each section is the build order. **M** = must have, **S** = should have (cut from the bottom if time runs short).
The rules for *how* to build are in `AGENTS.md`, and the reasons behind the choices are in `DECISIONS.md`.

---

## 1. Data and storage

- [ ] **M** Daily record defined: date, mission day, heart rate, blood pressure (two numbers), blood sugar, temperature, sleep hours, mood (1–5), reaction median, lapses, false starts, exercise minutes, symptoms, SpO2 (optional), radiation dose (optional)
- [ ] **M** Units chosen and shown everywhere (mg/dL or mmol/L, °C)
- [ ] **M** Save and load daily records in the browser: SQLite via sql.js, saved to IndexedDB after every write, with the `.wasm` file bundled locally (`DECISIONS.md` › Database)
- [ ] **M** Save and load the two baselines
- [ ] **M** Mission simulator: 180 days for 3 crew (`DECISIONS.md` › Crew):
  - **Commander Rivera:** pre-flight days, early adaptation, a settled period, then slow decline in sleep, reaction and mood from about week 12 (drift alert)
  - **Pilot Singh:** stays healthy (shows no false alarm)
  - **Engineer Nakamura:** a sudden event (red-limit screen and crewmate emergency guidance, e.g. chest pain)
- [ ] **M** Simulator adds realistic day-to-day noise and one or two harmless bad days
- [ ] **M** "Load demo mission" and "Reset data" buttons work
- [ ] **M** Every indicator, guide and emergency entry has a `keywords` list (synonyms, plain-English terms, symptoms, common misspellings) for search
- [ ] **S** Store periodic exam results and the check-in streak

---

## 2. Logic (plain functions with no screen code)

- [ ] **M** Baseline calculator: mean and standard deviation per indicator for a fixed window
- [ ] **M** Pre-flight baseline and in-flight baseline (for example mission days 21–35) both calculated once and stored
- [ ] **M** Seven-day average per indicator
- [ ] **M** Health score 0–100 per astronaut (100 = perfect), with the change since yesterday and over 7 days (`DECISIONS.md` › Health Score)
- [ ] **M** Z-score of the seven-day average against the in-flight baseline
- [ ] **M** Status per indicator: no data, steady, drifting, expected adaptation
- [ ] **M** Drift cut-off of **z = 2** (`DECISIONS.md` › Drift Cut-off) written in the README as a design choice
- [ ] **M** Alert level: 1 drifting = note, 2 or more = alert, no recovery after 14 more days = tell crew and ground
- [ ] **M** Red-limit check on every new reading, independent of baselines
- [ ] **M** Red limits taken from a published source and cited (general clinical reference ranges, `DECISIONS.md` › Thresholds)
- [ ] **M** Reaction scoring: median, lapses over 500 ms, false starts
- [ ] **M** Handles missing days without crashing or false alerts
- [ ] **M** Search index: offline fuzzy search over all content (typos, prefixes, synonyms, symptoms; `DECISIONS.md` › Search). Library: **MiniSearch** (MIT)
- [ ] **M** Reminder scheduler: which measurements are due today
- [ ] **S** Region mapper: indicator-to-body-region table and worst-status function
- [ ] **S** Calendar scheduler: which periodic exams are due on a given mission day
- [ ] **S** Summary builder for the flight-surgeon report
- [ ] **S** Mission mode changes which hazards and advice are shown (ISS, Lunar Gateway, Mars Transit; no Lunar Surface Base)
- [ ] **S** Scenario Lab: inject radiation, fatigue, sleep loss or hypoxia into the data and watch the alerts react

---

## 3. Frontend

### Layout

- [ ] **M** Navigation: Today, Trends, Body, Calendar, Summary
- [ ] **M** Search bar and an **Emergency** button on every screen
- [ ] **M** Crew switcher, with the mission day and astronaut name always visible
- [ ] **M** Alert banner area at the top of every screen
- [ ] **M** Dark theme dashboard (`DECISIONS.md` › Design)
- [ ] **M** Health score (0–100) shown prominently per astronaut, with a status icon and drop indicator
- [ ] **M** One colour scheme for status, used everywhere, always colour **plus** icon **plus** text label
- [ ] **M** Readable on a laptop and a tablet

### Inclusive design (`DECISIONS.md` › Inclusive Design)

- [ ] **M** Colour-blind-safe palette, text contrast at least 4.5:1
- [ ] **M** Tap targets at least 44×44 px (usable with gloves); large text
- [ ] **M** Full keyboard navigation and screen-reader labels (including the body figure)
- [ ] **M** Respects "reduce motion"; no information shown only through animation
- [ ] **M** Health text in plain English: glance summary plus "Learn more" layer, medical terms explained in brackets (`DECISIONS.md` › Content Style)

### Daily check

- [ ] **M** Form for the six brief indicators, with units and sensible input limits
- [ ] **M** "How to measure" help beside each field (how to take it, why it matters, what to do if abnormal)
- [ ] **M** Mood as five large buttons, not a text box
- [ ] **M** Symptom tick boxes and exercise minutes
- [ ] **M** Save confirmation and today's result shown straight away
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
- [ ] **S** Voice reads the first-response steps aloud

### Body figure (2D SVG; regions drafted in `docs/BODY_MAP.md`)

- [ ] **S** Outline with the eight clickable regions from `docs/BODY_MAP.md`
- [ ] **S** Region colour from the region mapper
- [ ] **S** Card on click: function, status, risk, hazard, advice, "last checked" date
- [ ] **S** Fallback: region tiles if the drawing takes too long

### Calendar, summary, extras

- [ ] **S** Mission calendar listing due and completed periodic exams
- [ ] **S** One-page flight-surgeon summary, with "reply expected in about N minutes" (Earth Link delay)
- [ ] **S** Earth Link: shows the current communication delay for the mission mode
- [ ] **S** Mission mode switch: ISS, Lunar Gateway, Mars Transit
- [ ] **S** Check-in streak

---

## 4. Content and research

- [ ] **M** Open the NASA HRP pages for **all 5 hazards and all 17 risks**; note key points with links
- [ ] **M** NASA data map: hazard → risk → body system → indicator → countermeasure, each entry with its source URL
- [ ] **M** Guidance card text for each indicator, answering the brief's five questions: can it be measured in space, why it matters, how hazards affect it, when to escalate, what action helps
- [ ] **M** "How to measure" steps for each indicator, in plain English
- [ ] **M** Emergency guide text in plain English covering the hazards (`DECISIONS.md` › Data Map Coverage): chest pain/collapse first, then the rest
- [ ] **M** Search keywords for every item (synonyms, symptoms, misspellings)
- [ ] **M** Advice wording checked: modest, no diagnoses, no medication instructions
- [ ] **M** Source list with links in `docs/SOURCES.md` (NASA HRP, NASA OSDR, Canadian Space Agency, clinical ranges, libraries)
- [ ] **M** Every resource used is open source, openly licensed or public domain, with no NASA logos (`DECISIONS.md` › Licensing)
- [ ] **M** Every figure in the app or pitch traced to a source, or removed
- [ ] **S** Write every region card from `docs/BODY_MAP.md` (verified 14 Nov; linked to its hazards and risks)
- [ ] **S** List of periodic exams and how often
- [ ] **S** Short note on existing tools and what ATHENA adds

---

## 5. Offline

- [ ] **M** App loads and works with the network switched off
- [ ] **M** No fonts, scripts or data fetched from the internet at run time
- [ ] **M** Data survives closing and reopening the browser
- [ ] **S** Installable as an app (PWA) on a laptop or tablet

---

## 6. Testing

- [ ] **M** Fresh browser: load demo mission, Rivera's alert appears in the expected week
- [ ] **M** Healthy data (Singh) produces no alert and a stable, high health score
- [ ] **M** Health score drops as Rivera declines and when a red limit is hit
- [ ] **M** One bad day produces no alert
- [ ] **M** A dangerous reading (Nakamura) triggers the red-limit screen
- [ ] **M** Empty state (no data yet) looks sensible
- [ ] **M** Reaction test run ten times in a row without breaking
- [ ] **M** Search finds the right item for misspellings ("hart rate"), synonyms ("pulse") and symptoms ("chest pain")
- [ ] **M** Whole app usable by keyboard only; status readable in greyscale
- [ ] **M** Full demo rehearsed start to finish on the machine that will present it
- [ ] **M** Someone outside the team tries it without instructions

---

## 7. Demo, pitch and submission

Deadlines: **local submission closes 10:30 Sun 15 Nov**, local pitching starts **11:30** (3 min pitch + 2 min Q&A). The global portal closes 23:59. Full rules are in `judging.md`.

### Demo and pitch

- [ ] **M** Live pitch demo script (the global 30-second video follows `judging.md` 1D pacing instead):
  1. Hook: "Halfway to Mars, your crewmate collapses with chest pain."
  2. Problem (30 s)
  3. A judge takes the reaction test
  4. Fast-forward Rivera's mission to the drift alert, with "Why this alert?"
  5. Nakamura's red-limit response and crewmate emergency guidance
  6. Offline proof: Wi-Fi off on camera
  7. Close on the same tool for remote communities on Earth
- [ ] **M** Global demo: **30-second video** following the pacing in `judging.md` 1D (intro and team, challenge, title and tagline, how it works with NASA data, future vision). Going over 30 s disqualifies the project from global judging
- [ ] **M** Local pitch: a **short presentation plus a live demo** of the app within 3 minutes (team name and members, challenge, NASA data, UI flow), with a recorded backup
- [ ] **M** Q&A prep: where thresholds and emergency steps come from, what's simulated, limits, future work
- [ ] **M** Laptop charger and screen adapter (HDMI or USB-C) for the venue

### Submission form (`judging.md` Sections 1C and 1E)

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
