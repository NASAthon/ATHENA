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

Use only the official resources listed in `context.md` Section 7. This
includes NASA OSDR (https://osdr.nasa.gov/), which the official challenge video
names. Do not use the extra sources in Section 9 for now.
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
material (`judging.md` 1C.8). Open licences remove the risk.

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
- Use a small open-source fuzzy search library that runs in the browser. Record
  the final choice in `docs/SOURCES.md`.

Library options (team to choose):

| Library | Licence | Strengths | Weaknesses |
|---|---|---|---|
| **MiniSearch** (suggested) | MIT | Small and fast; typo tolerance, prefix matching and field boosting; built-in "did you mean" suggestions (`autoSuggest`) | Synonyms must come from our `keywords` lists |
| **Fuse.js** | Apache-2.0 | Very simple API; good fuzzy matching on short lists | Slower on larger data; no built-in prefix or auto-suggest |

Both run fully offline, need no server and are free to use.
- Rank results with emergency matches first when the query looks like a symptom.

Status:
LOCKED (library choice open)


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
