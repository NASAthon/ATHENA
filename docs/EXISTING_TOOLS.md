# Existing tools and what ATHENA adds

A short note for the pitch, Q&A and submission description (CHECKLIST § 4).
Based only on the official NASA pages we were given (`docs/context.md` Section 7), read on 14 Nov 2026.

## What NASA uses or is testing today

| Tool or study | What it does | Who uses the data | Guidance for the astronaut themselves? |
|---|---|---|---|
| [**Tempus Pro**](https://www.nasa.gov/reference/tempus-pro/) | A commercial telemedicine device being flight-tested: collects vital health data and medical imaging, with telemedicine features that could help diagnose crew "in near-real time" | Researchers (compared with standard health exams after the mission); the **crew medical officer** uses it to diagnose a simulated scenario | Supports the crew medical officer; the page doesn't describe guidance given to each crew member |
| [**ARCHeR**](https://www.nasa.gov/reference/archer/) (Artemis Research for Crew Health & Readiness) | Studies well-being, activity, sleep and interactions on Artemis missions, using activity/sleep sensing and behavioural surveys | Researchers, to develop protocols, interventions and technologies | None described |
| [**Spaceflight Standard Measures**](https://www.nasa.gov/reference/standard-measures/) | A standard set of measurements before, during and after missions: activity and light (wrist sensor), sleep reports, fluid and saliva samples, cognition and sensorimotor tests, strength test | Researchers, to inform protocols that keep astronauts healthier | None described |

## The gap

These tools **collect data for researchers and the ground**, or support a trained crew medical officer.
The pages describe **no tool that gives every astronaut their own plain-English view of their health**:
what is changing, why it matters in space, and what to do next. That gap gets bigger on deep-space missions,
where messages to Earth can take up to 20 minutes each way ([NASA, Distance from Earth](https://www.nasa.gov/hrp/hazard-distance-from-earth/)).

## What ATHENA adds

1. **Personal, not population, normals.** Each astronaut is compared with their own fixed pre-flight and in-flight
   baselines, so a slow decline that generic thresholds miss is caught (drift alert), while healthy crew stay green.
2. **Guidance for the astronaut, not just data for the ground.** Plain-English measurement guides, a health score,
   "Why this alert?" explanations, and step-by-step emergency guides that work for a **crewmate**, all linked
   to the NASA risk or the clinical source behind them.
3. **Works fully offline and on its own.** Everything runs on the device, with no internet and no server, so it
   still works when Earth is 20 minutes away or out of contact.
4. **Built for astronauts who aren't doctors.** No diagnoses and no medicines; large controls usable with gloves;
   status is never shown by colour alone.

ATHENA doesn't replace these tools or the flight surgeon. It **complements** them: it turns measurements the crew
can take into understandable, sourced guidance, and tells them when to involve the flight surgeon.
