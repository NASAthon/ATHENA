# AI Usage Log

Required for submission (`docs/judging.md` 1C.6). AI may speed up building but must **not** generate the core idea. Log each meaningful use and keep entries short.

| Date / time | Who | Tool | What it helped with | Files |
|---|---|---|---|---|
| 14 Nov 2026 | Team | Claude Code | Repo docs and agent workflow setup | `*.md` |
| 14 Nov 2026 | Chidozie | Claude Code | Base Next.js template (create-next-app, switched to system fonts, dark theme, static export) | `app/`, config files |
| 14 Nov 2026 | Chidozie | Claude Code | Read and cross-checked all 17 NASA risk pages and 5 hazard pages to verify the body map | `docs/BODY_MAP.md` |
| 14 Nov 2026 | Chidozie | Claude Code | Installed sql.js, MiniSearch and shadcn/ui; set up the dark theme, wasm copy script and licence scan | `package.json`, `components/`, `lib/`, `app/`, `scripts/` |
| 14 Nov 2026 | Chidozie | Claude Code | PR #6: merged main, moved header and pages into `src/`, restored dark theme, swapped emoji for Lucide icon | `src/components/Header.js`, `src/app/*` |
| 14 Nov 2026 | Chidozie | Claude Code | PR #6 review fixes: keyboard focus rings, current-page nav highlight, theme colour tokens, crew switcher | `src/components/*`, `src/lib/crew.js` |
| 14 Nov 2026 | Chidozie | Claude Code | Content and research: fetched and verified NASA, CDC and ADA pages; wrote hazard, risk, region, indicator, emergency, symptom and exam data with citations; content validation script | `src/data/`, `scripts/check-content.mjs`, `docs/SOURCES.md` |
| 14 Nov 2026 | Chidozie | Claude Code | Found CDC steps for hypoxia, radiation, head injury and mental health guides; heart rate and SpO₂ moved to personal baselines; generated third-party licence file | `src/data/`, `THIRD_PARTY_LICENSES.md`, `scripts/generate-licenses.mjs` |
| 14 Nov 2026 | Chidozie | Claude Code (Chrome) | Read AHA's CPR page in the browser; added CPR steps; added the no-medicines rule and dose check | `src/data/emergencies.js`, `scripts/check-content.mjs` |
| 14 Nov 2026 | Chidozie | Claude Code (Chrome) | Read AHA/Red Cross 2024 First Aid Guidelines (bleeding, fractures) in the browser; added severe bleeding and broken-bone guides | `src/data/emergencies.js`, `src/data/symptoms.js` |
| 14 Nov 2026 | Chidozie | Claude Code | PR #8 review fixes: merged main, single accessible header with Izabela's mission mode and Earth-link pill, daily check reads from `src/data`, theme contrast fix, mission modes data | `src/components/*`, `src/app/daily-check/page.js`, `src/app/globals.css`, `src/data/missionModes.js` |
| 14 Nov 2026 | Izabela | AI assistant | Frontend UI: header, navigation, dark space theme, daily check screen (PRs #6, #8) | `src/components/Header.js`, `src/app/daily-check/page.js`, `src/app/globals.css` |
| 14 Nov 2026 | Mercy | AI assistant | Body map: SVG figure, accessible region list, region status logic, region card with NASA sources (PR #9) | `src/components/BodyMap.js`, `src/components/RegionCard.js`, `src/lib/regionStatus.js` |
| 14 Nov 2026 | Chidozie | Claude Code | PR #9 fixes: moved region detail into `src/data`, status tokens, engine-aligned status names, crew-wide selection, samples for all 3 crew | `src/data/regions.js`, `src/components/CrewProvider.js`, `src/lib/sampleData.js` |
| 14 Nov 2026 | Chidozie | Claude Code | Codebase audit and cleanup: home shows Today, region status order from the engine, daily check wired to the engine's record shape and red-limit check, AGENTS layout and test docs | `src/app/page.js`, `src/lib/regionStatus.js`, `src/app/daily-check/page.js`, `AGENTS.md` |
| 14 Nov 2026 | Isaac | Claude | CHECKLIST §2 logic engine (baselines, 7-day average, drift z-score, statuses, alerts, red limits, health score, reaction scoring, reminders, search, regions, surgeon summary, calendar, Scenario Lab injection) reading all content from `src/data`; machine-readable `check` on each band; 82 unit tests; README drift design choice | `src/lib/engine/*`, `src/data/indicators.js`, `scripts/check-content.mjs`, `README.md`, `docs/*` |
| 14 Nov 2026 | Isaac | Claude | Found NASA sources for ISS and Gateway Earth-link delays (team-approved); mission-mode logic (hazard emphasis, advice, reply time) with tests | `src/data/missionModes.js`, `src/data/sources.js`, `src/lib/engine/missionMode.js`, `docs/*` |

## AI-generated media

Each item needs a **visible "AI-generated" watermark** and must not use or modify NASA logos, flags or mission identifiers.

| File | Tool | Watermarked? |
|---|---|---|
| | | |
