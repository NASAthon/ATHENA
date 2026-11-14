# Submission form answers (copy and paste)

Ready-to-paste answers for the Space Apps project page (`docs/judging.md` › 1C). Rules for each field are in
`docs/judging.md`; this file holds **our answers**. Every link is the full URL, as the form asks.
The NASA and clinical tables are generated from `src/data/sources.js` (the sources behind the app's health content), so keep them
in step with it when sources change. Check every link in an incognito window before submitting.

---

## 1. Use of Super Intelligence (SI)

### Checkboxes to tick

| Option on the form | Tick? | Why (from `docs/AI_USAGE.md`) |
|---|---|---|
| Ideation or Brainstorming | **No** | The core idea is the team's own; AI must not generate it (`docs/judging.md` 1C.6). |
| Research or Information Gathering | **Yes** | Claude Code read and cross-checked the NASA HRP, CDC, ADA and AHA pages we cite. |
| Data Analysis and Interpretation | **Yes** | Claude helped test the drift cut-off on simulated missions and check the simulated crew stories. |
| Building SI/ML Into the Project | **No** | ATHENA has no AI or machine learning inside: it is a deterministic rules engine with z-score drift detection. |
| Coding, Debugging, or Troubleshooting | **Yes** | Claude Code and other AI assistants helped write, test and review the app's code. |
| Writing, Editing, or Translation | **Yes** | AI helped write and edit the docs and the plain-English health text (all facts traced to cited sources). |
| Visual Design or Image Creation | **Yes** | The 7 screen-design mockups were made with Claude (see 1.3). |
| Presentation, Video, or Audio | Team to decide | Tick only if AI is used for the slides, the 30-second video or any audio. |
| Other Project-Related SI Use | No | |
| None / Did not use SI | **No** | |

### Statement for the project page (judges see this; the form's SI field is hidden from them)

> **Use of AI.** The ATHENA concept (personal-baseline drift detection, guidance for astronauts who aren't doctors,
> fully offline) is our team's own. We used AI coding assistants (Claude Code by Anthropic, and other AI chat
> assistants) to speed up building: writing and debugging code, checking the NASA, CDC, ADA and AHA pages we cite,
> testing our drift cut-off on simulated data, and editing plain-English text. Every health fact in the app is traced
> to a cited source, listed in `docs/SOURCES.md` in our repository (the app shows no web links, because astronauts
> can't open web pages in flight), and every AI-assisted change was reviewed by the team. Our screen-design mockups were made with Claude
> (Anthropic) and are marked "AI-generated" wherever they appear. ATHENA itself contains no AI: its alerts come from
> a deterministic, explainable rules engine. No NASA logos, flags or mission identifiers were used or generated.
> A dated log of every AI use is in `docs/AI_USAGE.md` in our repository.

### Rules we follow for SI-generated media

- **Images and videos** (including the AI-made mockups, if they appear in the slides, video or repo): a **visible
  "AI-generated" watermark** on each one.
- **Audio** (for example an AI voice-over): say it's AI-generated in the video description and file metadata.
- **Code and data:** acknowledged in the statement above, in `docs/AI_USAGE.md`, and in the README.
- Nothing AI-made may use, contain or modify NASA logos, flags or mission identifiers.

### 1.3 AI-generated media

| Item | Tool | Where it's used | Watermarked? |
|---|---|---|---|
| 7 screen-design mockups (Today, Daily check, Reaction test, Body, Emergency, Crew status, Trends) | Claude (Anthropic) | Design reference for building the app; not in the repo | Add "AI-generated" before using any of them in the slides, video or repo |

---

## 2. NASA Data (required for Global Awards)

Link Text | Link URL: every NASA resource ATHENA uses or cites.

| Link Text | Link URL |
|---|---|
| NASA HRP: 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| NASA HRP: Hazard: Space Radiation | https://www.nasa.gov/hrp/hazard-space-radiation/ |
| NASA HRP: Hazard: Isolation and Confinement | https://www.nasa.gov/hrp/hazard-isolation-and-confinement/ |
| NASA HRP: Hazard: Distance from Earth | https://www.nasa.gov/hrp/hazard-distance-from-earth/ |
| NASA HRP: Hazard: Gravity Fields | https://www.nasa.gov/hrp/hazard-gravity-fields/ |
| NASA HRP: Hazard: Hostile/Closed Environments | https://www.nasa.gov/hrp/hazard-hostile-closed-environments/ |
| NASA Goddard: Data Rate Increase on the International Space Station Supports Future Exploration | https://www.nasa.gov/feature/goddard/2019/data-rate-increase-on-the-international-space-station-supports-future-exploration |
| Assessment of the State of Communication Delay Research in Preparation for Missions Beyond Low Earth Orbit (NASA/TM-20250003885) | https://ntrs.nasa.gov/citations/20250003885 |
| NASA HRP: Risks of Human Spaceflight | https://www.nasa.gov/hrp/risks/ |
| NASA HRP: Risk of Altered Immune System Responses | https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/ |
| NASA HRP: Risk of Altered Sensorimotor and Vestibular Function | https://www.nasa.gov/reference/risk-of-altered-sensorimotor-and-vestibular-function/ |
| NASA HRP: Risk of Cardiovascular Adaptations | https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/ |
| NASA HRP: Risk of Decompression Sickness | https://www.nasa.gov/reference/risk-of-decompression-sickness/ |
| NASA HRP: Risk of Host-Microorganism Interactions | https://www.nasa.gov/reference/risk-of-host-microorganism-interactions/ |
| NASA HRP: Risk of Hypoxia | https://www.nasa.gov/reference/risk-of-hypoxia/ |
| NASA HRP: Risk of Inadequate Food and Nutrition | https://www.nasa.gov/reference/risk-of-inadequate-food-and-nutrition/ |
| NASA HRP: Risk of Injury and Compromised Performance from EVA | https://www.nasa.gov/reference/risk-of-injury-and-compromised-performance-from-extravehicular-activity-eva/ |
| NASA HRP: Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness | https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/ |
| NASA HRP: Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS) | https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/ |
| NASA HRP: Risk of Spaceflight-Induced Bone Changes | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ |
| NASA HRP: Risk of Behavioral Conditions and Psychiatric Disorders | https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/ |
| NASA HRP: Risk of Inadequate Teamwork | https://www.nasa.gov/reference/risk-of-inadequate-teamwork/ |
| NASA HRP: Risk from Inadequate Sleep and Irregular Schedules | https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/ |
| NASA HRP: Risk of Inadequate Systems Operations Support | https://www.nasa.gov/reference/risk-of-inadequate-systems-operations-support/ |
| NASA HRP: Risk of Injury from Dynamic Loads | https://www.nasa.gov/reference/risk-of-injury-from-dynamic-loads/ |
| NASA HRP: Risk of Radiation-Induced Cancers | https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/ |
| NASA Open Science Data Repository (OSDR) | https://osdr.nasa.gov/ |
| Tempus Pro (NASA HRP research) | https://www.nasa.gov/reference/tempus-pro/ |
| ARCHeR: Artemis Research for Crew Health and Readiness (NASA HRP) | https://www.nasa.gov/reference/archer/ |
| Spaceflight Standard Measures (NASA HRP) | https://www.nasa.gov/reference/standard-measures/ |

