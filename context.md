# NASA Space Apps Challenge 2026 — Project Context & Planning Brief

> **Status: PLAN APPROVED. We are in the BUILD phase.** Write application code following `AGENTS.md` and `DECISIONS.md`. The architecture is locked, so do not re-plan it or propose a different stack.
>
> This file holds the event rules, submission requirements, judging rubric, the challenge, our concept (Section 6.1) and every data link we were given. Section 10 is the original planning brief, kept for reference.

---

## 1. Who we are and what we're doing

- We are a team entering the **2026 NASA International Space Apps Challenge** at the local event **HackAthlone** (Athlone, Ireland).
- We are competing in the **Healthcare challenge: "Create Health Monitoring Software for Astronauts on Space Missions"** (difficulty: Intermediate; subjects: Human Exploration, Software, Space Exploration).
- There is also a **global judging** round for submissions, so quality, polish and clear NASA-data provenance matter.
- Team name / GitHub org: `<TEAM NAME — fill in>`
- Team size: `<N members, max 6 — fill in>`
- Skills and preferred stack: JavaScript (no TypeScript). Stack is locked in `DECISIONS.md`.
- Submission deadline: **Sun 15 Nov 2026, 23:59** (local time, global portal). Confirm with HackAthlone whether local pitching is earlier.

## 2. Event facts

