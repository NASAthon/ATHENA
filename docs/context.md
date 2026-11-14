# NASA Space Apps Challenge 2026 — Project Context & Planning Brief

> **Status: PLAN APPROVED. We are in the BUILD phase.** Write application code following `AGENTS.md` and `docs/DECISIONS.md`. The architecture is locked, so do not re-plan it or propose a different stack.
>
> This file holds the event rules, submission requirements, judging rubric, the challenge, our concept (Section 6.1) and every data link we were given.

---

## 1. Who we are and what we're doing

- We are a team entering the **2026 NASA International Space Apps Challenge** at the local event **HackAthlone** (Athlone, Ireland).
- We are competing in the **Healthcare challenge: "Create Health Monitoring Software for Astronauts on Space Missions"** (difficulty: Intermediate; subjects: Human Exploration, Software, Space Exploration).
- There is also a **global judging** round for submissions, so quality, polish and clear NASA-data provenance matter.
- Team name / GitHub org: **NASAthon** (github.com/NASAthon). App/software name: **ATHENA**
- Team size: **4 members**: Chidozie Onyejelem, Isaac Adeniji, Mercy Olasehinde, Izabela Heczková
- Skills and preferred stack: JavaScript (no TypeScript). Stack is locked in `docs/DECISIONS.md`.
- **Local (HackAthlone) deadline: Sun 15 Nov, 10:30 submission closes. Pitching starts 11:30: 3-minute pitch + 2-minute Q&A per team.** Global portal closes Sun 15 Nov, 23:59. Work to the 10:30 deadline.

## 2. Event facts

