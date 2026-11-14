# Decision Log

Every locked choice and why. Entries are in the order they were made. **Index:**
- **Product:** Originality · Body Map Required · Crew · Trends Over Single Readings · Heart Rate and SpO₂ · Indicators · Baselines · Drift Cut-off · Health Score · Scope Additions · Search · Inclusive Design · Content Style · Design · First-Time Help · Checklist
- **Data and content:** No Medicines or Diagnoses · Data Sources · Thresholds · Red-Limit Sources · Emergency Step Sources · Data Map Coverage · Licensing
- **Tech:** Frontend · Backend · Database · AI / Analytics · Body Visualisation · Charts (open) · Logic Engine · Logic Engine Assumptions · Logic Tests · Storage Layer
- **Team and event:** Git Workflow · Roles · File Naming · Hosting and Demo · Demo and Pitch · Local Judging

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

Use only the official resources listed in `docs/context.md` Section 7. This
includes NASA OSDR (https://osdr.nasa.gov/), which the official challenge video
names. Do not use the extra sources in Section 9 for now.
Exceptions: general clinical reference ranges for thresholds (see Thresholds), and
emergency first-response steps (see Emergency Step Sources).

Reason:
Team decision to stay within the data we were given.

Status:
ACTIVE (revisit only if the team agrees)


---

## Database

SQLite in the browser via sql.js (WASM), saved to IndexedDB.
- **SQLite** is the database the app uses (SQL queries). The team knows it.
- **IndexedDB** is required underneath: sql.js keeps the database in memory only, so
  the database file must be saved to IndexedDB (browser storage on the device) to survive
  closing the app.
- **Save after every write** (and load on startup). If the save step is missed, data is lost.
- Bundle the sql.js `.wasm` file with the app (e.g. in `public/`). **Never load it from a CDN**,
  because there's no connection onboard.

Reason:
Works fully offline with no Wi-Fi or mobile data, needs no server and survives reloads.
Chosen over IndexedDB alone (e.g. Dexie) because the team is familiar with SQLite.
Seed 3 simulated astronauts on first run, with a "reset demo" button.

Status:
LOCKED

---

## AI / Analytics

- Rule-based "Why this alert?" panels and a short FAQ ("Am I fit for EVA?"),
  answered from the rules engine with source URLs. Works fully offline.
- Anomaly and trend detection: fixed personal baselines plus a z-score drift
  check (z ≥ 3.5) in JavaScript (see Baselines and Drift Cut-off).

Status:
LOCKED

---

## Hosting and Demo

- **No hosting.** We won't deploy the app anywhere, so we can focus on building
  a good app. The public GitHub repo is the official "final project" link.
- The README must keep clear "How to run" steps so judges can run it locally.
- Demo on localhost: `npm run build`, serve the static output, then install as a PWA.
- 30-second video "offline moment": turn Wi-Fi off on camera, reload, and trigger
  an alert (a dangerous reading, or a Scenario Lab event if built). The alert still fires.
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
The official NASA resources contain no numeric thresholds. This is one of two
exceptions to "official sources only" (the other is Emergency Step Sources).

Status:
LOCKED

---

## Indicators

Core (official challenge text): heart rate, blood pressure, blood glucose,
body temperature, sleep hours, mood (1–5).
Also recorded daily (from `docs/CHECKLIST.md`): reaction test (median, lapses, false
starts), exercise minutes, symptoms.
Optional: SpO₂, radiation dose (and HRV and respiration rate if time allows).

Reason:
Judges score Relevance against the challenge text, so the core six come first.

Status:
LOCKED

---

## File Naming

`CLAUDE.md` only imports `AGENTS.md`, and all workflow rules live in `AGENTS.md`.
Layout: `AGENTS.md`, `CLAUDE.md` and `README.md` stay at the root (tools and GitHub require it);
all other docs live in `docs/`; app code lives in `src/` (Next.js `src/app`), with `@/*` → `./src/*`.

Status:
LOCKED


---

## Licensing

Everything ATHENA uses must be open source, openly licensed or public domain,
with its licence recorded in `docs/SOURCES.md`.
- Code, fonts and icons: open licences only (MIT, Apache-2.0, BSD, ISC, OFL).
- NASA text and data: public domain US Government works. Cite them. No NASA
  logos or insignia, no implied endorsement, no third-party-credited NASA images.
- CSA and other agencies: cite and link only unless their terms allow reuse.
- Clinical reference ranges: published facts, cited to their guideline.
- Our own repo: no licence file needed (it's a just-for-fun project). Licensing
  only applies to the resources we use.

Reason:
Submission requires citing everything and having permission for copyrighted
material (`docs/judging.md` 1C.8). Open licences remove the risk.

Status:
LOCKED

---

## Local Judging

Submission closes 10:30 Sun 15 Nov. Pitching from 11:30: 3-minute pitch plus
2-minute Q&A.

Status:
LOCKED


---

## Scope Additions (from challenge video)

Required: emergency guidance (including crewmate assessment), a measurement guide
for every indicator, and measurement reminders.
Out of scope: Lunar Surface Base mission mode.

Reason:
Emergency guidance and measurement guides are challenge requirements. Reminders are
cheap and add value. Lunar base isn't worth the time.

Status:
LOCKED


---

## Content Style: Accurate, Plain English, Layered

All health info in the app (measurement guides, alerts, "Why this alert?",
emergency steps) must be **as accurate and informative as possible, written in
plain English**. Astronauts aren't doctors, so give them more understanding,
not less. Simplify the wording, not the facts.
- **Layered:** a glanceable summary first, then "Learn more" for the full
  plain-English explanation. Nobody has to read a report to act, but the detail
  is there when they need it.
  - **Glance (always visible):** status, a one-line meaning, the next action.
    E.g. "Heart rate high: 118 bpm (your normal ~65). Sit down and rest 5 min, then re-measure."
  - **Learn more (on tap):** what the measurement is, how to take it properly,
    why it matters in space (linked to the NASA hazard or risk), what's normal,
    what can cause it, what to do and when to escalate to the flight surgeon.
- Plain English everywhere. Explain any medical term in brackets the first time,
  e.g. "hypoxia (low oxygen in the body)". Use short sentences and everyday words.
- Accuracy first: no oversimplifying that changes the meaning. Every fact traces
  to a cited source, shown as a small "Source" link.
- Emergency steps: clear, ordered, plain-English actions (e.g. "Check if they
  respond", "Record heart rate and blood pressure", "Contact the flight surgeon")
  with a short "why" for each step. Labelled not medical advice.

Status:
LOCKED

---

## Git Workflow: Branches and Review

- Never push straight to `main` (except initial docs setup).
- Each task gets a branch: `feature/<short-name>` or `fix/<short-name>`.
- Push the branch and open a pull request.
- **Ideally another teammate's agent reviews the PR first** (a different person, even
  if everyone uses Claude). If no one is free, the author may self-review and merge
  using the same checks (see `AGENTS.md` › Reviewing a PR),
  then it's merged into `main`.
- No code freeze. Keep merging small, working changes until submission.

Status:
LOCKED


---

## Search

A required, adaptive, fully offline search bar covering indicators, measurement
guides, emergency guides, "Why this alert?" answers and body parts. It must find
what the astronaut means even if they word it wrong.

Edge cases it must handle:
- **Typos and misspellings:** "hart rate", "temprature", "glucos" (fuzzy matching).
- **Partial words while typing:** "oxy" finds Blood Oxygen / SpO₂ (prefix matching).
- **Synonyms and plain English:** "pulse", "heartbeat" → Heart Rate; "sugar" →
  Blood Glucose; "fever" → Body Temperature; "BP" → Blood Pressure.
- **Medical vs everyday terms both ways:** "low oxygen" ↔ hypoxia ↔ SpO₂.
- **Symptoms, not just measurement names:** "chest pain", "dizzy", "can't sleep",
  "headache" → the relevant emergency guide or indicator.
- **Case, punctuation, extra spaces and word order** are ignored.
- **No exact match:** show "Did you mean…?" plus the closest results and the emergency
  guide shortcut. Never a dead end.

How:
- Each searchable item has a `keywords` list (synonyms, symptoms, plain-English
  terms, common misspellings), stored with the content data.
- Library: **MiniSearch (MIT)**, installed. It handles typos, prefixes, field boosting and
  "did you mean" (`autoSuggest`); synonyms come from our `keywords` lists.
  (Fuse.js was the alternative; it was rejected as slower, with no prefix or auto-suggest.)
- Rank results with emergency matches first when the query looks like a symptom.

Status:
LOCKED


---

## Inclusive Design: Different Knowledge and Abilities

ATHENA must work for every astronaut, whatever their medical knowledge and
whatever their state at that moment. We show judges we've thought about this.

**Different knowledge:**
- Plain English, with a glance summary plus a "Learn more" layer (see Content Style).
- Medical terms explained in brackets. Measurement guides explain how, why and what to do.
- Adaptive search understands typos, everyday words and symptoms (see Search).

**Different abilities and conditions** (fatigue, stress, emergencies, gloves,
microgravity, colour blindness, low vision):
- Status is never shown by colour alone: colour **plus** an icon **plus** a text
  label (e.g. ⚠ "Watch").
- Colour-blind-safe palette with high contrast (aim for WCAG AA, 4.5:1 for text).
- Large text and large tap targets (at least 44×44 px), usable with gloves.
- Full keyboard navigation and screen-reader labels on all controls, images and the SVG body map.
- Respect "reduced motion": no essential information in animations alone.
- Emergency mode: very few, very large controls, one step on screen at a time.

**Pitch angle:** "Built for an astronaut who is exhausted, stressed and isn't a
doctor." This scores on Validity (usability) and Impact (the same design suits
remote communities on Earth).

Status:
LOCKED


---

## Baselines

**Fixed**, not rolling. Each astronaut has a pre-flight baseline and an in-flight
baseline (e.g. mission days 21–35), each calculated once. Daily status = z-score of the
7-day average against the in-flight baseline. Red limits are checked separately on every reading.

Reason:
A rolling baseline sinks along with a slowly declining astronaut and can stay green.
Fixed catches slow decline, the key long-mission risk, and is simpler to explain.
This replaces the earlier rolling 14-day idea.

Status:
LOCKED

---

## Crew

3 simulated astronauts, 180-day mission, each with a demo role:
- **Commander Rivera:** slow decline in sleep, reaction and mood from about week 12 (drift alert).
- **Pilot Singh:** stays healthy (proves no false alarms).
- **Engineer Nakamura:** sudden event (red-limit screen and crewmate emergency guidance).

Status:
LOCKED

---

## Checklist

`docs/CHECKLIST.md` is the single list of what to build and hand in, with M/S priorities.
It merges the team's build checklist with the earlier plan. New features from the
checklist: reaction-time test, mission calendar, flight-surgeon summary, check-in
streak and voice read-aloud.

Status:
LOCKED


---

## Design

- **Dark theme** app/dashboard. Theme options (e.g. light mode) are a **future feature**, not in scope.
- Palette: Izabela's dark "space" theme (PR #8), set as shadcn tokens in `src/app/globals.css`.
  Components use tokens only (`bg-card`, `text-muted-foreground`, `bg-destructive`), never raw hex colours.
  Checked contrast: body text 17:1, muted text 6.5–7.3:1, form-field borders 3.5–3.9:1, Emergency button 6.7:1.
- **Status colours** (Mercy, PR #9): `--status-red / -amber / -adapted / -steady / -nodata` tokens, always
  with an icon and a text label. Status names match the logic engine: `red_limit, drifting, expected_adaptation,
  steady, no_data`, plus the UI's `symptom` layer (a symptom reported in the last 3 days, a design choice).
- **Per crew member:** the selected astronaut (`CrewProvider`) drives every page, and each status is judged
  against that astronaut's own baseline, not one fixed standard (red limits stay as the clinical emergency override).
- Form input limits (`input` in `src/data/indicators.js`) only catch typing mistakes. They're design choices, not health thresholds.
- Status uses **icons** (plus colour and a text label) so critical vs OK is obvious at a glance.

Status:
LOCKED

---

## Health Score

Each astronaut has a **0–100 health score** (100 = perfect, 0 = critical), so drops in
vitals are noticed straight away.

Starting formula (the logic owner may tune the numbers; record any change here):
- Each tracked indicator (or linked group, see Drift Cut-off) gets a sub-score: steady = 100, expected adaptation = 90,
  drifting = 80 − 20 × (z − 3.5) (floored at 20), red limit = 0. No data = left out.
- Score = average of the available sub-scores, rounded.
- **An active drift alert (2 or more groups drifting) caps the score at 79**, and
  **an escalated alert caps it at 59**, so the score never says "Good" while an
  alert is showing.
- **Any red limit caps the score at 25**, so emergencies always look critical.
- Bands, each with an icon and label: **80–100 Good**, **60–79 Watch**, **40–59 Alert**, **0–39 Critical**.
- Show the change since yesterday and over 7 days, e.g. "72 ▼ 9 this week".
- "Why this score?" lists the indicators pulling it down, in plain English.

Reason for the caps:
The score is an average, so two drifting indicators among nine still averaged
about 91 ("Good") while the drift alert was active.

Status:
LOCKED (numbers tunable)

---

## Data Map Coverage

- The NASA data map covers **all 5 hazards and all 17 risks** from the HRP pages.
- **Body map** regions cover every body system those risks affect. The 8 regions and
  their risk links are in `docs/BODY_MAP.md` (verified against all 22 NASA pages on 14 Nov).
- **Emergency scenarios** cover the acute events linked to the hazards: 13 guides in
  `src/data/emergencies.js` (chest pain, collapse/CPR, stroke, low blood sugar, very high BP,
  hypothermia, decompression sickness, hypoxia, radiation alert, head injury, severe bleeding,
  suspected broken bone, mental health crisis).

Status:
LOCKED

---

## Charts

No chart library chosen yet; it will be decided when the Trends screen is built. It must be open-licensed.

Status:
OPEN

---

## First-Time Help

Not included. Astronauts are trained on onboard software before flight, so the
app doesn't need a walkthrough. Plain-English guides and "Learn more" cover the rest.

Status:
LOCKED

---

## Demo and Pitch

Follows the recommendations in `docs/judging.md` 1D.
- **Global:** a 30-second video using the recommended pacing.
- **Local (11:30):** a short presentation **plus a live demo** of the app in 3 minutes,
  followed by 2 minutes of Q&A.

Status:
LOCKED

---

## Originality

ATHENA's original angle: it **catches the slow decline that generic one-size-fits-all thresholds miss**
(by comparing each astronaut with their own baseline),
is **built for astronauts who aren't doctors**, and **works fully offline**. Every
feature and the pitch should support this line.

Status:
LOCKED


---

## Roles

No fixed roles. Each teammate picks `docs/CHECKLIST.md` tasks they're comfortable with.
Say which item you're taking, and work on its own branch to avoid clashes.

Status:
LOCKED

---

## Drift Cut-off

Formula, per indicator, each day:

    z = (recent average − baseline mean) ÷ (s × √(1/n + 1/m))

- recent average: mean of the readings in the last 7 days (n readings, at least 4).
- baseline mean and s: mean and day-to-day standard deviation of the in-flight
  baseline (m readings). s has a minimum per indicator, so a very steady
  baseline cannot turn a trivial change into a large z.
- Direction: only a change in the worrying direction counts (lower sleep, mood,
  exercise or SpO₂; higher reaction time or lapses; either way for vital signs).

An indicator counts as **drifting at z ≥ 3.5** in its worrying direction.

For alert levels, linked indicators count once: reaction median and lapses are
one group, and systolic and diastolic are one group.

Reason:
"z ≥ 2" did not say what to divide by. With this formula, a cut-off of 2 gave a
false main alert in 96% of 300 simulated healthy missions, and 3 gave 12%.
At 3.5 it gave about 1%, while every one of 300 simulated declining missions
was still caught (typical alert day 119, decline starting day 75). This keeps
Pilot Singh green. Tested on simulated data with independent day-to-day noise,
so real false-alarm rates would be higher. Re-run on our own simulator and
record the result here. The cut-off is a design choice, not a clinical standard.

Status:
LOCKED (number tunable after testing)

---

## Red-Limit Sources

Red limits (and normal ranges) come from published clinical guidelines:
- Heart rate and blood pressure: **American Heart Association (AHA)**
- Blood glucose: **American Diabetes Association (ADA)**
- Body temperature and sleep: **CDC**

Every value must be **checked against the live source page before use**, entered
with its exact URL in `docs/SOURCES.md`, and labelled "general clinical reference
range" in the app. If a value can't be verified, don't use it.

Update (14 Nov): heart.org (AHA) blocks automated access, so blood pressure uses the
**CDC** table (which is based on ACC/AHA guidelines). The CPR technique and the bleeding and fracture
first aid were read from AHA pages through a browser on 14 Nov. Heart rate has no population range by design (see Heart Rate and SpO₂).

Status:
LOCKED


---

## Emergency Step Sources

Emergency first-response steps come from:
1. **NASA first:** wherever a NASA page gives a step, use it and cite it (e.g. decompression
   sickness: end the spacewalk and return to the pressurised environment).
2. **Otherwise AHA or CDC:** published first-aid and first-response guidance from the
   American Heart Association or the CDC.
   For low blood sugar, the American Diabetes Association's 15-15 rule is used, because ADA is already
   the glucose source.
   Earth guidance is adapted for space and marked `adaptation: true`. Examples: the CDC
   altitude-illness steps for hypoxia ("descend" becomes "restore cabin pressure"), and the CDC
   radiation steps ("get inside" becomes "go to the most shielded area"). Medication doses
   from any source are never included.

Rules:
- Write every step **in our own words** (plain English, with a short "why"). Never copy AHA text.
  CDC text is public domain, but still rewrite it for our style.
- Cite each step's exact source page in the app and in `docs/SOURCES.md`.
- Check every step against the live source page before use. If it can't be verified, leave it out.
- No diagnoses and no medication instructions. Label steps "not medical advice" and always
  include when to contact the flight surgeon.

Reason:
The official pages give almost no emergency steps, but every fact in the app must be
cited (Content Style). This is the second exception to "official sources only".

Status:
LOCKED


---

## Heart Rate and SpO₂

No one-size-fits-all range. A healthy resting heart rate differs between people, so ATHENA compares
each astronaut's heart rate (and SpO₂) only with **their own baseline** (Baselines, Drift Cut-off).
Symptoms such as chest pain, fainting or breathlessness open the Emergency guides instead.

Reason:
Team decision. It fits ATHENA's personal-baseline approach, and the allowed sources don't
give a usable population range (AHA is blocked; the CDC notes SpO₂ is naturally lower at altitude).

Status:
LOCKED


---

## No Medicines or Diagnoses

ATHENA never names a medicine to take, never gives a dose, and never states a diagnosis.
It shows signs, plain-English first-response actions, and **when to contact the flight
surgeon**, who makes every medical decision. Some sources list drugs and doses (e.g. the CDC
altitude chapter); those parts are always left out. Food-based steps such as "15 g of fast
sugar" (ADA 15-15 rule) are allowed. Wording says "may be" or "signs of", never "you have".

Reason:
Astronauts aren't doctors. A wrong medicine or dose, or a wrong self-diagnosis, could seriously
harm a crew member. `npm run check:content` blocks dose patterns (e.g. "mg", "tablets of") in `src/data`.

Status:
LOCKED


---

## Trends Over Single Readings

ATHENA judges **patterns over days**, not one reading on its own. A single low or high reading
is "watch" at most, unless it crosses a clinical red limit (e.g. blood sugar below 70, temperature
of 38°C or above) or comes with red-flag symptoms. "Act" needs a streak or a drift. The approved design limits are:
- Sleep under 7 h on 3+ nights in a row → act
- Mood 1–2 on 3+ days in a row → act
- Reaction lapse = response slower than 500 ms, counted against the astronaut's own baseline
- Exercise under 90 min → watch
- Exam intervals: eye scan, heart ultrasound and samples every 30 days; fitness check every 14 days
All are labelled `basis: "design"` in `src/data` and are tunable.

Reason:
Team decision. One bad day is normal; a trend is what signals a real problem. This also avoids
false alarms (Pilot Singh stays green) and matches the drift-based approach.

Status:
LOCKED (numbers tunable)


---

## Body Map Required

The clickable 2D SVG body figure (8 regions, `docs/BODY_MAP.md`, `src/data/regions.js`) is a
**must-have**, not a stretch goal. The fallback tiles stay a "should have".

Reason:
The official challenge text asks for a clickable human body figure where each part shows its
function and health status. It's also central to the demo.

Status:
LOCKED

---

## Logic Engine

CHECKLIST §2 lives in `src/lib/engine/` as plain JavaScript functions (no React, DOM,
database or network), each marked with the checklist item it satisfies. Import from
`@/lib/engine`. `evaluateMission(records, baselines, fromDay, toDay)` runs everything for
one astronaut.
- **One source of truth for health numbers.** Every threshold, source, region, exam and
  search keyword is read from `src/data/`. Each band in `src/data/indicators.js` now has a
  `check`: the machine-readable form of its `rule` text (e.g. `{ below: 70 }`), validated by
  `npm run check:content`. Keep `rule` and `check` in step when editing a band.
- **"Urgent" bands are the red limits:** they open the red-limit screen and cap the health
  score at 25. Streak bands (e.g. short sleep 3+ nights in a row) need consecutive days; a
  missing day breaks the streak. Heart rate and SpO₂ have no bands, so they're judged only
  by drift (Heart Rate and SpO₂).
- **Baselines:** sample standard deviation (n − 1). The raw SD is stored; the per-indicator
  minimum is applied in the z-score step. Missing values are skipped, never filled in, and
  too few readings gives no numbers.

Reason:
Keeps the engine testable on its own and keeps health numbers in one reviewed place
(AGENTS.md: never hard-code health numbers).

Status:
ACTIVE

---

## Logic Engine Assumptions

Choices made while building CHECKLIST §2 where no decision existed. Each is marked
ASSUMPTION in the code; change it in one place, then run `npm test`.
- **Daily-record field names** (`RECORD_FIELDS` in `src/lib/engine/indicators.js`): camelCase,
  e.g. `heartRate`, `bpSystolic`, `bpDiastolic`, `glucose` (mg/dL), `temperature` (°C),
  `sleepHours`, `mood`, `reactionMedianMs`, `reactionLapses`, `reactionFalseStarts`,
  `exerciseMinutes`, `symptoms` (list of symptom ids), `spo2`, `radiationMsv`, `missionDay`.
  CHECKLIST §1 "Daily record defined" should confirm or rename them.
- **Drift-tracked:** heart rate, both blood-pressure numbers, glucose, temperature, sleep, mood,
  reaction median and lapses, exercise and SpO₂. Not tracked: false starts (no worrying
  direction given), symptoms (not a number), radiation dose (a running total).
- **Minimum spread `s`** (Drift Cut-off gives none): heart rate 2 bpm, systolic 3 mmHg,
  diastolic 2 mmHg, glucose 4 mg/dL, temperature 0.1 °C, sleep 0.25 h, mood 0.3, reaction
  median 10 ms, lapses 0.5, exercise 5 min, SpO₂ 0.5 %. Tune after simulator runs.
- **Pre-flight baseline window:** mission days −30 to −1. **Minimum readings per baseline:** 10.
- **"Expected adaptation"** (status not defined before): the 7-day average differs from the
  PRE-FLIGHT baseline by z ≥ 3.5 in the worrying direction but is NOT drifting against the
  in-flight baseline: "changed since Earth, stable in space". This gives the pre-flight
  baseline its job. Before day 36 nothing can be "drifting".
- **Alert escalation:** an alert starts on the first day with 2+ drifting groups and ends only
  on a day WITH data that has fewer than 2; it escalates 14 days after it started. Days
  without data neither start nor end an alert.
- **Reminders:** every non-optional indicator plus the symptom check, once per mission day.
- **Exam calendar:** an exam repeating every N days is first due on mission day N.
- **Search:** a query counts as a symptom (emergency guides first) when all its words match an
  emergency guide or symptom and it isn't the name of a measurement.
- **Scenario Lab effect sizes** are invented demo values, never to be shown as physiology.

Interim check of the 3.5 cut-off (Drift Cut-off asks for a re-run on our own simulator):
with the engine and its test-data generator (`src/lib/engine/testData.js`), 100 healthy
180-day missions gave 1 false alert and 100 of 100 declining missions were caught (median day
101; decline from day 75). 68 of the 100 healthy missions had at least one "note" day, so the
UI should present a note quietly. Re-run with the real mission simulator (§1).

Status:
ACTIVE (team to confirm)

---

## Logic Tests

Engine functions are tested with Node's built-in test runner (`node:test`), so nothing extra
is installed. Test files sit next to the code as `*.test.js`; run them with `npm test`. They
use the real content in `src/data/`, so they also catch content and engine drifting apart.

Status:
ACTIVE

---

## Storage Layer

How the locked Database decision is built (`src/lib/db/`). Use `await getDatabase()` from
`@/lib/db`; never open sql.js directly.
- **sql.js is loaded as a plain script** from `public/sql-wasm.js` (with `public/sql-wasm.wasm`),
  both copied there by `npm install`. It isn't bundled, because its Node-only code paths break
  browser builds. Still local files only, so it works offline.
- **Saved to IndexedDB after every write**, as one stored copy of the SQLite file. Each write
  runs in a transaction, so a failed write saves nothing. Without IndexedDB the app falls back
  to memory (data lasts until reload).
- **Tables:** `daily_record` (one row per astronaut per mission day; the record is stored as
  JSON so its fields can change without a migration), `baseline` (fixed: one per astronaut and
  kind, never overwritten except by "Reset data") and `meta` (schema version).
- **Baselines are calculated once and stored:** `ensureMissionBaselines(astronautId, today)`
  calculates each baseline the first time its window has ended, then only loads it. If no
  indicator has enough readings yet, nothing is stored and it tries again next time.
- **A damaged saved copy** is replaced by a fresh database rather than locking the crew out.

Reason:
Implements DECISIONS › Database and Baselines (fixed) with the smallest API the screens need.

Status:
ACTIVE

