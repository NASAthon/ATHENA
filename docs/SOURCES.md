# Sources

Every source ATHENA uses. This feeds the submission's "NASA Data" and "Space Agency Partner Data and Other References" fields (`judging.md` 1C.7–8). Add a row whenever you use something new. **Only open source, openly licensed or public-domain material** (see `DECISIONS.md` › Licensing). If a licence is unclear, don't use it.

| Source | URL | What we take from it | Official NASA? | Licence / terms |
|---|---|---|---|---|
| 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ | The five hazards | Yes | US Gov work; no NASA logos |
| Risks of Human Spaceflight | https://www.nasa.gov/hrp/risks/ | 17 risks and the hazard-to-risk link | Yes | US Gov work; no NASA logos |
| NASA Open Science Data Repository (OSDR) | https://osdr.nasa.gov/ | Real spaceflight biology data for inspiration and testing (named in the challenge video) | Yes | Check each dataset's licence before use |
| Challenge video (Brazilian Space Agency) | https://www.youtube.com/watch?v=RERG3gEmdC8 | Challenge goals, emergency scenario, guidance requirements | Official challenge material | Cite and link only |
| Monitoring Radiation for Astronaut Health (CSA) | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp | Radiation monitoring context (CANS) | No (partner) | Cite and link only; check CSA notices |

## Clinical reference ranges (thresholds only, see `DECISIONS.md` › Thresholds)

| Indicator | Range used | Source | URL |
|---|---|---|---|
| | | | |

## Libraries and tools

| Name | Use | Licence |
|---|---|---|
| Next.js | App framework (static export) | MIT |
| React | UI library | MIT |
| Tailwind CSS | Styling | MIT |
| ESLint + eslint-config-next | Linting (dev only) | MIT |
| sql.js | SQLite database in the browser (WASM) | MIT. https://github.com/sql-js/sql.js |
| MiniSearch | Offline fuzzy search (typos, prefixes, synonyms) | MIT. https://github.com/lucaong/minisearch |