---

## 3. Space Agency Partner & Other Data

Everything else we used: partner agencies, clinical guidance, code libraries and tools (even if open source).

### Space agency partners and challenge material

| Link Text | Link URL |
|---|---|
| Canadian Space Agency: Monitoring Radiation for Astronaut Health | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp |
| Canadian Space Agency: Why Do We Conduct Science Experiments in Space? | https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp |
| Challenge video by the Brazilian Space Agency (AEB): Create Health Monitoring Software for Astronauts | https://www.youtube.com/watch?v=RERG3gEmdC8 |
| NASA Space Apps Challenge resources (submission and judging guides) | https://www.spaceappschallenge.org/resources/ |

### Clinical reference ranges and first-response guidance (general clinical reference ranges, not NASA flight standards)

| Link Text | Link URL |
|---|---|
| American Heart Association: What is CPR | https://cpr.heart.org/en/resources/what-is-cpr |
| American Heart Association and American Red Cross: 2024 AHA and American Red Cross Guidelines for First Aid (Trauma: bleeding, fractures) | https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines |
| CDC (table based on ACC/AHA guidelines): About High Blood Pressure | https://www.cdc.gov/high-blood-pressure/about/index.html |
| CDC: Measure Your Blood Pressure | https://www.cdc.gov/high-blood-pressure/measure/index.html |
| CDC: Heart Attack Symptoms, Risk, and Recovery | https://www.cdc.gov/heart-disease/about/heart-attack.html |
| CDC: Cardiac Arrest | https://www.cdc.gov/heart-disease/about/cardiac-arrest.html |
| CDC: Cardiac Emergency Response Plans | https://www.cdc.gov/heart-disease/php/cardiac-arrest-response-plans/index.html |
| CDC: Signs and Symptoms of Stroke | https://www.cdc.gov/stroke/signs-symptoms/index.html |
| High-Altitude Travel and Altitude Illness (CDC Yellow Book) | https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html |
| CDC: Radiation Emergencies: Get Inside | https://www.cdc.gov/radiation-emergencies/response/get-inside.html |
| CDC: Radiation Emergencies: Stay Inside | https://www.cdc.gov/radiation-emergencies/response/stay-inside.html |
| CDC: Radiation Emergencies: Stay Tuned | https://www.cdc.gov/radiation-emergencies/response/stay-tuned.html |
| CDC: HEADS UP: Responding to a Concussion | https://www.cdc.gov/heads-up/response/index.html |
| CDC: HEADS UP: Concussion Signs and Symptoms | https://www.cdc.gov/heads-up/signs-symptoms/index.html |
| CDC: Suicide Prevention | https://www.cdc.gov/suicide/prevention/index.html |
| CDC: Managing Stress | https://www.cdc.gov/mental-health/living-with/index.html |
| CDC: Definitions of Signs, Symptoms, and Conditions of Ill Travelers | https://www.cdc.gov/quarantine/maritime/definitions-signs-symptoms-conditions-ill-travelers.html |
| CDC: Preventing Hypothermia | https://www.cdc.gov/winter-weather/prevention/index.html |
| CDC: About Sleep | https://www.cdc.gov/sleep/about/index.html |
| CDC: Monitoring Your Blood Sugar | https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html |
| American Diabetes Association: Diagnosis | https://diabetes.org/about-diabetes/diagnosis |
| American Diabetes Association: Hypoglycemia (Low Blood Glucose) | https://diabetes.org/living-with-diabetes/treatment-care/hypoglycemia-low-blood-glucose |
| American Diabetes Association: Hypoglycemia Symptoms and Treatment | https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose/symptoms-treatment |
| American Diabetes Association: Hyperglycemia (High Blood Glucose) | https://diabetes.org/living-with-diabetes/treatment-care/hyperglycemia |

