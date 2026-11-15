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

- [x] **M** Daily record defined: date, mission day, heart rate, blood pressure (two numbers), blood sugar, temperature, sleep hours, mood (1–5), reaction median, lapses, false starts, exercise minutes, symptoms, SpO2 (optional), radiation dose (optional) (PR #18: `src/lib/dailyRecord.js`, field names from the engine's `RECORD_FIELDS`, input limits from `src/data`, `validateRecord()`; all 625 simulated records pass)
- [x] **M** Units chosen and shown everywhere (mg/dL or mmol/L, °C) (PR #7, PR #8, PR #16, PR #19, PR #20, PR #24): units on Today, daily check, reaction test, body cards and save errors; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state)
- [x] **M** Save and load daily records in the browser: SQLite via sql.js, saved to IndexedDB after every write, with the `.wasm` file bundled locally (PR #14 storage, PR #17 app wiring, PR #19 saving from the Daily check and Reaction test, validated first)
- [x] **M** Save and load the two baselines (`saveBaseline`/`loadMissionBaselines`/`ensureMissionBaselines` in `src/lib/db/database.js`) (PR #14)
- [x] **M** Mission simulator: 180 days for 3 crew (`docs/DECISIONS.md` › Crew) (`src/lib/sim/simulator.js`, seeded; stories checked by the engine in `simulator.test.js`) (PR #15):
  - **Commander Rivera:** pre-flight days, early adaptation, a settled period, then slow decline in sleep, reaction and mood from about week 12 (drift alert)
  - **Pilot Singh:** stays healthy (shows no false alarm)
  - **Engineer Nakamura:** a sudden event (red-limit screen and crewmate emergency guidance, e.g. chest pain)
- [x] **M** Simulator adds realistic day-to-day noise and one or two harmless bad days (Rivera day 50, Singh day 100; a few missed days too) (PR #15)
- [x] **M** "Load demo mission" and "Reset data" buttons work (Crew page, `src/components/MissionDataPanel.js`; demo loaded automatically on first run, stays empty after reset; tested against the real sql.js in `demo.db.test.js`)
- [x] **M** Every indicator, guide and emergency entry has a `keywords` list (synonyms, plain-English terms, symptoms, common misspellings) for search (PR #7)
- [x] **S** Store periodic exam results and the check-in streak (PR #19: `saveExamResult`/`loadExamResults` in `src/lib/checkIn.js`, cleared by Reset data; streak worked out from stored records with `checkInStreak`)
- [x] **S** Persist immutable simulated Earth-link reports and separate history per astronaut; Reset and Load demo clear it (PR #45)
- [x] **S** Serialise SQLite/IndexedDB writes and restore in-memory state after a failed persistence save (PR #45)
- [x] **S** Export and atomically restore a validated offline SQLite backup; show a recovery notice after a damaged saved database (PR #45)

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
- [x] **S** Mission mode changes which hazards and advice are shown (ISS, Lunar Gateway, Mars Transit; no Lunar Surface Base) (`src/lib/engine/missionMode.js`; delays, emphasis and advice in `src/data/missionModes.js`) (PR #8, PR #12)
- [x] **S** Scenario Lab: inject radiation, fatigue, sleep loss or hypoxia into the data and watch the alerts react (injection: PR #10; `/scenario-lab` screen with before/after score and alerts: PR #15)
- [x] **S** Incident timeline and report comparison derived from engine evaluations and immutable Earth-link snapshots (PR #45)

---

## 3. Frontend

### Screen designs (team mockups, 14 Nov)

One line per designed page. A page is ticked when it's built and working in the app; the detailed items below say what each one covers.

- [x] **M** Today: health score, drift alert card with "Why this alert?", indicator cards against your own normal (PR #20, PR #21)
- [x] **M** Daily check: readings with units, "How to measure" panel with read-aloud, mood buttons, symptom tick boxes, streak (PR #8, PR #19)
- [x] **M** Reaction test: 60 s panel with live counter, "Why this test", this run so far, result against your own normal (PR #16, PR #19)
- [x] **M** Body: figure plus region list and region card with NASA risk and hazard (PR #9, PR #21)
- [x] **M** Emergency: one step at a time with "why", read aloud, all steps, readings, not-medical-advice note (PR #22)
- [x] **M** Crew status: a card per astronaut (score, band, change, one-line reason, open or emergency button), demo controls (PR #23: design by the team; cards from the engine; real Load demo mission / Reset data panel and a Scenario Lab link. Reminders and Earth link boxes removed by team choice in PR #33: due measurements are on Today, exams on Calendar, the delay on Emergency, Summary and Trends)
- [x] **M** Trends: 7-day average lines with pre-flight and in-flight bands, baseline window, drifting periods, day slider, "What to do this week", "When to tell the ground" (PR #24: plain SVG charts; "What helps" uses each indicator's NASA countermeasures instead of the mockup's placeholder list)

### Layout

- [x] **M** Navigation: Today, Trends, Body, Calendar, Summary (PR #6)
- [x] **M** Search bar and an **Emergency** button on every screen (PR #6, PR #21, PR #22: Emergency screen with all 13 guides)
- [x] **M** Crew switcher, with the mission day and astronaut name always visible (PR #6, PR #9; real mission day from the stored mission: PR #17)
- [x] **M** Alert banner area at the top of every screen (PR #20: `AlertBanner` in the header for the selected astronaut; red limits link to the emergency guide)
- [x] **M** Dark theme dashboard (`docs/DECISIONS.md` › Design) (PR #4, PR #6)
- [x] **M** Health score (0–100) shown prominently per astronaut, with a status icon and drop indicator (PR #20: Today screen, from the engine, with cap reason and bands)
- [x] **M** One colour scheme for status, used everywhere, always colour **plus** icon **plus** text label (PR #9, PR #20, PR #24): status tokens with icon and label on the body map, Today and the alert banner; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state)
- [x] **M** Readable on a laptop and a tablet (PR #21, PR #24, PR #50): every built screen checked at 1280 px and 768 px wide in Chrome (no sideways scrolling, layout wraps); Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state); PR #50 adds a collapsible desktop sidebar and wider, denser content while retaining the existing navigation below the desktop breakpoint

### Inclusive design (`docs/DECISIONS.md` › Inclusive Design)

- [x] **M** Colour-blind-safe palette, text contrast at least 4.5:1 (PR #8, PR #9, PR #24): palette and status colours checked (text 5.8–17:1, form borders 3.5–3.9:1); charts use the same checked status tokens, and every coloured chart area also has a text label (PR #24)
- [x] **M** Tap targets at least 44×44 px (usable with gloves); large text (PR #6, #8, #9, #16, #20, PR #24, PR #50): header (logo, crew picker and Earth-link source enlarged in PR #21), navigation, Today, daily check, reaction test, body page, search results, calendar and summary done; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state); the PR #50 sidebar toggle and links retain 44 px targets in expanded and collapsed modes
- [x] **M** Full keyboard navigation and screen-reader labels (including the body figure) (PR #6, #8, #9, #16, #20, PR #24, PR #50): header, Today, daily check, reaction test, body figure, search (ARIA combobox: arrow keys, Enter, Escape, result count announced; PR #21), calendar and summary done; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state); the PR #50 sidebar toggle and icon-only links have explicit accessible names
- [x] **M** Respects "reduce motion"; no information shown only through animation (PR #21, PR #24): global reduced-motion rule in `globals.css` stops animations and transitions; the reaction-test signal is also shown as text; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state)
- [x] **M** Health text in plain English: quick reference (status, meaning, what to do; no "Learn more" layer, DECISIONS › Quick Reference Only), medical terms explained in brackets (PR #8, #9, #20, PR #22: emergency guides show the glance first, then each step with its "why", signs and "All steps at once")

### Daily check (replaced by live monitoring, PR #54)

- [x] **M** Vitals with units and input limits (PR #8; PR #51 sensor scan; PR #54: the Daily check page is removed; vitals come from the simulated always-on sensor feed, evaluated every minute, Live Monitor at `/live`)
- [x] **M** "How to measure" help (PR #8; PR #54: on the Live Monitor, `?guide=` from search and each tile, with read-aloud)
- [x] **M** Mood as five large buttons, not a text box (PR #8; PR #54: in Today's one-minute check)
- [x] **M** Symptom tick boxes (PR #8; PR #54: "Anything new today?" in Today's one-minute check; red-flag symptoms link to their emergency guide)
- [x] **M** Save confirmation (PR #8, PR #13, PR #19; PR #54: one-minute check and cuff extra check confirm on Today)
- [x] **M** Reminders: shows which measurements are still due today (PR #20; PR #54: only mood, anything new and reaction time, since sensors cover the rest)
- [x] **M** Live monitoring (PR #54): stable, fluctuating, deteriorating, critical and no-data states with rules; live alert bar and chip on every page; live values and today's average on Today; confidence on the health score; extra-check request; presenter demo controls on Crew
- [x] **M** Live data in sync on every screen (PR #55): today's vitals follow the live average so far on Today, Body, Trends, Summary and Crew; midnight roll-up saves the day's live averages; charts and values move every second

### Reaction test

- [x] **M** Start screen with one-line instructions (PR #16)
- [x] **M** Random wait of 2–5 seconds, signal, running millisecond counter (PR #16)
- [x] **M** Works with tap, click and space bar (PR #16)
- [x] **M** False start handled with "too early" (PR #16)
- [x] **M** Results screen: median, lapses, comparison with own baseline (PR #16; scoring from the engine, baseline = the selected astronaut's simulated in-flight baseline)
- [x] **S** Guest mode so a judge can try it without changing the crew's data (PR #19: Guest mode switch on the reaction test; the run is never saved)

### Trends

- [x] **M** One chart per indicator across the mission (PR #24: plain SVG, no chart library, so no new licence; `TrendChart`)
- [x] **M** Shaded bands for pre-flight normal and in-flight normal (PR #24: `driftBand` in `src/lib/engine/trends.js`; the in-flight band edge is exactly the drift cut-off)
- [x] **M** Drifting periods visibly marked (PR #24: shaded and labelled, from `driftPeriods`)
- [x] **M** Side-by-side view: ATHENA status against a generic-threshold status (the "stays green" comparison) (PR #24: "ATHENA vs one-size-fits-all" table; Rivera day 129: mood and reaction drifting but "Normal" / no general range, marked "Missed by the general range")
- [x] **M** Day slider or fast-forward to move through the mission (PR #24: day 1 to today; charts, statuses and advice follow the chosen day)

### Search

- [x] **M** Results as you type; finds content despite typos, everyday words and symptoms (PR #10, PR #21: `SearchBox` in the header; checked in Chrome with "hart rate", "pulse", "temprature", "oxy", "cant sleep")
- [x] **M** No match: "Did you mean…?", closest results and the emergency shortcut, never a dead end (PR #21)
- [x] **M** Symptom-like queries (e.g. "chest pain") show emergency guidance first (PR #10, PR #21; a measurement's own keyword such as "pulse" no longer counts as a symptom)

### Alerts and guidance

- [x] **M** Alert card: what is drifting, since when, likely hazard, what to do, when to tell the ground ("Why this alert?") (PR #20, PR #21: likely hazard from `likelyHazards` in `src/lib/engine/hazards.js`, with the NASA hazard page cited)
- [x] **M** Red-limit and emergency screen: numbered first-response steps with a short "why" each, one step at a time with big controls (PR #22: `/emergency?id=…`, opened from Today's red-limit card, the alert banner and search)
- [x] **M** Emergency guidance works for **a crewmate** (pick the affected astronaut, follow steps, record vitals) (PR #22: "Who needs help?", vitals saved to that astronaut's record with the red-limit check, flight-surgeon reply time shown)
- [x] **S** Voice reads the first-response steps aloud (PR #8 daily check, PR #22 emergency steps: one step or all)

### Body figure (2D SVG; regions in `docs/BODY_MAP.md` and `src/data/regions.js`). Required: the brief asks for a clickable body figure

- [x] **M** Outline with the eight clickable regions from `docs/BODY_MAP.md` (PR #9)
- [x] **M** Region colour (plus icon and label) from the region mapper (PR #9, PR #21: from the engine's evaluation of stored data via `regionInputFromEvaluation`; checked in Chrome for all 3 crew)
- [x] **M** Card on click: function, status, risk, hazard, advice, "last checked" date (PR #9; text from `src/data/regions.js`)
- [x] **S** Fallback: region tiles if the drawing takes too long (PR #9: the accessible region list beside the figure)

### Demo polish (14 Nov)

- [x] **S** Demo mission includes a realistic exam history, so the calendar and Today's reminders aren't falsely "overdue" (PR #26: `demoExamResults`)
- [x] **S** Reaction test result compares with the astronaut's stored in-flight baseline (the same one the engine uses), not a re-run of the simulator (PR #26)
- [x] **S** Mission mode remembered after a reload (PR #26: stored on the device)
- [x] **S** One low exercise day no longer counts as drift (PR #26: exercise minimum spread 5 → 10 min, DECISIONS › Logic Engine Assumptions)

### Calendar, summary, extras

- [x] **S** Mission calendar listing due and completed periodic exams (PR #21: `/calendar`, overdue, due today, next 30 days, "Mark done today" saves with `saveExamResult`)
- [x] **S** One-page flight-surgeon summary, with "reply expected in about N minutes" (Earth Link delay) (PR #10, PR #12, PR #21: `/summary` screen; "Send to Earth" button (simulated send, shows the reply time; replaced "Copy text" in PR #34); mission mode now shared app-wide)
- [x] **S** Earth Link: shows the current communication delay for the mission mode (PR #8; header pill removed, delay shown on the Emergency, Summary and Trends pages; sourced delays for all three modes and the summary's reply time PR #12)
- [x] **S** Mission communications simulation: queued report, two-way delay, deterministic simulated reply, 1×/60×/720× clock, progress and persistent per-astronaut history (PR #45)
- [x] **S** Earth-link receipt acknowledgement, onboard-wait guidance, report-to-report changes and combined incident history (PR #45)
- [x] **S** Mission mode switch: ISS, Lunar Gateway, Mars Transit (PR #8; modes in `src/data/missionModes.js`)
- [x] **S** Check-in streak (PR #19: shown after saving the Daily check)

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
- [x] **S** List of periodic exams and how often (PR #7: 5 exams from NASA pages in `src/data/exams.js`; NASA doesn't state in-flight frequencies, so intervals are labelled `basis: "design"`)
- [x] **S** Short note on existing tools and what ATHENA adds (`docs/EXISTING_TOOLS.md`: Tempus Pro, ARCHeR, Standard Measures from the official NASA pages)

---

## 5. Offline

- [x] **M** App loads and works with the network switched off (checked 14 Nov on the production build: every file, the database engine and the demo data come from the device; first run seeds the mission with no internet. Repeat with Wi-Fi off in the final rehearsal)
- [x] **M** No fonts, scripts or data fetched from the internet at run time (checked 14 Nov: build scan plus all 10 pages loaded with 0 external requests; system fonts only. Re-check new screens in PR review)
- [x] **M** Data survives closing and reopening the browser (PR #14 storage, PR #17 app wiring; checked in the app 14 Nov: reset stays empty and loaded data stays loaded after reload)
- [x] **S** ~~Installable as an app (PWA) on a laptop or tablet~~ Dropped (team decision 14 Nov): the operational version runs locally; the hosted evaluation copy intentionally has no service worker
- [x] **S** Hosted evaluation copy deploys the static export to GitHub Pages with no backend; local build remains the offline operational version (PR #46)
- [x] **S** Hosted evaluation copy renders compiled production styles in Safari and Chrome; deployment fails if Tailwind build directives remain in the CSS (PR #47)

---

## 6. Testing

- [x] **M** Fresh browser: load demo mission, Rivera's alert appears in the expected week (checked in the app 14 Nov: Today shows Rivera's alert since day 100, escalated by day 129)
- [x] **M** Healthy data (Singh) produces no alert and a stable, high health score (checked in the app 14 Nov: "No alerts", score 100 Good, no banner)
- [x] **M** Health score drops as Rivera declines and when a red limit is hit (checked in the app 14 Nov: Rivera 59 Alert, capped by escalation; Nakamura 25 Critical on the red limit)
- [x] **M** One bad day produces no alert (PR #10 engine; checked in the app 14 Nov: a bad day for Singh (3.5 h sleep, mood 1, 20 min exercise) gave "watch" flags and score 96, no alert or banner. Note: the single low exercise day made exercise "drifting" (a one-indicator Note, by design not an alert); the exercise minimum spread may be worth tuning)
- [x] **M** A dangerous reading (Nakamura) triggers the red-limit screen (PR #20, PR #22: checked in the app 14 Nov: Today's red-limit link opens the very-high-BP guide with Nakamura picked; saving 186/118 there flags the red limit)
- [x] **M** Empty state (no data yet) looks sensible (PR #9, PR #10, PR #20, PR #24): engine safe; Today, Daily check, Body, Calendar and Summary handle no stored data (PR #21); Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state)
- [x] **M** Reaction test run ten times in a row without breaking (checked 14 Nov on the production build: 10 back-to-back 60 s runs in guest mode, including false starts, missed signals, space bar and double taps; every run finished, no errors or blank results)
- [x] **M** Search finds the right item for misspellings ("hart rate"), synonyms ("pulse") and symptoms ("chest pain") (PR #10, PR #21: checked in the search bar in Chrome)
- [x] **S** Mission communications unit/storage coverage: mode delays, all statuses, speed changes, reload, separate histories, multiple immutable snapshots and reset/reload clearing (PR #45)
- [x] **S** Backup/recovery and incident-history coverage: valid restore, corrupt rejection, persistence failure rollback, alert transitions, red limits and receipt acknowledgement (PR #45)
- [x] **M** Whole app usable by keyboard only; status readable in greyscale (checked 14 Nov on every built page: all focusable controls have a visible focus style and a name, no click handlers on non-buttons, status readable in greyscale through icon and label, PR #24): ; Trends done in PR #24 (labelled chart areas, 44 px chips and slider, keyboard and screen-reader descriptions, no animation, units, empty state)
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
- [ ] **M** AI use declared, and any AI-generated media watermarked (`docs/AI_USAGE.md`) 🟡 Partial: SI checkboxes and project-page statement ready in `docs/SUBMISSION.md` › 1; AI-made mockups logged (made with Claude); still to do: watermark any AI image used in the slides, video or repo, paste the statement
- [ ] **M** NASA Data and Partner Data fields: every resource as Link Text plus full URL 🟡 Partial: ready to paste in `docs/SUBMISSION.md` › 2 and 3; still to do: test each link in an incognito window
- [ ] **M** Limits stated: simulated data, untested thresholds, not a diagnostic tool or medical advice
- [x] **M** Repo public with an up-to-date README, hosted evaluation link and local "How to run" steps (PRs #46, #47, #48 and #49)
- [ ] **M** Every link tested in an incognito window; the app runs from the README steps on another machine
- [ ] **M** Everything in English; no under-18 likeness anywhere
- [ ] **M** All 4 members confirmed at HackAthlone (none waitlisted)
- [ ] **M** Both confirmation boxes ticked, then **Submit for Judging**, aiming for at least one hour before the 10:30 deadline
