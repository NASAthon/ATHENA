# Body Map

> **Status: VERIFIED against NASA pages on 14 Nov 2026.** All 17 NASA HRP risk pages and all 5 hazard pages were read and cross-checked. Each link below is marked:
> - **Stated:** the NASA page says it directly.
> - **Inferred:** our own mapping, consistent with the page but not stated by it. Present it as ATHENA's interpretation, not as a NASA claim.
>
> **Important:** the risk pages **don't** use the five-hazard list. They name causes such as "microgravity" or "prolonged isolation". The hazard links below come from matching those causes and the hazard pages, so most are marked *Inferred*.
> **In the app:** this content lives in `src/data/regions.js` (`risks`, `riskNotes`, `hazards`, `facts`) and powers the Body page (PR #9). Keep the two in sync.
> Card text follows `docs/DECISIONS.md` › Content Style (accurate, plain English, quick reference only).

## Regions

Eight clickable regions on the 2D SVG body figure. Together they cover all 17 risks (`docs/DECISIONS.md` › Data Map Coverage). One risk can link to several regions.

### 1. Brain and nerves
- **Body parts:** brain, inner ear (balance), central nervous system
- **Risks:**
  - Altered Sensorimotor and Vestibular Function: orientation and motion sickness (Stated)
  - Hypoxia: "confusion, headaches, vision impairment, and trouble sleeping" (Stated)
  - Radiation-Induced Cancers: central nervous system, "cognitive or performance impairment" (Stated)
  - SANS: brain swelling (Stated)
- **Hazards:**
  - Gravity Fields: dizziness, spatial orientation and coordination are named on the hazard page (Stated)
  - Space Radiation: "damages the central nervous system", affects cognition and motor function (Stated)
  - Hostile/Closed Environments: hypoxia from cabin pressure changes (Inferred)
- **Indicators:** reaction test; symptoms (dizziness, headache, motion sickness, confusion)

### 2. Eyes
- **Body parts:** eyes, optic nerve, retina
- **Risks:**
  - SANS: optic nerve swelling, retinal folds, flattened back of the eye. About 70% of ISS crew show some swelling (Stated)
  - Hypoxia: vision impairment (Stated)
  - Radiation-Induced Cancers: degenerative disorders including the eyes (Stated)
- **Hazards:**
  - Gravity Fields: fluid shifts toward the head "can pressure the eyes" (Stated)
  - Space Radiation (Inferred, via the risk page)
- **Indicators:** symptoms (blurred or changed vision, headache)

### 3. Mind and sleep
- **Aspects:** mood, stress, sleep, body clock, alertness, teamwork, decision making
- **Risks:**
  - Behavioural Conditions and Psychiatric Disorders: anxiety, depression, sleep, morale, decision making (Stated)
  - Inadequate Sleep and Irregular Schedules: sleep-wake cycle, body clock, work overload (Stated)
  - Inadequate Teamwork: cooperation, communication, psychosocial adaptation (Stated)
  - Inadequate Systems Operations Support: crew performance without real-time ground help (Stated)
- **Hazards:**
  - Isolation and Confinement: named as the cause of behavioural risks; the hazard page names sleep loss and body-clock disruption (Stated)
  - Distance from Earth: communication delays, Earth-independent operations for teamwork and systems operations (Inferred)
  - Space Radiation: the hazard page names behavioural changes and altered cognition (Stated)
- **Indicators:** mood, sleep hours, reaction test

### 4. Heart and blood vessels
- **Body parts:** heart, blood vessels, blood pressure, blood flow
- **Risks:**
  - Cardiovascular Adaptations: blood clots, arrhythmias, low blood pressure and fainting risk at landing, heart becoming "more spherical" (Stated)
  - Reduced Cardiorespiratory Fitness: cardiopulmonary system (Stated)
  - Radiation-Induced Cancers: degenerative disorders of heart and blood vessels (Stated)
  - Decompression Sickness: nitrogen bubbles in the bloodstream; blood vessels in severe cases (Stated)
- **Hazards:**
  - Gravity Fields: "low-gravity conditions"; lightheadedness or fainting on return to gravity (Stated)
  - Space Radiation (Inferred, via the risk page)
- **Indicators:** heart rate, blood pressure, exercise minutes

### 5. Breathing and oxygen
- **Body parts:** lungs, breathing, oxygen in the body
- **Risks:**
  - Hypoxia: oxygen levels in body tissues fall below normal (Stated)
  - Decompression Sickness: breathing affected in severe cases (Stated)
  - Injury and Compromised Performance from Spacewalks (EVA): physical demands of spacewalks, linked to decompression sickness (Stated)
- **Hazards:**
  - Hostile/Closed Environments: cabin and spacesuit pressure; the hazard page lists pressure as an environmental factor (Inferred)
- **Indicators:** SpO₂ (optional); symptoms (shortness of breath)

### 6. Muscles and bones
- **Body parts:** spine, hips, weight-bearing bones, muscles
- **Risks:**
  - Spaceflight-Induced Bone Changes: bone density loss of 1–1.5% per month; spine can lengthen (height up to +3%); fracture risk (Stated)
  - Reduced Musculoskeletal Fitness: average loss 10–12% of pre-mission fitness; falls during gravity transitions (Stated)
  - Injury from Dynamic Loads: weakened bones and muscles, landing injuries (Stated)
  - Injury from Spacewalks (EVA): bone and muscle strength (Stated)
- **Hazards:**
  - Gravity Fields: bone and muscle loss, balance and locomotion are named on the hazard page (Stated)
- **Indicators:** exercise minutes (NASA countermeasure: exercise 6–7 days a week, about 1.5 h a day); symptoms (back or joint pain)

### 7. Gut, kidneys and nutrition
- **Body parts:** stomach, intestines, gut microbiome, kidneys, diet
- **Risks:**
  - Inadequate Food and Nutrition: "general health of body and mind" (no organs named); longer missions without resupply (Stated)
  - Host-Microorganism Interactions: gut and skin microbiome (Stated)
  - Kidney stones: named on the Gravity Fields hazard page, not a separate risk (Stated)
- **Hazards:**
  - Distance from Earth: rationing food and supplies (Stated)
  - Hostile/Closed Environments: microbes change and spread more easily (Stated)
  - Gravity Fields: kidney stones (Stated)
- **Indicators:** blood sugar (*our choice*: the nutrition page gives no measurable signs); symptoms (nausea, appetite change)

### 8. Immune system, skin and blood
- **Body parts:** immune system, skin, whole body
- **Risks:**
  - Altered Immune System Responses: dormant viruses reactivating (cold sores, shingles), rashes, allergies, infections (Stated)
  - Host-Microorganism Interactions: skin microbiome; microbes "more virulent in spaceflight" (Stated)
  - Radiation-Induced Cancers: cancer (Stated)
- **Hazards:**
  - Space Radiation: "increases cancer risk" (Stated)
  - Hostile/Closed Environments: altered immune system, stress hormones, microbes (Stated)
  - Gravity Fields: the immune risk page names "microgravity" (Inferred mapping)
- **Indicators:** body temperature, radiation dose (optional); symptoms (fever, rash, cold sores, infection)

## Coverage check (all 17 risks)

| Risk | Region(s) | Source |
|---|---|---|
| Altered Immune System Responses | 8 | https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/ |
| Altered Sensorimotor and Vestibular Function | 1 | https://www.nasa.gov/reference/risk-of-altered-sensorimotor-and-vestibular-function/ |
| Cardiovascular Adaptations | 4 | https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/ |
| Decompression Sickness | 4, 5 | https://www.nasa.gov/reference/risk-of-decompression-sickness/ |
| Host-Microorganism Interactions | 7, 8 | https://www.nasa.gov/reference/risk-of-host-microorganism-interactions/ |
| Hypoxia | 1, 2, 5 | https://www.nasa.gov/reference/risk-of-hypoxia/ |
| Inadequate Food and Nutrition | 7 | https://www.nasa.gov/reference/risk-of-inadequate-food-and-nutrition/ |
| Injury and Compromised Performance from Spacewalks (EVA) | 5, 6 | https://www.nasa.gov/reference/risk-of-injury-and-compromised-performance-from-extravehicular-activity-eva/ |
| Reduced Cardiorespiratory and Musculoskeletal Fitness | 4, 6 | https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/ |
| Spaceflight Associated Neuro-ocular Syndrome (SANS) | 1, 2 | https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/ |
| Spaceflight-Induced Bone Changes | 6 | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ |
| Behavioural Conditions and Psychiatric Disorders | 3 | https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/ |
| Inadequate Teamwork | 3 | https://www.nasa.gov/reference/risk-of-inadequate-teamwork/ |
| Inadequate Sleep and Irregular Schedules | 3 | https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/ |
| Inadequate Systems Operations Support | 3 | https://www.nasa.gov/reference/risk-of-inadequate-systems-operations-support/ |
| Injury from Dynamic Loads | 6 | https://www.nasa.gov/reference/risk-of-injury-from-dynamic-loads/ |
| Radiation-Induced Cancers | 1, 2, 4, 8 | https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/ |

## What each hazard page says it causes

| Hazard | Body effects named on the hazard page |
|---|---|
| [Space Radiation](https://www.nasa.gov/hrp/hazard-space-radiation/) | Higher cancer risk, central nervous system damage, altered cognition, reduced motor function, behavioural changes |
| [Isolation and Confinement](https://www.nasa.gov/hrp/hazard-isolation-and-confinement/) | Behavioural responses, sleep loss, body-clock disruption, work overload; decreased performance and adverse health |
| [Distance from Earth](https://www.nasa.gov/hrp/hazard-distance-from-earth/) | **No body effects named.** Covers supplies, medical care, communication delays of up to 20 minutes one way, equipment failures, medical emergencies and food rationing. This is why ATHENA must work autonomously and offline. |
| [Gravity Fields](https://www.nasa.gov/hrp/hazard-gravity-fields/) | Dizziness, bone and muscle loss (1–1.5% bone density per month), vision problems, orientation, coordination, balance, motion sickness, fainting on return, fluid shift to the head, kidney stones |
| [Hostile/Closed Environments](https://www.nasa.gov/hrp/hazard-hostile-closed-environments/) | Microbes changing and spreading, higher stress hormones, altered immune system (allergies, illness); factors include temperature, pressure, lighting, noise and crowding |

## Useful verified facts for cards and the pitch

- Bone density loss: **1–1.5% per month** in spaceflight (bone risk page and Gravity Fields hazard page).
- About **70% of ISS crew** show some swelling at the back of the eye (SANS page).
- Fitness loss: **10–12%** on average, and 12–38% of crew lose more than 20% (fitness page).
- Exercise countermeasure: **6–7 days a week, about 1.5 h a day** (fitness page).
- **Most astronauts** get motion sickness in spaceflight (sensorimotor page).
- Communication delay: **up to 20 minutes one way** (Distance from Earth page), so about 40 minutes round trip. This matches the 5–40 minute range in `docs/context.md`.
- None of these pages gives clinical thresholds (heart rate, blood pressure and so on), which confirms `docs/context.md` Section 8.

## Region card contents (`docs/CHECKLIST.md` › Body figure)

Each region card shows:
- **Glance:** region name, status (icon, colour and label), worst indicator, "last checked" date.
- **Search keywords:** synonyms and symptoms (e.g. "heart", "chest", "pulse", "palpitations", "faint" for region 4).

## Verification log

- [x] All 17 region-to-risk links checked against their NASA risk pages (14 Nov 2026)
- [x] Hazard links checked against the 5 hazard pages (14 Nov 2026); unstated links marked *Inferred*
- [ ] Indicators per region agreed with the logic owner (region mapper in `docs/CHECKLIST.md` › Logic)
