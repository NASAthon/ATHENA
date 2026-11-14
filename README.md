# ATHENA

Autonomous Telehealth and Health Evaluation Network for Astronauts

## Overview

ATHENA is a health monitoring and decision-support platform
designed for astronauts on long-duration space missions.

The system enables astronauts to monitor health metrics,
detect emerging risks, understand long-term trends,
and receive guidance even when communication with Earth
is delayed.

---

## Why ATHENA?

Future missions to Mars may experience communication
delays of up to 40 minutes.

Astronauts must therefore be capable of evaluating
their own health and responding to issues without
immediate support from Earth.

ATHENA provides:

- Continuous health monitoring
- Personalized baselines
- Explainable alerts
- Treatment recommendations
- Mission-specific health guidance

---

## Features

### Personal Health Baselines

Each astronaut is evaluated against their own
historical health data rather than generic thresholds.

### Trend Detection

Detects:

- Sleep deficits
- Vital sign drift
- Radiation exposure trends

### Explainable Alerts

Every alert includes:

- Trigger reason
- Contributing factors
- Recommended actions

### Mission Modes

ISS

Lunar Gateway

Mars Transit

### Earth Link

Visualizes communication delays between astronaut crews
and Earth-based mission control.

### Scenario Lab

Simulate:

- Radiation exposure
- Fatigue
- Sleep deprivation
- Hypoxia
- Multi-factor health events

### AI Assistant

Astronauts can ask questions such as:

"What caused this warning?"

"Am I fit for EVA tomorrow?"

"What factors are affecting my health score?"

---

## Technology

Frontend:
- Next.js
- TailwindCSS

Backend:
- FastAPI

Database:
- SQLite

AI:
- Rule Engine
- Isolation Forest
- LLM Assistant