| Item | Detail |
|---|---|
| Event | 2026 NASA International Space Apps Challenge, local chapter **HackAthlone (#HackAthlone)** |
| Venue | Engineering Building, Technological University of the Shannon (TUS): Midlands, Bunnavally, Athlone, Co. Westmeath, Ireland |
| Format | In-person, 48-hour hackathon |
| Dates | **14–15 November 2026**. Work officially starts **09:00 on 14 Nov** and concludes on 15 Nov |
| Facilities | Tech resources, mentors, food and drink provided. No accommodation (sleeping bags allowed on site) |
| Local judging | Submission closes **10:30 Sun 15 Nov**. Live pitching from **11:30**: **3 min pitch + 2 min Q&A** in front of local judges |
| Global judging | Separate: online submission (≤30 s video or ≤7 slides), portal closes 23:59 Sun 15 Nov |
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

> Full official guide: **`docs/judging.md`**. It covers the submission form fields, demo limits, the AI/SI policy, global eligibility, the judging timeline and the 10 global awards. If it differs from this summary, `docs/judging.md` wins.

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
- *(From the challenge video)* Give **emergency guidance** (e.g. a crewmate with chest pain who collapses mid-transit to Mars). For each measurement, explain how to take it, why it matters and what to do when it's abnormal. The challenge is authored by the **Brazilian Space Agency (AEB)**.

## 6. Original idea (superseded by 6.1; kept for background)

A visual astronaut self-assessment tool with these building blocks:
1. **Hazard-to-health mapping:** each of the five HRP hazards is linked to the health risks it drives and to the indicators that signal them.
2. **Indicator input:** astronauts enter or select values for indicators measurable in flight (heart rate, blood pressure, blood glucose, body temperature, sleep hours, mood, and others we justify).
3. **Rule-based triage engine:** each reading is classed (e.g. normal / watch / act / contact flight surgeon) with a plain-language explanation of *why* and a recommended action. Each rule should cite the NASA/HRP source it is based on.
4. **Clickable body figure:** organs/systems show function, current status, and the hazard that affects them.
5. **Time-series charts and colour-coded status** for at-a-glance trends.
6. **Environment context:** switch between spacecraft / station / lunar or Mars base, adjusting which hazards and advice are emphasised.
7. **Routine prompts and optional gamification:** reminders and streaks for measurements, exercise, sleep and so on.
8. **Plain-language guidance** for non-specialists.

### 6.1 ATHENA: our chosen concept and product spec

**Vision:** an autonomous astronaut health copilot. **ATHENA** stands for Autonomous Telecommunications and Health Evaluation Network for Astronauts. It is an onboard health monitoring and decision-support system for astronauts.

**Problem framing:** Deep-space crews face communication delays of 5–40 minutes from Earth, so medical decision-making must be autonomous.

**Users:** astronauts (primary), flight surgeons, mission control.

**Crew:** 3 simulated astronauts over a 180-day mission (`docs/DECISIONS.md` › Crew): **Commander Rivera** (slow decline from about week 12, causing a drift alert), **Pilot Singh** (stays healthy, so no false alarms), **Engineer Nakamura** (sudden event, triggering the red-limit screen and crewmate emergency guidance).

**Monitoring targets:**
- **Core (named in the official challenge text, must have):** heart rate, blood pressure, blood glucose, body temperature, sleep hours, mood
- **Also recorded daily:** reaction test, exercise minutes, symptoms. **Optional:** SpO₂, radiation dose (HRV, respiration rate if time allows). See `docs/DECISIONS.md` › Indicators.

**Feature targets:**
- **Personalised baselines:** **fixed** baselines per astronaut (pre-flight, plus in-flight days 21–35), calculated once, so slow decline shows as drift (`docs/DECISIONS.md` › Baselines).
- **Trend monitoring:** detect multi-day changes such as sleep deficit, vital-sign drift and radiation accumulation.
- **Alerting:** deterministic, explainable decision-support alerts, each giving the trigger, contributing factors and recommended action.
- **Mission modes:** ISS, Lunar Gateway, Mars Transit. This is our version of the environment context in idea 6 above.
- **Scenario Lab:** simulate radiation, fatigue, sleep deprivation, hypoxia and multi-factor events.
- **Earth Link:** visualise the communication delay to mission control.
- **"Why this alert?" panels and FAQ:** rule-based answers to "What caused this warning?" or "Am I fit for EVA tomorrow?", each citing its source. They work fully offline.

**Added from the challenge video (Section 7). These were not in our original plan:**
- **Emergency guidance (required: "gives guidance on what to do in an emergency"):** a step-by-step, offline emergency mode for acute events, e.g. *a crewmate with sharp chest pain who collapses halfway to Mars*. Must work for **assessing a crewmate**, not only yourself: pick the affected astronaut, follow the steps, record vitals, see the escalation (crew action vs contact flight surgeon, with the Earth Link delay shown).
- **Measurement guides (required: "astronauts are not doctors"):** for **every** indicator, a short card covering (1) **how to take it** in flight, (2) **why it matters** (linked to the NASA hazard or risk), and (3) **what to do if it's abnormal**. Reachable from the body map, alerts and data entry.
- **Designed for every astronaut (required, team decision):** the app works for different levels of medical knowledge and different abilities and conditions (fatigue, stress, gloves, colour blindness, low vision). See `docs/DECISIONS.md` › Inclusive Design. This is a deliberate story for judges (Validity: usability; Impact).
- **Adaptive search (required, team decision):** one search bar that finds any indicator, measurement guide, emergency guide, alert explanation or body part, **even when the astronaut words it wrong**. See `docs/DECISIONS.md` › Search.
- **Measurement reminders (required, team decision):** prompt the crew to take scheduled measurements as part of the mission routine.
- **Environments:** the video names spacecraft, space station and Moon surface base. Our Mission Modes (ISS, Lunar Gateway, Mars Transit) cover spacecraft and station. **Lunar Surface Base is out of scope** (time).
- **Earth impact story:** the same tool could support healthcare in remote communities with limited access to health services. Use it in the pitch (Impact criterion, Galactic Impact award).

> **Decided:** all guidance is **accurate and informative, in plain English**: astronauts aren't doctors, so simplify the wording, not the facts. Quick reference only: status, meaning and what to do, with no "Learn more" layer (DECISIONS › Quick Reference Only). Emergency steps are clear and ordered, each with a short "why", and labelled not medical advice. See `docs/DECISIONS.md` › Content Style.

**What makes ATHENA original (our pitch line):** ATHENA **catches the slow decline that generic one-size-fits-all thresholds miss** (by comparing each astronaut with their own baseline), is **built for astronauts who aren't doctors**, and **works fully offline**. See `docs/DECISIONS.md` › Originality.

**Innovation angles:** explainable alerts, personal fixed baselines + z-score drift detection, 0–100 health score, decision support, Earth-delay simulation.

**Tech stack** (locked in `docs/DECISIONS.md`): offline-first web app run on the laptop (not a PWA). Next.js (JavaScript, static export) + Tailwind + ShadCN; SQLite in the browser (sql.js, saved to IndexedDB); JS rules engine + fixed-baseline z-score drift detection (z ≥ 3.5 in the worrying direction; `docs/DECISIONS.md` › Drift Cut-off); 2D SVG body map. No backend server. Everything runs onboard.

**MVP scope, priorities and demo script:** see **`docs/CHECKLIST.md`**.

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
- **YouTube video on this challenge:** https://www.youtube.com/watch?v=RERG3gEmdC8 ("2026 Challenge | Create Health Monitoring Software for Astronauts on Space Missions", NASA Space Apps Challenge channel, about 3 min)
  - **Challenge author:** the **Brazilian Space Agency (AEB)**, presented by Rodrigo Leonardi, acting president of AEB. AEB is therefore a partner agency for this challenge and worth crediting in the pitch.
  - **Opening scenario (useful for our pitch and demo):** *"Imagine you're halfway to Mars. Suddenly your crewmate feels a sharp pain in the chest and collapses. What's happening? What should you do?"* So the tool should support **emergency guidance**, including assessing **a crewmate**, not only yourself.
  - **The ask:** software that helps astronauts assess their own health **and gives guidance on what to do in an emergency**. "Think outside the box."
  - **"Astronauts are not doctors."** For every measurement the tool should explain: (1) **how to take it**, (2) **why it matters**, and (3) **what to do when a value doesn't look normal**.
  - **Going further (optional):** remind the crew to take measurements; adapt to environments: spacecraft, space station, base on the Moon's surface.
  - **Data to start from:** NASA's Human Research Program (risks to the body and relevant indicators), and **NASA's Open Science Data Repository (OSDR, https://osdr.nasa.gov/)**, which holds real spaceflight biology data, "for inspiration and to test your ideas". Because the official challenge video names OSDR, it counts as an **official source**, not an extra one.
  - **Why it matters (Impact angle):** combines science, design, space habitation and code in a problem that could save lives on deep-space missions. It could also **inspire healthcare tools on Earth for remote communities or places with limited access to health services**.

## 8. CRITICAL data caveat — read before planning

**None of the provided pages contain numeric reference ranges, flight-risk thresholds, or downloadable JSON/CSV datasets.** They are narrative resources: hazard descriptions, risk lists, research summaries, and a radiation-monitoring article. An earlier compiled summary of this challenge claimed the Resources tab supplies "normal vs. flight-risk biometric thresholds" as structured files. **That was not confirmed by the official challenge text or the linked pages. Do not assume it.**

This means our design must handle the gap honestly:
- **Qualitative NASA content is our core data.** The hazard → risk → affected system → indicator → countermeasure mapping must be built from these pages, with each mapping entry carrying its source URL. This is where NASA provenance (the *Relevance* criterion) is demonstrated.
- **Numeric thresholds will need a different source.** (Team decision, see `docs/DECISIONS.md` › Thresholds. This is one of two exceptions to "official sources only"; the other is emergency steps, see `docs/DECISIONS.md` › Emergency Step Sources.) Use standard, widely published clinical reference ranges (for resting heart rate, blood pressure, fasting glucose, body temperature, sleep duration, and so on). Label them clearly as "general clinical reference ranges", not NASA flight standards. Where a NASA or space-agency source gives a spaceflight-specific value, use it and cite it.
- **Be transparent in the UI and the write-up:** thresholds are illustrative for a hackathon prototype, are **not medical advice**, and would need validation by flight surgeons before any real use.
- Any extra data we choose to add (see Section 9) must be an official, publicly accessible source with a clear licence, and must be named in the submission.

## 9. Additional public sources worth checking (NOT in the official list — verify before relying on them)

> **On hold:** the team uses only the official Section 7 resources (see `docs/DECISIONS.md` › Data Sources). The **only** exceptions are AHA, ADA and CDC guidance for thresholds and emergency steps (`docs/DECISIONS.md` › Red-Limit Sources and › Emergency Step Sources). Don't use the rest of this list unless that decision changes.

These are likely useful for numeric ranges and spaceflight-specific context. Confirm each is accessible and appropriately licensed before using, and cite it explicitly.
- NASA Human Research Roadmap: https://humanresearchroadmap.nasa.gov/
- ~~NASA Open Science Data Repository (OSDR)~~: now official, because the challenge video names it (see Section 7, Challenge video).
- NASA-STD-3001 (Space Flight Human-System Standard, Vol. 1 Crew Health) — search for the current version on nasa.gov; URL not verified.
- NASA Human Integration Design Handbook — search for it on nasa.gov; URL not verified.
- NASA Lifetime Surveillance of Astronaut Health (LSAH) — search for public documentation; URL not verified.
- Other agencies' public pages (ESA, JAXA) — look for astronaut health and countermeasure explainers; mind each site's data-use terms.
- Published clinical guidelines for general reference ranges (e.g. WHO, AHA, ADA, CDC sleep guidance) — cite directly.