| Item | Detail |
|---|---|
| Event | 2026 NASA International Space Apps Challenge, local chapter **HackAthlone (#HackAthlone)** |
| Venue | Engineering Building, Technological University of the Shannon (TUS): Midlands, Bunnavally, Athlone, Co. Westmeath, Ireland |
| Format | In-person, 48-hour hackathon |
| Dates | **14–15 November 2026**. Work officially starts **09:00 on 14 Nov** and concludes on 15 Nov |
| Local event lead | Sahir Sharma (sharma.sahir@gmail.com / spaceappsathlone@gmail.com) |
| Facilities | Tech resources, mentors, food and drink provided. No accommodation (sleeping bags allowed on site) |
| Global site | https://www.spaceappschallenge.org/ |

## 3. Rules that constrain us

- Free; open to all ages. Under-18s must be registered and accompanied by a parent/guardian, and **cannot upload personal photos, videos, voices or likenesses** to team pages or demos.
- Team size 1–6. For **global judging**, the team must meet the multi-member eligibility rules and **all members must be registered under the same local event**.
- **Projects must not be started before the official start time (09:00, 14 Nov 2026).** Do not reuse pre-existing project code. Using generic libraries and frameworks is normal, but be ready to explain what was built during the event.
- **AI tool policy:** AI tools (Claude, ChatGPT, AI code/animation generators) are **allowed** for coding and media. We **must explicitly disclose how AI was used** in the submission, and clearly **watermark/credit any AI-generated visual or media** alongside credits for NASA data sources.
- All submission text must be in **English**.

## 4. Submission deliverables (edited on the Project tab of our Team Page before the local deadline)

1. **Project name and high-level summary:** what we built, how it addresses the challenge, why it matters.
2. **Link to project demo:** publicly accessible (no password, login, or permission wall). Either a **video of 30 seconds or less** OR a **slide deck of no more than 7 slides** (including title/intro slides).
3. **Link to final project:** publicly accessible working prototype, live web app, or open-source repo (e.g. GitHub).
4. **Detailed description and NASA data:** technical explanation, tools/languages/AI used, and **explicit identification/demonstration of at least one official NASA data source**.

### Judging rubric (each scored 1–5)

> Full official guide: **`judging.md`**. It covers the submission form fields, demo limits, the AI/SI policy, global eligibility, the judging timeline and the 10 global awards. If it differs from this summary, `judging.md` wins.

| Criterion | What a 5 looks like |
|---|---|
| **Impact** | Addresses a significant real-world or spaceflight problem with wide reach and practical benefit |
| **Creativity** | Original, inventive execution; a fresh perspective or meaningful improvement over conventional methods |
| **Validity** | Grounded in sound science; technically and logically feasible; complete; strong usability |
| **Relevance** | Directly addresses the challenge objectives and **integrates NASA open data as a core functional component, not a superficial add-on** |
| **Presentation** | Clear, engaging storytelling covering the problem, solution, live demo and significance |

## 5. The challenge (official text, lightly condensed)

**Title:** Create Health Monitoring Software for Astronauts on Space Missions.

**Summary:** Long-duration missions expose astronauts to space radiation, isolation and confinement, altered gravity and a hostile closed environment. These can bring immune changes, bone loss, cardiovascular events and behavioural health problems. On long missions astronauts carry much of the responsibility for spotting these changes in themselves. The challenge is to build health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health.

**Background:** NASA's Artemis program recently completed a crewed lunar flyby, and Mars missions are planned. NASA's Human Research Program (HRP) has mapped the **five hazards of human spaceflight**: space radiation, isolation and confinement, distance from Earth, gravity fields, hostile/closed environments. These can contribute to immune changes, bone density loss, cardiovascular events, inadequate nutrition, behavioural health conditions and others. Astronauts must be able to assess their own health during a mission. Useful indicators include **blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, and mood**.

**Objectives:** Create a **visual tool** that helps astronauts assess their own health and provides guidance on treatment and health improvement. Input can be any modality (keyboard text, mouse clicks, camera images, e.g. ultrasound), as long as it represents a health indicator (e.g. blood glucose in mg/dL). Use NASA HRP resources **and publicly available resources from other space agencies** to decide which indicators matter and how they support a quick assessment.

**Questions the solution should answer:**
- Which measurements can actually be performed in space?
- Why is an exam needed?
- How do spaceflight hazards affect these health indicators?
- When does a result warrant attention from the crew or from flight surgeons on the ground?
- What actions can be taken to prevent a critical health condition?

**UI guidance:** Presentation of metrics and diagnosis should be clear. Animations and interactivity are encouraged, e.g. a **clickable human body figure** where each part shows its function and health status.

**Optional considerations (not required):**
- Health insights for different environments: spacecraft, space station, rover, base on another planet or moon.
- Prompt astronauts to take measurements or complete actions as part of mission routine.
- Gamification to encourage health-supporting tasks.
- Dynamic charts showing indicators over time.
- Colour coding to read status at a glance.
- Don't assume astronauts know how to assess their health. Provide simple instructions and explanations of measurements, indicators and risks.

## 6. Our current idea (starting point, open to refinement during planning)

A visual astronaut self-assessment tool with these building blocks:
1. **Hazard-to-health mapping:** each of the five HRP hazards is linked to the health risks it drives and to the indicators that signal them.
2. **Indicator input:** astronauts enter or select values for indicators measurable in flight (heart rate, blood pressure, blood glucose, body temperature, sleep hours, mood, and others we justify).
3. **Rule-based triage engine:** each reading is classed (e.g. normal / watch / act / contact flight surgeon) with a plain-language explanation of *why* and a recommended action. Each rule should cite the NASA/HRP source it is based on.
4. **Clickable body figure:** organs/systems show function, current status, and the hazard that affects them.
5. **Time-series charts and colour-coded status** for at-a-glance trends.
6. **Environment context:** switch between spacecraft / station / lunar or Mars base, adjusting which hazards and advice are emphasised.
7. **Routine prompts and optional gamification:** reminders and streaks for measurements, exercise, sleep and so on.
8. **Plain-language guidance** for non-specialists.

Planning should decide which of these are **must-have for the demo** versus **stretch goals**.

### 6.1 ATHENA: our chosen concept and product spec (merged from the earlier `Project_Context.md`, `NASA_Challenge.md` and `ATHENA_MASTER_SPEC.md`)

**Vision:** an autonomous astronaut health copilot. **ATHENA** stands for Autonomous Telecommunications and Health Evaluation Network for Astronauts. It is an onboard health monitoring and decision-support system for astronauts.

**Problem framing:** Deep-space crews face communication delays of 5–40 minutes from Earth, so medical decision-making must be autonomous.

**Users:** astronauts (primary), flight surgeons, mission control.

**Crew:** 3 simulated astronauts: Commander Rivera, Pilot Singh, Engineer Nakamura.

**Monitoring targets:**
- **Core (named in the official challenge text, must have):** heart rate, blood pressure, blood glucose, body temperature, sleep hours, mood
- **Extra (our team's choice, not official requirements):** HRV, SpO₂, respiration rate, activity level, radiation dose

**Feature targets:**
- **Personalised baselines:** a rolling 14-day baseline per astronaut instead of generic thresholds. The 14-day window is our assumption.
- **Trend monitoring:** detect multi-day changes such as sleep deficit, vital-sign drift and radiation accumulation.
- **Alerting:** deterministic, explainable decision-support alerts, each giving the trigger, contributing factors and recommended action.
- **Mission modes:** ISS, Lunar Gateway, Mars Transit. This is our version of the environment context in idea 6 above.
- **Scenario Lab:** simulate radiation, fatigue, sleep deprivation, hypoxia and multi-factor events.
- **Earth Link:** visualise the communication delay to mission control.
- **"Why this alert?" panels and FAQ:** rule-based answers to "What caused this warning?" or "Am I fit for EVA tomorrow?", each citing its source. They work fully offline.

**Innovation angles:** explainable AI, anomaly detection (rolling baseline + z-score), decision support, visual health insights, Earth-delay simulation.

**Tech stack** (locked in `DECISIONS.md`): offline-first PWA. Next.js (JavaScript, static export) + Tailwind + ShadCN; SQLite in the browser (sql.js, saved to IndexedDB); JS rules engine + rolling-baseline/z-score trend detection; 2D SVG body map. No backend server. Everything runs onboard.

**MVP scope** (product spec, from the earlier `ATHENA_MASTER_SPEC.md`):
- Dashboard with 3 astronauts
- Personal baselines
- Explainable alerts
- Scenario Lab
- Earth Link
- "Why this alert?" explanations

**Demo flow:**
1. Dashboard
2. An astronaut on a warning
3. An astronaut in critical status
4. Scenario simulation
5. "Why this alert?" explanation
6. Earth delay

> For judging, the official rubric in Section 4 (Impact, Creativity, Validity, Relevance, Presentation) replaces the informal "judging focus" list in the old `NASA_Challenge.md`.

## 7. Data and resources we were given (the full official list)

These are the **only** public data resources the organisers listed. Treat them as our official NASA/partner sources and cite them in the app, README and submission.

### NASA Human Research Program (official NASA data and resources)
- **5 Hazards of Human Spaceflight:** https://www.nasa.gov/hrp/hazards/
  - Hub page. Names the five hazards and links to a deep-dive for each. It does **not** list specific health risks or data itself.
  - Space Radiation: https://www.nasa.gov/hrp/hazard-space-radiation/
  - Isolation and Confinement: https://www.nasa.gov/hrp/hazard-isolation-and-confinement/
  - Distance from Earth: https://www.nasa.gov/hrp/hazard-distance-from-earth/
  - Gravity Fields: https://www.nasa.gov/hrp/hazard-gravity-fields/
  - Hostile/Closed Environments: https://www.nasa.gov/hrp/hazard-hostile-closed-environments/
- **Risks of Human Spaceflight:** https://www.nasa.gov/hrp/risks/
  - Lists **17 risks** in three groups, each linking to a detail page. It does **not** give numeric thresholds, metrics or monitoring methods; it names some countermeasures (exercise, diet, medication for bone; exercise for fitness; suit pressure and oxygen balance for spacewalks).
  - *Human physiology (11):*
    - Altered Immune System Responses: https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/
    - Altered Sensorimotor and Vestibular Function: https://www.nasa.gov/reference/risk-of-altered-sensorimotor-and-vestibular-function/
    - Cardiovascular Adaptations: https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/
    - Decompression Sickness: https://www.nasa.gov/reference/risk-of-decompression-sickness/
    - Host-Microorganism Interactions: https://www.nasa.gov/reference/risk-of-host-microorganism-interactions/
    - Hypoxia: https://www.nasa.gov/reference/risk-of-hypoxia/
    - Inadequate Food and Nutrition: https://www.nasa.gov/reference/risk-of-inadequate-food-and-nutrition/
    - Injury and Compromised Performance from Spacewalks (EVA): https://www.nasa.gov/reference/risk-of-injury-and-compromised-performance-from-extravehicular-activity-eva/
    - Reduced Cardiorespiratory and Musculoskeletal Fitness: https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/
    - Spaceflight Associated Neuro-ocular Syndrome (SANS): https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/
    - Spaceflight-Induced Bone Changes: https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/
  - *Behavioural performance and human factors (5):*
    - Behavioural Conditions and Psychiatric Disorders: https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/
    - Inadequate Teamwork: https://www.nasa.gov/reference/risk-of-inadequate-teamwork/
    - Inadequate Sleep and Irregular Schedules: https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/
    - Inadequate Systems Operations Support: https://www.nasa.gov/reference/risk-of-inadequate-systems-operations-support/
    - Injury from Dynamic Loads: https://www.nasa.gov/reference/risk-of-injury-from-dynamic-loads/
  - *Space radiation (1):*
    - Radiation-Induced Cancers: https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/
- **Ongoing HRP Research in Space:** https://www.nasa.gov/hrp/ongoing-hrp-research/
  - Index of current and past investigations. Most relevant to us:
    - Standard Measures (physiological and psychological measures collected from crew): https://www.nasa.gov/reference/standard-measures/
    - Artemis II Standard Measures (shared health data bank): https://www.nasa.gov/reference/artemis-ii-standard-measures/
    - ARCHeR (sleep, activity, well-being on Artemis II): https://www.nasa.gov/reference/archer/
    - Immune Biomarkers (blood and saliva, Artemis II): https://www.nasa.gov/reference/immune-biomarkers/
    - CIPHER (suite of studies on body changes in orbit): https://www.nasa.gov/reference/cipher/
    - Venous Haemostasis (blood flow and clotting): https://www.nasa.gov/reference/venous-haemostasis/
    - Thigh Cuff (fluid shift countermeasure for eye disorders): https://www.nasa.gov/reference/thigh-cuff/
    - Brain Fluid Pressure: https://www.nasa.gov/reference/brain-fluid-pressure/
    - Spinal Fluid Biomarkers: https://www.nasa.gov/reference/spinal-fluid-biomarkers/
    - B-Complex (B-vitamin supplement for brain and eye changes): https://www.nasa.gov/reference/b-complex/
    - Zero T2 (exercise without a treadmill): https://www.nasa.gov/reference/zero-t2/
    - Spacecraft Occupant Protection (re-entry discomfort): https://www.nasa.gov/reference/spacecraft-occupant-protection/
    - Simulating Manual Piloting for Moon Landings: https://www.nasa.gov/reference/simulating-manual-piloting-for-moon-landings/
    - Tempus Pro (telemedicine device for health data and remote diagnosis): https://www.nasa.gov/reference/tempus-pro/
    - Omics Archive (molecular-level biomarkers): https://www.nasa.gov/reference/omics-archive/
    - Altered Immunity: https://www.nasa.gov/missions/station/scientists-probe-how-long-term-spaceflight-alters-immunity/
    - Food Physiology: https://www.nasa.gov/missions/station/enhanced-diet-may-help-astronauts-adapt-to-spaceflight/
    - Food Acceptability: https://www.nasa.gov/humans-in-space/how-does-spaceflight-change-food-appeal/
    - Space Gardening (well-being under isolation): https://www.nasa.gov/humans-in-space/can-space-gardening-help-astronauts-cope-with-isolation/
    - Spinal Health (bone and muscle countermeasures): https://www.nasa.gov/missions/station/astronauts-spines-under-scrutiny/
    - Veggie Monitoring (microbial safety): https://www.nasa.gov/missions/station/researchers-put-space-garden-microbes-under-the-microscope/
  - Related hubs linked from the hazards page: Human Research Program https://www.nasa.gov/hrp · ISS https://www.nasa.gov/international-space-station/ · Analog missions https://www.nasa.gov/analog-missions/

### Canadian Space Agency (partner resources)
> NASA does not endorse non-U.S. Government sites and is not responsible for their content. **We must comply with the data-use parameters of each non-U.S. site** (check each page's "Notices and copyright" before reusing anything beyond citing and linking).
- **Monitoring Radiation for Astronaut Health:** https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
  - About the Canadian Active Neutron Spectrometer (CANS), an autonomous instrument measuring neutron radiation on the ISS (neutrons are roughly 30% of ISS radiation). Mentions related experiments (bubble detectors, MOSFET, EVARM, Radi-N, Radi-N2). Gives no units or data terms.
- **Why Do We Conduct Science Experiments in Space?** https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
  - General explainer. Links ISS human-health research (bones, heart and blood vessels, brain/balance, physical activity and metabolic health) to Earth conditions such as osteoporosis, cardiovascular disorders and Type-2 diabetes. Names no specific experiments or measurements.
  - Linked from it: ISS experiments list https://www.asc-csa.gc.ca/eng/iss/science/experiments.asp · "How does space affect the human body?" infographic https://www.asc-csa.gc.ca/eng/multimedia/search/image/watch/8056

### Challenge video
- **YouTube video on this challenge:** https://www.youtube.com/watch?v=RERG3gEmdC8&t=111s
  - The team has not summarised this yet and it could not be fetched automatically. If you can access it or a transcript, extract: recommended indicators, data sources, tips for teams, and what judges look for. Otherwise ask the team to paste the transcript (YouTube: "..." menu, then "Show transcript").

## 8. CRITICAL data caveat — read before planning

**None of the provided pages contain numeric reference ranges, flight-risk thresholds, or downloadable JSON/CSV datasets.** They are narrative resources: hazard descriptions, risk lists, research summaries, and a radiation-monitoring article. An earlier compiled summary of this challenge claimed the Resources tab supplies "normal vs. flight-risk biometric thresholds" as structured files. **That was not confirmed by the official challenge text or the linked pages. Do not assume it.**

This means our design must handle the gap honestly:
- **Qualitative NASA content is our core data.** The hazard → risk → affected system → indicator → countermeasure mapping must be built from these pages, with each mapping entry carrying its source URL. This is where NASA provenance (the *Relevance* criterion) is demonstrated.
- **Numeric thresholds will need a different source.** (Team decision, see `DECISIONS.md` › Thresholds: this is the **only** exception to "official sources only".) Use standard, widely published clinical reference ranges (for resting heart rate, blood pressure, fasting glucose, body temperature, sleep duration, and so on). Label them clearly as "general clinical reference ranges", not NASA flight standards. Where a NASA or space-agency source gives a spaceflight-specific value, use it and cite it.
- **Be transparent in the UI and the write-up:** thresholds are illustrative for a hackathon prototype, are **not medical advice**, and would need validation by flight surgeons before any real use.
- Any extra data we choose to add (see Section 9) must be an official, publicly accessible source with a clear licence, and must be named in the submission.

## 9. Additional public sources worth checking (NOT in the official list — verify before relying on them)

> **On hold:** the team decided to use only the official Section 7 resources for now (see `DECISIONS.md`, Data Sources). Do not use these sources unless that decision changes.

These are likely useful for numeric ranges and spaceflight-specific context. Confirm each is accessible and appropriately licensed before using, and cite it explicitly.
- NASA Human Research Roadmap: https://humanresearchroadmap.nasa.gov/
- NASA Open Science Data Repository (OSDR): https://osdr.nasa.gov/
- NASA-STD-3001 (Space Flight Human-System Standard, Vol. 1 Crew Health) — search for the current version on nasa.gov; URL not verified.
- NASA Human Integration Design Handbook — search for it on nasa.gov; URL not verified.
- NASA Lifetime Surveillance of Astronaut Health (LSAH) — search for public documentation; URL not verified.
- Other agencies' public pages (ESA, JAXA) — look for astronaut health and countermeasure explainers; mind each site's data-use terms.
- Published clinical guidelines for general reference ranges (e.g. WHO, AHA, ADA, CDC sleep guidance) — cite directly.

## 10. Original planning brief (DONE, kept for reference only; do not re-run it)

> The plan is approved and the stack is locked in `DECISIONS.md`. Ignore the "recommend a stack" and "do not implement" instructions below. The useful parts still apply: the `docs/` files listed here (create them as needed) and the constraints at the end.

Read this whole file. If you can access the web, open the linked NASA pages (start with the Risks page and the Standard Measures page) to extract accurate details. Then produce the following, in Markdown, and save them to a `docs/` folder in the repo:

1. **`docs/PLAN.md`**
   - A one-paragraph project pitch and a recommended **scope split: Must-have (demo-critical) / Should-have / Stretch**, justified against the five judging criteria.
   - A **recommended tech stack** (given our skills in Section 1), with reasons. Prefer something we can build, deploy and demo publicly within roughly 24 hours.
   - An **architecture overview**: data layer, rule/triage engine, UI components, charts, body-map component.
   - A **timeline** from now to the submission deadline, including time for the demo video/slides, README and submission form. Reserve the last ~3 hours for polish and submission only.
   - A **task split** for a team of `<N>` people that minimises merge conflicts.
   - Top risks and mitigations.
2. **`docs/DATA_MODEL.md`**
   - Proposed **JSON schema** for: hazards, risks, body systems, indicators (name, unit, how it can be measured in flight, normal range, watch/act/contact-surgeon bands), countermeasures/actions, environments, and sources.
   - A worked example for at least three indicators (e.g. heart rate, sleep hours, mood), each with a source URL and a note on where its numeric range comes from.
   - The mapping from the five hazards → the 17 listed risks → body systems → indicators.
3. **`docs/SOURCES.md`** — a table of every source we use: URL, what we take from it, whether it is official NASA data, and any licence/terms note. This feeds the submission's "NASA data" section.
4. **`docs/DEMO_STORYBOARD.md`** — a storyboard for a **≤30-second demo video** and, alternatively, a **≤7-slide deck**, showing the problem, the live demo, and why it matters.
5. **`docs/AI_USAGE.md`** — a running log template for disclosing how AI was used (required for submission), plus a list of any AI-generated media that will need a watermark/credit.
6. **`README.md`** skeleton with: project name, summary, challenge, features, tech stack, **NASA data credits**, **AI-usage disclosure**, a "not medical advice" disclaimer, how to run, team name and members.
7. A short list of **open questions** for the team (stack, deadline, who owns what) that you need answered before writing code.

### Constraints to respect throughout
- ~~Do not start implementing until I approve the plan.~~ Plan approved.
- Hackathon time is tight. Favour a working, polished vertical slice over breadth.
- Every health rule shown to the user should cite its source.
- The repo will be **public**, so don't commit secrets, personal data, or anyone's photo or likeness (some participants may be under 18).
- Be explicit wherever something is our assumption rather than an official NASA value.
- Ask me before making any decision that is hard to reverse.
