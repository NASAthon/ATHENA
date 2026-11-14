# Body Map (draft)

> **Status: DRAFT.** This is a starting point for the body figure and the NASA data map. The research person must check every link against its NASA risk page (URLs in `context.md` Section 7) and record sources in `docs/SOURCES.md` before it's shown in the app. Card text follows `DECISIONS.md` › Content Style (accurate, plain English, glance summary plus "Learn more").

## Regions

Eight clickable regions on the 2D SVG body figure. Together they cover all 17 NASA HRP risks (`DECISIONS.md` › Data Map Coverage). One risk can link to several regions.

| # | Region | Body parts | NASA risks it covers | Hazards behind them | ATHENA indicators shown |
|---|---|---|---|---|---|
| 1 | **Brain and nerves** | Brain, inner ear (balance) | Altered Sensorimotor and Vestibular Function; Hypoxia (thinking); Radiation-Induced Cancers (brain) | Gravity Fields; Hostile/Closed Environments; Space Radiation | Reaction test, symptoms (dizziness, headache) |
| 2 | **Eyes** | Eyes, optic nerve | Spaceflight Associated Neuro-ocular Syndrome (SANS) | Gravity Fields | Symptoms (blurred vision) |
| 3 | **Mind and sleep** | Mood, stress, sleep, alertness | Behavioural Conditions and Psychiatric Disorders; Inadequate Sleep and Irregular Schedules; Inadequate Teamwork; Inadequate Systems Operations Support | Isolation and Confinement; Distance from Earth | Mood, sleep hours, reaction test |
| 4 | **Heart and blood vessels** | Heart, veins, blood flow | Cardiovascular Adaptations; Reduced Cardiorespiratory Fitness | Gravity Fields; Space Radiation | Heart rate, blood pressure, exercise minutes |
| 5 | **Lungs and breathing** | Lungs, oxygen levels | Hypoxia; Decompression Sickness; Injury and Compromised Performance from Spacewalks (EVA) | Hostile/Closed Environments | SpO₂ (optional), symptoms (shortness of breath) |
| 6 | **Muscles and bones** | Spine, hips, legs, joints | Spaceflight-Induced Bone Changes; Reduced Musculoskeletal Fitness; Injury from Dynamic Loads; Injury from Spacewalks (EVA); Decompression Sickness (joints) | Gravity Fields; Hostile/Closed Environments | Exercise minutes, symptoms (joint or back pain) |
| 7 | **Gut and nutrition** | Stomach, intestines, diet | Inadequate Food and Nutrition; Host-Microorganism Interactions | Hostile/Closed Environments; Distance from Earth | Blood sugar, symptoms (nausea, appetite) |
| 8 | **Immune system and blood** | Whole body, immune cells | Altered Immune System Responses; Host-Microorganism Interactions; Radiation-Induced Cancers | Space Radiation; Isolation and Confinement; Hostile/Closed Environments | Temperature, radiation dose (optional), symptoms (fever, infection) |

## Coverage check (all 17 risks)

| Risk | Region(s) |
|---|---|
| Altered Immune System Responses | 8 |
| Altered Sensorimotor and Vestibular Function | 1 |
| Cardiovascular Adaptations | 4 |
| Decompression Sickness | 5, 6 |
| Host-Microorganism Interactions | 7, 8 |
| Hypoxia | 1, 5 |
| Inadequate Food and Nutrition | 7 |
| Injury and Compromised Performance from Spacewalks (EVA) | 5, 6 |
| Reduced Cardiorespiratory and Musculoskeletal Fitness | 4, 6 |
| Spaceflight Associated Neuro-ocular Syndrome (SANS) | 2 |
| Spaceflight-Induced Bone Changes | 6 |
| Behavioural Conditions and Psychiatric Disorders | 3 |
| Inadequate Teamwork | 3 |
| Inadequate Sleep and Irregular Schedules | 3 |
| Inadequate Systems Operations Support | 3 |
| Injury from Dynamic Loads | 6 |
| Radiation-Induced Cancers | 1, 8 |

## Region card contents (`CHECKLIST.md` › Body figure)

Each region card shows:
- **Glance:** region name, status (icon, colour and label), worst indicator, "last checked" date.
- **Learn more:** what this part of the body does, how spaceflight affects it (hazard and risk, with NASA source links), what's normal, what to do, and when to tell the flight surgeon.
- **Search keywords:** synonyms and symptoms (e.g. "heart", "chest", "pulse", "palpitations" for region 4).

## To verify

- [ ] Each region-to-risk link confirmed on its NASA risk page
- [ ] Hazard column confirmed against the 5 hazard pages
- [ ] Indicators per region agreed with the logic owner (region mapper in `CHECKLIST.md` › Logic)