### Code libraries (all open source; full licence texts in `THIRD_PARTY_LICENSES.md`)

| Link Text | Link URL |
|---|---|
| Next.js (MIT) | https://github.com/vercel/next.js |
| React and React DOM (MIT) | https://github.com/facebook/react |
| Tailwind CSS (MIT) | https://github.com/tailwindlabs/tailwindcss |
| shadcn/ui (MIT) | https://github.com/shadcn-ui/ui |
| Radix UI primitives (MIT) | https://github.com/radix-ui/primitives |
| Lucide icons (ISC) | https://github.com/lucide-icons/lucide |
| class-variance-authority (Apache-2.0) | https://github.com/joe-bell/cva |
| tw-animate-css (MIT) | https://github.com/Wombosvideo/tw-animate-css |
| sql.js: SQLite in the browser (MIT) | https://github.com/sql-js/sql.js |
| MiniSearch: offline search (MIT) | https://github.com/lucaong/minisearch |
| ESLint (MIT) | https://github.com/eslint/eslint |

### Tools

| Link Text | Link URL |
|---|---|
| Claude Code by Anthropic (AI coding assistant) | https://www.anthropic.com/claude-code |
| GitHub (code hosting; our public repository) | https://github.com/NASAthon/ATHENA |
| Claude by Anthropic (AI assistant used for the screen-design mockups) | https://www.anthropic.com/claude |

---

## Before you submit

- [ ] Add any AI used for the slides or video (sections 1 and 1.3).
- [ ] Watermark every AI-made image or video frame that appears in the slides, video or repo.
- [ ] Open every link above in an incognito window.
- [ ] Paste the SI statement into the project description so judges can see it.
